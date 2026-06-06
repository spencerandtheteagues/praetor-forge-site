import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Bot,
  Check,
  ClipboardCheck,
  Copy,
  FileCheck2,
  GitBranch,
  Mail,
  MessageSquareText,
  PhoneCall,
  ShieldCheck,
  TerminalSquare,
  TimerReset,
  Workflow,
  Wrench,
} from 'lucide-react';

const SALES_EMAIL = 'sales@theharnesslab.dev';
const TECH_EMAIL = 'tech@theharnesslab.dev';

const serviceOptions = [
  {
    name: 'Reliability Audit',
    price: '$750 fixed fee',
    short: 'Map failure modes, cost risk, security gaps, and the fastest repair path.',
    outcome: 'You receive a written failure map, prioritized fix list, and a 30-minute handoff call.',
    fit: 'Best when an existing agent workflow is looping, stalling, leaking context, or failing silently.',
  },
  {
    name: 'Foundation Harness',
    price: '$3,000-$7,000',
    short: 'One customer-owned agent harness around one defined workflow and one approval path.',
    outcome: 'Private repo, setup script, env template, runbook, smoke tests, and failure-path walkthrough.',
    fit: 'Best for founders and agencies that need one dependable workflow delivered and owned.',
    featured: true,
  },
  {
    name: 'Multi-Agent Harness',
    price: '$8,000-$18,000',
    short: '2-10 agents with routing, handoffs, model lanes, cost limits, and human gates.',
    outcome: 'Architecture, implementation, health checks, recovery plan, and operating docs.',
    fit: 'Best for teams already coordinating Codex, Claude, Hermes, OpenCode, OpenClaw, Cursor, or MCP tools.',
  },
  {
    name: 'Enterprise Fleet',
    price: '$20,000-$50,000',
    short: 'A tenant-aware reliability layer for larger agent operations and agency delivery teams.',
    outcome: 'Scoped after audit: fleet routing, role isolation, deployment scripts, dashboards, and support plan.',
    fit: 'Best when multiple clients, repos, tools, or security boundaries are involved.',
  },
];

const proofItems = [
  ['Founder-led', 'Every engagement is scoped and reviewed by Spencer, not routed through a generic agency bench.'],
  ['Customer-owned', 'You receive the repo, scripts, docs, and operating model. No rented dashboard lock-in.'],
  ['No hosted secrets', 'API keys stay in your environment, vault, or infrastructure. Do not paste secrets into intake.'],
  ['Evidence-first', 'Deliveries include smoke tests, failure notes, runbooks, and handoff criteria.'],
  ['Recovery-minded', 'Backups, health checks, dispatch probes, and canaries are designed into the harness.'],
];

const processSteps = [
  {
    step: '01',
    title: 'Diagnose',
    icon: ClipboardCheck,
    body: 'We map the workflow, agent roles, failure points, approvals, cost exposure, and secret boundaries.',
    artifact: 'Diagnostic report',
  },
  {
    step: '02',
    title: 'Build',
    icon: Wrench,
    body: 'We implement the harness in a customer-owned repo with explicit routing, gates, scripts, and docs.',
    artifact: 'Setup script + repo',
  },
  {
    step: '03',
    title: 'Stress test',
    icon: TimerReset,
    body: 'We run happy-path and failure-path checks so stuck workers, broken dispatch, and bad state are visible.',
    artifact: 'Smoke tests + recovery notes',
  },
  {
    step: '04',
    title: 'Handoff',
    icon: FileCheck2,
    body: 'We walk through how to run, inspect, recover, and safely change the harness after delivery.',
    artifact: 'Runbook + acceptance checklist',
  },
];

