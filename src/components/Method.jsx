import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Check, CheckCheck, ChevronRight, FileText, Play, Plus } from "lucide-react";
import { ChapterHead, Picture } from "./ui.jsx";
import { FAILURES, GATES, WORKFLOWS } from "../data/narrative.js";
import { useIntake } from "../lib/intake.js";
import { DEV_URL } from "../data/site.js";
import { useMotion } from "../lib/motion.js";

// Workflow explorer: three steps light the three optical gates on the plate.
// Contract (verify-redesign.mjs): buttons "Documents" / "Operations" /
// "Client work", "Run example" → "Replay example", .demo-announcement text,
// switching cancels timers, reduced motion completes instantly.
function useWorkflowRunner() {
  const { paused, reduced } = useMotion();
  const [selected, setSelected] = useState(0);
  const [step, setStep] = useState(-1);
  const timers = useRef([]);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const choose = (index) => {
    clearTimers();
    setSelected(index);
    setStep(-1);
  };
  const run = () => {
    clearTimers();
    setStep(0);
    if (paused || reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(4);
      return;
    }
    for (let i = 1; i <= 4; i++) timers.current.push(setTimeout(() => setStep(i), i * 750));
  };
  return { selected, step, choose, run };
}

function ConduitPlate({ step }) {
  return (
    <figure className="conduit" aria-label="Verification instrument: inputs pass three gates and leave as one verified result">
      <div className="conduit-frame">
        <Picture
          className="conduit-plate"
          srcSet="/plates/verification-conduit-2k.webp 1920w, /plates/verification-conduit-4k.webp 3840w"
          sizes="(min-width: 1800px) 1760px, 95vw"
          fallback="/plates/verification-conduit-2k.webp"
          alt="Black titanium optical instrument with three sapphire prism gates converging scattered amber threads into one golden beam"
          width="1920"
          height="1080"
        />
        <span className={`conduit-threads ${step >= 0 ? "is-live" : ""}`} aria-hidden="true">
          Inputs
        </span>
        {GATES.map((gate, i) => (
          <span
            key={gate.numeral}
            className={`conduit-gate ${step > i ? "is-passed" : ""} ${step === i ? "is-active" : ""}`}
            style={{ left: `${gate.x}%`, top: `${gate.y}%` }}
            aria-hidden="true"
          >
            <i />
            <b>{gate.numeral}</b>
          </span>
        ))}
        <span className={`conduit-beam ${step === 4 ? "is-live" : ""}`} aria-hidden="true">
          Verified
        </span>
      </div>
      <figcaption className="conduit-gates">
        {GATES.map((gate, i) => (
          <div
            key={gate.numeral}
            className={`gate-note ${step > i ? "is-passed" : ""} ${step === i ? "is-active" : ""}`}
          >
            <span className="gate-numeral">Gate {gate.numeral}</span>
            <strong>{gate.name}</strong>
            <p>{gate.body}</p>
          </div>
        ))}
      </figcaption>
    </figure>
  );
}

