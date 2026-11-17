import { ArrowRight, ArrowUpRight, Expand } from "lucide-react";
import { ChapterHead, Picture } from "./ui.jsx";
import { useImageViewer } from "../lib/useImageViewer.js";
import { goToContact, useIntake } from "../lib/intake.js";
import { useMotion } from "../lib/motion.js";
import { onTiltLeave, onTiltMove } from "../lib/tilt3d.js";
import { FORGE_ROWS, SHIPPED_SITES } from "../data/products.js";

const LOGO_SIZES = "(min-width: 1400px) 380px, (min-width: 760px) 32vw, 84vw";

function LogoArt({ logo, alt }) {
  if (logo.svg) {
    if (logo.medallionWrap) {
      return (
        <div className="vitrine-medallion-frame">
          <svg className="vitrine-medallion-ring" viewBox="0 0 200 200" aria-hidden="true">
            <circle cx="100" cy="100" r="94" className="medallion-ring-outer" />
            <circle cx="100" cy="100" r="82" className="medallion-ring-inner" />
            {Array.from({ length: 36 }, (_, i) => (
              <line
                key={i}
                x1="100"
                y1={i % 3 === 0 ? "8" : "12"}
                x2="100"
                y2="17"
                transform={`rotate(${i * 10} 100 100)`}
              />
            ))}
          </svg>
          <span className="vitrine-medallion-well">
            <img
              className="vitrine-logo vitrine-logo--medallion"
              src={logo.svg}
              alt={alt}
              width={logo.width}
              height={logo.height}
              loading="lazy"
              decoding="async"
            />
          </span>
        </div>
      );
    }
    return (
      <img
        className="vitrine-logo"
        src={logo.svg}
        alt={alt}
        width={logo.width}
        height={logo.height}
        loading="lazy"
        decoding="async"
      />
    );
  }
  const srcSet = logo.w640
    ? `${logo.w640} ${logo.w640Width || 640}w, ${logo.webp} ${logo.width}w`
    : undefined;
  return (
    <Picture
      className="vitrine-art"
      imgClassName="vitrine-logo"
      webp={logo.webp}
      srcSet={srcSet}
      sizes={srcSet ? LOGO_SIZES : undefined}
      fallback={logo.fallback}
      alt={alt}
      width={logo.width}
      height={logo.height}
    />
  );
}

