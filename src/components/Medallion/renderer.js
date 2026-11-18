// Client-only WebGL2 renderer for the medallion. Imported dynamically from
// MedallionStage after idle, so nothing here runs during SSR.
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shader.js";

const TEXTURES = [
  ["uObvAlb", "/medallion/obvAlb.webp?v=est2026"],
  ["uObvHgt", "/medallion/obvHgt.webp?v=est2026"],
  ["uObvEmi", "/medallion/obvEmi.webp?v=est2026"],
  ["uRevAlb", "/medallion/revAlb.webp?v=est2026"],
  ["uRevHgt", "/medallion/revHgt.webp?v=est2026"],
  ["uRevEmi", "/medallion/revEmi.webp?v=est2026"],
];

// Quality tiers: march steps, shadow steps, and a drawing-buffer scale.
const TIERS = [
  { steps: 128, shadow: 18, scale: 1 },
  { steps: 96, shadow: 12, scale: 0.85 },
  { steps: 72, shadow: 8, scale: 0.7 },
];
const DPR_CAP = 2;

const TAU = Math.PI * 2;
const SPIN_SPEED = TAU / 28; // rad/s — one slow, graceful 360° turn every 28s
const NUDGE = Math.PI / 12;
const NUDGE_MS = 280;
const FRICTION = 3.6; // 1/s; smooth drag release damping
const RELEASE_MAX = 1.8; // seconds; inertia settles cleanly after drag release
const PITCH_LIMIT = 1.38;
const CLICK_SLOP_PX = 6;

// Hidden numismatic edge-lettering Easter egg: rendered once at high DPI into a
// seamless 4x-repeating cylindrical height + inlay mask (R = V-groove depth for
// raymarched 3D normals, G = crisp glyph mask for 24k gold inlay).
async function buildEdgeEngravingBitmap() {
  try {
    if (document.fonts?.ready) {
      await Promise.race([
        document.fonts.ready,
        new Promise((r) => setTimeout(r, 900)),
      ]);
    }
  } catch {
    // Proceed with fallback serif if font readiness rejects.
  }

  const W = 2048;
  const H = 256;
  // Physical 1:1 aspect space for one 90-degree quadrant of the R=1.602, z∈[-0.104,+0.104] rim
  const VW = 3020;
  const VH = 256;

  const drawGlyphs = (blurPx) => {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.scale(W / VW, 1);
    if (blurPx > 0) ctx.filter = `blur(${blurPx}px)`;
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Subtle numismatic border hairlines & seam stars
    ctx.lineWidth = 2.4;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.moveTo(0, 22);
    ctx.lineTo(VW, 22);
    ctx.moveTo(0, VH - 22);
    ctx.lineTo(VW, VH - 22);
    ctx.stroke();

    ctx.globalAlpha = 0.9;
    ctx.font = '700 42px "Cinzel", Georgia, serif';
    ctx.fillText("✦", 0, VH * 0.5);
    ctx.fillText("✦", VW, VH * 0.5);

    ctx.globalAlpha = 1;
    if ("letterSpacing" in ctx) ctx.letterSpacing = "4.8px";
    ctx.font = '800 58px "Cinzel", Georgia, serif';
    ctx.fillText(
      "SPENCER ALLEN TEAGUE · STARTED THE JOURNEY IN 2020",
      VW * 0.5,
      94,
    );

    if ("letterSpacing" in ctx) ctx.letterSpacing = "5.8px";
    ctx.font = '700 52px "Cinzel", Georgia, serif';
    ctx.fillText(
      "AND FOUNDED THE HARNESS LAB IN 2026",
      VW * 0.5,
      170,
    );
    ctx.restore();
    return ctx.getImageData(0, 0, W, H);
  };

  const sharp = drawGlyphs(0);
  const soft = drawGlyphs(3.2);
  const out = new ImageData(W, H);
  const sd = sharp.data;
  const bd = soft.data;
  const od = out.data;
  for (let i = 0; i < sd.length; i += 4) {
    const s = sd[i];
    const b = bd[i];
    // R: smooth V-trench bevel profile for 3D SDF normal carving
    od[i] = Math.min(255, Math.round(b * 0.62 + s * 0.48));
    // G: crisp letter stroke mask
    od[i + 1] = s;
    // B: inner bevel rim highlight mask (strongest right along carved stroke walls)
    od[i + 2] = Math.min(255, Math.max(0, Math.round(Math.abs(b - s) * 2.1)));
    od[i + 3] = 255;
  }

  return createImageBitmap(out, {
    imageOrientation: "flipY",
    premultiplyAlpha: "none",
    colorSpaceConversion: "none",
  });
}

