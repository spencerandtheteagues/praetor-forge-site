import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  ArrowUpRight,
  Calendar,
  Code2,
  Columns2,
  Cpu,
  Expand,
  GitCommit,
  Layers,
  Sparkles,
} from "lucide-react";
import { ChapterHead, Picture } from "./ui.jsx";
import { useImageViewer } from "../lib/useImageViewer.js";
import { useMotion } from "../lib/motion.js";
import { onTiltLeave, onTiltMove } from "../lib/tilt3d.js";
import {
  TIMELINE_ERAS,
  TIMELINE_PROJECTS,
  TIMELINE_SUMMARY,
} from "../data/timeline.js";

const LANG_COLORS = [
  "#f6de9c",
  "#ff8a3d",
  "#8fd3ff",
  "#d9a84e",
  "#c8662e",
  "#c4bba8",
];

function fmtNum(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return String(n ?? "—");
  return n.toLocaleString("en-US");
}

function fmtDelta(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return String(n ?? "—");
  return `${n >= 0 ? "+" : ""}${n.toLocaleString("en-US")}`;
}

function ComparisonStage({ comparison, onOpenGalleryShot }) {
  const [splitPct, setSplitPct] = useState(50);
  const [layout, setLayout] = useState("slider"); // "slider" | "side"

  return (
    <div className="timeline-compare">
      <div className="timeline-compare-bar">
        <div className="timeline-compare-labels">
          <span className="compare-pill compare-pill--before mono">
            Before · {comparison.beforeLabel}
          </span>
          <ArrowLeftRight aria-hidden="true" className="compare-arrow" />
          <span className="compare-pill compare-pill--after mono">
            After · {comparison.afterLabel}
          </span>
        </div>
        <div className="timeline-compare-modes" role="group" aria-label="Comparison view mode">
          <button
            type="button"
            className={`compare-mode-btn mono ${layout === "slider" ? "is-active" : ""}`}
            aria-pressed={layout === "slider"}
            onClick={() => setLayout("slider")}
          >
            <ArrowLeftRight aria-hidden="true" /> Drag split
          </button>
          <button
            type="button"
            className={`compare-mode-btn mono ${layout === "side" ? "is-active" : ""}`}
            aria-pressed={layout === "side"}
            onClick={() => setLayout("side")}
          >
            <Columns2 aria-hidden="true" /> Side-by-side
          </button>
        </div>
      </div>

      {layout === "slider" ? (
        <div className="bezel compare-slider-bezel">
          <div
            className="compare-slider-viewport"
            style={{
              "--split": `${splitPct}%`,
              aspectRatio: `${comparison.afterShot.width || 1440} / ${comparison.afterShot.height || 900}`,
            }}
          >
            {/* Base layer: AFTER rename */}
            <Picture
              className="compare-layer compare-layer--after"
              webp={comparison.afterShot.webp}
              fallback={comparison.afterShot.fallback}
              alt={comparison.afterShot.alt}
              width={comparison.afterShot.width || 1440}
              height={comparison.afterShot.height || 900}
            />
            {/* Clipped top layer: BEFORE rename */}
            <div className="compare-clip-before">
              <Picture
                className="compare-layer compare-layer--before"
                webp={comparison.beforeShot.webp}
                fallback={comparison.beforeShot.fallback}
                alt={comparison.beforeShot.alt}
                width={comparison.beforeShot.width || 1440}
                height={comparison.beforeShot.height || 900}
              />
            </div>

            <div className="compare-divider" aria-hidden="true">
              <span className="compare-handle">
                <ArrowLeftRight />
              </span>
            </div>

            <span className="compare-corner compare-corner--left mono">
              {comparison.beforeBadge || "Pre-rename"}
            </span>
            <span className="compare-corner compare-corner--right mono">
              {comparison.afterBadge || "Post-rename"}
            </span>

            <input
              type="range"
              className="compare-range"
              min={4}
              max={96}
              value={splitPct}
              onChange={(e) => setSplitPct(Number(e.target.value))}
              aria-label={`Compare ${comparison.beforeLabel} and ${comparison.afterLabel}`}
            />
          </div>
          <div className="compare-slider-foot">
            <p className="compare-note">{comparison.summary}</p>
            <button
              type="button"
              className="compare-enlarge-link mono"
              onClick={() => onOpenGalleryShot(comparison.afterShot.shotIndex ?? 0)}
            >
              <Expand aria-hidden="true" /> Inspect full-res archive
            </button>
          </div>
        </div>
      ) : (
        <div className="compare-side-grid">
          <figure className="bezel compare-side-card">
            <div className="compare-side-head mono">
              <span>Before · {comparison.beforeLabel}</span>
              <span>{comparison.beforeSub}</span>
            </div>
            <button
              type="button"
              className="compare-side-btn"
              onClick={() => onOpenGalleryShot(comparison.beforeShot.shotIndex ?? 0)}
              aria-label={`Inspect ${comparison.beforeLabel} landing page`}
            >
              <Picture
                webp={comparison.beforeShot.webp}
                fallback={comparison.beforeShot.fallback}
                alt={comparison.beforeShot.alt}
                width={comparison.beforeShot.width || 1440}
                height={comparison.beforeShot.height || 900}
              />
            </button>
          </figure>
          <figure className="bezel compare-side-card">
            <div className="compare-side-head compare-side-head--after mono">
              <span>After · {comparison.afterLabel}</span>
              <span>{comparison.afterSub}</span>
            </div>
            <button
              type="button"
              className="compare-side-btn"
              onClick={() => onOpenGalleryShot(comparison.afterShot.shotIndex ?? 1)}
              aria-label={`Inspect ${comparison.afterLabel} landing page`}
            >
              <Picture
                webp={comparison.afterShot.webp}
                fallback={comparison.afterShot.fallback}
                alt={comparison.afterShot.alt}
                width={comparison.afterShot.width || 1440}
                height={comparison.afterShot.height || 900}
              />
            </button>
          </figure>
        </div>
      )}
    </div>
  );
}