function ItemAction({ item, onPrefill }) {
  const { action } = item;
  if (action.type === "prefill") {
    return (
      <button
        type="button"
        className="vitrine-link vitrine-link--button"
        onClick={() => onPrefill(action)}
      >
        {action.label} <ArrowRight aria-hidden="true" />
      </button>
    );
  }
  if (action.external) {
    return (
      <a
        className="vitrine-link"
        href={action.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {action.label} <span aria-hidden="true">↗</span>
        <span className="sr-only">: {item.name} (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <a className="vitrine-link" href={action.href}>
      {action.label} <span aria-hidden="true">{action.arrow || "→"}</span>
    </a>
  );
}

function Vitrine({ item, onOpen, onPrefill, motionDisabled }) {
  const anchor = item.id === "titledesk" ? "titledesk" : `forge-${item.id}`;
  const isLiveExternal = item.action?.external && item.action?.label === "Live site";
  return (
    <article
      id={anchor}
      className={`vitrine ${item.plaque ? "vitrine--plaque" : ""}`}
      style={{ "--scale": item.visualScale }}
      onPointerMove={(e) => onTiltMove(e, motionDisabled)}
      onPointerLeave={onTiltLeave}
    >
      <div className="vitrine-stage">
        <svg className="vitrine-indices" viewBox="0 0 320 240" aria-hidden="true">
          <path d="M18 44V18H44 M276 18H302V44 M18 196V222H44 M276 222H302V196" />
          {Array.from({ length: 21 }, (_, i) => (
            <line key={i} x1={40 + i * 12} x2={40 + i * 12} y1="18" y2={i % 5 === 0 ? 28 : 23} />
          ))}
        </svg>
        <span className="vitrine-pool" aria-hidden="true" />
        {item.plaque ? (
          <figure className="vitrine-plaque">
            <Picture
              srcSet={`${item.plaque.webp} ${item.plaque.webpWidth || 480}w, ${item.plaque.webpFull} ${item.plaque.fullWidth || 1600}w`}
              sizes="(min-width: 1400px) 380px, (min-width: 760px) 32vw, 84vw"
              fallback={item.plaque.fallback}
              alt={item.plaque.alt}
              width={item.plaque.width}
              height={item.plaque.height}
            />
          </figure>
        ) : (
          <LogoArt logo={item.logo} alt={`${item.name} logo`} />
        )}
        <span className="vitrine-shadow" aria-hidden="true" />
        <span className="vitrine-plinth" aria-hidden="true" />
        <span className="vitrine-reflection" aria-hidden="true" />
      </div>

      <div className="vitrine-meta-row">
        {item.status ? (
          <span className={`vitrine-status mono ${isLiveExternal ? "is-live" : ""}`}>
            {item.status}
          </span>
        ) : null}
        {item.domain ? <span className="vitrine-domain mono">{item.domain}</span> : null}
      </div>
      <p className="vitrine-placard">{item.placard}</p>
      <h4 className="vitrine-name">{item.name}</h4>
      <p className="vitrine-copy">{item.copy}</p>

      <div className="vitrine-actions">
        <ItemAction item={item} onPrefill={onPrefill} />
        {item.serviceLink ? (
          <a
            className="vitrine-service"
            href={item.serviceLink.href}
            target={item.serviceLink.external ? "_blank" : undefined}
            rel={item.serviceLink.external ? "noopener noreferrer" : undefined}
          >
            {item.serviceLink.label}{" "}
            {item.serviceLink.external ? (
              <ArrowUpRight aria-hidden="true" />
            ) : (
              <ArrowRight aria-hidden="true" />
            )}
          </a>
        ) : null}
      </div>

      {item.preview ? (
        <button
          type="button"
          className="screenshot-button vitrine-preview"
          onClick={() =>
            onOpen({
              src: item.preview.src,
              alt: item.preview.alt,
              caption: item.preview.caption,
              width: item.preview.width,
              height: item.preview.height,
            })
          }
          aria-label={item.preview.label}
        >
          <img
            src={item.preview.src}
            alt={item.preview.alt}
            width={item.preview.width}
            height={item.preview.height}
            loading="lazy"
            decoding="async"
          />
          <span className="vitrine-preview-tag mono">
            <Expand aria-hidden="true" /> Runsheet preview
          </span>
        </button>
      ) : null}
    </article>
  );
}

function ShippedSites({ onOpen }) {
  return (
    <div className="forge-sites">
      <header className="forge-subhead">
        <h4 className="forge-subhead-title">Shipped business websites</h4>
        <p className="forge-row-kicker">Live sites for Texas trades, captured full-length</p>
      </header>
      <ul className="sites-grid">
        {SHIPPED_SITES.map((site) => (
          <li key={site.id} className="site-card">
            <button
              type="button"
              className="screenshot-button site-thumb"
              onClick={() =>
                onOpen({
                  src: site.src,
                  alt: `${site.name} website, full homepage`,
                  caption: `${site.name} · ${site.place} · built by The Harness Lab`,
                  width: site.width,
                  height: site.height,
                })
              }
              aria-label={`Open the full ${site.name} homepage`}
            >
              <img
                src={site.src}
                alt={`${site.name} homepage, top of page`}
                width={site.width}
                height={site.height}
                loading="lazy"
                decoding="async"
              />
              <span className="site-thumb-tag mono">
                <Expand aria-hidden="true" /> Full page
              </span>
            </button>
            <p className="vitrine-placard">
              {site.trade} · {site.place}
            </p>
            <p className="site-name">{site.name}</p>
          </li>
        ))}
      </ul>
      <a className="text-link forge-sites-link" href="/website-design-development/">
        Business website development <ArrowUpRight aria-hidden="true" />
      </a>
    </div>
  );
}

export default function Forge() {
  const [viewer, openImage] = useImageViewer();
  const { prefill } = useIntake();
  const { paused, reduced } = useMotion();
  const motionDisabled = paused || reduced;
  const onPrefill = ({ requestType, product }) => {
    prefill({ requestType, product });
    goToContact();
  };

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
          numeral="VI"
          eyebrow="The forge · Every build on 3D plinths"
          id="forge-title"
          title={
            <>
              Built the hard way. <em>Owned in full.</em>
            </>
          }
        >
          <p>
            Autonomous county title engines forged across 5.5 straight months, the
            black-marble .dev engineering foundry, multi-agent operating cockpits,
            nine-generation SaaS platforms, and live Texas trade websites — all built
            by the same relentless engineer.
          </p>
        </ChapterHead>

        {FORGE_ROWS.map((row) => (
          <div key={row.id} className={`forge-row forge-row--${row.id}`}>
            <header className="forge-row-head">
              <span className="forge-row-letter" aria-hidden="true">
                {row.letter}
              </span>
              <div>
                <h3 className="forge-row-title">{row.title}</h3>
                <p className="forge-row-kicker">{row.kicker}</p>
              </div>
            </header>
            <div className="vitrines">
              {row.items.map((item) => (
                <Vitrine
                  key={item.id}
                  item={item}
                  onOpen={openImage}
                  onPrefill={onPrefill}
                  motionDisabled={motionDisabled}
                />
              ))}
            </div>
            {row.id === "ventures" ? <ShippedSites onOpen={openImage} /> : null}
          </div>
        ))}
      </div>
      {viewer}
    </section>
  );
}
