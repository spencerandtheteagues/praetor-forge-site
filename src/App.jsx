import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CalendarCheck,
  Check,
  ClipboardCheck,
  Copy,
  FileCheck2,
  GitBranch,
  Mail,
  MessageSquareText,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  TimerReset,
  Wrench,
} from 'lucide-react';

const SALES_EMAIL = 'sales@theharnesslab.com';
const TECH_EMAIL = 'spencer@theharnesslab.com';
const INTAKE_URL = 'https://harness-lab-intake.onrender.com/api/intake';
// Cal.com booking page — create at cal.com/theharnesslab and update this URL
const CALENDAR_URL = 'https://cal.com/harnesslab/teardown';
const FOUNDING_REMAINING = 8;

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
    founding: '$200 for founding clients — 8 spots remaining',
    short: 'The default first paid step: a 26-point audit mapping failures, cost exposure, security gaps, and the fastest repair path.',
    outcome: 'Written failure map, prioritized fix list, recommended package, and a 30-minute handoff call.',
    fit: 'Best when an existing agent workflow is looping, stalling, dropping work, leaking context, or failing silently.',
    featured: true,
    flag: 'Start here',
  },
  {
    name: 'Harness Setup',
    price: '$1,500-$3,000',
    short: 'Set up the agent workspace, model keys, approval paths, smoke tests, and a working runbook.',
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
    founding: '$2,100-$4,900 for founding clients',
    short: 'One customer-owned reliability harness around one defined workflow and one approval path.',
    outcome: 'Private repo, setup script, env template, runbook, smoke tests, evidence bundle, and handoff call.',
    fit: 'Best for founders, agencies, and teams that need one dependable workflow delivered and owned.',
  },
  {
    name: 'Multi-Agent Harness',
    price: '$8,000-$18,000',
    founding: '$5,600-$12,600 for founding clients',
    short: '2-10 agents with routing, handoffs, model lanes, cost limits, and human gates.',
    outcome: 'Architecture, implementation, health checks, recovery plan, operating docs, and acceptance tests.',
    fit: 'Best for teams coordinating multiple coding agents, browser tools, workflow apps, or custom automations.',
  },
  {
    name: 'Enterprise Fleet',
    price: '$20,000-$50,000',
    founding: '$14,000-$35,000 for founding clients',
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

const diagramPoints = [
  ['Pick one repeated workflow', 'Leads, tickets, invoices, records, browser checks, or any weekly task staff already repeats.'],
  ['Connect the tools already used', 'Inbox, CRM, sheets, calendar, files, browser apps, existing agents, scripts, and workflow tools.'],
  ['Automate the safe steps', 'The harness drafts, checks, routes, updates, retries, and escalates while approvals stay with the owner.'],
  ['Show where savings happen', 'Less checking, capped spend, recoverable failures, and proof the customer owns.'],
];

const mythosMeters = [
  ['Claude 5h lane', 'Usage watched', 'No blind calls when a subscription window is tight.', 64],
  ['Claude 7d lane', 'Fallback ready', 'Work can route before one model lane blocks the job.', 46],
  ['Local / Ollama lane', 'Cheap checks', 'Low-risk classification and summaries stay off premium lanes.', 72],
];

const mythosPanels = [
  {
    title: 'Rate-limit meters',
    icon: TimerReset,
    body: 'Track model windows, queue risky bursts, and route the next task before a 429 storm wastes the day.',
    status: 'capacity visible',
  },
  {
    title: 'Audit kit',
    icon: ClipboardCheck,
    body: 'Turn the 26-point teardown into a visual checklist: cost exposure, secrets, approvals, retries, and recovery.',
    status: 'findings mapped',
  },
  {
    title: 'Agent ledger',
    icon: GitBranch,
    body: 'Show what ran, what stalled, what retried, what needs approval, and what evidence was saved.',
    status: 'handoffs traced',
  },
  {
    title: 'Remote desktop',
    icon: TerminalSquare,
    body: 'Watch browser, VPS, and test surfaces during the build so customer workflows are proven on the right machine.',
    status: 'canaries checked',
  },
];

const mythosEvents = [
  ['Lead follow-up', 'Draft ready, waiting on owner send approval'],
  ['Support triage', 'Refund path blocked until human review'],
  ['Ops record', 'Invoice extracted, totals verified, proof saved'],
  ['Browser check', 'Session expired, retry note added to runbook'],
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
    body: 'Our delivery workflow produces the setup, rescue patch, or custom harness package against the agreed scope.',
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
  ['Orchestrator & browser hardening', 'Where relevant: orchestrator agent security, browser-session isolation, VPS access boundaries, and secret redaction checks across every surface.'],
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
  'Need agent setup',
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
  budget: '$200 founding audit',
  currentStack: '',
  infrastructure: '',
  approvalPath: 'Need recommendation',
  problems: [],
  desiredWorkflow: '',
  failureDetails: '',
  successCriteria: '',
  accessPlan: '',
  callWindow: '',
  hp: '',
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
  const [status, setStatus] = useState('idle'); // idle | sending | sent | fallback

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

  async function submitRequest(event) {
    event.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    try {
      const res = await fetch(INTAKE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!res.ok) throw new Error(`intake ${res.status}`);
      setStatus('sent');
    } catch {
      // Reliable fallback: open the mail client with the prefilled brief.
      setStatus('fallback');
      window.location.href = mailtoFor(request);
    }
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
          <a href="#case-study">Case Study</a>
          <a href="#our-os">Our OS</a>
          <a href="#diagram">Diagram</a>
          <a href="#mythos-demo">Demo</a>
          <a href="#failures">Failures</a>
          <a href="#who">Who benefits</a>
          <a href="#reviews">Reviews</a>
          <a href="#intake">Intake</a>
          <a href={`mailto:${SALES_EMAIL}`}>Contact</a>
        </nav>
        <a className="nav-cta" href="#intake">
          <span className="nav-cta-full">Start audit</span>
          <span className="nav-cta-short">Audit</span>
          <ArrowRight aria-hidden="true" />
        </a>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="hero-badge">
            <Sparkles aria-hidden="true" />
            Founding pricing — 30% off · <span className="scarcity-red">{FOUNDING_REMAINING} of 10 spots remaining</span>
          </p>
          <h1 id="hero-title">
            We build the <em className="aurora-text">harness</em> your AI agents run on.
          </h1>
          <p>
            The Harness Lab sets up, builds, and rescues agent harnesses — the operating
            layer that routes work between your models and tools, gates risky actions,
            caps spend, and recovers when things break. Every build is customer-owned
            and handed off with tests, runbooks, and proof.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#intake">
              Start with the $200 founding audit
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
              <dd>Free teardown, then $200 founding audit</dd>
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

        <div className="hero-visual" aria-label="The Harness Lab winged helmet emblem">
          <div className="circuit-plane" />
          <img
            src="/advancedhermes-hero-round.png"
            alt="The Harness Lab winged helmet emblem"
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

      <section id="diagram" className="section diagram-section reveal">
        <div className="section-heading">
          <p>Shareable Diagram</p>
          <h2>A plain-English map of how the harness runs business work.</h2>
          <span>
            See the setup in one pass: choose a repeated workflow, connect the tools
            already in use, let the harness handle safe steps, and keep approval with
            the owner for actions that matter.
          </span>
        </div>
        <div className="diagram-layout">
          <a className="diagram-frame" href="/marketing/harness-value-diagram.png" aria-label="Open The Harness Lab value diagram">
            <img
              src="/marketing/harness-value-diagram.png"
              alt="Diagram showing business work entering The Harness Lab reliability layer, then leaving as controlled, tested, customer-owned output."
              width="1600"
              height="1020"
              loading="lazy"
            />
          </a>
          <aside className="diagram-copy">
            <h3>Built for owners, operators, and technical leads.</h3>
            <p>
              The diagram shows where the harness sits in a normal business workflow:
              between repeated work and the tools already used every day. It explains
              how time, money, and labor savings come from safer routing, fewer manual
              checks, owner approvals, and proof that failures can be recovered.
            </p>
            <div className="diagram-points">
              {diagramPoints.map(([title, body]) => (
                <article key={title}>
                  <Check aria-hidden="true" />
                  <div>
                    <h4>{title}</h4>
                    <p>{body}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="diagram-actions">
              <a className="secondary-button" href="/marketing/harness-value-diagram.png" download>
                <FileCheck2 aria-hidden="true" />
                Download PNG
              </a>
              <a className="primary-button" href="#intake">
                Start audit
                <ArrowRight aria-hidden="true" />
              </a>
            </div>
          </aside>
        </div>
      </section>

      <section id="mythos-demo" className="section mythos-preview reveal">
        <div className="section-heading">
          <p>Mythos OS Demo</p>
          <h2>A preview of the control room behind each harness build.</h2>
          <span>
            Mythos OS is the internal cockpit we use to show model limits, audit
            findings, agent activity, and remote test surfaces during a build. The
            customer deliverable is still owned code, setup, tests, and a runbook on
            your infrastructure.
          </span>
        </div>

        <div className="mythos-shell" aria-label="Mythos OS demo preview">
          <div className="mythos-copy">
            <p className="mini-label">Audit-call preview</p>
            <h3>See the control room before the build starts.</h3>
            <p>
              The demo makes the value visual: where work is queued, which model lane is safe,
              what needs approval, which tasks saved proof, and where failures get recovered
              instead of disappearing.
            </p>
            <div className="mythos-actions">
              <a className="primary-button" href="#intake">
                Request the demo walkthrough
                <ArrowRight aria-hidden="true" />
              </a>
              <a className="secondary-button" href="#diagram">
                View setup map
                <FileCheck2 aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="mythos-window">
            <div className="mythos-topbar">
              <span />
              <strong>mythos os / harness lab cockpit</strong>
              <em>sanitized preview</em>
            </div>
            <div className="mythos-dashboard">
              <aside className="mythos-rail" aria-label="Demo navigation">
                <strong>Fleet</strong>
                <span className="active">Overview</span>
                <span>Audit kit</span>
                <span>Ledger</span>
                <span>Remote</span>
              </aside>

              <div className="mythos-main">
                <div className="mythos-meters">
                  {mythosMeters.map(([label, value, note, width]) => (
                    <article key={label}>
                      <div>
                        <h4>{label}</h4>
                        <strong>{value}</strong>
                      </div>
                      <p>{note}</p>
                      <span className="meter-track">
                        <span style={{ width: `${width}%` }} />
                      </span>
                    </article>
                  ))}
                </div>

                <div className="mythos-panel-grid">
                  {mythosPanels.map((panel) => {
                    const Icon = panel.icon;
                    return (
                      <article key={panel.title}>
                        <div className="mythos-panel-head">
                          <Icon aria-hidden="true" />
                          <span>{panel.status}</span>
                        </div>
                        <h4>{panel.title}</h4>
                        <p>{panel.body}</p>
                      </article>
                    );
                  })}
                </div>

                <div className="mythos-ledger">
                  <div>
                    <h4>Agent ledger</h4>
                    <p>Example events from one audited workflow.</p>
                  </div>
                  <ul>
                    {mythosEvents.map(([title, body]) => (
                      <li key={title}>
                        <Check aria-hidden="true" />
                        <div>
                          <strong>{title}</strong>
                          <span>{body}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
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
                {service.founding ? <strong className="founding-price">{service.founding}</strong> : null}
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
          <strong>Founding-client offer</strong> — the first 10 build clients receive 30% off the
          build fee, locked for 12 months. The discounted ranges are shown on each build card.
          Enterprise and regulated workflows are quoted only after a paid audit.
          <strong className="founding-counter">{FOUNDING_REMAINING} of 10 founding spots remaining.</strong>
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
          <h2>Our lab workflow builds and verifies the package. You receive the finished operating system.</h2>
          <p>
            Behind the scenes, we scope, build, inspect, and verify the work against
            the acceptance criteria. The deliverable stays simple: customer-owned code,
            setup, tests, runbook, and evidence.
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
              Intake brief becomes a scoped delivery plan
            </li>
            <li>
              <Bot aria-hidden="true" />
              Build and review passes inspect the package before handoff
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
          <input
            type="text"
            name="company_website_hp"
            className="hp-field"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={request.hp}
            onChange={(event) => update('hp', event.target.value)}
          />
          <div className="form-panel">
            <h3>Contact and scope</h3>
            <div className="form-grid">
              <Field label="Request type">
                <select value={request.requestType} onChange={(event) => update('requestType', event.target.value)}>
                  {serviceOptions.map((service) => (
                    <option key={service.name}>{service.name}</option>
                  ))}
                  <option>More information / fit call</option>
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
                  <option>$200 founding audit</option>
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
                <textarea value={request.currentStack} onChange={(event) => update('currentStack', event.target.value)} placeholder="Coding agents, browser tools, GitHub, chat apps, cloud host, workflow tools, queues, databases..." />
              </Field>
              <Field label="Where it runs">
                <textarea value={request.infrastructure} onChange={(event) => update('infrastructure', event.target.value)} placeholder="Mac, Linux desktop, cloud server, Docker, Render, customer cloud, local machine..." />
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
              <button className="primary-button" type="submit" disabled={status === 'sending'}>
                <Mail aria-hidden="true" />
                {status === 'sending' ? 'Sending...' : 'Send request'}
              </button>
            </div>
            {(request.requestType === 'Free Teardown Call' || request.requestType === 'More information / fit call') && status === 'idle' ? (
              <div className="calendar-prompt">
                <CalendarCheck aria-hidden="true" />
                <div>
                  <strong>Skip the queue — book directly</strong>
                  <p>Pick a time now instead of waiting for a reply.</p>
                  <a className="primary-button" href={CALENDAR_URL} target="_blank" rel="noopener noreferrer">
                    Book a time
                    <ArrowRight aria-hidden="true" />
                  </a>
                </div>
              </div>
            ) : null}
            {status === 'sent' ? (
              <div className="submit-note">
                <p>Request received — it is in front of Spencer now. Reply incoming by email.</p>
                <div className="calendar-prompt">
                  <CalendarCheck aria-hidden="true" />
                  <div>
                    <strong>Lock in your call now</strong>
                    <p>Don't wait for the reply. Book a slot directly.</p>
                    <a className="primary-button" href={CALENDAR_URL} target="_blank" rel="noopener noreferrer">
                      Book a time
                      <ArrowRight aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            ) : null}
            {status === 'fallback' ? (
              <p className="submit-note">
                Opening your email app with the completed brief. If nothing opens, use Copy brief
                and send it to {SALES_EMAIL}.
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
            <Field label="Access plan" wide hint="Safe options: screen share, temporary repo access, redacted logs, temporary server user, or sanitized zip.">
              <textarea value={request.accessPlan} onChange={(event) => update('accessPlan', event.target.value)} placeholder="How can The Harness Lab inspect or work on this without exposing secrets?" />
            </Field>
            <Field label="Best call window" wide>
              <input value={request.callWindow} onChange={(event) => update('callWindow', event.target.value)} placeholder="Example: weekdays after 2pm Central" />
            </Field>
          </div>
        </form>
      </section>

      {/* ── Case Study: Jayson Powers ── */}
      <section id="case-study" className="section case-study-section reveal">
        <div className="section-heading">
          <p>Real-World Harness</p>
          <h2>Jayson Powers hired The Harness Lab. We built him an empire.</h2>
          <span>
            Jayson Powers is a private investor from Missouri with a complex, active
            portfolio spanning stocks, crypto, precious metals, and real estate.
            He came to The Harness Lab with a clear challenge: he needed one unified
            command center where every asset was visible, every AI decision was
            verified and human-approved, and where an autonomous agent could be
            handed a cash stake and set loose to grow it — legally, transparently,
            and with hard kill-switches enforced by the engine, not trusted to the
            model. The result is the <strong>Wealth &amp; Powers OS</strong> — a fully
            custom investor AI Harness built and installed remotely in a single session.
            It is not a single dashboard but many AI agents working in concert across the
            entire OS — each owning a different job and running in parallel: cross-verifying
            live market data across 18 symbols simultaneously, surfacing deep AI research
            grounded in real-time prices and headlines, auditing every finding with a
            separate model, watching real estate listings nationwide, hunting down obscure
            items across every marketplace on the internet, and letting Midas Mode — powered
            by Claude Fable 5 — autonomously trade and hustle its way to profit within
            whatever risk envelope Jayson sets. Every trade requires Jayson's explicit
            approval before execution. Every model decision is audited by an
            independent model. Jayson called the work outstanding and said the setup
            was faster than he ever expected. He gave it five stars.
          </span>
        </div>

        {/* Hero image — large, standalone */}
        <div className="cs-hero-wrap">
          <div className="cs-hero-frame">
            <img
              src="/case-studies/jayson/screen-4.jpg"
              alt="Wealth & Powers OS — Jayson's command center showing live market ticker, Midas Mode engagement, portfolio stats, and all 11 modules at a glance"
              width="1512"
              height="807"
              loading="lazy"
            />
          </div>
          <p className="cs-hero-caption">
            The command center. One screen shows Jayson his full portfolio at live-verified prices,
            the Midas Mode engage button, 18/18 quotes verified live, active research jobs,
            and every module — from stocks and crypto to real estate and item search —
            two clicks away. Behind that single screen, a fleet of AI agents works in concert —
            verifying prices, auditing research, watching listings, and running the money engine
            in parallel. The Oracle AI assistant is always one click from anywhere in the AI Harness.
          </p>
        </div>

        {/* Midas Mode group */}
        <div className="cs-group">
          <div className="cs-group-label">
            <span className="mini-label">Midas Mode</span>
            <h3>Hand Fable the capital. Set the clock. Walk away.</h3>
            <p>
              Midas Mode is the most ambitious feature in the OS. Jayson picks a dollar amount —
              $100 to $5,000 or more — sets a mission clock from 3 hours to "until I stop it,"
              and Fable (Claude Fable 5) takes over. It re-underwrites every position on a 45-second
              cycle, journals every decision, scans social and news sentiment, hunts arbitrage,
              and explores every legal side hustle it can find. Hard risk controls — kill switch
              at drawdown %, max single position size, daily-loss pause — are enforced by the
              engine itself. The model cannot override them. Across every run so far, Midas Mode
              has stayed inside the risk envelope it was handed — no kill-switch breach, no runaway
              position, no surprise drawdown.
            </p>
          </div>
          <div className="cs-grid cs-grid-2">
            <div className="cs-card">
              <div className="cs-frame">
                <img
                  src="/case-studies/jayson/screen-5.jpg"
                  alt="Midas Mode setup screen showing starting capital presets, mission clock options, weapons-free asset classes, and hard risk controls panel"
                  loading="lazy"
                />
              </div>
              <p className="cs-caption">
                <strong>Mission launcher.</strong> Select starting capital, set the clock, choose which
                asset classes Fable can trade (stocks &amp; ETFs, crypto, metals), and dial in hard risk
                controls. The engine enforces every limit mechanically — Fable cannot override a single one.
              </p>
            </div>
            <div className="cs-card">
              <div className="cs-frame">
                <img
                  src="/case-studies/jayson/screen-13.jpg"
                  alt="Midas Mode live session showing $500 deployed, LIVE · HUMAN-APPROVED · ACTIVE badge, real-time P&L, drawdown monitor, and Fable thinking status"
                  loading="lazy"
                />
              </div>
              <p className="cs-caption">
                <strong>Live session.</strong> Fable is thinking at max effort, re-evaluating every position
                on its cycle. The AI Harness shows cash, deployed capital, realized P&amp;L, and drawdown
                in real time. Human-approval is enforced — no trade executes until Jayson confirms.
                Kill switch is one button away at any moment.
              </p>
            </div>
          </div>
        </div>

        {/* Research group */}
        <div className="cs-group">
          <div className="cs-group-label">
            <span className="mini-label">AI Research</span>
            <h3>Grounded in live data. Cross-examined by a second model.</h3>
            <p>
              Every research job is grounded in live verified quotes and fresh headlines before any
              AI model runs. Then an independent auditor model — one not involved in the original
              research — cross-examines the findings for conflicts and hallucinations. Jayson can
              research any public company, private business, IPO, crypto project, or market trend
              and receive an exhaustive, structured investigation with a verification verdict
              attached. The result is deeper than what most paid analysts produce.
            </p>
          </div>
          <div className="cs-grid cs-grid-1">
            <div className="cs-card">
              <div className="cs-frame">
                <img
                  src="/case-studies/jayson/screen-9.jpg"
                  alt="Research page showing Space X IPO investigation with Model Helper grounding explanation, INDEPENDENTLY AUDITED BY CLAUDE CODE badge, and partial verification verdict"
                  loading="lazy"
                />
              </div>
              <p className="cs-caption">
                <strong>Space X IPO deep dive.</strong> The research engine grounded the job in live data,
                dispatched a multi-model investigation, then had Claude Code independently audit the
                findings. The verdict — Partially Verified 65/100 — arrives with a precise breakdown of
                what was confirmed, what was truncated, and what needs more evidence. No hallucination
                survives a second model reviewing it.
              </p>
            </div>
          </div>
        </div>

        {/* Markets group */}
        <div className="cs-group">
          <div className="cs-group-label">
            <span className="mini-label">Live Markets</span>
            <h3>Every price triple-verified before any money moves.</h3>
            <p>
              Stocks use live Yahoo Finance consensus with per-source verification. Crypto is
              triple-verified across CoinGecko, Coinbase, and Kraken — divergence flags appear
              before any order is drafted. Precious metals run dual verification: Yahoo Finance
              front-month futures against gold-api.com spot prices, with a 2.5% basis tolerance
              before a flag fires. No single feed is trusted. Orders never submit until Jayson
              confirms the exact price and signal.
            </p>
          </div>
          <div className="cs-grid cs-grid-3">
            <div className="cs-card">
              <div className="cs-frame">
                <img
                  src="/case-studies/jayson/screen-6.jpg"
                  alt="Stocks page showing SCHD, AAPL, NVDA, MSFT holdings with live prices, gain/loss, AI signals (HOLD/TRIM), confidence percentages, and next best stocks panel"
                  loading="lazy"
                />
              </div>
              <p className="cs-caption">
                <strong>Stocks — capital-first.</strong> Each holding shows a live-verified price, gain/loss,
                and an AI signal (HOLD, TRIM, or BUY) with a confidence score. Draft order buttons stay
                locked until Jayson approves the exact trade.
              </p>
            </div>
            <div className="cs-card">
              <div className="cs-frame">
                <img
                  src="/case-studies/jayson/screen-7.jpg"
                  alt="Crypto page showing Bitcoin, Ethereum, Solana, and Chainlink with 3-source verified badges, CoinGecko/Coinbase/Kraken price agreement, and AI confidence signals"
                  loading="lazy"
                />
              </div>
              <p className="cs-caption">
                <strong>Crypto — triple-source verified.</strong> Every coin shows the live price
                from three independent feeds with a divergence check. If CoinGecko, Coinbase, and
                Kraken don't agree, the divergence is displayed before any action is allowed.
              </p>
            </div>
            <div className="cs-card">
              <div className="cs-frame">
                <img
                  src="/case-studies/jayson/screen-8.jpg"
                  alt="Gold & Metals page showing Gold spot $4,230, Silver $68.14, Platinum $1,723, Palladium $1,302 — all 2-source verified with Yahoo futures against spot price"
                  loading="lazy"
                />
              </div>
              <p className="cs-caption">
                <strong>Metals — hedge, not speculation.</strong> Gold, silver, platinum, and palladium
                are verified two ways simultaneously: Yahoo Finance front-month futures against
                gold-api.com spot. A big spread gets flagged. A small one is normal.
              </p>
            </div>
          </div>
        </div>

        {/* Tools group */}
        <div className="cs-group">
          <div className="cs-group-label">
            <span className="mini-label">Intelligent Tools</span>
            <h3>Real estate. Item hunting. Full model control.</h3>
            <p>
              Three specialized tools round out the OS. Real Estate Super Search lets Jayson
              set location, radius, property type, and ranking criteria, then watch listings
              nationwide for price drops, status changes, or anything worth a notification.
              Item Search dispatches an AI agent across every major and minor marketplace,
              Facebook listing, and local listing to find any item at or below a target price —
              with every match, price, description, and source link returned. Models &amp; Cost
              gives Jayson full control over which AI model handles each role, from cheap
              summarizers on local Ollama to Claude Opus running the Midas Mode brain.
            </p>
          </div>
          <div className="cs-grid cs-grid-3">
            <div className="cs-card">
              <div className="cs-frame">
                <img
                  src="/case-studies/jayson/screen-10.jpg"
                  alt="Real Estate page showing super search form with city, radius, property type, and ranking filters, plus listing watcher with URL, target price, and notification fields"
                  loading="lazy"
                />
              </div>
              <p className="cs-caption">
                <strong>Real Estate Super Search.</strong> Set must-have criteria and Jayson's AI
                ranks exact matches first, closest matches second, and explicitly flags when a
                listing misses a requirement. The watcher monitors any listing URL and notifies
                on price changes or status moves.
              </p>
            </div>
            <div className="cs-card">
              <div className="cs-frame">
                <img
                  src="/case-studies/jayson/screen-11.jpg"
                  alt="Item Search page with item description form, target price field, and condition/model/shipping/alternatives detail fields"
                  loading="lazy"
                />
              </div>
              <p className="cs-caption">
                <strong>Item Search.</strong> Describe the item, set a max price, add condition and
                model constraints. The AI agent sweeps every marketplace — major, minor, Facebook,
                and local — and returns every match with price, description, and a direct link.
                No obscure item has beaten it yet.
              </p>
            </div>
            <div className="cs-card">
              <div className="cs-frame">
                <img
                  src="/case-studies/jayson/screen-12.jpg"
                  alt="Models & Cost page showing per-role model picker: research uses GPT-5, real estate uses Claude Opus, finance uses Claude Sonnet, autopilot brain uses Claude Code Opus"
                  loading="lazy"
                />
              </div>
              <p className="cs-caption">
                <strong>Models &amp; Cost.</strong> Every AI role has an independently assignable model.
                Research helpers can run cheap; the Midas Mode brain runs the most powerful model
                available. Cost stays visible at all times, and Jayson can swap any model in or out
                without touching code.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Walkthrough: Mythos OS (our own harness) ── */}
      <section id="our-os" className="section case-study-section reveal">
        <div className="section-heading">
          <p>Our Own Harness</p>
          <h2>We don't just build these. We run on one.</h2>
          <span>
            Mythos OS is the AI Harness we built for ourselves. Spencer Teague, The Harness Lab's
            founder, engineered it for internal use — a single command cockpit that runs every
            model subscription, orchestrates a fleet of AI agents in parallel across this Mac, an
            Omen workstation, and a Kali VPS, and folds the entire operation into one queryable
            system. It is the clearest example we can show of the custom engineering that goes into
            a harness: dozens of agents, each owning a different job, working in concert behind one
            screen. The same architecture can be tailored to almost any business and the exact work
            it needs done — audits, research, sales, support, logistics, trading, anything a
            workflow can describe. This one is ours. Here is the full walkthrough.
          </span>
        </div>

        {/* Hero — Mission Control */}
        <div className="cs-hero-wrap">
          <div className="cs-hero-frame">
            <img
              src="/walkthrough/mission-control.jpg"
              alt="Mythos OS Mission Control home screen showing open pipeline, audits, forge jobs, OpenRouter spend, value estimate, and every module as a card"
              loading="lazy"
            />
          </div>
          <p className="cs-hero-caption">
            <strong>Mission Control.</strong> The home cockpit — open pipeline, live audits, forge
            jobs, real OpenRouter spend, and estimated value, with every tool one click away. This
            is the first screen we see every morning.
          </p>
        </div>

        {/* Group: The cockpit */}
        <div className="cs-group">
          <div className="cs-group-label">
            <span className="mini-label">The Cockpit</span>
            <h3>One screen runs the entire operation.</h3>
            <p>
              Every engine, provider, and agent reports into a single control surface — and any of
              them can be driven from one console without leaving the dashboard.
            </p>
          </div>
          <div className="cs-grid cs-grid-3">
            <div className="cs-card">
              <div className="cs-frame">
                <img src="/walkthrough/harnesses-one-roof.jpg" alt="Mythos OS Mission Control showing seven harnesses online, providers and auth, plan-limit windows, and models in use" loading="lazy" />
              </div>
              <p className="cs-caption">
                <strong>Every harness under one roof.</strong> Seven engines — Claude Code, Hermes,
                Codex, OpenClaw, Graphify, Ollama Cloud, and the Kali VPS — report live status,
                alongside provider auth, plan-limit windows, and the exact models in use. All OAuth
                and subscriptions, no loose API keys.
              </p>
            </div>
            <div className="cs-card">
              <div className="cs-frame">
                <img src="/walkthrough/hermes-agent.jpg" alt="Hermes Agent dashboard showing 296 sessions, 15299 messages, connected Telegram platform, and recent sessions" loading="lazy" />
              </div>
              <p className="cs-caption">
                <strong>Hermes, the orchestrator.</strong> The master-plan agent runs the show
                across hundreds of sessions and 15,000+ messages, wired to Telegram, cron, and the
                CLI. It decomposes the work and dispatches each piece to the right engine.
              </p>
            </div>
            <div className="cs-card">
              <div className="cs-frame">
                <img src="/walkthrough/console.jpg" alt="Mythos OS Console messaging Hermes on the VPS, with a detailed table answer about where a lead-research job ran" loading="lazy" />
              </div>
              <p className="cs-caption">
                <strong>One console for every agent.</strong> Message any harness — local or on the
                VPS — and get back diagrams, charts, and file previews. Here Hermes explains exactly
                where and how it ran a lead-research job.
              </p>
            </div>
          </div>
        </div>

        {/* Group: Delivery factory */}
        <div className="cs-group">
          <div className="cs-group-label">
            <span className="mini-label">Delivery Factory</span>
            <h3>Audit, research, build, ship — as one pipeline.</h3>
            <p>
              The same flow we sell to clients runs end to end inside the OS: tear a system down,
              research the ground truth, compose a build brief, and account for every piece of work
              an agent actually completed.
            </p>
          </div>
          <div className="cs-grid cs-grid-2">
            <div className="cs-card">
              <div className="cs-frame">
                <img src="/walkthrough/audit-kit.jpg" alt="Audit Kit reliability audit showing a 75/100 score, one critical finding, file and LOC counts, and a generated report" loading="lazy" />
              </div>
              <p className="cs-caption">
                <strong>Audit Kit.</strong> A deep reliability teardown of any repo or folder —
                score, control fails, and critical findings (here a real secrets-in-repo catch)
                turned into a remediation roadmap and a sales-ready report.
              </p>
            </div>
            <div className="cs-card">
              <div className="cs-frame">
                <img src="/walkthrough/research.jpg" alt="Mythos Research Platform showing an investigation assignment, intensity and returned-data controls, and source scope selection" loading="lazy" />
              </div>
              <p className="cs-caption">
                <strong>Research platform.</strong> Professional OSINT dossiers with source leads,
                intensity controls, independent verification, and full reports — lawful public-source
                only, grounded before any model runs.
              </p>
            </div>
            <div className="cs-card">
              <div className="cs-frame">
                <img src="/walkthrough/forge.jpg" alt="The Forge build-brief composer with client, audit evidence, service, target harness, and model selectors and a dispatch button" loading="lazy" />
              </div>
              <p className="cs-caption">
                <strong>The Forge.</strong> Composes an evidence-grounded build brief from client
                and audit data, then dispatches it to any harness on a chosen model. The factory
                floor between "audited" and "shipped."
              </p>
            </div>
            <div className="cs-card">
              <div className="cs-frame">
                <img src="/walkthrough/work-ledger.jpg" alt="Agents and Work ledger showing 7 agents, 120 work items, 100 completed, and sourced completed-work entries from Claude Code" loading="lazy" />
              </div>
              <p className="cs-caption">
                <strong>Work ledger.</strong> Real completed-work signals from every agent — Claude,
                Codex, the Hermes kanban, git history, and the VPS — so nothing is claimed that
                wasn't actually done. 120 work items, 7 agents, fully sourced.
              </p>
            </div>
          </div>
        </div>

        {/* Group: The brain */}
        <div className="cs-group">
          <div className="cs-group-label">
            <span className="mini-label">The Brain</span>
            <h3>It learns, remembers, and improves itself.</h3>
            <p>
              Knowledge doesn't evaporate between sessions. The OS keeps a graph of everything it
              knows, a library of reusable skills, and a nightly review loop that tunes itself.
            </p>
          </div>
          <div className="cs-grid cs-grid-3">
            <div className="cs-card">
              <div className="cs-frame">
                <img src="/walkthrough/memory-graph.jpg" alt="Memory and knowledge graph view showing 20911 graph nodes, 164 communities, 13 memory files, and a force-directed graph" loading="lazy" />
              </div>
              <p className="cs-caption">
                <strong>Memory &amp; knowledge graph.</strong> Code, repos, and memory fused into one
                queryable Graphify graph — 20,911 nodes across 164 communities. The OS can be asked
                about itself.
              </p>
            </div>
            <div className="cs-card">
              <div className="cs-frame">
                <img src="/walkthrough/skills.jpg" alt="Skills page listing 60 capabilities including agent-orchestrator, browser-agent, deep-code-review, and api-integrator" loading="lazy" />
              </div>
              <p className="cs-caption">
                <strong>Skills.</strong> 60 installed capabilities — agent orchestration, deep code
                review, browser automation, API integration, and more — each a reusable, composable
                command.
              </p>
            </div>
            <div className="cs-card">
              <div className="cs-frame">
                <img src="/walkthrough/dream.jpg" alt="Dream review screen showing four self-improvement suggestions across skill, memory, cost, and workflow categories" loading="lazy" />
              </div>
              <p className="cs-caption">
                <strong>Dream.</strong> Every night the OS reviews its own usage and proposes
                concrete improvements — consolidate these skills, curate this memory, cut this cost,
                fix this workflow. It tunes itself while we sleep.
              </p>
            </div>
          </div>
        </div>

        {/* Group: Infrastructure & reach */}
        <div className="cs-group">
          <div className="cs-group-label">
            <span className="mini-label">Infrastructure &amp; Reach</span>
            <h3>Wired into every machine, file, and inbox.</h3>
            <p>
              The harness isn't trapped in a browser tab. It reaches across the whole fleet — remote
              desktops, filesystems, mailboxes, and devices — from one place.
            </p>
          </div>
          <div className="cs-grid cs-grid-3">
            <div className="cs-card">
              <div className="cs-frame">
                <img src="/walkthrough/connections.jpg" alt="Connections page showing 15 of 15 sources connected with in-dashboard remote terminals and harness status cards" loading="lazy" />
              </div>
              <p className="cs-caption">
                <strong>Connections.</strong> Fifteen of fifteen sources — every harness, provider,
                and knowledge base — connected under one roof, with in-dashboard terminals and
                desktops.
              </p>
            </div>
            <div className="cs-card">
              <div className="cs-frame">
                <img src="/walkthrough/remote-access.jpg" alt="Remote Access page showing HP Omen, Kali VPS desktops and SSH paths over Tailscale plus a device transfer panel" loading="lazy" />
              </div>
              <p className="cs-caption">
                <strong>Remote access.</strong> Omen workstation, Kali VPS, and SSH paths reachable
                over Tailscale, plus device transfer between Mac, Omen, VPS, and phone — all from the
                cockpit.
              </p>
            </div>
            <div className="cs-card">
              <div className="cs-frame">
                <img src="/walkthrough/kali-desktop.jpg" alt="A full Kali Linux xfce desktop streamed into the Mythos OS dashboard over noVNC" loading="lazy" />
              </div>
              <p className="cs-caption">
                <strong>The VPS, in the browser.</strong> A full Kali desktop streamed into the
                dashboard over noVNC — no separate RDP client, no context switch.
              </p>
            </div>
            <div className="cs-card">
              <div className="cs-frame">
                <img src="/walkthrough/vps-files.jpg" alt="Remote Files browser showing the Kali VPS filesystem over Tailscale SSH with metadata-first listings" loading="lazy" />
              </div>
              <p className="cs-caption">
                <strong>Remote files.</strong> Browse the Kali VPS filesystem over Tailscale SSH with
                metadata-first listings and secrets automatically redacted in previews.
              </p>
            </div>
            <div className="cs-card">
              <div className="cs-frame">
                <img src="/walkthrough/mail-desk.jpg" alt="Mail Desk showing company mailbox accounts, an inbox, and a compose pane sending from theharnesslab.com" loading="lazy" />
              </div>
              <p className="cs-caption">
                <strong>Mail Desk.</strong> A native inbox and sender for the company mailboxes — no
                Gmail send-as detour — built straight into the OS.
              </p>
            </div>
            <div className="cs-card">
              <div className="cs-frame">
                <img src="/walkthrough/settings.jpg" alt="Settings onboarding showing an auto-detected stack and Claude subscription auto-fallback across two accounts" loading="lazy" />
              </div>
              <p className="cs-caption">
                <strong>Settings.</strong> The OS auto-detects the whole stack on launch and rotates
                across Claude subscriptions automatically, falling back the moment one is exhausted —
                each account isolated, the terminal login untouched.
              </p>
            </div>
          </div>
        </div>

        {/* Close */}
        <div className="cs-group cs-os-close">
          <p>
            Every screen above was custom-engineered for how we actually operate. That is the point
            of a harness: it is shaped to the business, not the other way around.{' '}
            <a href="#intake">Tell us what your operation needs</a> and we'll scope the one that fits
            it.
          </p>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section id="reviews" className="section reviews-section reveal">
        <div className="section-heading">
          <p>Client Reviews</p>
          <h2>What clients say after the harness is live.</h2>
        </div>
        <div className="reviews-grid">
          <article className="review-card">
            <div className="review-top">
              <div className="review-avatar">
                <img
                  src="/case-studies/jayson/jayson-powers.jpg"
                  alt="Jayson Powers"
                  width="80"
                  height="80"
                  loading="lazy"
                />
              </div>
              <div className="review-meta">
                <strong>Jayson Powers</strong>
                <span>Private Investor · Missouri</span>
                <div className="review-stars" aria-label="5 stars out of 5">
                  {[1,2,3,4,5].map((n) => (
                    <svg key={n} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <blockquote className="review-quote">
              "I've been investing for over 20 years and I've never had a single tool that puts
              this much firepower in one place. The Wealth &amp; Powers OS does things I genuinely
              didn't think were possible. Midas Mode made money its first week — but what sold me
              is that I could see exactly why every trade was proposed and approve it before a dollar
              moved. The research engine goes deeper than analysts I've paid for, and Item Search
              tracked down something I'd been hunting for months in under ten minutes. Spencer built
              and installed the whole system in a single session; when I hit a snag during setup, he
              had it fixed before I finished explaining it. Fast, sharp, and it works exactly the way
              he said it would. Five stars — and I'd give ten if the scale went that high."
            </blockquote>
          </article>
        </div>
      </section>

      <section className="final-cta reveal">
        <img src="/hermes-mark.png" alt="" width="96" height="96" />
        <h2>Bring the broken workflow. Leave with a setup you can operate and prove.</h2>
        <p>
          Start with the free teardown if you are unsure. Start with the $200 founding audit
          when the system already exists and the risk matters.
        </p>
        <div className="hero-actions">
          <a className="primary-button" href="#intake">
            Start the intake
            <ArrowRight aria-hidden="true" />
          </a>
          <a className="secondary-button" href={CALENDAR_URL} target="_blank" rel="noopener noreferrer">
            <CalendarCheck aria-hidden="true" />
            Book a teardown call
          </a>
        </div>
      </section>

      <button
        className="cal-fab"
        data-cal-namespace="teardown"
        data-cal-link="harnesslab/teardown"
        data-cal-config='{"layout":"month_view"}'
        aria-label="Book a teardown call"
      >
        <CalendarCheck aria-hidden="true" />
        <span>Book a call</span>
      </button>

      <footer className="site-footer">
        <div>
          <a className="brand" href="#top">
            <img src="/hermes-mark.png" alt="" width="38" height="38" />
            <span>The Harness Lab</span>
          </a>
          <p>Custom AI agent harnesses. Set up, built, rescued, audited, tested, and handed off.</p>
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
