import { useMemo, useState } from "react";
import { Expand } from "lucide-react";

/**
 * <TelemetryBadge> — compact engraved stat strip ("22,582 · Authored LOC").
 *   items: [[value, label], ...]
 */
export function TelemetryBadge({ items, label = "Build telemetry", className = "" }) {
  return (
    <dl className={`telemetry-badge ${className}`} aria-label={label}>
      {items.map(([value, term]) => (
        <div key={term}>
          <dt>{term}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

const viewerOf = (s, name) => ({
  src: s.src,
  alt: s.alt,
  caption: `${name} — ${s.title}. ${s.caption}`,
  width: s.width,
  height: s.height,
  kindLabel: s.group,
});

/**
 * <ShotGallery> — interactive screenshot gallery: one large stage + a rail of
 * grouped thumbnails. Contract with verify-redesign.mjs: only the active
 * screenshot renders as a `.screenshot-button`; rail buttons only switch.
 *   name    product name used in captions / accessible labels
 *   groups  [{ label, shots: [{ src, src640, width, height, title, caption, alt }] }]
 *   onOpen  image-viewer opener from useImageViewer()
 */
export function ShotGallery({ name, groups, onOpen, sizes = "(min-width: 1180px) 60vw, 94vw" }) {
  const flat = useMemo(
    () => groups.flatMap((g) => g.shots.map((s) => ({ ...s, group: g.label }))),
    [groups],
  );
  const [index, setIndex] = useState(0);
  const active = flat[index];
  const total = String(flat.length).padStart(2, "0");
  const open = () =>
    onOpen({
      ...viewerOf(active, name),
      gallery: flat.map((s) => viewerOf(s, name)),
      index,
    });
  const offsets = groups.map((_, gi) =>
    groups.slice(0, gi).reduce((sum, g) => sum + g.shots.length, 0),
  );

  return (
    <div className="shot-gallery">
      <div className="shot-stage">
        <div className="bezel shot-bezel">
          <button
            type="button"
            className="screenshot-button shot-main"
            onClick={open}
            aria-label={`Enlarge ${name} screen: ${active.title}`}
            style={{ aspectRatio: `${active.width} / ${active.height}` }}
          >
            <img
              key={active.src}
              src={active.src}
              srcSet={`${active.src640} 640w, ${active.src} ${active.width}w`}
              sizes={sizes}
              alt={active.alt}
              width={active.width}
              height={active.height}
              loading="lazy"
              decoding="async"
            />
            <span className="shot-pill mono" aria-hidden="true">
              <Expand /> Inspect full-screen
            </span>
          </button>
        </div>
        <div className="shot-caption" aria-live="polite">
          <p className="mono shot-caption-meta">
            {active.group} · {String(index + 1).padStart(2, "0")} / {total}
          </p>
          <h4>{active.title}</h4>
          <p>{active.caption}</p>
        </div>
      </div>
      <div className="shot-rail" role="group" aria-label={`${name} screens`}>
        {groups.map((g, gi) => (
          <div key={g.label} className="shot-rail-group">
            {groups.length > 1 ? <p className="shot-rail-label mono">{g.label}</p> : null}
            <ul>
              {g.shots.map((s, si) => {
                const i = offsets[gi] + si;
                const current = i === index;
                return (
                  <li key={`${g.label}-${s.src}`}>
                    <button
                      type="button"
                      className={`shot-thumb ${current ? "is-active" : ""}`}
                      aria-pressed={current}
                      onClick={() => setIndex(i)}
                    >
                      <img
                        src={s.src640}
                        alt=""
                        width={640}
                        height={400}
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="shot-thumb-title">{s.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
