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
            webp="/products/mythos-os-emblem-640.webp"
            fallback="/products/mythos-os-emblem.png"
            alt="Mythos OS emblem"
            width={640}
            height={640}
          />
          <ChapterHead
            numeral="V"
            eyebrow="Mythos OS · Our own harness"
            title={
              <>
                We don&rsquo;t just build harnesses. <em>We run on one.</em>
              </>
            }
            id="our-os-title"
          >
            <p>
              Mythos OS is the harness Spencer Teague built to run The Harness
              Lab: one cockpit for our model subscriptions that coordinates
              agents across a Mac, an Omen workstation and a Kali VPS. It&rsquo;s
              the clearest example we can show of the engineering inside a
              harness, and the same architecture can be shaped around the work
              your business needs done.
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
