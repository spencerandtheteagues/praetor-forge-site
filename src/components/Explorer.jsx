import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { LayoutGrid, Maximize2 } from "lucide-react";
import { useImageViewer } from "../lib/useImageViewer.js";
import { useMotion } from "../lib/motion.js";

/**
 * <Explorer> — shared tabbed screen explorer (Mythos OS, Wealth & Powers OS).
 *
 *   id               unique prefix ("mythos", "wealth"); also names the view transition
 *   label            accessible name of the group tablist
 *   groups           [{ id, label, title, intro, screens: [screenId] }]
 *   screens          [{ id, src (no extension), width, height, title, alt, shows,
 *                       matters, full?: { src, width, height } }]
 *   railClassName    extra class on the screen rail (e.g. "investor-thumbnails")
 *   thumbOpensViewer rail clicks also open the image viewer (arrow keys only select)
 *   renderGroupExtra (group, screen) => node rendered under the caption
 *
 * Only the active panel's images are ever rendered; the contact sheet renders
 * its grid only while open. SSR-safe: browser APIs are touched only in effects
 * and handlers.
 */
const KEYS = ["ArrowRight", "ArrowLeft", "Home", "End"];

function nextIndex(key, index, length) {
  if (key === "ArrowRight") return (index + 1) % length;
  if (key === "ArrowLeft") return (index - 1 + length) % length;
  if (key === "Home") return 0;
  return length - 1;
}

const thumbHeight = (s) => Math.floor((480 * s.height) / s.width);

function viewerImage(s) {
  const full = s.full || { src: `${s.src}.webp`, width: s.width, height: s.height };
  return {
    src: full.src,
    width: full.width,
    height: full.height,
    alt: s.alt,
    caption: `${s.title}. ${s.shows}`,
  };
}

