import { ArrowDown, ArrowUpRight, CalendarCheck, Pause, Play } from "lucide-react";
import MedallionStage from "./Medallion/MedallionStage.jsx";
import { CalTrigger } from "./Header.jsx";
import { useMotion } from "../lib/motion.js";

const SPECS = [
  ["Direct builder", "Work with Spencer Teague, start to finish"],
  ["Verified systems", "Multi-model checks & human gates"],
  ["Client-owned", "Repo, config, tests & runbook"],
];

export default function Hero() {
  const { paused, setPaused } = useMotion();
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-grid container">
        <div className="hero-copy">
          <p className="hero-eyebrow">
            <span className="chapter-numeral">I</span>
            <span>Spencer Teague · Founder &amp; Lead Engineer</span>
          </p>
          <h1 id="hero-title">
            <span className="hero-line">Sovereign AI systems,</span>{" "}
            <em className="hero-line gold-text">engineered around real work.</em>
          </h1>
          <p className="hero-lede">
            Custom software, business websites, workflow automation, and AI agent
            harnesses — built by Spencer Teague and owned by you.
          </p>
          <p className="hero-detail">
            From Landman title research workflows in TitleDesk Agent to multi-model
            verification engines and private operating cockpits: every system ships with
            tests, a runbook, and the keys in your hands.
          </p>
          <div className="hero-actions">
            <a className="button button-gold" href="#contact">
              Build what’s next <ArrowUpRight aria-hidden="true" />
            </a>
            <CalTrigger className="button button-outline">
              <CalendarCheck aria-hidden="true" /> Book a free teardown
            </CalTrigger>
            <a className="button button-ghost" href="#work">
              Explore our work <ArrowDown aria-hidden="true" />
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
        <span className="mono">Applied intelligence · Engineered by hand</span>
        <button
          type="button"
          className="motion-control"
          onClick={() => setPaused(!paused)}
          aria-pressed={paused}
        >
          {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          {paused ? "Resume motion" : "Pause motion"}
        </button>
        <a className="hero-scroll" href="#cinema" aria-label="Continue to the studio film">
          <ArrowDown aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
