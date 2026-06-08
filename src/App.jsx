import { useMemo, useState } from 'react';
import {
  AlertTriangle,
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
  Wrench,
} from 'lucide-react';

const SALES_EMAIL = 'sales@theharnesslab.dev';
const TECH_EMAIL = 'tech@theharnesslab.dev';

const serviceOptions = [
  {
    name: 'Free Teardown Call',
    price: '$0 / 20 min',
    short: 'A focused fit call where we identify the likely failure modes and decide whether an audit is worth it.',
    outcome: 'You leave with 2-3 likely risks and the right next step. No credentials, no pressure.',
    fit: 'Best when you are not sure if the problem is reliability, cost, setup, or scope.',
  },
  {
    name: 'Reliability Audit',
    price: '$750 fixed fee',
    short: 'The default first paid step: map failures, cost exposure, security gaps, and the fastest repair path.',
    outcome: 'Written failure map, prioritized fix list, recommended package, and a 30-minute handoff call.',
    fit: 'Best when an existing agent workflow is looping, stalling, dropping work, leaking context, or failing silently.',
    featured: true,
    flag: 'Start here',
  },
  {
    name: 'Harness Setup',
    price: '$1,500-$3,000',
    short: 'Stand up Hermes, OpenClaw, clawctl, model keys, approval paths, smoke tests, and a working runbook.',
    outcome: 'Self-checking setup, environment validation, BYOK config, smoke tests, and live handoff.',
    fit: 'Best when you want a proven harness stack installed and verified on your machine.',
  },
  {
    name: 'Harness Rescue',
    price: '$1,500-$5,000',
    short: 'Repair an existing broken harness, agent workflow, automation stack, or browser-agent setup.',
    outcome: 'Root-cause notes, patched workflow, failure-path tests, recovery instructions, and handoff.',
    fit: 'Best when the system already exists but loops, stalls, burns money, or fails in front of customers.',
  },
  {
    name: 'Foundation Harness',
    price: '$3,000-$7,000',
    short: 'One customer-owned reliability harness around one defined workflow and one approval path.',
    outcome: 'Private repo, setup script, env template, runbook, smoke tests, evidence bundle, and handoff call.',
    fit: 'Best for founders, agencies, and teams that need one dependable workflow delivered and owned.',
  },
  {
    name: 'Multi-Agent Harness',
    price: '$8,000-$18,000',
    short: '2-10 agents with routing, handoffs, model lanes, cost limits, and human gates.',
    outcome: 'Architecture, implementation, health checks, recovery plan, operating docs, and acceptance tests.',
    fit: 'Best for teams coordinating Codex, Claude, Hermes, OpenCode, OpenClaw, Cursor, or MCP tools.',
  },
  {
    name: 'Enterprise Fleet',
    price: '$20,000-$50,000',
    short: 'A tenant-aware reliability layer for larger agent operations and agency delivery teams.',
    outcome: 'Scoped after audit: fleet routing, role isolation, deployment scripts, dashboards, and support plan.',
    fit: 'Best when multiple clients, repos, tools, security boundaries, or operators are involved.',
  },
  {
    name: 'Care Plan',
    price: '$500-$2,000/mo',
    short: 'Ongoing health checks, routing refreshes, small fixes, and monthly reliability review.',
    outcome: 'Scheduled checks, issue notes, model/provider update review, and a clear support lane.',
    fit: 'Best after a setup, rescue, or custom build that the business depends on every week.',
  },
];

const proofItems = [
  ['Customer-owned', 'You receive the repo, scripts, docs, and operating model. No rented dashboard lock-in.'],
  ['BYOK by default', 'API keys stay in your environment, vault, or infrastructure. Do not paste secrets into intake.'],
  ['Remote, not blind', 'We scope from real examples, then prove the result with tests on your machine.'],
  ['Evidence-first', 'Deliveries include smoke tests, failure notes, runbooks, and acceptance criteria.'],
  ['Founder-led', 'Every engagement is scoped and reviewed by Spencer, not routed through a generic agency bench.'],
];

const businessOutcomes = [
  ['Save time', 'Stop manually checking whether agents finished, stalled, or silently skipped work.'],
  ['Save money', 'Add model routing, budget caps, retry limits, and alerts before a loop turns into a bill.'],
  ['Save labor', 'Move repeated review, setup, monitoring, and handoff work into a tested operating layer.'],
  ['Reduce outages', 'Catch dead workers, broken dispatch, stuck browser sessions, and failed handoffs earlier.'],
  ['Protect access', 'Keep secrets out of prompts, logs, repos, screenshots, and first-contact intake.'],
  ['Prove delivery', 'Hand clients evidence: what was tested, what failed, what was fixed, and how to recover.'],
];