const deliverables = [
  ['Agent authority map', 'Role boundaries, model lanes, task ownership, and escalation rules.'],
  ['Human approval gate', 'Telegram, Slack, CLI, or manual review before spend, commits, deploys, or destructive actions.'],
  ['Cost and model routing', 'Cheap lanes for easy work, high-effort lanes for hard work, and fallback behavior.'],
  ['Secret isolation', 'No hardcoded keys, scoped identities, env templates, and redaction checks.'],
  ['Health and recovery', 'DB backups, watchdog checks, dispatch probes, canaries, and incident notes where needed.'],
  ['Operating package', 'Setup script, runbook, smoke tests, handoff recording notes, and change-order boundary.'],
];

const problemTags = [
  'Agent loop or stalls',
  'Workers die silently',
  'No approval gate',
  'Bad model routing',
  'Cost runaway',
  'Context leakage',
  'Tool/MCP failures',
  'No runbook',
  'Need new build',
  'Need audit call',
];

const defaultRequest = {
  requestType: 'Foundation Harness',
  name: '',
  email: '',
  company: '',
  website: '',
  role: '',
  urgency: 'This month',
  budget: '$3,000-$7,000',
  currentStack: '',
  infrastructure: '',
  approvalPath: 'Telegram',
  problems: [],
  desiredWorkflow: '',
  failureDetails: '',
  successCriteria: '',
  accessPlan: '',
  callWindow: '',
};

function buildBrief(request) {
  return `THE HARNESS LAB INTAKE

Request type: ${request.requestType}
Urgency: ${request.urgency}
Budget range: ${request.budget}

Contact
- Name: ${request.name}
- Email: ${request.email}
- Company: ${request.company}
- Website/repo: ${request.website}
- Role: ${request.role}
- Best call window: ${request.callWindow}

Current setup
- Stack/tools: ${request.currentStack}
- Infrastructure: ${request.infrastructure}
- Approval path: ${request.approvalPath}
- Problem categories: ${request.problems.join(', ') || 'None selected'}

Desired workflow
${request.desiredWorkflow}

Current failure details
${request.failureDetails}

Success criteria
${request.successCriteria}

Access plan
${request.accessPlan}

Security note: do not send API keys, passwords, private keys, production secrets, or raw .env files in first contact.
`;
}

function mailtoFor(request, subjectPrefix = 'The Harness Lab request') {
  const subject = encodeURIComponent(`${subjectPrefix} - ${request.requestType || 'Intake'}`);
  const body = encodeURIComponent(buildBrief(request));
  return `mailto:${SALES_EMAIL}?subject=${subject}&body=${body}`;
}

function Field({ label, children, hint, wide = false }) {
  return (
    <label className={`field ${wide ? 'wide' : ''}`}>
      <span>{label}</span>
      {children}
      {hint ? <em>{hint}</em> : null}
    </label>
  );
}

