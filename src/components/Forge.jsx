import { ArrowRight, ArrowUpRight, Expand } from "lucide-react";
import { ChapterHead, Picture } from "./ui.jsx";
import { ShotGallery, TelemetryBadge } from "./Showcase.jsx";
import { useImageViewer } from "../lib/useImageViewer.js";
import { PRODUCT_SHOWCASES } from "../data/products.js";

// Chapter IV·B — Evidence: the four live products, each with its landing page,
// running-workspace gallery, authored-LOC telemetry and a single live link.

const LOGO_SIZES = "(min-width: 1100px) 220px, 40vw";

function ProductSeal({ logo, name }) {
  return (
    <div className="product-seal">
      <Picture
        className="product-seal-art"
        imgClassName="product-seal-img"
        srcSet={`${logo.w640} 640w, ${logo.webp} ${logo.width}w`}
        sizes={LOGO_SIZES}
        fallback={logo.fallback}
        alt={`${name} logo`}
        width={logo.width}
        height={logo.height}
      />
    </div>
  );
}

function BeforeAfter({ product, onOpen }) {
  const { before, after } = product.comparison;
  return (
    <div className="before-after" aria-label={`${product.name} before and after the rename`}>
      {[before, after].map((s, i) => (
        <figure key={s.src} className={`before-after-cell ${i ? "is-after" : "is-before"}`}>
          <button
            type="button"
            className="screenshot-button before-after-shot"
            onClick={() =>
              onOpen({ src: s.src, alt: s.alt, caption: `${s.title}. ${s.caption}`, width: s.width, height: s.height })
            }
            aria-label={`Enlarge ${s.title}`}
          >
            <img
              src={s.src640}
              srcSet={`${s.src640} 640w, ${s.src} ${s.width}w`}
              sizes="(min-width: 900px) 36vw, 92vw"
              alt={s.alt}
              width={s.width}
              height={s.height}
              loading="lazy"
              decoding="async"
            />
            <span className="shot-pill mono" aria-hidden="true">
              <Expand /> Enlarge
            </span>
          </button>
          <figcaption className="mono">{s.title}</figcaption>
        </figure>
      ))}
      <span className="before-after-arrow" aria-hidden="true">
        <ArrowRight />
      </span>
    </div>
  );
}

function ProductShowcase({ product, onOpen }) {
  const anchor = product.id === "title-desk" ? "titledesk" : `product-${product.id}`;
  return (
    <article id={anchor} className="product-showcase" aria-labelledby={`${anchor}-name`}>
      <header className="product-head">
        <ProductSeal logo={product.logo} name={product.name} />
        <div className="product-intro">
          <div className="vitrine-meta-row">
            <span className="vitrine-status mono is-live">{product.status}</span>
            <span className="vitrine-domain mono">{product.domain}</span>
          </div>
          <p className="vitrine-placard">{product.placard}</p>
          <h3 className="product-name" id={`${anchor}-name`}>
            {product.name}
            {product.alsoName ? <span className="product-also"> &amp; {product.alsoName}</span> : null}
          </h3>
          <p className="product-lede">{product.lede}</p>
          <TelemetryBadge items={product.stats} label={`${product.name} build telemetry`} />
          {product.breakdown ? (
            <ul className="product-breakdown">
              {product.breakdown.map(([value, label]) => (
                <li key={label}>
                  <strong>{value}</strong> <span>{label}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="product-actions">
            <a className="button button-gold button-small" href={product.href} target="_blank" rel="noopener noreferrer">
              Visit {product.domain} <ArrowUpRight aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            {product.serviceLink ? (
              <a className="text-link" href={product.serviceLink.href}>
                {product.serviceLink.label} <ArrowRight aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
      </header>
      {product.comparison ? <BeforeAfter product={product} onOpen={onOpen} /> : null}
      <ShotGallery name={product.name} groups={product.groups} onOpen={onOpen} />
    </article>
  );
}

export default function Forge() {
  const [viewer, openImage] = useImageViewer();
  return (
    <section id="work" className="section forge" aria-labelledby="forge-title">
      <span id="products" className="anchor-alias" aria-hidden="true" />
      <div className="forge-plate" aria-hidden="true">
        <img
          src="/plates/forge-architecture-2k.webp"
          srcSet="/plates/forge-architecture-2k.webp 1920w, /plates/forge-architecture-4k.webp 3840w"
          sizes="100vw"
          alt=""
          width="1920"
          height="1080"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="container forge-inner">
        <ChapterHead
          numeral="IV·B"
          eyebrow="Evidence of what we built · Four live products"
          id="forge-title"
          title={
            <>
              Running software. <em>Not mockups.</em>
            </>
          }
        >
          <p>
            Every screen below is a capture of the real product — its landing page and its
            running workspace — with the authored source lines, commits, tests and whole
            months it took to get there. Two flagship title engines that are live today,
            and the two past flagship platforms that taught us how to build them.
          </p>
        </ChapterHead>

        <div className="product-list">
          {PRODUCT_SHOWCASES.map((product) => (
            <ProductShowcase key={product.id} product={product} onOpen={openImage} />
          ))}
        </div>
      </div>
      {viewer}
    </section>
  );
}