const failureModes = [
  ['Dropped messages', 'No acknowledgement, retry queue, or dead-letter path means customer work disappears.'],
  ['Runaway spend', 'Agents loop, retry too fast, or use expensive models for cheap work.'],
  ['429 storms', 'Shared keys, no backoff, and too many workers make providers reject useful work.'],
  ['Status theater', 'A health check says the app is running, but no real task is being completed.'],
  ['Silent workers', 'A subagent dies, stalls, or loses state and nobody knows until a client complains.'],
  ['Secret leaks', 'Keys live in prompts, logs, screenshots, repos, shell history, or unredacted bundles.'],
  ['Bad approval gates', 'Agents can spend, commit, deploy, delete, or message customers without a human checkpoint.'],
  ['Browser fragility', 'Sessions expire, tabs drift, screenshots fail, or browser tasks lack identity verification.'],
  ['Duplicate work', 'Retries or parallel workers process the same task twice and create conflicting outputs.'],
  ['No recovery path', 'Backups are missing, stale, unverified, or impossible to restore during an incident.'],
  ['Model mismatch', 'The system uses one model for everything instead of routing by risk, cost, and difficulty.'],
  ['No handoff proof', 'There is no runbook, no smoke test, and no evidence that the customer can operate it.'],
];

const businessTypes = [
  ['AI automation agencies', 'Need reliability proof before client automations embarrass them or churn.'],
  ['MSPs and IT shops', 'Can add AI services without becoming agent reliability engineers overnight.'],
  ['SaaS teams', 'Ship agent features with cost, approvals, observability, and recovery from day one.'],
  ['Support teams', 'Keep ticket, chat, and escalation agents from dropping work or hallucinating action.'],
  ['Ecommerce operators', 'Stabilize inventory, support, research, listing, and browser-based workflows.'],
  ['Clinics and admin teams', 'Automate back-office tasks with clearer approval boundaries and safer secrets.'],
  ['Legal and accounting firms', 'Add controlled research, document, and intake helpers without blind autonomy.'],
  ['Recruiting and staffing', 'Make sourcing, outreach, enrichment, and CRM updates traceable and recoverable.'],
  ['Logistics and field service', 'Control dispatch, schedule, vendor, and browser workflows with human gates.'],
  ['Solo founders and builders', 'Turn a powerful AI-built prototype into something another person can operate.'],
];

const processSteps = [
  {
    step: '01',
    title: 'Teardown',
    icon: ClipboardCheck,
    body: 'We inspect the workflow, agent roles, current symptoms, secret boundary, cost risk, and acceptance criteria.',
    artifact: 'Intake brief + audit scope',
  },
  {
    step: '02',
    title: 'Build or repair',
    icon: Wrench,
    body: 'Our internal Hermes factory helps produce the setup, rescue patch, or custom harness package.',
    artifact: 'Customer-owned repo or package',
  },
  {
    step: '03',
    title: 'Stress test',
    icon: TimerReset,
    body: 'We test the happy path and the failure paths: approval, rejection, restart, budget limit, and secret handling.',
    artifact: 'Smoke tests + evidence notes',
  },
  {
    step: '04',
    title: 'Handoff',
    icon: FileCheck2,
    body: 'You run the setup and smoke tests in your environment so the proof happens on the machine that matters.',
    artifact: 'Runbook + acceptance checklist',
  },
];

const deliverables = [
  ['Written scope and acceptance criteria', 'Everyone agrees what working means before the build starts.'],
  ['Self-checking setup', 'Environment checks, key/provider validation, setup notes, and clear failure messages.'],
  ['Agent authority map', 'Role boundaries, model lanes, tool permissions, escalation rules, and allowed actions.'],
  ['Human approval gate', 'Telegram, Slack, CLI, or manual review before expensive or destructive actions.'],
  ['Cost and model routing', 'Cheap lanes for easy work, high-effort lanes for hard work, and fallback behavior.'],
  ['Secret isolation', 'No hardcoded keys, scoped identities, env templates, and redaction checks.'],
  ['Health and recovery', 'Health checks, backup/restore notes, canaries, dispatch probes, and incident steps where needed.'],
  ['Operating package', 'Repo, setup script, runbook, smoke tests, evidence bundle, and change-order boundary.'],
];