function App() {
  const [request, setRequest] = useState(defaultRequest);
  const [copyText, setCopyText] = useState('Copy brief');
  const [submitted, setSubmitted] = useState(false);

  const brief = useMemo(() => buildBrief(request), [request]);

  function update(key, value) {
    setRequest((current) => ({ ...current, [key]: value }));
  }

  function toggleProblem(problem) {
    setRequest((current) => {
      const selected = current.problems.includes(problem);
      return {
        ...current,
        problems: selected
          ? current.problems.filter((item) => item !== problem)
          : [...current.problems, problem],
      };
    });
  }

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(brief);
      setCopyText('Copied');
    } catch {
      setCopyText('Select brief');
    }
    window.setTimeout(() => setCopyText('Copy brief'), 1800);
  }

  function submitRequest(event) {
    event.preventDefault();
    setSubmitted(true);
    window.location.href = mailtoFor(request);
  }

  return (
    <main id="top">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="The Harness Lab home">
          <img src="/hermes-mark.png" alt="" width="44" height="44" />
          <span>The Harness Lab</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#services">Services</a>
          <a href="#process">Process</a>
          <a href="#proof">Proof</a>
          <a href="#intake">Intake</a>
          <a href={`mailto:${SALES_EMAIL}`}>Contact</a>
        </nav>
        <a className="nav-cta" href="#intake">
          Request an audit
          <ArrowRight aria-hidden="true" />
        </a>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">AI agent harnesses that keep working after you stop watching.</h1>
          <p>
            The Harness Lab builds and repairs customer-owned reliability harnesses for teams
            using Claude, Codex, Hermes, OpenCode, OpenClaw, Cursor, Ollama, and MCP tools.
            You get the code, the runbook, and the failure-path evidence. Your keys stay yours.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#intake">
              Request an audit
              <ArrowRight aria-hidden="true" />
            </a>
            <a className="secondary-button" href="#services">
              Build my harness
              <Workflow aria-hidden="true" />
            </a>
          </div>
          <dl className="hero-facts" aria-label="Core operating facts">
            <div>
              <dt>Ownership</dt>
              <dd>Private repo + setup script</dd>
            </div>
            <div>
              <dt>Security</dt>
              <dd>BYOK, no hosted secrets</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>Audit, build, stress test, handoff</dd>
            </div>
          </dl>
        </div>

        <div className="hero-visual" aria-label="The Harness Lab Hermes emblem">
          <div className="circuit-plane" />
          <img
            src="/advancedhermes-hero-round.png"
            alt="The Harness Lab Hermes winged helmet emblem"
            width="900"
            height="900"
            fetchPriority="high"
          />
        </div>
      </section>

      <section id="proof" className="trust-band reveal" aria-label="Trust proof">
        <h2>Founder-led. Customer-owned. No hosted secrets.</h2>
        <div className="proof-grid">
          {proofItems.map(([title, body]) => (
            <article key={title}>
              <ShieldCheck aria-hidden="true" />
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="services" className="section reveal">
        <div className="section-heading">
          <p>Services</p>
          <h2>Buy the level of reliability work your agent system actually needs.</h2>
          <span>
            Pricing is scoped around concrete workflows, not vague retainers. First contact starts
            with the audit path unless the build scope is already clear.
          </span>
        </div>
        <div className="service-grid">
          {serviceOptions.map((service) => (
            <article className={`service-card ${service.featured ? 'featured' : ''}`} key={service.name}>
              {service.featured ? <strong className="flag">Most common starting build</strong> : null}
              <div className="service-head">
                <h3>{service.name}</h3>
                <span>{service.price}</span>
              </div>
              <p>{service.short}</p>
              <dl>
                <div>
                  <dt>Outcome</dt>
                  <dd>{service.outcome}</dd>
                </div>
                <div>
                  <dt>Best fit</dt>
                  <dd>{service.fit}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="section split reveal">
        <div className="section-heading left">
          <p>What We Deliver</p>
          <h2>Not a prompt pack. A controlled operating layer.</h2>
          <span>
            The work is practical: routing rules, approval boundaries, failure detection, cost
            control, documentation, and recovery procedures that a team can actually run.
          </span>
        </div>
        <div className="deliverable-list">
          {deliverables.map(([title, body]) => (
            <article key={title}>
              <Check aria-hidden="true" />
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="process" className="section process-section reveal">
        <div className="section-heading">
          <p>Process</p>
          <h2>Built like infrastructure, handed off like an operating system.</h2>
          <span>
            Every step produces a concrete artifact. That keeps the engagement inspectable and
            prevents “the bot said it was done” from becoming the acceptance standard.
          </span>
        </div>
        <div className="process-line">
          {processSteps.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.step}>
                <div className="process-icon">
                  <Icon aria-hidden="true" />
                </div>
                <span>{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <small>Artifact: {item.artifact}</small>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section proof-console reveal">
        <div>
          <p className="mini-label">Proof of Process</p>
          <h2>The lab runs on the same discipline it sells.</h2>
          <p>
            The internal Hermes harness uses verified kanban backups, health checks, task-state
            alerts, dispatch probes, and synthetic worker canaries. Those patterns inform customer
            builds when the same failure modes apply.
          </p>
        </div>
        <div className="console-panel" aria-label="Reliability status example">
          <div className="console-top">
            <span />
            <strong>harness health</strong>
            <em>sample operating pattern</em>
          </div>
          <ul>
            <li>
              <TimerReset aria-hidden="true" />
              Healthcheck timer: every 30 seconds
            </li>
            <li>
              <GitBranch aria-hidden="true" />
              Verified kanban backup: every 2 minutes
            </li>
            <li>
              <Bot aria-hidden="true" />
              Synthetic worker canary: proves real task execution
            </li>
            <li>
              <TerminalSquare aria-hidden="true" />
              Recovery path: preserve incident, restore latest-good, notify operator
            </li>
          </ul>
        </div>
      </section>

      <section id="intake" className="section intake-section reveal">
        <div className="section-heading left">
          <p>Start Here</p>
          <h2>Request an audit, call, or full harness build.</h2>
          <span>
            Fill out what you can. The form builds an email-ready brief for {SALES_EMAIL}. Do not
            include passwords, API keys, private keys, or raw production secrets.
          </span>
        </div>

        <form className="intake-grid" onSubmit={submitRequest}>
          <div className="form-panel">
            <h3>Contact and scope</h3>
            <div className="form-grid">
              <Field label="Request type">
                <select value={request.requestType} onChange={(event) => update('requestType', event.target.value)}>
                  {serviceOptions.map((service) => (
                    <option key={service.name}>{service.name}</option>
                  ))}
                  <option>More information / sales call</option>
                </select>
              </Field>
              <Field label="Urgency">
                <select value={request.urgency} onChange={(event) => update('urgency', event.target.value)}>
                  <option>This week</option>
                  <option>Next two weeks</option>
                  <option>This month</option>
                  <option>Researching for later</option>
                </select>
              </Field>
              <Field label="Name">
                <input required value={request.name} onChange={(event) => update('name', event.target.value)} placeholder="Your name" />
              </Field>
              <Field label="Email">
                <input required type="email" value={request.email} onChange={(event) => update('email', event.target.value)} placeholder="you@company.com" />
              </Field>
              <Field label="Company">
                <input value={request.company} onChange={(event) => update('company', event.target.value)} placeholder="Company or project" />
              </Field>
              <Field label="Website / repo">
                <input value={request.website} onChange={(event) => update('website', event.target.value)} placeholder="https://" />
              </Field>
              <Field label="Role">
                <input value={request.role} onChange={(event) => update('role', event.target.value)} placeholder="Founder, CTO, agency owner..." />
              </Field>
              <Field label="Budget">
                <select value={request.budget} onChange={(event) => update('budget', event.target.value)}>
                  <option>$750 audit</option>
                  <option>$3,000-$7,000</option>
                  <option>$8,000-$18,000</option>
                  <option>$20,000-$50,000</option>
                  <option>Need recommendation</option>
                </select>
              </Field>
            </div>

            <h3>System details</h3>
            <div className="form-grid">
              <Field label="Current stack" wide>
                <textarea value={request.currentStack} onChange={(event) => update('currentStack', event.target.value)} placeholder="Claude Code, Codex, Hermes, Cursor, GitHub, Slack, Telegram, Render, MCP servers..." />
              </Field>
              <Field label="Where it runs">
                <textarea value={request.infrastructure} onChange={(event) => update('infrastructure', event.target.value)} placeholder="Mac, Linux desktop, VPS, Docker, Render, customer cloud..." />
              </Field>
              <Field label="Approval path">
                <select value={request.approvalPath} onChange={(event) => update('approvalPath', event.target.value)}>
                  <option>Telegram</option>
                  <option>Slack</option>
                  <option>CLI</option>
                  <option>Email</option>
                  <option>Manual review</option>
                  <option>Need recommendation</option>
                </select>
              </Field>
            </div>

            <div className="problem-picker" aria-label="Problem checklist">
              {problemTags.map((problem) => (
                <button
                  className={request.problems.includes(problem) ? 'selected' : ''}
                  key={problem}
                  onClick={() => toggleProblem(problem)}
                  type="button"
                >
                  {problem}
                </button>
              ))}
            </div>
          </div>

          <aside className="form-panel brief-panel">
            <h3>Order brief preview</h3>
            <pre>{brief}</pre>
            <div className="form-actions">
              <button className="secondary-button" type="button" onClick={copyBrief}>
                <Copy aria-hidden="true" />
                {copyText}
              </button>
              <button className="primary-button" type="submit">
                <Mail aria-hidden="true" />
                Send request
              </button>
            </div>
            {submitted ? (
              <p className="submit-note">
                Your email client should open with the completed brief. If it does not, copy the
                brief and email it to {SALES_EMAIL}.
              </p>
            ) : null}
          </aside>

          <div className="form-panel wide-fields">
            <h3>Workflow, failure mode, and acceptance criteria</h3>
            <Field label="Desired workflow" wide>
              <textarea value={request.desiredWorkflow} onChange={(event) => update('desiredWorkflow', event.target.value)} placeholder="Example: support ticket -> triage -> research -> patch plan -> human approval -> PR package." />
            </Field>
            <Field label="Current failure details" wide>
              <textarea value={request.failureDetails} onChange={(event) => update('failureDetails', event.target.value)} placeholder="What breaks, where it breaks, what logs or symptoms you see, and what has already been tried." />
            </Field>
            <Field label="Success criteria" wide>
              <textarea value={request.successCriteria} onChange={(event) => update('successCriteria', event.target.value)} placeholder="What must be true before the audit/build is considered complete?" />
            </Field>
            <Field label="Access plan" wide hint="Safe options: screen share, temporary repo access, redacted logs, disposable VPS user, or sanitized zip.">
              <textarea value={request.accessPlan} onChange={(event) => update('accessPlan', event.target.value)} placeholder="How can The Harness Lab inspect or work on this without exposing secrets?" />
            </Field>
            <Field label="Best call window" wide>
              <input value={request.callWindow} onChange={(event) => update('callWindow', event.target.value)} placeholder="Example: weekdays after 2pm Central" />
            </Field>
          </div>
        </form>
      </section>

      <section className="final-cta reveal">
        <img src="/hermes-mark.png" alt="" width="96" height="96" />
        <h2>Bring the broken workflow. Leave with a harness you can operate.</h2>
        <p>
          Start with an audit if the failure mode is unclear. Start with a build if the workflow
          and acceptance criteria are already defined.
        </p>
        <div className="hero-actions">
          <a className="primary-button" href="#intake">
            Start the intake
            <ArrowRight aria-hidden="true" />
          </a>
          <a className="secondary-button" href={`mailto:${SALES_EMAIL}?subject=The%20Harness%20Lab%20call%20request`}>
            <PhoneCall aria-hidden="true" />
            Ask for a call
          </a>
        </div>
      </section>

      <footer className="site-footer">
        <div>
          <a className="brand" href="#top">
            <img src="/hermes-mark.png" alt="" width="38" height="38" />
            <span>The Harness Lab</span>
          </a>
          <p>Customer-owned AI agent reliability harnesses. Built, repaired, tested, and handed off.</p>
        </div>
        <div>
          <h3>Contact</h3>
          <a href={`mailto:${SALES_EMAIL}`}>
            <Mail aria-hidden="true" />
            {SALES_EMAIL}
          </a>
          <a href={`mailto:${TECH_EMAIL}`}>
            <MessageSquareText aria-hidden="true" />
            {TECH_EMAIL}
          </a>
        </div>
        <div>
          <h3>Model</h3>
          <p>Flat-fee engagements. No hosted customer secrets. You own the code, config, and runbook.</p>
        </div>
        <small>© 2026 The Harness Lab. The first call is for fit and scope, not credential exchange.</small>
      </footer>
    </main>
  );
}

export default App;
