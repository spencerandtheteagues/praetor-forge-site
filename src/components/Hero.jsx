import { ArrowDown, ArrowUpRight, CalendarCheck, Pause, Play } from "lucide-react";
import MedallionStage from "./Medallion/MedallionStage.jsx";
import { CalTrigger } from "./Header.jsx";
import { useMotion } from "../lib/motion.js";
import Raised from "./Raised.jsx";

const SPECS = [
  ["4 Months · 1,662 Commits", "Taking Title-Desk from a desktop workstation to live online Texas county runs (Aug–Nov 2026)"],
  ["14 Months · 9 Generations", "Rebuilding MyAIMediaMgr into BrandStreams across 1,364 commits until every edge case held"],
  ["5-Star Client OS", "Wealth & Powers OS, built and installed in a single session for investor Jayson Powers"],
];

const OFFERS = [
  ["Bespoke workflow automation", "Documents, requests and client work turned into tested systems your team owns."],
  ["Full-stack web & desktop software", "Business websites, internal tools, SaaS platforms and native desktop apps."],
  ["Verifiable multi-agent AI harnesses", "Agents that are grounded, cross-examined and gated before anything ships."],
];

export default function Hero() {
  const { paused, setPaused } = useMotion();
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-grid container">
        <div className="hero-copy">
          <p className="hero-eyebrow">
            <span className="chapter-numeral">I</span>
            <span>The Harness Lab · Custom software studio of Spencer Teague</span>
          </p>
          {/* Cast-bronze monument headline: instantly explains what we build
              (custom software & verified AI) and how we build it (the right way),
              followed by Spencer's challenge. Each word is raised by <Raised>;
              DOM text appears once. */}
          <h1 id="hero-title" className="hero-headline">
            <span className="hl-line hl-dare">
              <span className="hl-seg">
                <Raised>Custom software</Raised>
              </span>{" "}
              <span className="hl-seg">
                <Raised>&amp; verified AI.</Raised>
              </span>
            </span>{" "}
            <span className="hl-line hl-vow r3d-gold">
              <span className="hl-seg">
                <Raised>Built the right way.</Raised>
              </span>
            </span>{" "}
            <span className="hl-line hl-us">
              <span className="hl-seg">
                <Raised>{"Bring us your hardest idea\u00a0\u2014"}</Raised>
              </span>{" "}
              <span className="hl-seg">
                <Raised>we build a working product you own.</Raised>
              </span>
            </span>
          </h1>

          <div className="hero-manifesto">
            <p className="hero-what-kicker inscription">
              Who we are · What we build · What we sell
            </p>
            <p className="hero-lede">
              The Harness Lab is a founder-led engineering studio. Spencer Teague
              personally designs, builds, verifies and hands over every system: we
              sell bespoke workflow automation, full-stack web and desktop
              software, and verifiable multi-agent AI harnesses — engineered
              against your real data and delivered into accounts you own.
            </p>
            <ul className="hero-offers">
              {OFFERS.map(([title, body]) => (
                <li key={title}>
                  <strong>{title}</strong>
                  <span>{body}</span>
                </li>
              ))}
            </ul>
            <div className="hero-actions">
              <a className="button button-gold" href="#work">
                See what we have built <ArrowDown aria-hidden="true" />
              </a>
              <CalTrigger className="button button-outline">
                <CalendarCheck aria-hidden="true" /> Book a 20-min teardown
              </CalTrigger>
              <a className="button button-ghost" href="#contact">
                Bring us the hard problem <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
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
                — Spencer Teague · Founder &amp; Lead Engineer · Landman title, SaaS &amp; autonomous AI harnesses
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
        <a className="hero-scroll" href="#method" aria-label="Continue to how we operate">
          <ArrowDown aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