const easeInOutCubic = (x) =>
  x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

/**
 * createMedallionRenderer(canvas, { onReady, onFail })
 * onReady() fires once, after all textures decode and one frame renders and
 * validates. onFail(reason) fires at most once, always asynchronously; reason
 * is "unsupported", "compile", "texture", "invalid-frame", or "context-lost".
 * After onFail the caller should dispose() and show the static picture.
 */
export function createMedallionRenderer(canvas, { onReady, onFail, onInteractiveChange } = {}) {
  let disposed = false;
  let failed = false;
  let ready = false;
  let hold = false; // global pause or cinema playing
  let visible = true;
  let docHidden = document.hidden;
  let interactive = false; // false = slow graceful spin; true = stopped & movable by user

  let raf = 0;
  let demandRaf = 0;
  let lastTs = 0;
  let clock = 0; // monotonic runtime seconds for tweens, inertia, and perf hysteresis
  let spinTime = 0; // shader & floating poise clock; advances only while spinning

  let tier = 0;
  let cssW = 0;
  let cssH = 0;
  let bufW = 0;
  let bufH = 0;

  const pose = { yaw: 0, pitch: 0, yawVel: 0, pitchVel: 0 };
  let tween = null; // { fromYaw, toYaw, fromPitch, toPitch, start, dur, ease }
  let releaseAt = -1;
  let drag = null; // { id, pointerType, startX, startY, x, y, maxDist, ts, width, velYaw, velPitch, wasInteractive }

  const perf = { ema: 0, base: Infinity, slow: 0, fast: 0, warm: 30, changedAt: 0, drops: [0, 0, 0] };

  let gl = null;
  let program = null;
  let vao = null;
  let buffer = null;
  const textures = [];
  let uniforms = {};
  const abort = new AbortController();
  let resizeObserver = null;
  let intersectionObserver = null;

  function fail(reason) {
    if (failed || disposed) return;
    failed = true;
    stopLoop();
    queueMicrotask(() => {
      if (!disposed) onFail?.(reason);
    });
  }

  const onContextLost = () => {
    fail("context-lost");
  };
  const onVisibility = () => {
    docHidden = document.hidden;
    updateLoop();
  };

  // ---------------------------------------------------------------- setup
  gl = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: "high-performance",
    failIfMajorPerformanceCaveat: true,
  });
  if (!gl || typeof createImageBitmap !== "function") {
    fail("unsupported");
    return makeApi();
  }

  canvas.addEventListener("webglcontextlost", onContextLost);

  const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  const parallel = gl.getExtension("KHR_parallel_shader_compile");

  vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  measure();
  resizeObserver = new ResizeObserver(([entry]) => {
    const box = entry.contentBoxSize?.[0];
    cssW = box ? box.inlineSize : entry.contentRect.width;
    cssH = box ? box.blockSize : entry.contentRect.height;
    if (applySize()) requestRender();
  });
  resizeObserver.observe(canvas);

  intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updateLoop();
  });
  intersectionObserver.observe(canvas);

  document.addEventListener("visibilitychange", onVisibility);

  init();

  async function waitForProgram() {
    if (parallel) {
      while (!gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        if (disposed || failed) return false;
      }
    }
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      if (import.meta.env?.DEV) {
        console.warn(
          "[medallion] shader failed:",
          gl.getShaderInfoLog(fs) || gl.getShaderInfoLog(vs) || gl.getProgramInfoLog(program),
        );
      }
      return false;
    }
    return true;
  }

  async function decodeAll() {
    return Promise.all(
      TEXTURES.map(async ([, url]) => {
        const res = await fetch(url, { signal: abort.signal, credentials: "same-origin" });
        if (!res.ok) throw new Error(`${url}: ${res.status}`);
        const blob = await res.blob();
        return createImageBitmap(blob, {
          imageOrientation: "flipY",
          premultiplyAlpha: "none",
          colorSpaceConversion: "none",
        });
      }),
    );
  }

  async function init() {
    let bitmaps = null;
    let edgeBitmap = null;
    try {
      const [linked, decoded, edgeBmp] = await Promise.all([
        waitForProgram(),
        decodeAll(),
        buildEdgeEngravingBitmap(),
      ]);
      bitmaps = decoded;
      edgeBitmap = edgeBmp;
      if (disposed || failed) return;
      if (!linked) return fail("compile");

      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.useProgram(program);
      const aPos = gl.getAttribLocation(program, "aPos");
      gl.bindVertexArray(vao);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      uniforms = {};
      for (const name of ["uRes", "uTime", "uPose", "uBob", "uPop", "uEdge", "uSteps", "uShadowSteps", "uValidate"]) {
        uniforms[name] = gl.getUniformLocation(program, name);
      }

      // ImageBitmaps carry their own orientation/premultiply/colour options,
      // but pin the unpack state anyway so nothing else can flip them.
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
      TEXTURES.forEach(([name], i) => {
        const tex = gl.createTexture();
        textures.push(tex);
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, bitmaps[i]);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.uniform1i(gl.getUniformLocation(program, name), i);
      });

      const edgeUnit = TEXTURES.length;
      const edgeTex = gl.createTexture();
      textures.push(edgeTex);
      gl.activeTexture(gl.TEXTURE0 + edgeUnit);
      gl.bindTexture(gl.TEXTURE_2D, edgeTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, edgeBitmap);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(gl.getUniformLocation(program, "uEdgeTex"), edgeUnit);

      if (gl.getError() !== gl.NO_ERROR) return fail("texture");

      gl.uniform1f(uniforms.uPop, 1);
      gl.uniform1f(uniforms.uEdge, 1);
      applyTier();

      await firstFrame();
    } catch {
      if (!disposed) fail("texture");
    } finally {
      bitmaps?.forEach((b) => b.close());
      edgeBitmap?.close();
    }
  }

  async function firstFrame() {
    // Wait for a laid-out, non-zero canvas.
    while (!applySize() && (bufW === 0 || bufH === 0)) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      if (disposed || failed) return;
      measure();
    }
    draw();
    if (gl.getError() !== gl.NO_ERROR || gl.isContextLost()) {
      return fail("invalid-frame");
    }
    // Zero-readback GPU validation: run a 1x1 color-masked ANY_SAMPLES_PASSED
    // occlusion query at the canvas center where shader discards alpha < 0.785,
    // avoiding all synchronous/PBO gl.readPixels driver stalls on NVIDIA/OpenGL.
    const query = gl.createQuery();
    let passed = false;
    try {
      if (!query) return fail("invalid-frame");
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(bufW >> 1, bufH >> 1, 1, 1);
      gl.colorMask(false, false, false, false);
      gl.uniform1i(uniforms.uValidate, 1);
      gl.beginQuery(gl.ANY_SAMPLES_PASSED, query);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.endQuery(gl.ANY_SAMPLES_PASSED);
      gl.uniform1i(uniforms.uValidate, 0);
      gl.colorMask(true, true, true, true);
      gl.disable(gl.SCISSOR_TEST);
      gl.flush();

      let frames = 0;
      while (frames < 120) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        if (disposed || failed || gl.isContextLost()) return;
        if (gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE)) {
          passed = Boolean(gl.getQueryParameter(query, gl.QUERY_RESULT));
          break;
        }
        frames += 1;
      }
    } finally {
      if (gl && !gl.isContextLost() && query) {
        gl.deleteQuery(query);
      }
    }
    if (gl.getError() !== gl.NO_ERROR || gl.isContextLost() || !passed) {
      return fail("invalid-frame");
    }
    ready = true;
    onReady?.();
    updateLoop();
  }

  // ---------------------------------------------------------------- sizing
  function measure() {
    const rect = canvas.getBoundingClientRect();
    cssW = rect.width;
    cssH = rect.height;
  }

  function applySize() {
    if (!gl || failed || disposed) return false;
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP) * TIERS[tier].scale;
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    if (cssW === 0 || cssH === 0) return false;
    if (w === bufW && h === bufH) return false;
    bufW = canvas.width = w;
    bufH = canvas.height = h;
    return true;
  }

  function applyTier() {
    gl.uniform1i(uniforms.uSteps, TIERS[tier].steps);
    gl.uniform1i(uniforms.uShadowSteps, TIERS[tier].shadow);
  }

  function setTier(next) {
    tier = next;
    applyTier();
    applySize();
    perf.slow = 0;
    perf.fast = 0;
    perf.warm = 20;
    perf.ema = 0;
    perf.changedAt = clock;
  }

  // Frame-time hysteresis: drop a tier after ~45 slow frames, climb back only
  // after ~5s of frames at the display's own cadence, and never retry a tier
  // that has been dropped twice.
  function trackPerf(dtMs) {
    if (perf.warm > 0) {
      perf.warm -= 1;
      return;
    }
    perf.base = Math.max(4, Math.min(perf.base, dtMs));
    perf.ema = perf.ema ? perf.ema + (dtMs - perf.ema) * 0.08 : dtMs;
    const slowAt = Math.max(perf.base * 1.35, 20);
    if (perf.ema > slowAt) {
      perf.slow += 1;
      perf.fast = 0;
    } else if (perf.ema < perf.base * 1.12) {
      perf.fast += 1;
      perf.slow = 0;
    } else {
      perf.slow = Math.max(0, perf.slow - 1);
      perf.fast = 0;
    }
    if (perf.slow > 45 && tier < TIERS.length - 1) {
      perf.drops[tier] += 1;
      setTier(tier + 1);
    } else if (
      perf.fast > 300 &&
      tier > 0 &&
      perf.drops[tier - 1] < 2 &&
      clock - perf.changedAt > 10
    ) {
      setTier(tier - 1);
    }
  }

  // ---------------------------------------------------------------- motion
  function setInteractive(next) {
    const val = Boolean(next);
    if (interactive === val) return;
    interactive = val;
    tween = null;
    releaseAt = -1;
    pose.yawVel = 0;
    pose.pitchVel = 0;
    onInteractiveChange?.(interactive);
    updateLoop();
    requestRender();
  }

  function startTween(toYaw, toPitch, dur, ease = easeInOutCubic) {
    pose.yawVel = 0;
    pose.pitchVel = 0;
    releaseAt = -1;
    if (!canRun()) {
      tween = null;
      pose.yaw = toYaw;
      pose.pitch = toPitch;
      normalizeYaw();
      requestRender();
      return;
    }
    tween = { fromYaw: pose.yaw, toYaw, fromPitch: pose.pitch, toPitch, start: clock, dur: dur / 1000, ease };
  }

  function normalizeYaw() {
    const k = Math.round(pose.yaw / TAU);
    pose.yaw -= k * TAU;
  }

  function step(dt) {
    if (drag) return;

    if (tween) {
      const x = clamp((clock - tween.start) / tween.dur, 0, 1);
      const e = tween.ease(x);
      pose.yaw = tween.fromYaw + (tween.toYaw - tween.fromYaw) * e;
      pose.pitch = tween.fromPitch + (tween.toPitch - tween.fromPitch) * e;
      if (x >= 1) {
        tween = null;
        normalizeYaw();
      }
      return;
    }

    if (!interactive) {
      // Slow, graceful continuous 360° spin until clicked.
      spinTime += dt;
      pose.yaw += SPIN_SPEED * dt;
      if (pose.yaw > Math.PI) pose.yaw -= TAU;
      pose.pitch *= Math.exp(-3.2 * dt);
      if (Math.abs(pose.pitch) < 0.0005) pose.pitch = 0;
      return;
    }

    if (releaseAt >= 0) {
      pose.yaw += pose.yawVel * dt;
      pose.pitch = clamp(pose.pitch + pose.pitchVel * dt, -PITCH_LIMIT, PITCH_LIMIT);
      const decay = Math.exp(-FRICTION * dt);
      pose.yawVel *= decay;
      pose.pitchVel *= decay;
      if (clock - releaseAt >= RELEASE_MAX || (Math.abs(pose.yawVel) < 0.002 && Math.abs(pose.pitchVel) < 0.002)) {
        pose.yawVel = 0;
        pose.pitchVel = 0;
        releaseAt = -1;
        normalizeYaw();
      }
    }
  }

  // ---------------------------------------------------------------- render
  function draw() {
    if (!gl || failed || disposed || bufW === 0) return;
    // Gentle floating poise while spinning; freezes seamlessly in place when stopped.
    const w = clamp(spinTime / 1.4, 0, 1);
    const breath = w * w * (3 - 2 * w);
    const pitch = pose.pitch + Math.sin(spinTime * 0.55) * 0.045 * breath;
    const roll = Math.sin(spinTime * 0.42) * 0.025 * breath;
    const bob = Math.sin(spinTime * 0.92) * 0.022 * breath;
    gl.viewport(0, 0, bufW, bufH);
    gl.disable(gl.BLEND);
    gl.uniform2f(uniforms.uRes, bufW, bufH);
    gl.uniform1f(uniforms.uTime, spinTime);
    gl.uniform3f(uniforms.uPose, pose.yaw, pitch, roll);
    gl.uniform1f(uniforms.uBob, bob);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function needsContinuousFrames() {
    return !interactive || Boolean(tween) || releaseAt >= 0;
  }

  function canRun() {
    return !disposed && !failed && visible && !docHidden && !hold;
  }

  function frame(ts) {
    raf = 0;
    if (!canRun() || !needsContinuousFrames()) return;
    const dtMs = lastTs ? ts - lastTs : 16.7;
    lastTs = ts;
    const dt = Math.min(dtMs, 50) / 1000;
    clock += dt;
    step(dt);
    draw();
    trackPerf(dtMs);
    if (needsContinuousFrames()) {
      raf = requestAnimationFrame(frame);
    }
  }

  function updateLoop() {
    if (ready && canRun() && needsContinuousFrames()) {
      if (!raf) {
        lastTs = 0;
        perf.warm = Math.max(perf.warm, 10);
        raf = requestAnimationFrame(frame);
      }
    } else {
      stopLoop();
    }
  }

  function stopLoop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  // One frame on demand (resize while paused, user actions while paused).
  function requestRender() {
    if (!ready || raf || demandRaf || failed || disposed) return;
    demandRaf = requestAnimationFrame(() => {
      demandRaf = 0;
      draw();
    });
  }

  // ---------------------------------------------------------------- API
  function makeApi() {
    return {
      setHold(value) {
        hold = Boolean(value);
        if (hold && tween) {
          pose.yaw = tween.toYaw;
          pose.pitch = tween.toPitch;
          tween = null;
          normalizeYaw();
          requestRender();
        }
        updateLoop();
      },
      toggleInteractive() {
        if (!ready) return;
        setInteractive(!interactive);
      },
      resumeSpin() {
        if (!ready) return;
        setInteractive(false);
      },
      nudge(direction) {
        if (!ready) return;
        setInteractive(true);
        const base = tween ? tween.toYaw : pose.yaw;
        startTween(base + direction * NUDGE, pose.pitch, NUDGE_MS);
        updateLoop();
      },
      pointerDown(event) {
        if (!ready || drag) return;
        if (event.pointerType === "mouse" && event.button !== 0) return;
        const el = event.currentTarget;
        const wasInteractive = interactive;

        // On mouse click, stop the spin immediately so the medallion is halted
        // and ready to move; on touch while spinning, wait for tap confirmation
        // so vertical page scrolling is never hijacked.
        if (event.pointerType === "mouse" && !interactive) {
          setInteractive(true);
        }
        if (interactive || event.pointerType === "mouse") {
          el.setPointerCapture?.(event.pointerId);
        }

        tween = null;
        releaseAt = -1;
        pose.yawVel = 0;
        pose.pitchVel = 0;
        drag = {
          id: event.pointerId,
          pointerType: event.pointerType,
          startX: event.clientX,
          startY: event.clientY,
          x: event.clientX,
          y: event.clientY,
          maxDist: 0,
          ts: event.timeStamp,
          width: Math.max(1, el.clientWidth),
          velYaw: 0,
          velPitch: 0,
          wasInteractive,
        };
      },
      pointerMove(event) {
        if (!drag || event.pointerId !== drag.id) return;
        const totalHyp = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
        if (totalHyp > drag.maxDist) drag.maxDist = totalHyp;

        // Ignore movement until the medallion has been clicked/tapped into interactive mode.
        if (!interactive) return;

        const k = Math.PI / drag.width; // half a turn per stage width
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        const dt = Math.max(1, event.timeStamp - drag.ts) / 1000;
        pose.yaw += dx * k;
        pose.pitch = clamp(pose.pitch - dy * k * 0.72, -PITCH_LIMIT, PITCH_LIMIT);
        drag.velYaw = drag.velYaw * 0.6 + ((dx * k) / dt) * 0.4;
        drag.velPitch = drag.velPitch * 0.6 + ((-dy * k * 0.72) / dt) * 0.4;
        drag.x = event.clientX;
        drag.y = event.clientY;
        drag.ts = event.timeStamp;
        requestRender();
      },
      pointerUp(event) {
        if (!drag || event.pointerId !== drag.id) return;
        const cur = drag;
        drag = null;
        if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
          event.currentTarget.releasePointerCapture?.(event.pointerId);
        }

        if (event.type === "pointercancel") return;

        const isCleanClick = cur.maxDist < (cur.pointerType === "mouse" ? CLICK_SLOP_PX : 12);

        // Touch tap while spinning -> stop spin and unlock movement.
        if (!cur.wasInteractive && !interactive && isCleanClick) {
          setInteractive(true);
          return;
        }

        // Clean click while ALREADY stopped -> resume slow graceful spin.
        if (cur.wasInteractive && isCleanClick) {
          setInteractive(false);
          return;
        }

        // Finished a drag while interactive -> smooth damping & hold pose.
        if (interactive) {
          const idle = event.timeStamp - cur.ts > 80;
          if (!idle && canRun() && cur.maxDist >= CLICK_SLOP_PX) {
            pose.yawVel = clamp(cur.velYaw, -6, 6);
            pose.pitchVel = clamp(cur.velPitch, -4, 4);
            releaseAt = clock;
            updateLoop();
          } else {
            pose.yawVel = 0;
            pose.pitchVel = 0;
            releaseAt = -1;
            normalizeYaw();
            updateLoop();
            requestRender();
          }
        }
      },
      dispose() {
        if (disposed) return;
        disposed = true;
        stopLoop();
        if (demandRaf) cancelAnimationFrame(demandRaf);
        demandRaf = 0;
        abort.abort();
        resizeObserver?.disconnect();
        intersectionObserver?.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        canvas.removeEventListener("webglcontextlost", onContextLost);
        if (gl && !gl.isContextLost()) {
          textures.forEach((t) => gl.deleteTexture(t));
          if (buffer) gl.deleteBuffer(buffer);
          if (vao) gl.deleteVertexArray(vao);
          if (program) gl.deleteProgram(program);
          gl.getExtension("WEBGL_lose_context")?.loseContext();
        }
        textures.length = 0;
        gl = null;
      },
    };
  }

  return makeApi();
}