const problemTags = [
  'Dropped messages',
  'Runaway cost',
  '429/rate limits',
  'Fake health checks',
  'Workers die silently',
  'Browser breaks',
  'Secret leaks',
  'No approval gate',
  'Duplicate work',
  'No backup/recovery',
  'Bad model routing',
  'No runbook',
  'Need Hermes/OpenClaw setup',
  'Need rescue',
  'Need new build',
];

const defaultRequest = {
  requestType: 'Reliability Audit',
  name: '',
  email: '',
  company: '',
  website: '',
  role: '',
  urgency: 'This month',
  budget: '$750 audit',
  currentStack: '',
  infrastructure: '',
  approvalPath: 'Need recommendation',
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
          <a href="#failures">Failures</a>
          <a href="#who">Who benefits</a>
          <a href="#process">Process</a>
          <a href="#intake">Intake</a>
          <a href={`mailto:${SALES_EMAIL}`}>Contact</a>
        </nav>
        <a className="nav-cta" href="#intake">
          Start audit
          <ArrowRight aria-hidden="true" />
        </a>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">We fix and build the safety layer around AI agents.</h1>
          <p>
            The Harness Lab helps businesses save time, money, and labor by making AI
            workflows harder to break and easier to operate. We audit broken setups,
            install Hermes/OpenClaw stacks, rescue unreliable agents, and deliver
            customer-owned harnesses with tests, runbooks, and proof.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#intake">
              Start with the $750 audit
              <ArrowRight aria-hidden="true" />
            </a>
            <a className="secondary-button" href="#failures">
              See what we fix
              <AlertTriangle aria-hidden="true" />
            </a>
          </div>
          <dl className="hero-facts" aria-label="Core operating facts">
            <div>
              <dt>Best first step</dt>
              <dd>Free teardown, then $750 audit</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>Remote, verified on your machine</dd>
            </div>
            <div>
              <dt>Ownership</dt>
              <dd>BYOK, private repo, runbook</dd>
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
        <h2>Remote delivery. Customer-owned code. No hosted secrets.</h2>
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

      <section id="outcomes" className="section reveal">
        <div className="section-heading">
          <p>Business Outcomes</p>
          <h2>Where the work pays for itself.</h2>
          <span>
            The harness is not the point. The point is fewer dropped tasks, less manual
            babysitting, safer access, controlled spend, and proof your AI workflow can
            survive real operating conditions.
          </span>
        </div>
        <div className="outcome-grid">
          {businessOutcomes.map(([title, body]) => (
            <article key={title}>
              <Check aria-hidden="true" />
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="services" className="section reveal">
        <div className="section-heading">
          <p>Services And Pricing</p>
          <h2>Start small, prove the failure mode, then build only what is needed.</h2>
          <span>
            Public pricing stays flat-fee and early-customer friendly. The audit is the
            default wedge because it protects both sides from guessing at scope.
          </span>
        </div>
        <div className="service-grid">
          {serviceOptions.map((service) => (
            <article className={`service-card ${service.featured ? 'featured' : ''}`} key={service.name}>
              {service.featured ? <strong className="flag">{service.flag || 'Recommended'}</strong> : null}
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
        <p className="pricing-note">
          Founding-client offer: the first 10 build clients receive 30% off the build fee.
          Enterprise and regulated workflows are quoted only after a paid audit.
        </p>
      </section>

      <section id="failures" className="section reveal">
        <div className="section-heading">
          <p>Existing Setups We Fix</p>
          <h2>The failures that make AI agents expensive, fragile, or embarrassing.</h2>
          <span>
            Most broken agent systems do not fail because the model is bad. They fail
            because the operating layer around the model is missing or weak.
          </span>
        </div>
        <div className="failure-grid">
          {failureModes.map(([title, body]) => (
            <article key={title}>
              <AlertTriangle aria-hidden="true" />
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section split reveal">
        <div className="section-heading left">
          <p>What Done Means</p>
          <h2>Not a prompt pack. A controlled operating layer.</h2>
          <span>
            Every delivery needs a plain handoff: what it controls, what it cannot do,
            how it is approved, how it is tested, how it recovers, and what is out of
            scope after acceptance.
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

      <section id="who" className="section reveal">
        <div className="section-heading">
          <p>Who Benefits</p>
          <h2>Best fit for teams already using AI in real workflows.</h2>
          <span>
            The strongest clients already have useful automation or a clear workflow.
            We make it safer, cheaper, more recoverable, and easier to hand off.
          </span>
        </div>
        <div className="market-grid">
          {businessTypes.map(([title, body]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="process" className="section process-section reveal">
        <div className="section-heading">
          <p>Process</p>
          <h2>Remote delivery without works-on-my-machine roulette.</h2>
          <span>
            A form alone is not enough for custom work. We use a short discovery loop,
            one real redacted sample, written acceptance criteria, and customer-run
            smoke tests.
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
          <p className="mini-label">How The Lab Works</p>
          <h2>The Hermes VPS is the factory. The client receives the finished operating package.</h2>
          <p>
            Internally, we use Hermes, Codex, MasterHarness diagnostics, and clawctl where
            useful to build and verify the work. Publicly, the deliverable is simple:
            customer-owned code, setup, tests, runbook, and evidence.
          </p>
        </div>
        <div className="console-panel" aria-label="Reliability delivery example">
          <div className="console-top">
            <span />
            <strong>delivery proof</strong>
            <em>sample operating pattern</em>
          </div>
          <ul>
            <li>
              <GitBranch aria-hidden="true" />
              Intake brief becomes an internal Hermes factory task
            </li>
            <li>
              <Bot aria-hidden="true" />
              Codex and review agents build, inspect, and package the result
            </li>
            <li>
              <TerminalSquare aria-hidden="true" />
              Smoke tests prove setup, approval, restart, cost, and secret handling
            </li>
            <li>
              <TimerReset aria-hidden="true" />
              Handoff happens when the customer can run and verify it
            </li>
          </ul>
        </div>
      </section>

      <section id="intake" className="section intake-section reveal">
        <div className="section-heading left">
          <p>Start Here</p>
          <h2>Request a teardown, audit, setup, rescue, or full harness build.</h2>
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
                  <option>$0 teardown call</option>
                  <option>$750 audit</option>
                  <option>$1,500-$3,000 setup</option>
                  <option>$1,500-$5,000 rescue</option>
                  <option>$3,000-$7,000 build</option>
                  <option>$8,000-$18,000 multi-agent</option>
                  <option>$20,000-$50,000 enterprise</option>
                  <option>$500-$2,000/mo care plan</option>
                  <option>Need recommendation</option>
                </select>
              </Field>
            </div>

            <h3>System details</h3>
            <div className="form-grid">
              <Field label="Current stack" wide>
                <textarea value={request.currentStack} onChange={(event) => update('currentStack', event.target.value)} placeholder="Claude Code, Codex, Hermes, OpenClaw, Cursor, GitHub, Slack, Telegram, Render, MCP servers, n8n, Make..." />
              </Field>
              <Field label="Where it runs">
                <textarea value={request.infrastructure} onChange={(event) => update('infrastructure', event.target.value)} placeholder="Mac, Linux desktop, VPS, Docker, Render, customer cloud, local machine..." />
              </Field>
              <Field label="Approval path">
                <select value={request.approvalPath} onChange={(event) => update('approvalPath', event.target.value)}>
                  <option>Need recommendation</option>
                  <option>Telegram</option>
                  <option>Slack</option>
                  <option>CLI</option>
                  <option>Email</option>
                  <option>Manual review</option>
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
        <h2>Bring the broken workflow. Leave with a setup you can operate and prove.</h2>
        <p>
          Start with the free teardown if you are unsure. Start with the $750 audit
          when the system already exists and the risk matters.
        </p>
        <div className="hero-actions">
          <a className="primary-button" href="#intake">
            Start the intake
            <ArrowRight aria-hidden="true" />
          </a>
          <a className="secondary-button" href={`mailto:${SALES_EMAIL}?subject=The%20Harness%20Lab%20teardown%20call`}>
            <PhoneCall aria-hidden="true" />
            Ask for a teardown call
          </a>
        </div>
      </section>

      <footer className="site-footer">
        <div>
          <a className="brand" href="#top">
            <img src="/hermes-mark.png" alt="" width="38" height="38" />
            <span>The Harness Lab</span>
          </a>
          <p>AI agent reliability services. Audited, set up, rescued, built, tested, and handed off.</p>
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
          <p>Flat-fee service ladder. No hosted customer secrets. You own the code, config, tests, and runbook.</p>
        </div>
        <small>© 2026 The Harness Lab. The first call is for fit and scope, not credential exchange.</small>
      </footer>
    </main>
  );
}

export default App;
