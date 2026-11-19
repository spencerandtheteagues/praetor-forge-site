import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Raised from "./Raised.jsx";

/**
 * <Picture> — WebP source (+ optional responsive srcSet) with a PNG/JPG fallback.
 * Always pass intrinsic width/height so layout never shifts.
 *   webp:      "/products/x.webp"           (single source) …or…
 *   srcSet:    "/a-640.webp 640w, /a.webp 1254w" (responsive webp)
 *   fallback:  "/products/x.png"            (img src)
 */
export function Picture({
  webp,
  srcSet,
  sizes,
  fallback,
  alt = "",
  width,
  height,
  className,
  imgClassName,
  priority = false,
  style,
}) {
  return (
    <picture className={className}>
      {(srcSet || webp) && (
        <source type="image/webp" srcSet={srcSet || webp} sizes={sizes} />
      )}
      <img
        className={imgClassName}
        src={fallback || webp}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : undefined}
        style={style}
      />
    </picture>
  );
}

/**
 * <ImageViewer> — modal <dialog> for full-size inspection + optional multi-shot
 * gallery carousel. Mount it only while open (verify-redesign.mjs expects zero
 * <dialog> elements after Escape) and focus returns to whatever opened it.
 *   image: { src, alt, caption?, width?, height?, gallery?: [...], index?: number }
 */
export function ImageViewer({ image, onClose }) {
  const ref = useRef(null);
  const gallery = Array.isArray(image.gallery) && image.gallery.length > 1 ? image.gallery : null;
  const [idx, setIdx] = useState(() =>
    gallery ? Math.min(Math.max(0, image.index ?? 0), gallery.length - 1) : 0,
  );
  const current = gallery ? gallery[idx] : image;

  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      if (previous && typeof previous.focus === "function") previous.focus();
    };
  }, []);

  useEffect(() => {
    if (!gallery) return undefined;
    const onKey = (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setIdx((i) => (i + 1) % gallery.length);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIdx((i) => (i - 1 + gallery.length) % gallery.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gallery]);

  const isTallPage = (current.height || 900) > (current.width || 1440) * 1.8;

  return (
    <dialog
      ref={ref}
      className={`image-dialog ${isTallPage ? "image-dialog--page" : ""}`}
      aria-label={current.alt || "Screenshot preview"}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="dialog-toolbar">
        <div className="dialog-toolbar-meta">
          <span className="mono">The Harness Lab · Evidence archive</span>
          {gallery ? (
            <span className="mono dialog-counter">
              {String(idx + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}
              {current.kindLabel ? ` · ${current.kindLabel}` : ""}
            </span>
          ) : null}
        </div>
        <div className="dialog-toolbar-actions">
          {gallery ? (
            <>
              <button
                type="button"
                className="dialog-nav-btn"
                onClick={() => setIdx((i) => (i - 1 + gallery.length) % gallery.length)}
                aria-label="Previous screenshot"
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                className="dialog-nav-btn"
                onClick={() => setIdx((i) => (i + 1) % gallery.length)}
                aria-label="Next screenshot"
              >
                <ChevronRight aria-hidden="true" />
              </button>
            </>
          ) : null}
          <button type="button" className="dialog-close" onClick={onClose} aria-label="Close image">
            <X aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="dialog-image-well">
        <img
          src={current.src}
          alt={current.alt}
          width={current.width}
          height={current.height}
        />
      </div>
      {current.caption ? <p className="dialog-caption">{current.caption}</p> : null}
    </dialog>
  );
}

/** Engraved chapter heading: Roman numeral + eyebrow + H2 + optional lede. */
export function ChapterHead({ numeral, eyebrow, title, children, align = "left", id }) {
  return (
    <header className={`chapter-head chapter-head--${align}`}>
      <p className="chapter-eyebrow">
        {numeral ? <span className="chapter-numeral">{numeral}</span> : null}
        <span>{eyebrow}</span>
      </p>
      <h2 id={id} className="r3d-title">
        <Raised>{title}</Raised>
      </h2>
      {children ? <div className="chapter-lede">{children}</div> : null}
    </header>
  );
}
