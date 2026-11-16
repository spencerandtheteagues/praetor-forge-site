// Client-only WebGL2 renderer for the medallion. Imported dynamically from
// MedallionStage after idle, so nothing here runs during SSR.
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shader.js";

const TEXTURES = [
  ["uObvAlb", "/medallion/obvAlb.webp"],
  ["uObvHgt", "/medallion/obvHgt.png"],
  ["uObvEmi", "/medallion/obvEmi.webp"],
  ["uRevAlb", "/medallion/revAlb.webp"],
  ["uRevHgt", "/medallion/revHgt.png"],
  ["uRevEmi", "/medallion/revEmi.webp"],
];

// Quality tiers: march steps, shadow steps, and a drawing-buffer scale.
const TIERS = [
  { steps: 128, shadow: 18, scale: 1 },
  { steps: 96, shadow: 12, scale: 0.85 },
  { steps: 72, shadow: 8, scale: 0.7 },
];
const DPR_CAP = 2;

const TAU = Math.PI * 2;
const EDGE_YAW = (72 * Math.PI) / 180;
const SETTLE_MS = 1000;
const FLIP_MS = 800;
const NUDGE = Math.PI / 12;
const NUDGE_MS = 280;
const SETTLE_FROM = { yaw: -0.62, pitch: 0.2 };
const FRICTION = 3.4; // 1/s; release inertia is below 0.2% after 2s
const RELEASE_MAX = 2; // seconds; inertia is cut off after this
const PITCH_OMEGA = 5.5; // critically damped return of the drag pitch
const PITCH_LIMIT = 0.45;

