import { useState } from 'react';
import {
  Activity,
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  CircleDollarSign,
  FileCheck2,
  GitBranch,
  MessageSquareText,
  ScrollText,
  ShieldCheck,
  Swords,
  Workflow,
  HeartPulse,
  Hammer,
  Settings,
  Crown,
  Star,
  Clock,
  FileText,
  Send,
  AlertTriangle,
  Users,
  Download,
  Eye,
} from 'lucide-react';

const logoMark = '/harnesslab-mark.svg';
const heroSeal = '/harnesslab-hero.svg';

/* ─── COPY FROM SPEC ─── */

const pains = [
  'Agents loop, stall, or answer in circles instead of shipping work.',
  'Claude, Codex, OpenCode, Hermes, OpenClaw, and local models all live in separate silos.',
  'No human approval gate before spend, commits, messages, or destructive actions.',
  'Model routing is expensive, brittle, and impossible to debug at 2 a.m.',
  'Your setup works only while you are watching it.',
  'Every new workflow turns into another half-finished config file.',
];

const deliverables = [
  {
    icon: Workflow,
    title: 'Command Harness',
    text: 'A custom agent workflow built around your stack, tools, approval rules, and exact operating rhythm.',
  },
  {
    icon: MessageSquareText,
    title: 'Telegram Gate',
    text: 'Manager agents report, request approval, and accept directives in a shared command channel you control.',
  },
  {
    icon: Bot,
    title: 'Agent Hierarchy',
    text: 'Codex, Claude, Hermes, OpenClaw, OpenCode, and lower-cost workers get clear authority boundaries.',
  },
  {
    icon: CircleDollarSign,
    title: 'Cost Lanes',
    text: 'Model routing, concurrency caps, fallback keys, and approval-only expensive providers are configured up front.',
  },
  {
    icon: ShieldCheck,
    title: 'Reliability Gates',
    text: 'Smoke tests, secret scans, dead-agent checks, loop detection, and runbooks ship with the harness.',
  },
  {
    icon: GitBranch,
    title: 'Owned Code',
    text: 'You receive the repo, config, setup script, and operating docs. No rented dashboard. No lock-in.',
  },
];

const steps = [
  {
    label: 'I',
    title: 'Diagnostic',
    text: 'We map the workflow, tools, models, risk level, human approval points, and what success must look like.',
  },
  {
    label: 'II',
    title: 'Forge',
    text: 'Your harness is built from hardened patterns, then customized for your repos, agents, gates, and channels.',
  },
  {
    label: 'III',
    title: 'Trial By Fire',
    text: 'It runs against real tasks with smoke tests, logs, cost caps, and failure recovery before handoff.',
  },
  {
    label: 'IV',
    title: 'Handoff',
    text: 'You get the code, runbook, setup guide, and walkthrough. The harness runs on your machine or VPS.',
  },
];

/* Cash-flow service tiers from spec */
const existingHarnessTiers = [
  {
    icon: HeartPulse,
    name: 'Health Check',
    price: '$299',
    note: 'Existing harness audit: config review, agent role cleanup, approval gate defaults, model routing notes. You keep the report whether you hire us or not.',
    items: [
      'Full config and agent audit',
      'Agent role and authority map cleanup',
      'Approval gate defaults documented',
      'Model routing and cost lane notes',
      'Written report with prioritized fixes',
    ],
  },
  {
    icon: Hammer,
    name: 'Fix & Stabilize Sprint',
    price: '$750',
    note: 'Take an existing harness that is broken, looping, or burning budget and make it run reliably. One focused sprint.',
    items: [
      'Root-cause the failures',
      'Patch agent loops and permission errors',
      'Tighten cost lanes and fallback routing',
      'Add monitoring and heartbeat checks',
      'Smoke test and handoff runbook',
    ],
  },
  {
    icon: Settings,
    name: 'Customization Sprint',
    price: '$1,500',
    note: 'Add workflows, skills, memory, or tool integrations to a working harness. Extends what you already own.',
    items: [
      'New skills, tools, or integrations',
      'Memory and context tuning',
      'Workflow sequencing and branching',
      'Extended smoke test coverage',
      'Updated docs and setup runbook',
    ],
  },
];

