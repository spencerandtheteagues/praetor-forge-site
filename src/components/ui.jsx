import { useEffect, useRef } from "react";
import { X } from "lucide-react";

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
 * <ImageViewer> — modal <dialog> for full-size inspection. Mount it only while
 * open (verify-redesign.mjs expects zero <dialog> elements after Escape) and
 * focus returns to whatever opened it.
 *   image: { src, alt, caption?, width?, height? }
 */
export function ImageViewer({ image, onClose }) {
  const ref = useRef(null);
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
  return (
    <dialog
      ref={ref}
      className={`image-dialog ${image.height > image.width * 1.8 ? "image-dialog--page" : ""}`}
      aria-label={image.alt}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="dialog-toolbar">
        <span className="mono">The Harness Lab · Image archive</span>
        <button type="button" className="dialog-close" onClick={onClose} aria-label="Close image">
          <X aria-hidden="true" />
        </button>
      </div>
      <div className="dialog-image-well">
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
        />
      </div>
      {image.caption ? <p className="dialog-caption">{image.caption}</p> : null}
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
      <h2 id={id}>{title}</h2>
      {children ? <div className="chapter-lede">{children}</div> : null}
    </header>
  );
}
