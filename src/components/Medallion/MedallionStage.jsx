import { useEffect, useId, useRef, useState } from "react";
import { Picture } from "../ui.jsx";
import { useMotion } from "../../lib/motion.js";

// 144-tick bezel geometry, computed once at module scope (pure math, SSR-safe).
// viewBox is 1000 x 1000, centred on 500,500; angle 0 is 12 o'clock.
const C = 500;
const r2 = (n) => Math.round(n * 100) / 100;
const polar = (radius, angle) => [r2(C + radius * Math.sin(angle)), r2(C - radius * Math.cos(angle))];

function buildTicks() {
  const minor = [];
  const mid = [];
  const major = [];
  for (let i = 0; i < 144; i += 1) {
    const a = (i / 144) * Math.PI * 2;
    let target = minor;
    let inner = 470;
    let outer = 482;
    if (i % 12 === 0) {
      target = major;
      inner = 452;
      outer = 488;
    } else if (i % 6 === 0) {
      target = mid;
      inner = 462;
      outer = 486;
    }
    if (i === 0) continue; // the XII marker is drawn separately in sapphire
    const [x1, y1] = polar(inner, a);
    const [x2, y2] = polar(outer, a);
    target.push(`M${x1} ${y1}L${x2} ${y2}`);
  }
  return { minor: minor.join(""), mid: mid.join(""), major: major.join("") };
}

const TICKS = buildTicks();
const NUMERALS = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"].map(
  (label, i) => {
    const [x, y] = polar(428, (i / 12) * Math.PI * 2);
    // Radial, but the lower third (IV to VIII) turns to read upright.
    const rotate = i >= 4 && i <= 8 ? i * 30 + 180 : i * 30;
    return { label, x, y, rotate };
  },
);

function Bezel() {
  return (
    <svg
      className="medallion-bezel orbit-one"
      viewBox="0 0 1000 1000"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="medallion-bezel-hair" cx={C} cy={C} r="494" />
      <circle className="medallion-bezel-hair is-soft" cx={C} cy={C} r="446" />
      <path className="medallion-tick is-minor" d={TICKS.minor} />
      <path className="medallion-tick is-mid" d={TICKS.mid} />
      <path className="medallion-tick is-major" d={TICKS.major} />
      <path className="medallion-tick is-marker" d={`M${C} ${C - 450}L${C} ${C - 490}`} />
      <g className="medallion-numerals">
        {NUMERALS.map(({ label, x, y, rotate }) => (
          <text
            key={label}
            x={x}
            y={y}
            transform={`rotate(${rotate} ${x} ${y})`}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {label}
          </text>
        ))}
      </g>
    </svg>
  );
}

/**
 * MedallionStage: the Chapter I hero instrument. A prerendered <picture> is the
 * LCP and the permanent fallback; after idle, a WebGL2 raymarched medallion is
 * imported and faded in once its textures decode and one frame validates.
 * data-state on the stage: static | loading | live | reduced | unsupported | fallback.
 */
export default function MedallionStage() {
  const { paused, reduced, cinemaPlaying } = useMotion();
  const holderRef = useRef(null);
  const ctrlRef = useRef(null);
  const holdRef = useRef(false);
  const [state, setState] = useState("static");
  const [interactive, setInteractive] = useState(false);
  const hintId = useId();
  const live = state === "live";

  // Keep the renderer's hold gate in sync with global pause and the cinema.
  useEffect(() => {
    holdRef.current = paused || cinemaPlaying;
    ctrlRef.current?.setHold(holdRef.current);
  }, [paused, cinemaPlaying]);

  useEffect(() => {
    if (reduced) {
      setState("reduced");
      setInteractive(false);
      return undefined;
    }
    const holder = holderRef.current;
    if (!holder) return undefined;

    let cancelled = false;
    let canvas = null;
    let ctrl = null;
    let idleId = 0;
    let timerId = 0;

    const teardown = () => {
      ctrl?.dispose();
      canvas?.remove();
      if (ctrlRef.current === ctrl) ctrlRef.current = null;
      ctrl = null;
      canvas = null;
    };

    const start = () => {
      idleId = 0;
      timerId = 0;
      if (cancelled) return;
      setState("loading");
      import("./renderer.js")
        .then(({ createMedallionRenderer }) => {
          if (cancelled) return;
          canvas = document.createElement("canvas");
          canvas.className = "medallion-canvas";
          canvas.setAttribute("aria-hidden", "true");
          holder.appendChild(canvas);
          ctrl = createMedallionRenderer(canvas, {
            onReady: () => {
              if (!cancelled) setState("live");
            },
            onInteractiveChange: (next) => {
              if (!cancelled) setInteractive(next);
            },
            onFail: (reason) => {
              if (cancelled) return;
              teardown();
              setInteractive(false);
              setState(reason === "unsupported" ? "unsupported" : "fallback");
            },
          });
          ctrlRef.current = ctrl;
          ctrl.setHold(holdRef.current);
        })
        .catch(() => {
          if (!cancelled) {
            teardown();
            setInteractive(false);
            setState("fallback");
          }
        });
    };

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(start, { timeout: 1800 });
    } else {
      timerId = window.setTimeout(start, 250);
    }

    return () => {
      cancelled = true;
      if (idleId) window.cancelIdleCallback(idleId);
      if (timerId) window.clearTimeout(timerId);
      teardown();
    };
  }, [reduced]);

  const onKeyDown = (event) => {
    if (!live) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      ctrlRef.current?.toggleInteractive();
    } else if (event.key === "Escape" && interactive) {
      event.preventDefault();
      ctrlRef.current?.resumeSpin();
    } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      ctrlRef.current?.nudge(event.key === "ArrowLeft" ? -1 : 1);
    }
  };

  const pointer = (method) => (event) => {
    if (live) ctrlRef.current?.[method](event);
  };

  return (
    <div className="medallion">
      <div
        className="medallion-stage"
        data-state={state}
        data-interactive={interactive ? "true" : "false"}
        role="button"
        aria-pressed={live ? interactive : undefined}
        aria-label="The Harness Lab medallion — spins continuously; click to stop and turn in 3D"
        aria-describedby={live ? hintId : undefined}
        tabIndex={live ? 0 : undefined}
        onKeyDown={onKeyDown}
        onPointerDown={pointer("pointerDown")}
        onPointerMove={pointer("pointerMove")}
        onPointerUp={pointer("pointerUp")}
        onPointerCancel={pointer("pointerUp")}
      >
        <div className="medallion-pool" aria-hidden="true" />
        <Bezel />
        <div className="medallion-face">
          <Picture
            className="medallion-picture"
            srcSet="/brand/harness-lab-hero-aligned-512.webp 512w, /brand/harness-lab-hero-aligned.webp 1024w"
            sizes="(min-width: 1024px) min(45vw, 720px), (min-width: 768px) min(40vw, 340px), 60vw"
            fallback="/brand/harness-lab-copper-marble.png"
            alt="The Harness Lab medallion: a winged bust in copper and white marble, ringed by the inscription The Harness Lab"
            width={1024}
            height={1024}
            priority
          />
          <div ref={holderRef} className="medallion-canvas-holder" />
        </div>
        {live && (
          <span id={hintId} className="sr-only">
            {interactive
              ? "Stopped for inspection. Drag to turn and tilt the medallion, or click cleanly to resume spinning."
              : "Spinning slowly. Click on the medallion to stop it and drag to inspect in 3D."}
          </span>
        )}
      </div>
    </div>
  );
}
