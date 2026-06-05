import {
  Activity,
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  CircleDollarSign,
  Code2,
  FileCheck2,
  GitBranch,
  KeyRound,
  LockKeyhole,
  MessageSquareText,
  ScrollText,
  ShieldCheck,
  Swords,
  Workflow,
} from 'lucide-react';

const logo = '/praetor-forge-logo.png';

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

const pricing = [
  {
    name: 'Customize',
    price: '$149',
    note: 'Existing Hermes or OpenClaw config tuned to your workflow.',
    items: ['Config review', 'Agent role cleanup', 'Approval gate defaults', 'Model routing notes'],
  },
  {
    name: 'Hybrid',
    price: '$399',
    note: 'Existing foundation plus custom extensions, skills, memory, and delivery docs.',
    items: ['Custom agents and skills', 'Telegram or CLI approval', 'Smoke test scaffold', 'Install runbook'],
    featured: true,
  },
  {
    name: 'Full Custom',
    price: '$999',
    note: 'New customer-owned command harness generated from intake and QA checked.',
    items: ['Fresh harness architecture', 'Multi-agent hierarchy', 'Cost and lane policy', 'Delivery package'],
  },
];

const faqs = [
  {
    question: 'Is this another SaaS subscription?',
    answer: 'No. Praetor Forge is flat-fee delivery. You own the harness and run it yourself.',
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
];

function IconLine({ icon: Icon, children }) {
  return (
    <li>
      <Icon aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

function App() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Praetor Forge home">
          <img src={logo} alt="" />
          <span>Praetor Forge</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#forge">Forge</a>
          <a href="#process">Process</a>
          <a href="#pricing">Pricing</a>
          <a className="nav-cta" href="mailto:s.teague@apex-build.dev?subject=Praetor%20Forge%20diagnostic">
            Start
            <ArrowRight aria-hidden="true" />
          </a>
        </nav>
      </header>

      <section id="top" className="hero">
        <img className="hero-seal" src={logo} alt="" />
        <div className="hero-content">
          <p className="domain">Custom AI Agent Command Harnesses</p>
          <h1>Praetor Forge</h1>
          <p className="hero-copy">
            Custom AI agent command harnesses for founders, agencies, and operators who want
            Claude, Codex, Hermes, OpenClaw, OpenCode, and lower-cost workers moving as one
            disciplined system.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="mailto:s.teague@apex-build.dev?subject=Praetor%20Forge%20diagnostic">
              Book a diagnostic
              <ArrowRight aria-hidden="true" />
            </a>
            <a className="secondary-button" href="#pricing">
              View the offer
              <ScrollText aria-hidden="true" />
            </a>
          </div>
          <ul className="hero-proof" aria-label="Core offer">
            <IconLine icon={LockKeyhole}>Flat fee</IconLine>
            <IconLine icon={KeyRound}>Your keys</IconLine>
            <IconLine icon={Code2}>Your code</IconLine>
          </ul>
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

      <section className="section split">
        <div>
          <p className="section-number">I. The Problem</p>
          <h2>Your agents are powerful. Your command structure is weak.</h2>
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

      <section id="forge" className="section">
        <div className="section-heading">
          <p className="section-number">II. What Gets Forged</p>
          <h2>One harness. Clear hierarchy. Hard gates. Owned forever.</h2>
          <p>
            Praetor Forge turns scattered AI tools into a customer-owned operating harness
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

      <section id="process" className="section process">
        <div className="section-heading">
          <p className="section-number">III. The Campaign</p>
          <h2>Built narrow, tested hard, handed off clean.</h2>
        </div>
        <div className="steps">
          {steps.map((step) => (
            <article className="step" key={step.title}>
              <span>{step.label}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section command-band">
        <div>
          <p className="section-number">IV. Quality Doctrine</p>
          <h2>If it cannot be tested, it does not ship.</h2>
        </div>
        <ul>
          <IconLine icon={Activity}>Heartbeat and dead-agent checks</IconLine>
          <IconLine icon={ShieldCheck}>Approval gates before risky actions</IconLine>
          <IconLine icon={FileCheck2}>Secrets redaction before delivery</IconLine>
          <IconLine icon={Check}>Smoke test before handoff</IconLine>
        </ul>
      </section>

      <section id="pricing" className="section">
        <div className="section-heading">
          <p className="section-number">V. Founding Offer</p>
          <h2>Start manual. Turn the pattern into the product.</h2>
          <p>
            Three flat-fee paths. No subscriptions. Support is finite, explicit, and optional.
          </p>
        </div>
        <div className="pricing-grid">
          {pricing.map((tier) => (
            <article className={`price-card ${tier.featured ? 'featured' : ''}`} key={tier.name}>
              {tier.featured ? <span className="featured-label">Best first offer</span> : null}
              <h3>{tier.name}</h3>
              <p className="price">{tier.price}</p>
              <p className="price-note">{tier.note}</p>
              <ul>
                {tier.items.map((item) => (
                  <IconLine icon={ChevronRight} key={item}>
                    {item}
                  </IconLine>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section faq">
        <div className="section-heading">
          <p className="section-number">VI. Terms Of Command</p>
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

      <section className="final-cta">
        <img src={logo} alt="" />
        <h2>Forge the command layer before everyone else sells the template.</h2>
        <p>
          Praetor Forge is the narrow version of Apex Build: custom AI agent harnesses
          delivered fast, owned by the customer, and built for one real workflow at a time.
        </p>
        <a className="primary-button" href="mailto:s.teague@apex-build.dev?subject=Praetor%20Forge%20diagnostic">
          Start the first build
          <ArrowRight aria-hidden="true" />
        </a>
      </section>

      <footer>
        <span>Praetor Forge by Apex Build</span>
        <span>praetorforge.com</span>
        <span>San Angelo, Texas</span>
      </footer>
    </main>
  );
}

export default App;