/* Flagship custom harness builds */
const customBuildTiers = [
  {
    icon: Crown,
    name: 'Founding Custom Harness',
    price: '$2,500',
    note: 'First 10 customers only. Full custom harness built from your diagnostic, delivered with code, runbook, and walkthrough.',
    items: [
      'Complete diagnostic intake',
      'Custom architecture from scratch',
      'Full multi-agent hierarchy',
      'Cost and lane policy configuration',
      'Telegram or CLI approval gates',
      'Smoke test suite and delivery package',
    ],
    featured: true,
    badge: 'Founding — Limited',
  },
  {
    icon: Star,
    name: 'Standard Custom Harness',
    price: '$4,500',
    note: 'Full custom harness for standard engagements. Same deliverables, full production quality.',
    items: [
      'Complete diagnostic intake',
      'Custom architecture from scratch',
      'Full multi-agent hierarchy',
      'Cost and lane policy configuration',
      'Telegram or CLI approval gates',
      'Smoke test suite and delivery package',
    ],
  },
];

const supportPack = {
  price: '$399',
  period: '30 days',
  tickets: 5,
  note: 'Post-delivery support: bug fixes, minor config changes, and questions. One pack per 30-day period, maximum 5 tickets.',
};

const changeOrderNote = 'Change orders start at $750. Scoped and quoted before work begins. No surprise invoices.';

const faqs = [
  {
    question: 'Is this another SaaS subscription?',
    answer: 'No. The Harness Lab delivers flat-fee. You own the harness and run it yourself. No monthly billing after delivery.',
  },
  {
    question: 'Do you store API keys or customer secrets?',
    answer: 'No. Generated harnesses use your environment files and your infrastructure. Secrets are never hardcoded into the delivered repo.',
  },
  {
    question: 'Which agents and tools can it support?',
    answer: 'The target stack includes Claude Code, Codex, Hermes, OpenClaw, OpenCode, Ollama Cloud, Telegram, Firecrawl, Brave Search, and MCP tools when they fit the workflow.',
  },
  {
    question: 'What happens if the harness does not run?',
    answer: 'Every delivery includes setup docs and smoke tests. For Phase 1 builds, acceptance terms are written into the build order before payment.',
  },
  {
    question: 'What is the Apex Build roadmap?',
    answer: 'Apex Build is a planned self-serve harness builder — same workflow, automated packaging. It is not available yet and will not be sold until it ships. Current service is hands-on custom harness delivery only.',
  },
  {
    question: 'Can I get just a health check without committing to a build?',
    answer: 'Yes. The Health Check is standalone. You keep the written report regardless of whether you proceed with further work.',
  },
];

/* Questionnaire form fields */
const serviceOptions = [
  'Health Check ($299)',
  'Fix & Stabilize Sprint ($750)',
  'Customization Sprint ($1,500)',
  'Founding Custom Harness ($2,500)',
  'Standard Custom Harness ($4,500)',
  'Support Pack ($399/30 days)',
  'Not sure — diagnose me first',
];

const agentOptions = [
  'Claude Code',
  'Codex',
  'Hermes',
  'OpenClaw',
  'OpenCode',
  'Ollama Cloud',
  'Other',
];

/* Mock leads for internal-only admin prototype */
const mockLeads = [
  {
    id: 'THL-001',
    name: 'Alex Rivera',
    email: 'alex@example.com',
    service: 'Health Check',
    priority: 75,
    status: 'triage',
    created: '2026-06-04',
  },
  {
    id: 'THL-002',
    name: 'Jordan Chen',
    email: 'jordan@example.com',
    service: 'Founding Custom Harness',
    priority: 90,
    status: 'intake',
    created: '2026-06-04',
  },
  {
    id: 'THL-003',
    name: 'Sam Okonkwo',
    email: 'sam@example.com',
    service: 'Fix & Stabilize Sprint',
    priority: 60,
    status: 'awaiting_secret',
    created: '2026-06-05',
  },
];

const STATUS_COLORS = {
  triage: '#eab308',
  intake: '#3b82f6',
  awaiting_secret: '#f97316',
  building: '#22d3ee',
  review: '#a855f7',
  delivered: '#22c55e',
};