function ProjectVisualStage({ project, openImage }) {
  const shots = project.screenshots || [];
  const [activeIdx, setActiveIdx] = useState(0);
  const [showCompare, setShowCompare] = useState(Boolean(project.comparison));

  if (shots.length === 0) return null;

  const safeIdx = Math.min(activeIdx, shots.length - 1);
  const active = shots[safeIdx];

  const galleryPayload = shots.map((s) => ({
    src: s.webp || s.fallback,
    alt: s.alt || `${project.title} — ${s.title}`,
    caption: `${project.title} (${s.kindLabel}) — ${s.caption}`,
    width: s.width || 1440,
    height: s.height || 900,
    kindLabel: s.kindLabel,
  }));

  const openAt = (idx) => {
    const targetIdx = Math.min(Math.max(0, idx), galleryPayload.length - 1);
    openImage({
      ...galleryPayload[targetIdx],
      gallery: galleryPayload,
      index: targetIdx,
    });
  };

  return (
    <div className="timeline-visuals">
      <div className="timeline-visuals-head">
        <div className="timeline-visuals-title">
          <Layers aria-hidden="true" />
          <h4 className="inscription">Interactive visual evidence</h4>
          <span className="mono timeline-shot-count">
            {shots.length} {shots.length === 1 ? "capture" : "captures"}
          </span>
        </div>

        {project.comparison ? (
          <div className="timeline-stage-switch" role="group" aria-label={`${project.title} visual mode`}>
            <button
              type="button"
              className={`stage-switch-btn mono ${showCompare ? "is-active" : ""}`}
              aria-pressed={showCompare}
              onClick={() => setShowCompare(true)}
            >
              <ArrowLeftRight aria-hidden="true" /> Rename evolution
            </button>
            <button
              type="button"
              className={`stage-switch-btn mono ${!showCompare ? "is-active" : ""}`}
              aria-pressed={!showCompare}
              onClick={() => setShowCompare(false)}
            >
              <Layers aria-hidden="true" /> All {shots.length} screens
            </button>
          </div>
        ) : null}
      </div>

      {project.comparison && showCompare ? (
        <ComparisonStage
          comparison={project.comparison}
          onOpenGalleryShot={(i) => openAt(i)}
        />
      ) : null}

      <div className="timeline-gallery-stage">
        <div className="bezel timeline-bezel">
          <div className="timeline-bezel-chrome">
            <span className="mono timeline-chrome-idx">
              {String(safeIdx + 1).padStart(2, "0")} / {String(shots.length).padStart(2, "0")}
            </span>
            <span className="timeline-chrome-title">{active.title}</span>
            <span className={`mono timeline-kind-pill timeline-kind-pill--${active.kind || "workspace"}`}>
              {active.kindLabel}
            </span>
          </div>
          <button
            type="button"
            className="screenshot-button timeline-main-shot"
            onClick={() => openAt(safeIdx)}
            aria-label={`Enlarge ${project.title} screenshot: ${active.title}`}
            style={{ aspectRatio: `${active.width || 1440} / ${Math.min(active.height || 900, 1020)}` }}
          >
            <Picture
              srcSet={
                active.thumb && active.webp
                  ? `${active.thumb} 640w, ${active.webp} ${active.width || 1440}w`
                  : undefined
              }
              sizes="(min-width: 1180px) 52vw, 92vw"
              webp={active.webp}
              fallback={active.fallback || active.webp}
              alt={active.alt || `${project.title} — ${active.title}`}
              width={active.width || 1440}
              height={active.height || 900}
            />
            <span className="timeline-enlarge-tag mono" aria-hidden="true">
              <Expand /> Full-screen carousel ({safeIdx + 1}/{shots.length})
            </span>
          </button>
        </div>

        <p className="timeline-shot-caption">{active.caption}</p>

        {shots.length > 1 ? (
          <ul className="timeline-filmstrip" aria-label={`${project.title} screenshots`}>
            {shots.map((s, idx) => {
              const isCurrent = idx === safeIdx;
              return (
                <li key={s.id || `${s.webp}-${idx}`}>
                  <button
                    type="button"
                    className={`timeline-thumb ${isCurrent ? "is-active" : ""}`}
                    aria-current={isCurrent ? "true" : undefined}
                    onClick={() => {
                      setActiveIdx(idx);
                      if (showCompare && project.comparison) {
                        // Keep compare visible above while updating gallery stage below
                      }
                    }}
                  >
                    <img
                      src={s.thumb || s.webp || s.fallback}
                      alt=""
                      width={320}
                      height={200}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="timeline-thumb-kind mono">{s.kindLabel}</span>
                    <span className="timeline-thumb-label">{s.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function ProjectMilestone({ project, index, total, openImage, motionDisabled }) {
  const [aiPoint, setAiPoint] = useState("start"); // "start" | "latest"
  const langs = project.languages || [];
  const activeAi =
    aiPoint === "latest" && project.aiLandscapeLatest
      ? project.aiLandscapeLatest
      : project.aiLandscape;
  const activeAiMonth =
    aiPoint === "latest" && project.aiLandscapeLatest
      ? project.endMonthLabel
      : project.startMonthLabel || project.eraWindow;
  const growthMultiple =
    project.initialLoc > 0 && project.latestLoc > project.initialLoc
      ? `${(project.latestLoc / Math.max(1, project.firstAppLoc || project.initialLoc)).toFixed(1)}×`
      : null;

  return (
    <li id={`build-${project.slug}`} className="timeline-item">
      <div className="timeline-node" aria-hidden="true">
        <span className="timeline-node-num mono">{String(index + 1).padStart(2, "0")}</span>
        <span className="timeline-node-date mono">{project.startMonthShort}</span>
      </div>

      <article
        className="timeline-card card-3d"
        onPointerMove={(e) => onTiltMove(e, motionDisabled)}
        onPointerLeave={onTiltLeave}
      >
        {/* Top Dossier Header */}
        <header className="timeline-card-head">
          <div className="timeline-card-badges">
            <span className="timeline-seq-pill mono">
              Build {String(index + 1).padStart(2, "0")} of {String(total).padStart(2, "0")}
            </span>
            <span className="timeline-category-pill mono">{project.category}</span>
            {project.eraBadge ? (
              <span className="timeline-era-pill mono">{project.eraBadge}</span>
            ) : null}
            {project.liveUrl ? (
              <a
                className="timeline-live-link mono"
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {project.liveLabel || "Live deployment"} <ArrowUpRight aria-hidden="true" />
              </a>
            ) : null}
          </div>

          <div className="timeline-title-row">
            <div>
              <h3 className="timeline-project-title">{project.title}</h3>
              {project.lineage ? (
                <p className="timeline-lineage mono">{project.lineage}</p>
              ) : null}
            </div>
            <div className="timeline-span-callout">
              <span className="mono timeline-span-label">Active span</span>
              <strong>{project.durationLabel}</strong>
              <span className="mono timeline-span-commits">
                {fmtNum(project.commitCount)} {project.commitCount === 1 ? "commit" : "commits"}
              </span>
            </div>
          </div>

          <p className="timeline-idea">{project.idea}</p>
          <p className="timeline-arch">
            <span className="mono timeline-inline-tag">Architecture</span>
            {project.architecture}
          </p>
        </header>

        {/* Chronology + Authored LOC Growth Row */}
        <div className="timeline-telemetry-grid">
          <div className="timeline-panel timeline-dates-panel">
            <div className="timeline-panel-head">
              <Calendar aria-hidden="true" />
              <span className="inscription">Exact commit chronology</span>
            </div>
            <dl className="timeline-dates-dl">
              <div>
                <dt className="mono">First commit</dt>
                <dd>
                  <strong>{project.firstCommitDisplay}</strong>
                  <span className="mono timeline-sha">
                    <GitCommit aria-hidden="true" /> {project.firstCommitSha} · {project.firstCommitIso}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="mono">Latest HEAD</dt>
                <dd>
                  <strong>{project.latestCommitDisplay}</strong>
                  <span className="mono timeline-sha">
                    <GitCommit aria-hidden="true" /> {project.latestCommitSha} · {project.latestCommitIso}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="timeline-panel timeline-loc-panel">
            <div className="timeline-panel-head">
              <Code2 aria-hidden="true" />
              <span className="inscription">{project.locUnitLabel || "Authored source LOC"} growth</span>
              {growthMultiple ? (
                <span className="mono timeline-growth-badge">{growthMultiple} expansion</span>
              ) : project.docsLocNote ? (
                <span className="mono timeline-growth-badge">{project.docsLocNote}</span>
              ) : null}
            </div>

            <div className="timeline-loc-stats">
              <div className="loc-cell">
                <span className="mono loc-label">First version LOC</span>
                <strong className="loc-val">{fmtNum(project.initialLoc)}</strong>
                {project.firstAppLoc && project.firstAppLoc !== project.initialLoc ? (
                  <span className="mono loc-sub">
                    1st app commit: {fmtNum(project.firstAppLoc)} ({project.firstAppSha})
                  </span>
                ) : (
                  <span className="mono loc-sub">
                    {fmtNum(project.initialFiles)} {project.initialFiles === 1 ? "file" : "files"} at init
                  </span>
                )}
              </div>

              <div className="loc-arrow" aria-hidden="true">
                →
              </div>

              <div className="loc-cell">
                <span className="mono loc-label">Latest HEAD LOC</span>
                <strong className="loc-val loc-val--gold">{fmtNum(project.latestLoc)}</strong>
                <span className="mono loc-sub">
                  {fmtNum(project.latestFiles)} authored source files
                </span>
              </div>

              <div className="loc-cell loc-cell--delta">
                <span className="mono loc-label">Net LOC delta</span>
                <strong className="loc-val loc-val--sapphire">{fmtDelta(project.locDelta)}</strong>
                <span className="mono loc-sub">Excludes lockfiles &amp; vendor</span>
              </div>
            </div>

            {langs.length > 0 ? (
              <div className="timeline-langs">
                <div className="lang-bar" aria-hidden="true">
                  {langs.map((l, idx) => (
                    <span
                      key={l.name}
                      style={{
                        width: `${Math.max(2, l.pct)}%`,
                        background: LANG_COLORS[idx % LANG_COLORS.length],
                      }}
                    />
                  ))}
                </div>
                <ul className="lang-legend">
                  {langs.slice(0, 5).map((l, idx) => (
                    <li key={l.name} className="mono">
                      <i style={{ background: LANG_COLORS[idx % LANG_COLORS.length] }} aria-hidden="true" />
                      <span>{l.name}</span>
                      <span className="lang-pct">{fmtNum(l.loc)} LOC ({l.pct}%)</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        {/* Historical AI Era Context Matrix */}
        <div className="timeline-ai-era">
          <div className="timeline-ai-head">
            <div className="timeline-ai-title">
              <Cpu aria-hidden="true" />
              <span className="inscription">
                AI model state · {activeAiMonth}
              </span>
            </div>
            <div className="timeline-ai-controls">
              {project.aiLandscapeLatest ? (
                <div className="timeline-ai-toggle" role="group" aria-label="AI era timestamp">
                  <button
                    type="button"
                    className={`compare-mode-btn mono ${aiPoint === "start" ? "is-active" : ""}`}
                    aria-pressed={aiPoint === "start"}
                    onClick={() => setAiPoint("start")}
                  >
                    Start ({project.startMonthLabel})
                  </button>
                  <button
                    type="button"
                    className={`compare-mode-btn mono ${aiPoint === "latest" ? "is-active" : ""}`}
                    aria-pressed={aiPoint === "latest"}
                    onClick={() => setAiPoint("latest")}
                  >
                    Latest ({project.endMonthLabel})
                  </button>
                </div>
              ) : null}
              <span className="mono timeline-models-used">
                <Sparkles aria-hidden="true" /> Repo runtime: {project.modelsCalled}
              </span>
            </div>
          </div>

          <div className="timeline-ai-matrix">
            <div className="ai-provider-card">
              <span className="mono ai-provider-name">OpenAI / ChatGPT</span>
              <p>{activeAi.openai}</p>
            </div>
            <div className="ai-provider-card">
              <span className="mono ai-provider-name">Anthropic / Claude</span>
              <p>{activeAi.anthropic}</p>
            </div>
            <div className="ai-provider-card">
              <span className="mono ai-provider-name">Google / Gemini</span>
              <p>{activeAi.google}</p>
            </div>
          </div>

          <p className="timeline-ai-friction">
            <span className="mono timeline-friction-tag">Why it mattered</span>
            {project.eraFriction}
          </p>
        </div>

        {/* Interactive Visual Evidence Stage */}
        <ProjectVisualStage project={project} openImage={openImage} />
      </article>
    </li>
  );
}

export default function ProgressionTimeline() {
  const [activeEra, setActiveEra] = useState("all");
  const [viewer, openImage] = useImageViewer();
  const { paused, reduced } = useMotion();
  const motionDisabled = paused || reduced;

  const filtered = useMemo(() => {
    if (activeEra === "all") return TIMELINE_PROJECTS;
    return TIMELINE_PROJECTS.filter((p) => p.eraId === activeEra);
  }, [activeEra]);

  return (
    <section
      id="timeline"
      className="section timeline-section"
      aria-labelledby="timeline-title"
    >
      <div className="timeline-backdrop-grid" aria-hidden="true" />
      <div className="container timeline-inner">
        <ChapterHead
          numeral="II"
          eyebrow="Chronological Progression & Project Archive"
          id="timeline-title"
          title={
            <>
              Every build, first commit to HEAD.{" "}
              <span className="gold-3d">Zero fake demos.</span>
            </>
          }
        >
          <p>
            Every application, multi-agent operating system, security daemon, and
            autonomous title engine Spencer built from {TIMELINE_SUMMARY.earliestMonth} to{" "}
            {TIMELINE_SUMMARY.latestMonth} — charted strictly in chronological order
            with exact git timestamps, authored lines-of-code growth, the exact state
            of ChatGPT, Claude, and Gemini in that month, and live screenshots inside
            every workspace.
          </p>
        </ChapterHead>

        {/* Estate-wide Horological Summary Monuments */}
        <div className="timeline-summary-grid">
          {TIMELINE_SUMMARY.monuments.map((m) => (
            <div
              key={m.label}
              className="monument-3d timeline-stat-plinth"
              onPointerMove={(e) => onTiltMove(e, motionDisabled)}
              onPointerLeave={onTiltLeave}
            >
              <p className="monument-value">{m.value}</p>
              <p className="monument-sub mono">{m.subValue}</p>
              <p className="monument-label">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Era Filter Bar */}
        <div className="timeline-controls">
          <div className="timeline-era-filters" role="group" aria-label="Filter timeline by AI era">
            <button
              type="button"
              className={`era-filter-btn ${activeEra === "all" ? "is-active" : ""}`}
              aria-pressed={activeEra === "all"}
              onClick={() => setActiveEra("all")}
            >
              <span className="era-filter-title">All chronological builds</span>
              <span className="mono era-filter-meta">{TIMELINE_PROJECTS.length} systems</span>
            </button>
            {TIMELINE_ERAS.map((era) => {
              const count = TIMELINE_PROJECTS.filter((p) => p.eraId === era.id).length;
              return (
                <button
                  key={era.id}
                  type="button"
                  className={`era-filter-btn ${activeEra === era.id ? "is-active" : ""}`}
                  aria-pressed={activeEra === era.id}
                  onClick={() => setActiveEra(era.id)}
                >
                  <span className="era-filter-title">{era.label}</span>
                  <span className="mono era-filter-meta">
                    {era.window} · {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick-Jump Chronological Index Strip */}
          <nav className="timeline-scrubber" aria-label="Chronological build jump index">
            <ol className="timeline-scrubber-list">
              {filtered.map((p, idx) => (
                <li key={p.slug}>
                  <a className="scrubber-chip" href={`#build-${p.slug}`}>
                    <span className="mono scrubber-num">{String(idx + 1).padStart(2, "0")}</span>
                    <span className="scrubber-name">{p.shortTitle || p.title}</span>
                    <span className="mono scrubber-date">{p.startMonthShort}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Chronological Spine */}
        <ol className="timeline-spine">
          {filtered.map((project, idx) => (
            <ProjectMilestone
              key={project.slug}
              project={project}
              index={idx}
              total={filtered.length}
              openImage={openImage}
              motionDisabled={motionDisabled}
            />
          ))}
        </ol>
      </div>
      {viewer}
    </section>
  );
}
