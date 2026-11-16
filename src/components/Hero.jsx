import { ArrowDown, ArrowUpRight, CalendarCheck, Pause, Play } from "lucide-react";
import MedallionStage from "./Medallion/MedallionStage.jsx";
import { CalTrigger } from "./Header.jsx";
import { useMotion } from "../lib/motion.js";

const SPECS = [
  ["5.5 Mos · 1,662 Commits", "305+ git branches taking TitleDesk Agent & Artificial Landman live online"],
  ["9 Gens · 14+ Months", "932+ V8+ commits rebuilding MyAIMediaMgr into BrandStreams without quitting"],
  ["3,850+ Commits · 0 Quit", "Built directly by Spencer Teague — full source code & keys handed to you"],
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
            <span className="hero-line">We figure shit out.</span>{" "}
            <span className="hero-line gold-3d">And we never quit.</span>
          </h1>
          <p className="hero-lede">
            Custom software, autonomous AI harnesses, and full-stack platforms —
            forged through hundreds of branches and thousands of commits until
            real work runs end to end.
          </p>
          <p className="hero-detail">
            Anyone can wire up a weekend AI demo that dies on the first crooked
            courthouse scan, OAuth wall, or hallucinated decimal. From Landman
            title research workflows in TitleDesk Agent and Artificial Landman
            (5.5 months of non-stop work across 305+ branches) to rebuilding
            MyAIMediaMgr across nine generations into BrandStreams: we stay in
            the trenches until it works — and you own every line.
          </p>
          <div className="hero-actions">
            <a className="button button-gold" href="#contact">
              Bring us the hard problem <ArrowUpRight aria-hidden="true" />
            </a>
            <CalTrigger className="button button-outline">
              <CalendarCheck aria-hidden="true" /> Book a 20-min teardown
            </CalTrigger>
            <a className="button button-ghost" href="#trenches">
              See the git proof <ArrowDown aria-hidden="true" />
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
          White marble seal: theharnesslab.com · Black marble seal: theharnesslab.dev
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
        <a className="hero-scroll" href="#trenches" aria-label="Continue to the git war-ledger">
          <ArrowDown aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
