import { ChapterHead } from "./ui.jsx";
import { PROCESS_STEPS } from "../data/narrative.js";

export function Buyer() {
  return (
    <section className="section buyer" id="buyer" aria-labelledby="buyer-title">
      <div className="container">
        <ChapterHead
          numeral="II"
          eyebrow="What we build · Who it is for · What it replaces"
          id="buyer-title"
          title={
            <>
              Software that does the job. <em>Any industry.</em>
            </>
          }
        >
          <p>
            The Harness Lab is a software company. It owns the software and sells
            the same product to every customer of that product. The product replaces
            a job people still do by hand.
          </p>
        </ChapterHead>
        <ul className="buyer-points">
          <li>
            <h3>What we build</h3>
            <p>A software product. The company owns it. Customers use that same software.</p>
          </li>
          <li>
            <h3>Who it is for</h3>
            <p>Teams still paying people to repeat a job that software can do.</p>
          </li>
          <li>
            <h3>What it replaces</h3>
            <p>The slow manual version of that job. The software does it better, cheaper and faster than a person.</p>
          </li>
        </ul>
        <div className="industry-proof">
          <p>
            Live now: Title-Desk, Artificial Landman, and AI Landman automate mineral title work.
          </p>
          <p>
            Also shipped: BrandStreams for social publishing, APEX.BUILD for building
            software in the cloud, and Wealth &amp; Powers OS for investor research
            across stocks, crypto, precious metals, and real estate.
          </p>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section className="section how" id="method" aria-labelledby="how-title">
      <div className="container">
        <ChapterHead
          numeral="III"
          eyebrow="How it works"
          id="how-title"
          title={
            <>
              Spot the job. <em>Ship the product.</em>
            </>
          }
        >
          <p>
            Spencer Teague finds a job in an industry that can be automated, proves
            the software on real samples, and sells the product. Customers pay per
            run or by subscription.
          </p>
        </ChapterHead>
        <ol className="process-steps">
          {PROCESS_STEPS.map((item) => (
            <li key={item.step}>
              <span className="process-step-num mono">Step {item.step}</span>
              <strong>{item.title}</strong>
              <span className="process-step-body">{item.body}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