export default function Explorer({
  id,
  label,
  groups,
  screens,
  railClassName = "",
  thumbOpensViewer = false,
  renderGroupExtra,
}) {
  const byId = useMemo(() => {
    const map = {};
    screens.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, [screens]);
  const order = useMemo(() => groups.flatMap((g) => g.screens), [groups]);
  const groupOf = useMemo(() => {
    const map = {};
    groups.forEach((g, i) => g.screens.forEach((sid) => (map[sid] = i)));
    return map;
  }, [groups]);

  const first = groups[0].screens[0];
  const [activeId, setActiveId] = useState(first);
  const [shownId, setShownId] = useState(first);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewer, openImage] = useImageViewer();
  const { reduced, paused } = useMotion();

  const tabRefs = useRef([]);
  const railRefs = useRef({});
  const stageRef = useRef(null);
  const resolveRef = useRef(null);

  const groupIndex = groupOf[activeId] ?? 0;
  const group = groups[groupIndex];
  const shown = byId[shownId] || byId[first];
  const vtName = `explorer-stage-${id}`;

  // Keep the previous image on stage until the next one has decoded, then swap
  // (cross-faded with the View Transitions API when available and allowed).
  useEffect(() => {
    if (activeId === shownId) return undefined;
    const next = byId[activeId];
    let cancelled = false;
    const swap = () => {
      if (cancelled) return;
      const root = document.documentElement;
      const canTransition =
        typeof document.startViewTransition === "function" &&
        !reduced &&
        !paused &&
        !document.querySelector("dialog[open]");
      if (!canTransition) {
        setShownId(activeId);
        return;
      }
      root.classList.add("explorer-vt");
      try {
        const transition = document.startViewTransition(
          () =>
            new Promise((resolve) => {
              resolveRef.current = resolve;
              setShownId(activeId);
              window.setTimeout(resolve, 400);
            }),
        );
        transition.finished.finally(() => root.classList.remove("explorer-vt"));
      } catch {
        root.classList.remove("explorer-vt");
        setShownId(activeId);
      }
    };
    const img = new Image();
    img.src = `${next.src}.webp`;
    if (typeof img.decode === "function") img.decode().then(swap, swap);
    else img.onload = img.onerror = swap;
    return () => {
      cancelled = true;
    };
  }, [activeId, shownId, byId, reduced, paused]);

  // Release a pending view transition once React has committed the new screen.
  useLayoutEffect(() => {
    if (resolveRef.current) {
      resolveRef.current();
      resolveRef.current = null;
    }
  }, [shownId]);

  const select = (sid, { instant = false } = {}) => {
    setActiveId(sid);
    if (instant) setShownId(sid);
  };

  const activateGroup = (i) => select(groups[i].screens[0]);

  const onTabKeyDown = (event) => {
    if (!KEYS.includes(event.key)) return;
    event.preventDefault();
    const i = nextIndex(event.key, groupIndex, groups.length);
    activateGroup(i);
    tabRefs.current[i]?.focus();
  };

  const onRailKeyDown = (event) => {
    if (!KEYS.includes(event.key)) return;
    event.preventDefault();
    const list = group.screens;
    const i = nextIndex(event.key, Math.max(0, list.indexOf(activeId)), list.length);
    select(list[i]);
    railRefs.current[list[i]]?.focus();
  };

  const onRailClick = (sid) => {
    if (thumbOpensViewer) {
      select(sid, { instant: true });
      openImage(viewerImage(byId[sid]));
    } else {
      select(sid);
    }
  };

  const onSheetPick = (sid) => {
    select(sid);
    const stage = stageRef.current;
    if (stage) {
      stage.focus({ preventScroll: true });
      stage.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
    }
  };

  const position = order.indexOf(shown.id) + 1;

  return (
    <div className="explorer" data-explorer={id}>
      <div
        className="explorer-tabs"
        role="tablist"
        aria-label={label}
        onKeyDown={onTabKeyDown}
      >
        {groups.map((g, i) => {
          const selected = i === groupIndex;
          return (
            <button
              key={g.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${g.id}`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              className="explorer-tab"
              onClick={() => activateGroup(i)}
            >
              <span className="explorer-tab-label">{g.label}</span>
              <span className="explorer-tab-count" aria-hidden="true">
                {g.screens.length}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="explorer-panel"
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${group.id}`}
      >
        <div className="explorer-stage-col">
          <div className="bezel explorer-bezel">
            <div className="explorer-chrome" aria-live="polite">
              <span className="explorer-chrome-index mono">{String(position).padStart(2, "0")} / {order.length}</span>
              <span className="explorer-chrome-title">{shown.title}</span>
              <span className="explorer-chrome-state mono">Captured surface</span>
            </div>
            <button
              ref={stageRef}
              type="button"
              className="screenshot-button explorer-stage"
              aria-label={`Enlarge screen: ${shown.title}`}
              onClick={() => openImage(viewerImage(shown))}
              style={{ aspectRatio: `${shown.width} / ${shown.height}` }}
            >
              <picture style={{ viewTransitionName: vtName }}>
                <source
                  type="image/webp"
                  srcSet={`${shown.src}-480.webp 480w, ${shown.src}.webp ${shown.width}w`}
                  sizes="(min-width: 1100px) 62vw, 94vw"
                />
                <img
                  src={shown.full ? shown.full.src : `${shown.src}.jpg`}
                  alt={shown.alt}
                  width={shown.width}
                  height={shown.height}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
              <span className="explorer-stage-hint" aria-hidden="true">
                <Maximize2 /> Enlarge
              </span>
            </button>
          </div>

          <ul
            className={`explorer-rail ${railClassName}`.trim()}
            aria-label={`${group.label} screens`}
            onKeyDown={onRailKeyDown}
          >
            {group.screens.map((sid) => {
              const s = byId[sid];
              const current = sid === activeId;
              return (
                <li key={sid}>
                  <button
                    ref={(el) => {
                      railRefs.current[sid] = el;
                    }}
                    type="button"
                    className="explorer-thumb"
                    aria-current={current ? "true" : undefined}
                    aria-label={thumbOpensViewer ? `Enlarge screen: ${s.title}` : undefined}
                    onClick={() => onRailClick(sid)}
                  >
                    <img
                      src={`${s.src}-480.webp`}
                      alt=""
                      width={480}
                      height={thumbHeight(s)}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="explorer-thumb-title">{s.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="explorer-aside">
          <div className="explorer-group-head">
            <h3>{group.title}</h3>
            <p>{group.intro}</p>
          </div>
          <div className="explorer-caption">
            <p className="mono explorer-count">
              Screen {position} of {order.length}
            </p>
            <h4>{shown.title}</h4>
            <dl>
              <div>
                <dt>What it shows</dt>
                <dd>{shown.shows}</dd>
              </div>
              <div>
                <dt>Why it matters</dt>
                <dd>{shown.matters}</dd>
              </div>
            </dl>
          </div>
          {renderGroupExtra ? renderGroupExtra(group, shown) : null}
        </div>
      </div>

      <div className="explorer-sheet-bar">
        <button
          type="button"
          className="button button-outline button-small explorer-sheet-toggle"
          aria-expanded={sheetOpen}
          aria-controls={`${id}-sheet`}
          onClick={() => setSheetOpen((open) => !open)}
        >
          <LayoutGrid aria-hidden="true" />
          {sheetOpen ? "Hide contact sheet" : `View all ${screens.length} screens`}
        </button>
      </div>
      <div id={`${id}-sheet`} className="explorer-sheet">
        {sheetOpen ? (
          <ul className="explorer-sheet-grid" aria-label={`All ${screens.length} screens`}>
            {order.map((sid) => {
              const s = byId[sid];
              return (
                <li key={sid}>
                  <button
                    type="button"
                    className="explorer-sheet-item"
                    aria-current={sid === activeId ? "true" : undefined}
                    onClick={() => onSheetPick(sid)}
                  >
                    <img
                      src={`${s.src}-480.webp`}
                      alt=""
                      width={480}
                      height={thumbHeight(s)}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="explorer-sheet-title">{s.title}</span>
                    <span className="explorer-sheet-group mono">
                      {groups[groupOf[sid]].label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
      {viewer}
    </div>
  );
}