function WorkflowExplorer({ runner }) {
  const { selected, step, choose, run } = runner;
  const workflow = WORKFLOWS[selected];
  const running = step >= 0 && step < 4;
  return (
    <div className="workflow-demo" id="workflow" data-state={step === 4 ? "verified" : running ? "running" : "idle"}>
      <div className="demo-top">
        <span className="mono">
          <span className="status-dot" aria-hidden="true" /> Workflow explorer
        </span>
        <span className="demo-label mono">{step === 4 ? "Checks complete" : running ? `Executing ${Math.min(step + 1, 3)} / 3` : "Interactive example"}</span>
      </div>
      <div className="demo-tabs" role="group" aria-label="Choose a workflow example">
        {WORKFLOWS.map((item, i) => (
          <button
            type="button"
            key={item.name}
            aria-pressed={selected === i}
            onClick={() => choose(i)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="flow-bus mono" aria-hidden="true">
        <span className={step >= 0 ? "is-live" : ""}>Input</span><i />
        <span className={running ? "is-live" : ""}>Harness</span><i />
        <span className={step === 4 ? "is-verified" : ""}>Verified output</span>
      </div>
      <div className="flow-track">
        <div className={`flow-end ${step >= 0 ? "active" : ""}`}>
          <FileText aria-hidden="true" />
          <span className="mono">Start with</span>
          <strong>{workflow.input}</strong>
        </div>
        <ol className="flow-middle">
          {workflow.steps.map((label, i) => (
            <li
              key={label}
              className={`flow-step ${step > i ? "complete" : ""} ${step === i ? "current" : ""}`}
            >
              <span className="flow-mark" aria-hidden="true">
                {step > i ? <Check /> : <span className="step-dot" />}
              </span>
              <span className="flow-gate mono">Gate {GATES[i].numeral}</span>
              {label}
              <ChevronRight className="flow-chevron" aria-hidden="true" />
            </li>
          ))}
        </ol>
        <div className={`flow-end result ${step === 4 ? "active" : ""}`}>
          <CheckCheck aria-hidden="true" />
          <span className="mono">Finish with</span>
          <strong>{workflow.output}</strong>
        </div>
      </div>
      <div className="demo-bottom">
        <p>{workflow.description}</p>
        <button
          type="button"
          className="button button-gold button-small"
          onClick={run}
          disabled={running}
        >
          {running ? (
            <>
              <span className="small-spinner" aria-hidden="true" /> Running example
            </>
          ) : (
            <>
              <Play aria-hidden="true" /> {step === 4 ? "Replay example" : "Run example"}
            </>
          )}
        </button>
      </div>
      <p className="demo-announcement" role="status">
        {step === 4
          ? "Example complete. The result is ready for a person to review."
          : "Illustrates a possible workflow. No files are processed or systems connected."}
      </p>
    </div>
  );
}

function FaultLedger() {
  const { request, toggleProblem } = useIntake();
  const [openIndex, setOpenIndex] = useState(null);
  const selectedCount = FAILURES.filter((f) => request.problems.includes(f.tag)).length;
  return (
    <div className="fault-ledger" id="failure-ledger">
      <div className="fault-ledger-head">
        <h3>
          Twelve ways agent systems fail <em>— and the control that fixes each.</em>
        </h3>
        <p>
          Most broken automation doesn’t fail because the model is bad. It fails because the
          operating layer around the model is missing. Select the symptoms you recognise and
          they are added to your brief.
        </p>
      </div>
      <ol className="fault-list">
        {FAILURES.map((fault, i) => {
          const added = request.problems.includes(fault.tag);
          const open = openIndex === i || added;
          return (
            <li key={fault.title} className={`fault ${added ? "is-added" : ""}`}>
              <button
                type="button"
                className="fault-toggle"
                aria-pressed={added}
                aria-expanded={open}
                onClick={() => {
                  toggleProblem(fault.tag);
                  setOpenIndex(added ? null : i);
                }}
              >
                <span className="fault-index" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="fault-title">{fault.title}</span>
                <span className="fault-state" aria-hidden="true">
                  {added ? <Check /> : <Plus />}
                </span>
              </button>
              <p className="fault-body">{fault.body}</p>
              {open ? (
                <div className="fault-control">
                  <p><span className="mono">Control</span> {fault.control}</p>
                  <a href="#contact" className="fault-brief-link">Added to Work Order <ArrowRight aria-hidden="true" /></a>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
      <div className={`fault-summary ${selectedCount ? "has-items" : ""}`} aria-live="polite">
        {selectedCount ? (
          <>
            <span>
              {selectedCount} symptom{selectedCount === 1 ? "" : "s"} added to your brief.
            </span>
            <a className="text-link" href="#contact">
              Review your brief <ArrowRight aria-hidden="true" />
            </a>
          </>
        ) : (
          <span>Nothing selected yet — choose any symptom above.</span>
        )}
      </div>
    </div>
  );
}

export default function Method() {
  const runner = useWorkflowRunner();
  return (
    <section className="section method" id="method" aria-labelledby="method-title">
      <span id="failures" className="anchor-alias" aria-hidden="true" />
      <span id="diagram" className="anchor-alias" aria-hidden="true" />
      <div className="container">
        <ChapterHead
          numeral="II"
          eyebrow="How we operate · Why we never ship raw model output"
          id="method-title"
          title={
            <>
              Wrappers guess and stall. <em>Harnesses verify.</em>
            </>
          }
        >
          <p>
            Raw AI wrappers guess, stall, and report “done” while the work is still
            broken. So we build the custom, deterministic harness first — primary-source
            grounding, independent cross-examination, hard limits and human gates — and
            then iterate relentlessly until every primary-source check and every holdout
            test passes on real data. Across 3,900+ commits on courthouse deeds, OAuth
            callbacks and live portfolios, that discipline is the difference between a
            demo and a system you can run your business on.
          </p>
        </ChapterHead>
        <aside className="credibility-card" aria-labelledby="credibility-title">
          <picture className="credibility-seal">
            <source
              type="image/webp"
              srcSet="/brand/harness-lab-black-marble-512.webp 512w, /brand/harness-lab-black-marble.webp 1024w"
              sizes="132px"
            />
            <img
              src="/brand/harness-lab-black-marble.png"
              alt="The Harness Lab black-marble engineering seal"
              width="512"
              height="512"
              loading="lazy"
              decoding="async"
            />
          </picture>
          <div className="credibility-copy">
            <p className="inscription">Black-marble engineering foundry · theharnesslab.dev</p>
            <h3 id="credibility-title">Inspect the architecture before you hire us.</h3>
            <p>
              Our engineering site publishes the state machines, the Perihelion Loop
              internals, the twelve-tool verification bench, and the full 28-build
              evolution ledger with commit-level provenance. Engineers can step the
              execution labs in the browser and judge the work for themselves.
            </p>
          </div>
          <a className="button button-gold credibility-action" href={DEV_URL} target="_blank" rel="noopener noreferrer">
            Inspect theharnesslab.dev <ArrowUpRight aria-hidden="true" />
          </a>
        </aside>
      </div>
      <div className="container-media method-instrument">
        <ConduitPlate step={runner.step} />
      </div>
      <div className="container method-grid">
        <WorkflowExplorer runner={runner} />
        <FaultLedger />
      </div>
    </section>
  );
}
