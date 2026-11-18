import Explorer from "./Explorer.jsx";
import { ChapterHead, Picture } from "./ui.jsx";
import { TelemetryBadge } from "./Showcase.jsx";

const WEALTH_TELEMETRY = [
  ["7,110", "Authored LOC"],
  ["45", "Source files"],
  ["10", "Investor surfaces"],
  ["Single Session", "Built & installed"],
];
import { JAYSON, WEALTH_GROUPS, WEALTH_SCREENS } from "../data/wealth.js";

// Risk-envelope dial geometry (pure math, identical on server and client).
const CX = 120;
const CY = 118;
const R = 92;
const pt = (t, r = R) => {
  const a = Math.PI * (1 - t);
  return [(CX + r * Math.cos(a)).toFixed(2), (CY - r * Math.sin(a)).toFixed(2)];
};
const arc = (t0, t1, r = R) => {
  const [x0, y0] = pt(t0, r);
  const [x1, y1] = pt(t1, r);
  return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
};
const PAUSE = 0.48;
const KILL = 0.72;
const NEEDLE = 0.3;
const TICKS = Array.from({ length: 21 }, (_, i) => i / 20);

function RiskDial() {
  const [nx, ny] = pt(NEEDLE, R - 18);
  const [px, py] = pt(PAUSE, R + 14);
  const [kx, ky] = pt(KILL, R + 14);
  return (
    <figure className="risk-dial">
      <svg
        viewBox="0 0 240 150"
        role="img"
        aria-label="Illustrative risk-envelope dial: the agent operates inside a band bounded by a daily-loss pause and a drawdown kill switch. Not live data."
      >
        <defs>
          <linearGradient id="risk-dial-gold" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="var(--gold-lo)" />
            <stop offset="1" stopColor="var(--gold-hi)" />
          </linearGradient>
        </defs>
        <path d={arc(0, 1)} className="risk-dial-track" />
        <path d={arc(0, PAUSE)} className="risk-dial-safe" stroke="url(#risk-dial-gold)" />
        <path d={arc(PAUSE, KILL)} className="risk-dial-caution" />
        <path d={arc(KILL, 1)} className="risk-dial-stop" />
        {TICKS.map((t) => {
          const major = Math.round(t * 20) % 5 === 0;
          const [x0, y0] = pt(t, R - 12);
          const [x1, y1] = pt(t, major ? R - 24 : R - 18);
          return (
            <line key={t} x1={x0} y1={y0} x2={x1} y2={y1} className="risk-dial-tick" />
          );
        })}
        <line x1={pt(PAUSE, R - 8)[0]} y1={pt(PAUSE, R - 8)[1]} x2={px} y2={py} className="risk-dial-marker" />
        <line x1={pt(KILL, R - 8)[0]} y1={pt(KILL, R - 8)[1]} x2={kx} y2={ky} className="risk-dial-marker risk-dial-marker--stop" />
        <g className="risk-dial-needle">
          <line x1={CX} y1={CY} x2={nx} y2={ny} />
          <circle cx={CX} cy={CY} r="5" />
        </g>
        <text x={CX} y={CY + 26} textAnchor="middle" className="risk-dial-caption">
          ILLUSTRATIVE
        </text>
      </svg>
      <figcaption>
        <p className="mono risk-dial-label">Risk envelope · illustrative, not live data</p>
        <ul>
          <li>
            <span className="risk-key risk-key--safe" aria-hidden="true" />
            Operating band, set by Jayson
          </li>
          <li>
            <span className="risk-key risk-key--caution" aria-hidden="true" />
            Daily-loss pause and max single position
          </li>
          <li>
            <span className="risk-key risk-key--stop" aria-hidden="true" />
            Drawdown kill switch, enforced by the engine
          </li>
        </ul>
      </figcaption>
    </figure>
  );
}

const renderExtra = (group) => (group.id === "midas" ? <RiskDial /> : null);

/** Chapter V — Wealth & Powers OS client build + Jayson Powers testimony. No props. */
export default function WealthExplorer() {
  return (
    <section
      id="case-study"
      className="section explorer-section explorer-section--wealth"
      aria-labelledby="case-study-title"
    >
      <span id="reviews" className="anchor-alias" aria-hidden="true" />
      <div className="container">
        <ChapterHead
          numeral="V"
          eyebrow="Client proof · Wealth & Powers OS · Five-star review"
          title={
            <>
              Built for Jayson Powers: <em>dual-audited firepower.</em>
            </>
          }
          id="case-study-title"
        >
          <p>
            Jayson Powers is a private investor in Missouri with an active
            portfolio across stocks, crypto, precious metals and real estate. We
            built him the Wealth &amp; Powers OS, a custom investor harness
            installed remotely, where several AI agents work in parallel, every
            finding is audited by a second model, and every trade waits for his
            approval.
          </p>
          <TelemetryBadge items={WEALTH_TELEMETRY} label="Wealth & Powers OS build telemetry" />
        </ChapterHead>

        <Explorer
          id="wealth"
          label="Wealth & Powers OS modules"
          groups={WEALTH_GROUPS}
          screens={WEALTH_SCREENS}
          railClassName="investor-thumbnails"
          thumbOpensViewer
          renderGroupExtra={renderExtra}
        />

        <figure className="testimony">
          <div className="testimony-portrait">
            <Picture
              webp={JAYSON.portrait.src}
              fallback={JAYSON.portrait.fallback}
              alt="Portrait of Jayson Powers"
              width={JAYSON.portrait.width}
              height={JAYSON.portrait.height}
            />
          </div>
          <blockquote className="testimony-quote">
            {JAYSON.quote.map((para, i) => (
              <p key={i}>
                {i === 0 ? "\u201c" : ""}
                {para}
                {i === JAYSON.quote.length - 1 ? "\u201d" : ""}
              </p>
            ))}
          </blockquote>
          <figcaption className="testimony-cite">
            <strong>{JAYSON.name}</strong>
            <span>{JAYSON.role}</span>
            <span className="mono">Five-star review</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