function IconLine({ icon: Icon, children }) {
  return (
    <li>
      <Icon aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

/* ─── INTAKE / QUESTIONNAIRE FORM ─── */
function IntakeForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    agents: [],
    currentSetup: '',
    brokenWorkflow: '',
    repoAccess: '',
    symptoms: '',
    budget: '',
    deadline: '',
    successCriteria: '',
    workMethod: '',
    approvalGates: '',
    secretsHandling: '',
    additionalInfo: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const prev = form.agents || [];
      setForm((f) => ({
        ...f,
        agents: checked ? [...prev, value] : prev.filter((a) => a !== value),
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production this would POST to a backend or email service.
    // For now, display a confirmation.
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="form-success">
        <Check aria-hidden="true" />
        <h3>Intake received.</h3>
        <p>
          We will review your diagnostic and follow up within one business day. Check your email for a
          confirmation. No payment is required at this stage.
        </p>
        <a className="primary-button" href="#top" onClick={() => setSubmitted(false)}>
          Submit another
          <ArrowRight aria-hidden="true" />
        </a>
      </div>
    );
  }

  return (
    <form className="intake-form" onSubmit={handleSubmit}>
      <fieldset>
        <legend>Contact</legend>
        <div className="form-row">
          <label>
            Full name <span className="required">*</span>
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Email <span className="required">*</span>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
        </div>
        <div className="form-row">
          <label>
            Phone
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} />
          </label>
          <label>
            Company
            <input type="text" name="company" value={form.company} onChange={handleChange} />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Service selection</legend>
        <label>
          What do you need? <span className="required">*</span>
          <select name="service" value={form.service} onChange={handleChange} required>
            <option value="">— Select a service —</option>
            {serviceOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <fieldset>
        <legend>Current stack</legend>
        <label className="checkbox-group-label">
          Which agents / tools are you running?
          <div className="checkbox-grid">
            {agentOptions.map((agent) => (
              <label key={agent} className="checkbox-item">
                <input
                  type="checkbox"
                  name="agents"
                  value={agent}
                  checked={(form.agents || []).includes(agent)}
                  onChange={handleChange}
                />
                <span>{agent}</span>
              </label>
            ))}
          </div>
        </label>
        <label>
          Describe your current setup (VPS, local, Docker, etc.)
          <textarea
            name="currentSetup"
            rows={3}
            value={form.currentSetup}
            onChange={handleChange}
            placeholder="e.g. Ubuntu VPS on DigitalOcean, running Hermes + Claude Code + Codex via Telegram…"
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>Problem description</legend>
        <label>
          What is broken, stuck, or missing? <span className="required">*</span>
          <textarea
            name="brokenWorkflow"
            rows={4}
            value={form.brokenWorkflow}
            onChange={handleChange}
            required
            placeholder="Describe in as much detail as you can. The more precise the problem, the better the diagnostic."
          />
        </label>
        <label>
          Specific symptoms or error logs
          <textarea
            name="symptoms"
            rows={3}
            value={form.symptoms}
            onChange={handleChange}
            placeholder="Paste relevant log output, error messages, or agent behavior descriptions."
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>Access &amp; security</legend>
        <label>
          How do you share repo / VPS access?
          <textarea
            name="repoAccess"
            rows={2}
            value={form.repoAccess}
            onChange={handleChange}
            placeholder="e.g. GitHub collaborator invite, SSH key, or temporary access…"
          />
        </label>
        <label>
          Approval gates and human-in-the-loop requirements
          <textarea
            name="approvalGates"
            rows={2}
            value={form.approvalGates}
            onChange={handleChange}
            placeholder="Which actions should require your explicit approval? Commits? Deploys? Spending? Messages?"
          />
        </label>
        <label>
          How should secrets and tokens be handled?
          <textarea
            name="secretsHandling"
            rows={2}
            value={form.secretsHandling}
            onChange={handleChange}
            placeholder="e.g. .env files, 1Password, Vault, one-time secret links — we never ask for raw secrets in forms."
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>Success criteria &amp; logistics</legend>
        <label>
          What does success look like for this engagement?
          <textarea
            name="successCriteria"
            rows={2}
            value={form.successCriteria}
            onChange={handleChange}
            placeholder="e.g. Agents stop looping, costs stay under $X/month, deploys require my approval…"
          />
        </label>
        <div className="form-row">
          <label>
            Budget range
            <select name="budget" value={form.budget} onChange={handleChange}>
              <option value="">— Select —</option>
              <option value="299-749">$299 — $749</option>
              <option value="750-1499">$750 — $1,499</option>
              <option value="1500-2499">$1,500 — $2,499</option>
              <option value="2500-4499">$2,500 — $4,499</option>
              <option value="4500+">$4,500+</option>
              <option value="flexible">Flexible / discuss</option>
            </select>
          </label>
          <label>
            Deadline
            <select name="deadline" value={form.deadline} onChange={handleChange}>
              <option value="">— Select —</option>
              <option value="asap">ASAP</option>
              <option value="1week">Within 1 week</option>
              <option value="2weeks">Within 2 weeks</option>
              <option value="1month">Within 1 month</option>
              <option value="flexible">Flexible</option>
            </select>
          </label>
        </div>
        <label>
          Preferred work method
          <select name="workMethod" value={form.workMethod} onChange={handleChange}>
            <option value="">— Select —</option>
            <option value="async">Mostly async (email / Telegram)</option>
            <option value="sync">Scheduled sync calls</option>
            <option value="mixed">Mixed — async first, calls when needed</option>
          </select>
        </label>
      </fieldset>

      <fieldset>
        <legend>Anything else?</legend>
        <label>
          Additional context, questions, or requirements
          <textarea
            name="additionalInfo"
            rows={3}
            value={form.additionalInfo}
            onChange={handleChange}
            placeholder="Anything that did not fit above."
          />
        </label>
      </fieldset>

      <div className="form-disclaimer">
        <AlertTriangle aria-hidden="true" />
        <p>
          <strong>No payment is required at intake.</strong> We review every submission and follow up
          with a scope and quote before any money changes hands. Never send API keys, passwords, or
          secrets through this form — we will provide a secure handoff link after intake.
        </p>
      </div>

      <button type="submit" className="primary-button submit-button">
        <Send aria-hidden="true" />
        Submit intake
      </button>
    </form>
  );
}

/* ─── INTERNAL LEADS MOCK (admin-only prototype) ─── */
function LeadsDashboard() {
  return (
    <section id="leads" className="section leads-admin">
      <div className="section-heading">
        <p className="section-number">INTERNAL — Leads</p>
        <h2>Lead pipeline <span className="badge-local">local prototype</span></h2>
        <p>
          This section is a static mock for internal review only. No real customer data is stored or
          displayed. In production this will be behind authentication.
        </p>
      </div>
      <div className="leads-toolbar">
        <span className="leads-count">
          <Users aria-hidden="true" /> {mockLeads.length} leads
        </span>
        <span className="leads-actions">
          <button className="secondary-button small" disabled title="Export not wired in prototype">
            <Download aria-hidden="true" /> CSV
          </button>
          <button className="secondary-button small" disabled title="Export not wired in prototype">
            <Download aria-hidden="true" /> JSON
          </button>
        </span>
      </div>
      <div className="leads-table-wrap">
        <table className="leads-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Service</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockLeads.map((lead) => (
              <tr key={lead.id}>
                <td className="mono">{lead.id}</td>
                <td>{lead.name}</td>
                <td>{lead.service}</td>
                <td>
                  <span className="priority-score" style={{ '--score-color': lead.priority >= 80 ? '#22c55e' : lead.priority >= 50 ? '#eab308' : '#94a3b8' }}>
                    {lead.priority}
                  </span>
                </td>
                <td>
                  <span className="status-pill" style={{ '--pill-bg': STATUS_COLORS[lead.status] || '#64748b' }}>
                    {lead.status}
                  </span>
                </td>
                <td className="mono">{lead.created}</td>
                <td>
                  <button className="icon-btn" disabled title="View not wired in prototype">
                    <Eye aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="leads-disclaimer">
        <AlertTriangle aria-hidden="true" />
        <p>
          <strong>Prototype only.</strong> No real leads are stored here. Export, status changes, and
          detail views will be wired to the backend when auth is in place. Internal dashboard must be
          excluded from the public build pipeline until HTTPS, auth, and audit logging are active.
        </p>
      </div>
    </section>
  );
}

/* ─── MAIN APP ─── */
function App() {
  const [page, setPage] = useState('home');

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="The Harness Lab home" onClick={() => setPage('home')}>
          <img src={logoMark} alt="" />
          <span>The Harness Lab</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#forge" onClick={() => setPage('home')}>Harness</a>
          <a href="#process" onClick={() => setPage('home')}>Process</a>
          <a href="#pricing" onClick={() => setPage('home')}>Pricing</a>
          <a href="#intake" onClick={() => setPage('intake')}>Intake</a>
          <a className="nav-cta" href="#intake" onClick={() => setPage('intake')}>
            Start intake
            <ArrowRight aria-hidden="true" />
          </a>
        </nav>
      </header>

      {page === 'home' ? <HomePage onIntake={() => setPage('intake')} /> : <IntakePage />}
    </main>
  );
}

/* ─── HOME PAGE ─── */
function HomePage({ onIntake }) {
  return (
    <>
      <section id="top" className="hero">
        <img className="hero-seal" src={heroSeal} alt="" />
        <div className="hero-content">
          <p className="domain">theharnesslab.dev</p>
          <h1>
            Your agents <span className="accent">are powerful</span>.<br />
            Your command structure is not.
          </h1>
          <p className="hero-copy">
            The Harness Lab turns scattered AI tools into a customer-owned operating harness
            with rules, roles, memory, status, approval, and tests. Flat fee. Your keys. Your code.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#intake" onClick={(e) => { e.preventDefault(); onIntake(); }}>
              Start intake
              <ArrowRight aria-hidden="true" />
            </a>
            <a className="secondary-button" href="#pricing">
              View pricing
              <ScrollText aria-hidden="true" />
            </a>
          </div>
          <div className="terminal-preview">
            <div className="terminal-dots">
              <span></span><span></span><span></span>
            </div>
            <div className="terminal-line">
              <span className="terminal-prompt">$</span>
              <span className="terminal-cmd">harness-lab init --stack hermes,codex,telegram</span>
            </div>
            <div className="terminal-line">
              <span className="terminal-prompt">$</span>
              <span className="terminal-cmd">harness-lab forge --profile my-team</span>
            </div>
            <div className="terminal-line">
              <span className="terminal-comment"># harness built, smoke-tested, delivered → your repo</span>
            </div>
          </div>
        </div>
      </section>

      <section className="marquee" aria-label="Supported command stack">
        <span>Claude Code</span>
        <span>Codex</span>
        <span>Hermes</span>
        <span>OpenClaw</span>
        <span>OpenCode</span>
        <span>Ollama Cloud</span>
        <span>Telegram</span>
        <span>MCP</span>
      </section>

      {/* PROBLEM */}
      <section className="section split">
        <div>
          <p className="section-number">01 — The Problem</p>
          <h2>Six agents, zero command discipline.</h2>
        </div>
        <div className="pain-list">
          {pains.map((pain) => (
            <div className="pain-row" key={pain}>
              <Swords aria-hidden="true" />
              <p>{pain}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DELIVERABLES */}
      <section id="forge" className="section">
        <div className="section-heading">
          <p className="section-number">02 — What Gets Forged</p>
          <h2>One harness. Clear hierarchy. Hard gates. Owned forever.</h2>
          <p>
            The Harness Lab turns scattered AI tools into a customer-owned operating harness
            with rules, roles, memory, status, approval, and tests.
          </p>
        </div>
        <div className="deliverable-grid">
          {deliverables.map(({ icon: Icon, title, text }) => (
            <article className="deliverable" key={title}>
              <Icon aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* EXISTING HARNESS SERVICES */}
      <div className="section-heading center-heading">
        <p className="section-number">03 — Existing Harness Services</p>
        <h2>Already running Hermes, OpenClaw, or another harness?</h2>
        <p>
          We diagnose, fix, stabilize, and customize existing AI agent setups. Three flat-fee service tiers, no subscription.
        </p>
      </div>
      <div className="pricing-grid three-col">
        {existingHarnessTiers.map((tier) => (
          <article className="price-card" key={tier.name}>
            <div className="price-card-icon">
              <tier.icon aria-hidden="true" />
            </div>
            <h3>{tier.name}</h3>
            <p className="price">{tier.price}</p>
            <p className="price-note">{tier.note}</p>
            <ul>
              {tier.items.map((item) => (
                <IconLine icon={Check} key={item}>{item}</IconLine>
              ))}
            </ul>
          </article>
        ))}
      </div>

      {/* CUSTOM BUILD TIERS */}
      <section id="pricing" className="section">
        <div className="section-heading">
          <p className="section-number">04 — Custom Harness Builds</p>
          <h2>From diagnostic to delivery. Your code. Your keys. No lock-in.</h2>
          <p>
            Full custom harness builds delivered flat-fee. You own the repo, the config, and the operating docs.
          </p>
        </div>
        <div className="pricing-grid two-col">
          {customBuildTiers.map((tier) => (
            <article className={`price-card ${tier.featured ? 'featured' : ''}`} key={tier.name}>
              {tier.badge ? <span className="featured-label">{tier.badge}</span> : null}
              <div className="price-card-icon">
                <tier.icon aria-hidden="true" />
              </div>
              <h3>{tier.name}</h3>
              <p className="price">{tier.price}</p>
              <p className="price-note">{tier.note}</p>
              <ul>
                {tier.items.map((item) => (
                  <IconLine icon={ChevronRight} key={item}>{item}</IconLine>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="support-pack-row">
          <div className="support-pack-card">
            <div className="sp-icon-label">
              <Clock aria-hidden="true" />
              <div>
                <h3>Support Pack</h3>
                <p>{supportPack.price} / {supportPack.period} / {supportPack.tickets} tickets</p>
              </div>
            </div>
            <p className="price-note">{supportPack.note}</p>
          </div>
          <p className="change-order-note">
            <FileText aria-hidden="true" />
            {changeOrderNote}
          </p>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" className="section process">
        <div className="section-heading">
          <p className="section-number">05 — The Campaign</p>
          <h2>Built narrow, tested hard, handed off clean.</h2>
        </div>
        <div className="steps">
          {steps.map((step) => (
            <article className="step" key={step.title}>
              <span className="step-label">{step.label}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* QUALITY DOCTRINE */}
      <section className="section command-band">
        <div>
          <p className="section-number">06 — Quality Doctrine</p>
          <h2>If it cannot be tested, it does not ship.</h2>
        </div>
        <ul>
          <IconLine icon={Activity}>Heartbeat and dead-agent checks</IconLine>
          <IconLine icon={ShieldCheck}>Approval gates before risky actions</IconLine>
          <IconLine icon={FileCheck2}>Secrets redaction before delivery</IconLine>
          <IconLine icon={Check}>Smoke test before handoff</IconLine>
        </ul>
      </section>

      {/* FAQ */}
      <section className="section faq">
        <div className="section-heading">
          <p className="section-number">07 — Terms Of Command</p>
          <h2>Simple answers before money changes hands.</h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq) => (
            <article className="faq-item" key={faq.question}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      {/* RISK DISCLOSURE */}
      <section className="section risk-disclosure">
        <div className="section-heading">
          <p className="section-number">08 — Honest Boundaries</p>
          <h2>What we will not claim.</h2>
        </div>
        <div className="risk-grid">
          <div className="risk-col">
            <h3>We do claim</h3>
            <ul>
              <li><Check aria-hidden="true" /> Flat-fee delivery with clear scope</li>
              <li><Check aria-hidden="true" /> You own all code, config, and docs</li>
              <li><Check aria-hidden="true" /> Smoke tests and runbooks included</li>
              <li><Check aria-hidden="true" /> Real agents, real workflows, real VPS deployments</li>
              <li><Check aria-hidden="true" /> Support packs available post-delivery</li>
            </ul>
          </div>
          <div className="risk-col">
            <h3>We do not claim</h3>
            <ul>
              <li><Swords aria-hidden="true" /> Guaranteed uptime or SLA (support packs are limited)</li>
              <li><Swords aria-hidden="true" /> &ldquo;Set and forget&rdquo; — harnesses need monitoring</li>
              <li><Swords aria-hidden="true" /> Zero hallucination — models can still break</li>
              <li><Swords aria-hidden="true" /> Apex Build is available today (it is a roadmap item)</li>
              <li><Swords aria-hidden="true" /> Any specific revenue or ROI outcome</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <img src={logoMark} alt="" />
        <h2>Forge the command layer before everyone else sells the template.</h2>
        <p>
          The Harness Lab builds custom AI agent harnesses
          delivered fast, owned by the customer, and built for one real workflow at a time.
        </p>
        <a className="primary-button" href="#intake" onClick={(e) => { e.preventDefault(); onIntake(); }}>
          Start the intake
          <ArrowRight aria-hidden="true" />
        </a>
      </section>

      {/* INTERNAL LEADS PROTOTYPE */}
      <LeadsDashboard />

      <footer>
        <span>The Harness Lab</span>
        <span>theharnesslab.dev</span>
        <span>San Angelo, Texas</span>
      </footer>
    </>
  );
}

/* ─── INTAKE PAGE ─── */
function IntakePage() {
  return (
    <div className="page-intake">
      <section className="section intake-hero">
        <div className="section-heading">
          <p className="section-number">Intake</p>
          <h2>Tell us what is broken, missing, or needed.</h2>
          <p>
            No payment required. We review every submission and reply with a scope and quote before any
            work begins. Long-form answers help us give you a better diagnostic.
          </p>
        </div>
        <IntakeForm />
      </section>

      <footer>
        <span>The Harness Lab</span>
        <span>theharnesslab.dev</span>
        <span>San Angelo, Texas</span>
      </footer>
    </div>
  );
}

export default App;