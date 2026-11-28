import { ArrowRight, ArrowUpRight, Cpu, GitBranch, Layers, Network } from "lucide-react";
import { ChapterHead, Picture } from "./ui.jsx";
import Raised from "./Raised.jsx";
import { ShotGallery, TelemetryBadge } from "./Showcase.jsx";
import { useImageViewer } from "../lib/useImageViewer.js";
import { ROGUE_AGENTS } from "../data/products.js";
import { DEV_URL } from "../data/site.js";

const ROGUE_POINTS = [
  [Network, "Multi-provider routing", "Claude, Codex, Antigravity and Grok work as co-leads across isolated provider lanes, with Ollama Cloud models as subordinate workers."],
  [GitBranch, "Worktree isolation", "Every execution job gets its own Git worktree, so parallel agents never write over each other."],
  [Layers, "Council before commit", "Plans pass a four-agent endorsement vote and independent cross-provider verification before anything is merged."],
];

/** Chapter III opener + III·A Rogue Agents. */
export function RogueAgentsSection() {
  const [viewer, openImage] = useImageViewer();
  return (
    <section id="harnesses" className="section harnesses" aria-labelledby="harnesses-title">
      <div className="container">
        <ChapterHead
          numeral="III"
          eyebrow="How the products are built"
          id="harnesses-title"
          title={
            <>
              Machinery we built <em>for our own products.</em>
            </>
          }
        >
          <p>
            Off-the-shelf agent tools stalled, lied about passing tests, or lost work
            between runs — so we built our own. Three in-house systems carry the
            work of building the title products: Rogue Agents coordinates the team,
            Perihelion Loop proves or reverts every change, and Mythos OS runs the lab.
          </p>
        </ChapterHead>

        <div className="harness-block" id="rogue-agents">
          <header className="harness-block-head">
            <Picture
              className="harness-wordmark"
              srcSet="/products/rogue-agents-wordmark-640.webp 640w, /products/rogue-agents-wordmark.webp 1400w"
              sizes="(min-width: 900px) 320px, 70vw"
              fallback="/products/rogue-agents-wordmark.png"
              alt="Rogue Agents wordmark"
              width={1400}
              height={608}
            />
            <div className="harness-block-intro">
              <p className="inscription">
                <span className="harness-index">III·A</span> Rogue Agents · Multi-agent command center
              </p>
              <h3 className="r3d-title r3d-sub">
                <Raised>
                  A coordinated AI engineering team, <span className="gold-3d">under one human.</span>
                </Raised>
              </h3>
              <p>
                Rogue Agents is the macOS and Linux command center we use to run Claude,
                Codex, Antigravity and Grok side by side — debating plans, dividing work,
                cross-checking each other, and reporting back with evidence before
                Spencer signs off.
              </p>
              <TelemetryBadge items={ROGUE_AGENTS.telemetry} label="Rogue Agents build telemetry" />
            </div>
          </header>

          <ul className="harness-points">
            {ROGUE_POINTS.map(([Icon, title, body]) => (
              <li key={title}>
                <Icon aria-hidden="true" />
                <strong>{title}</strong>
                <span>{body}</span>
              </li>
            ))}
          </ul>

          <ShotGallery name="Rogue Agents" groups={[{ label: "Rogue Agents cockpit", shots: ROGUE_AGENTS.shots }]} onOpen={openImage} />

          <div className="harness-actions">
            <a className="button button-outline button-small" href="#work">
              See the products <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
      {viewer}
    </section>
  );
}

const BRIDGE_STEPS = [
  ["Rogue Agents", "coordinates the build team and its debates."],
  ["Perihelion Loop", "proves or reverts every change on exact bytes."],
  ["Mythos OS", "remembers, schedules and gates the work."],
];

/** End of Chapter III: from internal tools to the products we sell. */
export function HarnessBridge() {
  return (
    <section id="custom-built" className="section harness-bridge" aria-labelledby="custom-built-title">
      <div className="container">
        <div className="bridge-plate">
          <div className="bridge-copy">
            <p className="inscription">
              <Cpu aria-hidden="true" /> From the bench to the products
            </p>
            <h2 id="custom-built-title" className="r3d-title">
              <Raised>
                The same tools <span className="gold-3d">behind the products we sell.</span>
              </Raised>
            </h2>
            <p>
              These systems build and check our products. Perihelion Loop repaired and
              verified all 7,070 Title-Desk engine tests. BrandStreams and APEX.BUILD are
              earlier platforms. The next chapter shows the title products running.
            </p>
          </div>
          <ol className="bridge-steps">
            {BRIDGE_STEPS.map(([name, body], i) => (
              <li key={name}>
                <span className="bridge-step-index mono" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <strong>{name}</strong>
                <span>{body}</span>
              </li>
            ))}
          </ol>
          <div className="bridge-actions">
            <a className="button button-gold" href="#work">
              See the products they built <ArrowRight aria-hidden="true" />
            </a>
            <a className="button button-outline" href={DEV_URL} target="_blank" rel="noopener noreferrer">
              Inspect the harness internals <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
