import { useState } from "react";
import { ArrowUpRight, GitBranch, GitCommit, ShieldCheck, Terminal } from "lucide-react";
import { ChapterHead, Picture } from "./ui.jsx";
import { STUDIO_MONUMENTS, TRENCH_CAMPAIGNS } from "../data/trenches.js";
import { useMotion } from "../lib/motion.js";
import { onTiltLeave, onTiltMove } from "../lib/tilt3d.js";

export default function Trenches() {
  const [activeIdx, setActiveIdx] = useState(0);
  const { paused, reduced } = useMotion();
  const motionDisabled = paused || reduced;
  const campaign = TRENCH_CAMPAIGNS[activeIdx];

  return (
    <section
      id="trenches"
      className="section trenches"
      aria-labelledby="trenches-title"
    >
      <div className="trenches-grid-floor" aria-hidden="true" />
      <div className="container trenches-inner">
        <ChapterHead
          numeral="III"
          eyebrow="Proof in the git log · Zero quit"
          id="trenches-title"
          title={
            <>
              5.5 months on Title-Desk.{" "}
              <span className="gold-3d">Longer on BrandStreams.</span>
            </>
          }
        >
          <p>
            Most agencies hand you a brittle prototype and disappear the day real
            documents, real OAuth walls, or real edge cases show up. Here is what
            our actual git repositories look like when we lock onto a hard problem
            and refuse to quit until it works in production.
          </p>
        </ChapterHead>

        {/* Four 3D Cast-Bronze & Carved-Marble Monument Plinths */}
        <div className="trenches-monuments">
          {STUDIO_MONUMENTS.map((m) => (
            <div
              key={m.value}
              className="monument-3d"
              onPointerMove={(e) => onTiltMove(e, motionDisabled)}
              onPointerLeave={onTiltLeave}
            >
              <span className="monument-shine" aria-hidden="true" />
              <p className="monument-value">{m.value}</p>
              <p className="monument-sub mono">{m.subValue}</p>
              <p className="monument-label">{m.label}</p>
            </div>
          ))}
        </div>

        {/* 3-Campaign War-Ledger Switcher */}
        <div
          className="trenches-tabs"
          role="tablist"
          aria-label="Engineering war-ledger campaigns"
        >
          {TRENCH_CAMPAIGNS.map((c, idx) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              id={`trenches-tab-${c.id}`}
              aria-selected={idx === activeIdx}
              aria-controls="trenches-stage"
              tabIndex={idx === activeIdx ? 0 : -1}
              className={`trenches-tab ${idx === activeIdx ? "is-active" : ""}`}
              onClick={() => setActiveIdx(idx)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                e.preventDefault();
                const next =
                  (idx + (e.key === "ArrowRight" ? 1 : -1) + TRENCH_CAMPAIGNS.length) %
                  TRENCH_CAMPAIGNS.length;
                setActiveIdx(next);
                document.getElementById(`trenches-tab-${TRENCH_CAMPAIGNS[next].id}`)?.focus();
              }}
            >
              <span className="trenches-tab-name">{c.tab}</span>
              <span className="trenches-tab-meta mono">{c.meta}</span>
            </button>
          ))}
        </div>

        <div
          id="trenches-stage"
          role="tabpanel"
          aria-labelledby={`trenches-tab-${campaign.id}`}
          className="trenches-stage"
        >
          {/* Top Dossier Banner with 3D Floating Medallions + Verified Git Metrics */}
          <div
            className="trenches-banner card-3d"
            onPointerMove={(e) => onTiltMove(e, motionDisabled)}
            onPointerLeave={onTiltLeave}
          >
            <div className="trenches-seals">
              <Picture
                className="trenches-seal trenches-seal--primary"
                webp={campaign.emblem.webp}
                fallback={campaign.emblem.fallback}
                alt={campaign.emblem.alt}
                width={512}
                height={512}
              />
              {campaign.secondEmblem ? (
                <Picture
                  className="trenches-seal trenches-seal--secondary"
                  webp={campaign.secondEmblem.webp}
                  fallback={campaign.secondEmblem.fallback}
                  alt={campaign.secondEmblem.alt}
                  width={512}
                  height={512}
                />
              ) : null}
            </div>
            <div className="trenches-banner-copy">
              <p className="inscription">Verified repository forensics</p>
              <h3>{campaign.headline}</h3>
              <p>{campaign.summary}</p>
              {campaign.liveLinks.length > 0 ? (
                <div className="trenches-links">
                  {campaign.liveLinks.map((lnk) => (
                    <a
                      key={lnk.href}
                      className="button button-outline button-small"
                      href={lnk.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {lnk.label} <ArrowUpRight aria-hidden="true" />
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
            <dl className="trenches-metrics">
              {campaign.metrics.map(([num, lbl]) => (
                <div key={lbl}>
                  <dt className="mono">{lbl}</dt>
                  <dd>{num}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Two-Column Split: Left = Real Problems Figured Out, Right = Verbatim Git Commit Log */}
          <div className="trenches-columns">
            <div className="trenches-walls">
              <h4 className="trenches-subhead">
                <ShieldCheck aria-hidden="true" /> Hard walls we smashed through
              </h4>
              <ol className="wall-list">
                {campaign.walls.map((w, i) => (
                  <li
                    key={w.broke}
                    className="wall-card card-3d"
                    onPointerMove={(e) => onTiltMove(e, motionDisabled)}
                    onPointerLeave={onTiltLeave}
                  >
                    <div className="wall-problem">
                      <span className="wall-num mono">PROBLEM {String(i + 1).padStart(2, "0")}</span>
                      <strong>{w.broke}</strong>
                    </div>
                    <p className="wall-solution">
                      <span className="mono wall-tag">HOW WE FIGURED IT OUT</span>
                      {w.solved}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="trenches-terminal">
              <div className="terminal-chrome">
                <span className="terminal-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="mono terminal-title">
                  <Terminal aria-hidden="true" /> git log --all · verbatim repository trail
                </span>
                <span className="mono terminal-badge">
                  <GitBranch aria-hidden="true" /> verified
                </span>
              </div>
              <ol className="git-log-list">
                {campaign.gitLog.map(([date, branch, msg], idx) => (
                  <li key={`${date}-${idx}`} className="git-log-row">
                    <div className="git-log-meta mono">
                      <span className="git-date">{date}</span>
                      <span className="git-branch">
                        <GitCommit aria-hidden="true" /> {branch}
                      </span>
                    </div>
                    <p className="git-subject">{msg}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
