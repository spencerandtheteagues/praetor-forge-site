import Explorer from "./Explorer.jsx";
import { ChapterHead, Picture } from "./ui.jsx";
import { MYTHOS_GROUPS, MYTHOS_SCREENS, MYTHOS_STATS } from "../data/mythos.js";

/** Chapter V — Mythos OS, the studio's own cockpit. No props. */
export default function MythosExplorer() {
  return (
    <section
      id="our-os"
      className="section explorer-section explorer-section--mythos"
      aria-labelledby="our-os-title"
    >
      <span id="mythos-demo" className="anchor-alias" aria-hidden="true" />
      <div className="container">
        <div className="explorer-intro">
          <Picture
            className="explorer-emblem"
            webp="/products/mythos-os-seal-640.webp"
            fallback="/products/mythos-os-seal.png"
            alt="Mythos OS emblem"
            width={640}
            height={640}
          />
          <ChapterHead
            numeral="VIII"
            eyebrow="Mythos OS · 17 live operator surfaces"
            title={
              <>
                We don&rsquo;t just sell harnesses. <em>We live inside one.</em>
              </>
            }
            id="our-os-title"
          >
            <p>
              Mythos OS is the command cockpit Spencer Teague engineered to run The
              Harness Lab 24/7: coordinating Claude, Codex, Gemini, and Ollama across
              a Mac, a Linux workstation, and production VPS nodes with 20,911
              knowledge-graph nodes and zero silent failures.
            </p>
          </ChapterHead>
        </div>

        <p className="explorer-framing mono">
          Captured studio environment — 17 production surfaces we operate daily.
        </p>

        <div className="explorer-stats-wrap">
          <p className="explorer-stats-label inscription">As captured</p>
          <dl className="explorer-stats">
            {MYTHOS_STATS.map((s) => (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <Explorer
          id="mythos"
          label="Mythos OS screen groups"
          groups={MYTHOS_GROUPS}
          screens={MYTHOS_SCREENS}
        />

        <p className="explorer-close">
          Every screen here was engineered around how we actually operate. That
          is the point of a harness: it&rsquo;s shaped to the business, not the
          other way around.{" "}
          <a className="text-link" href="#contact">
            Tell us what your operation needs
          </a>
          .
        </p>
      </div>
    </section>
  );
}
