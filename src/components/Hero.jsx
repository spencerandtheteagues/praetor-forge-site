import { ArrowDown, ArrowUpRight, Pause, Play } from "lucide-react";
import MedallionStage from "./Medallion/MedallionStage.jsx";
import { useMotion } from "../lib/motion.js";
import Raised from "./Raised.jsx";
import { SALES_EMAIL, TITLE_DESK_URL } from "../data/site.js";

const SPECS = [
  ["Any industry", "Find a job people still do by hand, then sell the software."],
  ["Same product", "Every customer of a product uses the same software."],
  ["Also shipped", "BrandStreams, APEX.BUILD, and Wealth & Powers OS."],
];

export default function Hero() {
  const { paused, setPaused } = useMotion();
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-grid container">
        <div className="hero-copy">
          <p className="hero-eyebrow">
            <span className="chapter-numeral">I</span>
            <span>The Harness Lab · Spencer Teague, San Angelo</span>
          </p>
          <h1 id="hero-title" className="hero-headline">
            <span className="hl-line hl-dare">
              <span className="hl-seg">
                <Raised>We find the job.</Raised>
              </span>{" "}
              <span className="hl-seg">
                <Raised>We build it.</Raised>
              </span>
            </span>{" "}
            <span className="hl-line hl-vow r3d-gold">
              <span className="hl-seg">
                <Raised>Better and faster.</Raised>
              </span>
            </span>{" "}
            <span className="hl-line hl-us">
              <span className="hl-seg">
                <Raised>Any industry.</Raised>
              </span>{" "}
              <span className="hl-seg">
                <Raised>Paid per run or by subscription.</Raised>
              </span>
            </span>
          </h1>

          <div className="hero-manifesto">
            <p className="hero-what-kicker inscription">
              Software products · Any industry · San Angelo
            </p>
            <p className="hero-lede">
              The Harness Lab is a software company. Spencer Teague, a self-taught
              software engineer in San Angelo, Texas, finds a job in any industry that
              can be automated, then builds software that does it better, cheaper and
              faster than a person.
            </p>
            <p className="hero-live">
              Live now: Title-Desk, Artificial Landman, and AI Landman automate mineral title work.
            </p>
            <div className="hero-actions">
              <a className="button button-gold" href={TITLE_DESK_URL} target="_blank" rel="noopener noreferrer">
                Try Title-Desk <ArrowUpRight aria-hidden="true" />
              </a>
              <a className="button button-outline" href="/contact/">
                Tell us a job to automate
              </a>
            </div>
            <p className="hero-email">
              <a href={`mailto:${SALES_EMAIL}`}>{SALES_EMAIL}</a>
            </p>
            <blockquote className="hero-credo">
              <p>
                “At The Harness Lab, we dream big, start small, take on the
                hardest problems early, and follow every edge case to the root —
                because you will never know what is possible until you have
                found the parts that seemed impossible at first and engineered
                through every single one of them. We ground it out and never
                quit, because when you emerge on the other side, you emerge with
                a proven system and a deep command of how complex software
                actually holds up.”
              </p>
              <footer className="hero-credo-cite mono">
                — Spencer Teague · Software engineer · San Angelo, Texas
              </footer>
            </blockquote>
          </div>

          <dl className="hero-specs">
            {SPECS.map(([term, detail]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="hero-art">
          <div className="hero-glow" aria-hidden="true" />
          <MedallionStage />
        </div>
      </div>
      <div className="hero-bottom container">
        <span className="mono">
          White marble seal: theharnesslab.com · Black marble seal:{" "}
          <a
            className="hero-dev-link"
            href="https://theharnesslab.dev/"
            target="_blank"
            rel="noopener noreferrer"
          >
            theharnesslab.dev
          </a>
        </span>
        <button
          type="button"
          className="motion-control"
          onClick={() => setPaused(!paused)}
          aria-pressed={paused}
        >
          {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          {paused ? "Resume motion" : "Pause motion"}
        </button>
        <a className="hero-scroll" href="#method" aria-label="Continue to how it works">
          <ArrowDown aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
