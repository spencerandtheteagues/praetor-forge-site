import { ArrowDown, ArrowUpRight, CalendarCheck, Pause, Play } from "lucide-react";
import MedallionStage from "./Medallion/MedallionStage.jsx";
import { CalTrigger } from "./Header.jsx";
import { useMotion } from "../lib/motion.js";

const SPECS = [
  ["5.5 Mos · 1,662 Commits", "305+ git branches taking TitleDesk Agent & Artificial Landman live online"],
  ["9 Gens · 14+ Months", "932+ V8+ commits rebuilding MyAIMediaMgr into BrandStreams without quitting"],
  ["Full Estate Archive", "Every app charted from Commit #1 LOC to HEAD with real AI-era context"],
];

export default function Hero() {
  const { paused, setPaused } = useMotion();
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-grid container">
        <div className="hero-copy">
          <p className="hero-eyebrow">
            <span className="chapter-numeral">I</span>
            <span>Spencer Teague · Self-Taught Founder &amp; Lead Engineer</span>
          </p>
          <h1 id="hero-title">
            <span className="hero-line">We push the edge.</span>{" "}
            <span className="hero-line gold-3d">And we never quit.</span>
          </h1>

          <div className="hero-manifesto">
            <p className="hero-what-kicker inscription">
              What we do at The Harness Lab
            </p>
            <p className="hero-lede">
              We are constantly pushing the absolute edge of what is possible and
              trying to expand that even further, turning ideas into working code
              in ways people didn’t think could be done — especially not with the
              AI models available at the time (though that’s getting harder to say
              as models get very good).
            </p>
            <blockquote className="hero-credo">
              <p>
                “At The Harness Lab, we dream big, start small, get in over our
                heads, jump the gun wildly, and get stuck in the shit — because
                you will never know what is possible until you have found all the
                things that seemed impossible at the time and conquered every
                single one of them. We ground it out and never quit, because when
                you emerge on the other side, you emerge an expert with a deep
                understanding of how to build the best, most complex software
                there is.”
              </p>
              <footer className="hero-credo-cite mono">
                — Spencer Teague · Founder &amp; Lead Engineer · Landman title, SaaS &amp; autonomous AI harnesses
              </footer>
            </blockquote>
          </div>

          <div className="hero-actions">
            <a className="button button-gold" href="#timeline">
              Explore the progression timeline <ArrowDown aria-hidden="true" />
            </a>
            <CalTrigger className="button button-outline">
              <CalendarCheck aria-hidden="true" /> Book a 20-min teardown
            </CalTrigger>
            <a className="button button-ghost" href="#contact">
              Bring us the hard problem <ArrowUpRight aria-hidden="true" />
            </a>
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
        <a className="hero-scroll" href="#timeline" aria-label="Continue to the chronological progression timeline">
          <ArrowDown aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
