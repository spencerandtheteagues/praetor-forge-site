import { useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Cpu,
  Expand,
  GitBranch,
  Layers,
  Lock,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { ChapterHead, Picture } from "./ui.jsx";
import { TelemetryBadge } from "./Showcase.jsx";
import { useImageViewer } from "../lib/useImageViewer.js";
import { goToContact, useIntake } from "../lib/intake.js";
import { useMotion } from "../lib/motion.js";
import { onTiltLeave, onTiltMove } from "../lib/tilt3d.js";
import {
  KARPATHY_LOOP_STEPS,
  PERIHELION_DEV_URL,
  PERIHELION_MODES,
  PERIHELION_MONUMENTS,
  PERIHELION_PILLARS,
  PERIHELION_STAGES,
  PERIHELION_TELEMETRY,
} from "../data/perihelion.js";

const PILLAR_ICONS = [RefreshCw, GitBranch, Lock, Cpu];

export default function PerihelionSection() {
  const [stageIdx, setStageIdx] = useState(0);
  const [viewer, openImage] = useImageViewer();
  const { prefill } = useIntake();
  const { paused, reduced } = useMotion();
  const motionDisabled = paused || reduced;
  const tabRefs = useRef([]);

  const activeStage = PERIHELION_STAGES[stageIdx];

  const galleryPayload = PERIHELION_STAGES.map((s) => ({
    src: s.webp,
    alt: s.alt,
    caption: `Perihelion Loop (${s.zoomTag}) — ${s.title}. ${s.shows}`,
    width: s.width,
    height: s.height,
    kindLabel: s.zoomTag,
  }));

  const openStageModal = (idx) => {
    const safe = Math.min(Math.max(0, idx), galleryPayload.length - 1);
    openImage({
      ...galleryPayload[safe],
      gallery: galleryPayload,
      index: safe,
    });
  };

  const onTabKeyDown = (e, idx) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    let next = idx;
    if (e.key === "ArrowRight") next = (idx + 1) % PERIHELION_STAGES.length;
    else if (e.key === "ArrowLeft")
      next = (idx - 1 + PERIHELION_STAGES.length) % PERIHELION_STAGES.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = PERIHELION_STAGES.length - 1;
    setStageIdx(next);
    tabRefs.current[next]?.focus();
  };

  const handlePrefill = () => {
    prefill({
      requestType: "An AI harness",
      product: "Perihelion Loop",
    });
    goToContact();
  };

  return (
    <section
      id="perihelion-loop"
      className="section perihelion-section"
      aria-labelledby="perihelion-title"
    >
      <span id="perihelion" className="anchor-alias" aria-hidden="true" />
      <div className="perihelion-orbit-backdrop" aria-hidden="true" />

      <div className="container perihelion-inner">
        <div className="perihelion-head-row">
          <ChapterHead
            numeral="III·B"
            eyebrow="Perihelion Loop · klh v2.2 · Karpathy Loop + cloudroom.dev"
            id="perihelion-title"
            title={
              <>
                Perihelion Loop.{" "}
                <span className="gold-3d">
                  Create, fix, or reverse-engineer anything.
                </span>
              </>
            }
          >
            <p>
              To build, repair, and re-engineer complex software without guessing, we
              forged <strong>Perihelion Loop</strong> on{" "}
              <a
                className="text-link"
                href={PERIHELION_DEV_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                theharnesslab.dev
              </a>{" "}
              — pairing <strong>Andrej Karpathy&rsquo;s autonomous keep-or-revert loop</strong>{" "}
              and typed task graphs with isolated{" "}
              <code>cloudroom.dev</code> Linux sandboxes and an independent{" "}
              <strong>Multi-Provider Review Council</strong>. Every candidate edit is
              tested in isolation and automatically reverted unless the verification suite
              passes across three modes: creating original software, fixing production
              systems, and lawful no-copy reverse-engineering.
            </p>
            <TelemetryBadge items={PERIHELION_TELEMETRY} label="Perihelion Loop build telemetry" />
          </ChapterHead>

          <aside className="perihelion-seal-card card-3d" aria-label="Foundry provenance">
            <Picture
              className="perihelion-seal-emblem"
              srcSet="/brand/harness-lab-black-marble-512.webp 512w, /brand/harness-lab-black-marble.webp 1024w"
              sizes="140px"
              fallback="/brand/harness-lab-black-marble.png"
              alt="The Harness Lab black-marble .dev engineering seal"
              width={512}
              height={512}
            />
            <div className="perihelion-seal-meta">
              <span className="inscription">R&amp;D Centerpiece · klh v2.2</span>
              <strong>Forged at theharnesslab.dev</strong>
              <p>
                Powered by Apache-2.0 <code>cloudroom.dev</code> Linux VMs, OS
                kernel sandboxes, and quota-governed multi-provider review councils.
              </p>
            </div>
          </aside>
        </div>

        {/* Four Cast-Bronze & Marble Proof Plinths */}
        <div className="perihelion-monuments">
          {PERIHELION_MONUMENTS.map((m) => (
            <div
              key={m.value}
              className="monument-3d perihelion-plinth"
              onPointerMove={(e) => onTiltMove(e, motionDisabled)}
              onPointerLeave={onTiltLeave}
            >
              <span className="monument-shine" aria-hidden="true" />
              <p className="monument-value">{m.value}</p>
              <p className="monument-sub mono">{m.subValue}</p>
              <p className="monument-label">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Transactional Karpathy Keep-or-Revert Cycle Conduit */}
        <div className="perihelion-cycle-strip" aria-label="Karpathy autonomous keep-or-revert loop stages">
          <div className="perihelion-cycle-head">
            <span className="inscription">
              <RefreshCw aria-hidden="true" /> Transactional Karpathy Loop Spine
            </span>
            <span className="mono perihelion-cycle-sub">
              Every candidate edit is proven on exact bytes or reverted automatically
            </span>
          </div>
          <ol className="perihelion-cycle-steps">
            {KARPATHY_LOOP_STEPS.map((item) => (
              <li key={item.step} className="perihelion-cycle-node">
                <span className="perihelion-cycle-num mono">{item.step}</span>
                <strong>{item.name}</strong>
                <p>{item.detail}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Four-Layer Architecture Grid: How Perihelion Loop Was Built */}
        <div className="perihelion-pillars-block">
          <header className="perihelion-subhead">
            <p className="inscription">How we built it</p>
            <h3>
              Four hardened layers turning raw frontier models into a{" "}
              <span className="gold-3d">deterministic software foundry.</span>
            </h3>
          </header>
          <div className="perihelion-pillars-grid">
            {PERIHELION_PILLARS.map((pillar, idx) => {
              const Icon = PILLAR_ICONS[idx] || ShieldCheck;
              return (
                <article
                  key={pillar.code}
                  className="perihelion-pillar card-3d"
                  onPointerMove={(e) => onTiltMove(e, motionDisabled)}
                  onPointerLeave={onTiltLeave}
                >
                  <div className="perihelion-pillar-top">
                    <span className="perihelion-pillar-icon" aria-hidden="true">
                      <Icon />
                    </span>
                    <span className="mono perihelion-pillar-code">{pillar.code}</span>
                  </div>
                  <h4>{pillar.title}</h4>
                  <p>{pillar.body}</p>
                </article>
              );
            })}
          </div>
        </div>

        {/* Three Capability Modes: Create, Fix, No-Copy Reverse-Engineer */}
        <div className="perihelion-modes-block">
          <header className="perihelion-subhead">
            <p className="inscription">What it achieves in production</p>
            <h3>
              One autonomous harness to{" "}
              <span className="gold-3d">create, fix, or carry out no-copy reverse-engineering</span>{" "}
              at verified quality.
            </h3>
          </header>

          <div className="perihelion-modes-grid">
            {PERIHELION_MODES.map((mode) => (
              <article
                key={mode.numeral}
                className="perihelion-mode card-3d"
                onPointerMove={(e) => onTiltMove(e, motionDisabled)}
                onPointerLeave={onTiltLeave}
              >
                <div className="perihelion-mode-head">
                  <span className="perihelion-mode-num mono">{mode.numeral}</span>
                  <span className="perihelion-mode-badge mono">{mode.badge}</span>
                </div>
                <h4>{mode.title}</h4>
                <p className="perihelion-mode-summary">{mode.summary}</p>
                <p className="perihelion-mode-proof">
                  <ShieldCheck aria-hidden="true" />
                  <span>{mode.proof}</span>
                </p>
                {mode.disclosure ? (
                  <p className="perihelion-mode-disclosure">{mode.disclosure}</p>
                ) : null}
              </article>
            ))}
          </div>
        </div>

        {/* Interactive 5-Stage Perihelion Cockpit Viewer */}
        <div className="perihelion-cockpit">
          <header className="perihelion-cockpit-head">
            <div>
              <p className="inscription">
                <Layers aria-hidden="true" /> Interactive 5-Stage Perihelion Cockpit
              </p>
              <h3>
                Inspect every zoom level —{" "}
                <span className="gold-3d">from fleet DAGs down to the kernel sandbox.</span>
              </h3>
            </div>
            <span className="mono perihelion-cockpit-meta">
              5 live klh v2.2 &amp; Cloudroom captures
            </span>
          </header>

          <div
            className="perihelion-stage-tabs"
            role="tablist"
            aria-label="Perihelion Loop cockpit stages"
          >
            {PERIHELION_STAGES.map((stage, idx) => {
              const selected = idx === stageIdx;
              return (
                <button
                  key={stage.id}
                  ref={(el) => {
                    tabRefs.current[idx] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`perihelion-tab-${stage.id}`}
                  aria-selected={selected}
                  aria-controls="perihelion-stage-panel"
                  tabIndex={selected ? 0 : -1}
                  className={`perihelion-stage-tab ${selected ? "is-active" : ""}`}
                  onClick={() => setStageIdx(idx)}
                  onKeyDown={(e) => onTabKeyDown(e, idx)}
                >
                  <span className="mono perihelion-tab-idx">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="perihelion-tab-label">{stage.shortLabel}</span>
                </button>
              );
            })}
          </div>

          <div
            id="perihelion-stage-panel"
            role="tabpanel"
            aria-labelledby={`perihelion-tab-${activeStage.id}`}
            className="perihelion-stage-body"
          >
            <div className="perihelion-stage-media">
              <div className="bezel perihelion-bezel">
                <div className="perihelion-chrome" aria-live="polite">
                  <span className="mono perihelion-chrome-idx">
                    {String(stageIdx + 1).padStart(2, "0")} /{" "}
                    {String(PERIHELION_STAGES.length).padStart(2, "0")}
                  </span>
                  <span className="perihelion-chrome-title">{activeStage.title}</span>
                  <span className="mono perihelion-chrome-tag">{activeStage.zoomTag}</span>
                </div>

                <button
                  type="button"
                  className="screenshot-button perihelion-shot-btn"
                  onClick={() => openStageModal(stageIdx)}
                  aria-label={`Enlarge Perihelion Loop screen: ${activeStage.title}`}
                  style={{ aspectRatio: `${activeStage.width} / ${activeStage.height}` }}
                >
                  <Picture
                    srcSet={`${activeStage.thumb} 640w, ${activeStage.webp} ${activeStage.width}w`}
                    sizes="(min-width: 1180px) 58vw, 94vw"
                    webp={activeStage.webp}
                    fallback={activeStage.webp}
                    alt={activeStage.alt}
                    width={activeStage.width}
                    height={activeStage.height}
                  />
                  <span className="perihelion-enlarge-pill mono" aria-hidden="true">
                    <Expand /> Inspect full-screen ({stageIdx + 1}/{PERIHELION_STAGES.length})
                  </span>
                </button>
              </div>

              <ul className="perihelion-filmstrip" aria-label="Perihelion cockpit thumbnails">
                {PERIHELION_STAGES.map((stage, idx) => {
                  const current = idx === stageIdx;
                  return (
                    <li key={stage.id}>
                      <button
                        type="button"
                        className={`perihelion-thumb ${current ? "is-active" : ""}`}
                        aria-current={current ? "true" : undefined}
                        onClick={() => setStageIdx(idx)}
                      >
                        <img
                          src={stage.thumb}
                          alt=""
                          width={320}
                          height={200}
                          loading="lazy"
                          decoding="async"
                        />
                        <span className="mono perihelion-thumb-tag">{stage.zoomTag}</span>
                        <span className="perihelion-thumb-title">{stage.shortLabel}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <aside className="perihelion-stage-dossier card-3d">
              <p className="mono perihelion-dossier-count">
                Stage {String(stageIdx + 1).padStart(2, "0")} of{" "}
                {String(PERIHELION_STAGES.length).padStart(2, "0")} · {activeStage.zoomTag}
              </p>
              <h4>{activeStage.title}</h4>
              <dl className="perihelion-dossier-dl">
                <div>
                  <dt className="mono">What you are inspecting</dt>
                  <dd>{activeStage.shows}</dd>
                </div>
                <div>
                  <dt className="mono">Verification invariant</dt>
                  <dd>{activeStage.invariant}</dd>
                </div>
              </dl>

              <div className="perihelion-ctas">
                <a
                  className="button button-gold"
                  href={PERIHELION_DEV_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Inspect the Perihelion Loop architecture on theharnesslab.dev{" "}
                  <ArrowUpRight aria-hidden="true" />
                </a>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={handlePrefill}
                >
                  Scope a Perihelion build or repair <ArrowRight aria-hidden="true" />
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {viewer}
    </section>
  );
}
