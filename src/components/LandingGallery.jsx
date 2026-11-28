import { Expand } from "lucide-react";
import { ChapterHead } from "./ui.jsx";
import { useImageViewer } from "../lib/useImageViewer.js";
import { LANDING_GALLERY } from "../data/products.js";

// Chapter VI — landing pages & product entry surfaces. Deliberately carries no
// site addresses and no outbound links (verify-redesign.mjs asserts both).
export default function LandingGallery() {
  const [viewer, openImage] = useImageViewer();
  const gallery = LANDING_GALLERY.map((item) => ({
    src: item.src,
    alt: `${item.name} — ${item.kind}`,
    caption: `${item.name} · ${item.kind}. ${item.body}`,
    width: item.width,
    height: item.height,
    kindLabel: item.name,
  }));
  return (
    <section id="landing-gallery" className="section landing-gallery" aria-labelledby="landing-gallery-title">
      <div className="container">
        <ChapterHead
          numeral="VI"
          eyebrow="Earlier sites"
          id="landing-gallery-title"
          title={
            <>
              First impressions, <em>engineered.</em>
            </>
          }
        >
          <p>
            Earlier landing pages and websites. The products for sale are Title-Desk,
            Artificial Landman and AI Landman. Select any card to inspect it full-screen.
          </p>
        </ChapterHead>
        <ul className="landing-grid">
          {LANDING_GALLERY.map((item, i) => (
            <li key={item.id} className={`landing-card ${item.page ? "landing-card--page" : ""}`}>
              <button
                type="button"
                className="screenshot-button landing-thumb"
                onClick={() => openImage({ ...gallery[i], gallery, index: i })}
                aria-label={`Inspect the ${item.name} ${item.page ? "full-length website" : "landing screen"}`}
              >
                <img
                  src={item.thumb || item.src}
                  alt={`${item.name} — ${item.kind}`}
                  width={item.thumb ? 640 : item.width}
                  height={item.thumb ? 400 : item.height}
                  loading="lazy"
                  decoding="async"
                />
                <span className="shot-pill mono" aria-hidden="true">
                  <Expand /> {item.page ? "Full page" : "Inspect"}
                </span>
              </button>
              <p className="vitrine-placard">{item.kind}</p>
              <h3 className="landing-name">{item.name}</h3>
              <p className="landing-body">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
      {viewer}
    </section>
  );
}