const easeOutCubic = (x) => 1 - (1 - x) ** 3;
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
export function createMedallionRenderer(canvas, { onReady, onFail } = {}) {
  let disposed = false;
  let failed = false;
  let ready = false;
  let hold = false; // global pause or cinema playing
  let visible = true;
  let docHidden = document.hidden;

  let raf = 0;
  let demandRaf = 0;
  let lastTs = 0;
  let clock = 0; // seconds of running time; frozen whenever the loop stops

  let tier = 0;
  let cssW = 0;
  let cssH = 0;
  let bufW = 0;
  let bufH = 0;

  const pose = { yaw: SETTLE_FROM.yaw, pitch: SETTLE_FROM.pitch, yawVel: 0, pitchVel: 0 };
  let tween = null; // { fromYaw, toYaw, fromPitch, toPitch, start, dur, ease, done }
  let settled = false;
  let releaseAt = -1;
  let drag = null; // { id, x, y, ts, width, vel }

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
    try {
      const [linked, decoded] = await Promise.all([waitForProgram(), decodeAll()]);
      bitmaps = decoded;
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
      for (const name of ["uRes", "uTime", "uPose", "uBob", "uPop", "uEdge", "uSteps", "uShadowSteps"]) {
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
      if (gl.getError() !== gl.NO_ERROR) return fail("texture");

      gl.uniform1f(uniforms.uPop, 1);
      gl.uniform1f(uniforms.uEdge, 1);
      applyTier();

      await firstFrame();
    } catch {
      if (!disposed) fail("texture");
    } finally {
      bitmaps?.forEach((b) => b.close());
    }
  }

  async function firstFrame() {
    // Wait for a laid-out, non-zero canvas.
    while (!applySize() && (bufW === 0 || bufH === 0)) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      if (disposed || failed) return;
      measure();
    }
    // If the loop can't run yet, show the resting pose instead of the settle.
    if (!canRun()) finishSettle();
    draw();
    const px = new Uint8Array(4);
    gl.readPixels(bufW >> 1, bufH >> 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    if (gl.getError() !== gl.NO_ERROR || gl.isContextLost() || px[3] < 200) {
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
  function startTween(toYaw, toPitch, dur, ease = easeInOutCubic) {
    pose.yawVel = 0;
    pose.pitchVel = 0;
    releaseAt = -1;
    if (!canRun()) {
      // Motion is paused: apply user actions instantly.
      tween = null;
      pose.yaw = toYaw;
      pose.pitch = toPitch;
      normalizeYaw();
      requestRender();
      return;
    }
    tween = { fromYaw: pose.yaw, toYaw, fromPitch: pose.pitch, toPitch, start: clock, dur: dur / 1000, ease };
  }

  function finishSettle() {
    settled = true;
    if (tween?.settle) tween = null;
    pose.yaw = 0;
    pose.pitch = 0;
  }

  function normalizeYaw() {
    const k = Math.round(pose.yaw / TAU);
    pose.yaw -= k * TAU;
  }

  function step(dt) {
    if (!settled) {
      settled = true;
      tween = {
        fromYaw: pose.yaw, toYaw: 0, fromPitch: pose.pitch, toPitch: 0,
        start: clock, dur: SETTLE_MS / 1000, ease: easeOutCubic, settle: true,
      };
    }
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
    if (releaseAt >= 0) {
      pose.yaw += pose.yawVel * dt;
      pose.yawVel *= Math.exp(-FRICTION * dt);
      const a = -PITCH_OMEGA * PITCH_OMEGA * pose.pitch - 2 * PITCH_OMEGA * pose.pitchVel;
      pose.pitchVel += a * dt;
      pose.pitch += pose.pitchVel * dt;
      if (clock - releaseAt >= RELEASE_MAX) {
        pose.yawVel = 0;
        pose.pitchVel = 0;
        pose.pitch = 0;
        releaseAt = -1;
        normalizeYaw();
      }
    }
  }

  // ---------------------------------------------------------------- render
  function draw() {
    if (!gl || failed || disposed || bufW === 0) return;
    // Gentle breathing tilt at rest; weight eases in after the settle.
    const w = clamp((clock - 0.6) / 1.6, 0, 1);
    const breath = w * w * (3 - 2 * w);
    const pitch = pose.pitch + Math.sin(clock * 0.63) * 0.07 * breath;
    const roll = Math.sin(clock * 0.47) * 0.035 * breath;
    const bob = Math.sin(clock * 1.05) * 0.03 * breath;
    gl.viewport(0, 0, bufW, bufH);
    gl.disable(gl.BLEND);
    gl.uniform2f(uniforms.uRes, bufW, bufH);
    gl.uniform1f(uniforms.uTime, clock);
    gl.uniform3f(uniforms.uPose, pose.yaw, pitch, roll);
    gl.uniform1f(uniforms.uBob, bob);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function frame(ts) {
    raf = 0;
    if (!canRun()) return;
    const dtMs = lastTs ? ts - lastTs : 16.7;
    lastTs = ts;
    const dt = Math.min(dtMs, 50) / 1000;
    clock += dt;
    step(dt);
    draw();
    trackPerf(dtMs);
    raf = requestAnimationFrame(frame);
  }

  function canRun() {
    return !disposed && !failed && visible && !docHidden && !hold;
  }

  function updateLoop() {
    if (ready && canRun()) {
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
  function nearestFace() {
    return Math.round(pose.yaw / Math.PI) * Math.PI;
  }

  function makeApi() {
    return {
      setHold(value) {
        hold = Boolean(value);
        if (hold && tween) {
          // Freeze mid-action at its destination rather than mid-air.
          pose.yaw = tween.toYaw;
          pose.pitch = tween.toPitch;
          tween = null;
          normalizeYaw();
          requestRender();
        }
        updateLoop();
      },
      flip() {
        if (!ready) return;
        startTween(nearestFace() + Math.PI, 0, FLIP_MS);
      },
      inspectEdge() {
        if (!ready) return;
        startTween(nearestFace() + EDGE_YAW, 0, FLIP_MS);
      },
      reset() {
        if (!ready) return;
        startTween(Math.round(pose.yaw / TAU) * TAU, 0, FLIP_MS);
      },
      nudge(direction) {
        if (!ready) return;
        const base = tween ? tween.toYaw : pose.yaw;
        startTween(base + direction * NUDGE, 0, NUDGE_MS);
      },
      pointerDown(event) {
        if (!ready || drag) return;
        if (event.pointerType === "mouse" && event.button !== 0) return;
        const el = event.currentTarget;
        el.setPointerCapture?.(event.pointerId);
        tween = null;
        releaseAt = -1;
        pose.yawVel = 0;
        pose.pitchVel = 0;
        drag = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          ts: event.timeStamp,
          width: Math.max(1, el.clientWidth),
          vel: 0,
        };
      },
      pointerMove(event) {
        if (!drag || event.pointerId !== drag.id) return;
        const k = Math.PI / drag.width; // half a turn per stage width
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        const dt = Math.max(1, event.timeStamp - drag.ts) / 1000;
        pose.yaw += dx * k;
        pose.pitch = clamp(pose.pitch - dy * k * 0.6, -PITCH_LIMIT, PITCH_LIMIT);
        drag.vel = drag.vel * 0.6 + ((dx * k) / dt) * 0.4;
        drag.x = event.clientX;
        drag.y = event.clientY;
        drag.ts = event.timeStamp;
        requestRender();
      },
      pointerUp(event) {
        if (!drag || event.pointerId !== drag.id) return;
        const idle = event.timeStamp - drag.ts > 80;
        const vel = idle ? 0 : clamp(drag.vel, -8, 8);
        event.currentTarget.releasePointerCapture?.(event.pointerId);
        drag = null;
        if (canRun()) {
          pose.yawVel = vel;
          pose.pitchVel = 0;
          releaseAt = clock;
        } else {
          pose.pitch = 0;
          normalizeYaw();
          requestRender();
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
