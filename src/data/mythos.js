// Mythos OS: the studio's own operating cockpit. 15 captured surfaces.
// Copy rules: no dollar figures, no absolute claims. Numbers are "as captured".

const W = 1600;
const H = 787;

const shot = (id, extra) => ({
  id,
  src: `/walkthrough/${id}`,
  width: W,
  height: H,
  ...extra,
});

export const MYTHOS_STATS = [
  { value: "7", label: "harnesses" },
  { value: "60", label: "skills" },
  { value: "20,911", label: "graph nodes" },
  { value: "164", label: "communities" },
  { value: "15/15", label: "connections" },
];

export const MYTHOS_GROUPS = [
  {
    id: "operate",
    label: "Operate",
    title: "One screen runs the operation.",
    intro:
      "Every engine, provider and agent reports into one control surface, and any of them can be driven from a single console without leaving the dashboard.",
    screens: ["mission-control", "harnesses-one-roof", "hermes-agent", "console"],
  },
  {
    id: "deliver",
    label: "Deliver",
    title: "Audit, research, build, ship: one pipeline.",
    intro:
      "The flow we run for clients runs end to end here too. Tear a system down, research the ground truth, compose a build brief, then account for the work an agent actually completed.",
    screens: ["audit-kit", "research", "forge", "work-ledger"],
  },
  {
    id: "knowledge",
    label: "Knowledge",
    title: "What it learns, it keeps.",
    intro:
      "Knowledge doesn't evaporate between sessions. The OS keeps a graph of what it knows, a library of reusable skills, and a nightly review that proposes improvements for a human to accept.",
    screens: ["memory-graph", "skills", "dream"],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    title: "Wired into the machines, files and inboxes.",
    intro:
      "The harness isn't trapped in a browser tab. It reaches remote filesystems, mailboxes and connected services across the studio from one place.",
    screens: [
      "connections",
      "vps-files",
      "mail-desk",
      "settings",
    ],
  },
];

export const MYTHOS_SCREENS = [
  shot("mission-control", {
    height: 863,
    title: "Mission Control",
    alt: "Mythos OS Mission Control home screen showing open pipeline, audits, forge jobs, model spend, a value estimate, and every module as a card",
    shows:
      "The home cockpit: open pipeline, live audits, forge jobs, model spend and an estimated value, with every tool one click away.",
    matters:
      "It's the first screen we open each morning. When the whole operation sits on one surface, nothing important hides in a tab nobody checked.",
  }),
  shot("harnesses-one-roof", {
    title: "Every harness under one roof",
    alt: "Mythos OS showing seven harnesses online, providers and auth, quota windows, and models in use",
    shows:
      "Seven engines and runners (Claude Code, Hermes, Codex, OpenClaw, Graphify, Ollama Cloud and remote Linux workers) reporting live status, alongside provider auth, quota windows and the exact models in use.",
    matters:
      "Scoped authentication and rate-limit windows stay visible before they bite, not after a job fails.",
  }),
  shot("hermes-agent", {
    title: "Hermes, the orchestrator",
    alt: "Hermes Agent dashboard showing 296 sessions, 15,299 messages, a connected Telegram platform, and recent sessions",
    shows:
      "The orchestration agent as captured: 296 sessions and 15,299 messages, wired to Telegram, scheduled jobs and the command line.",
    matters:
      "It breaks work into pieces and dispatches each one to the engine best suited to it, so one request can fan out without anyone babysitting the handoffs.",
  }),
  shot("console", {
    title: "One console for every agent",
    alt: "Mythos OS Console messaging Hermes on the VPS, with a detailed table answer about where a lead-research job ran",
    shows:
      "A single console that can message any harness, local or on the VPS, and render diagrams, charts and file previews. Here Hermes explains where and how it ran a lead-research job.",
    matters:
      "Asking an agent to account for its own work, in plain language with evidence, is how we keep automated jobs reviewable.",
  }),
  shot("audit-kit", {
    title: "Audit Kit",
    alt: "Audit Kit reliability audit showing a 75/100 score, one critical finding, file and line counts, and a generated report",
    shows:
      "A reliability teardown of a repo or folder: a score, failed controls and critical findings (here a secrets-in-repo catch), turned into a remediation roadmap and a report.",
    matters:
      "Every engagement starts with evidence. The same audit we run on our own code is the one we run before quoting a client's.",
  }),
  shot("research", {
    title: "Research platform",
    alt: "Mythos Research Platform showing an investigation assignment, intensity and returned-data controls, and source scope selection",
    shows:
      "Structured public-source investigations with source leads, intensity controls, independent verification and full reports.",
    matters:
      "Research is grounded in sources before any model writes a word, and it stays limited to lawful public sources.",
  }),
  shot("forge", {
    title: "The Forge",
    alt: "The Forge build-brief composer with client, audit evidence, service, target harness, and model selectors and a dispatch button",
    shows:
      "A composer that builds an evidence-grounded brief from client and audit data, then dispatches it to a chosen harness on a chosen model.",
    matters:
      "It's the factory floor between \u201caudited\u201d and \u201cshipped\u201d: builds start from documented findings, not from a vague prompt.",
  }),
  shot("work-ledger", {
    title: "Work ledger",
    alt: "Agents and Work ledger showing 7 agents, 120 work items, 100 completed, and sourced completed-work entries",
    shows:
      "Completed-work signals gathered from every agent, the Hermes kanban, git history and the VPS. As captured: 7 agents and 120 sourced work items.",
    matters:
      "Each item links back to its source, so progress reports describe work that actually happened rather than work an agent says it did.",
  }),
  shot("memory-graph", {
    title: "Memory & knowledge graph",
    alt: "Memory and knowledge graph view showing 20,911 graph nodes, 164 communities, 13 memory files, and a force-directed graph",
    shows:
      "Code, repositories and memory fused into one queryable Graphify graph: 20,911 nodes across 164 communities as captured.",
    matters:
      "The OS can be asked about itself. Context that would normally live in one person's head becomes something any agent can look up.",
  }),
  shot("skills", {
    title: "Skills",
    alt: "Skills page listing 60 capabilities including agent-orchestrator, browser-agent, deep-code-review, and api-integrator",
    shows:
      "Sixty installed capabilities (agent orchestration, deep code review, browser automation, API integration and more), each a reusable command.",
    matters:
      "Repeatable know-how gets written down once and reused, so the hundredth run follows the same discipline as the first.",
  }),
  shot("dream", {
    title: "Dream",
    alt: "Dream review screen showing four self-improvement suggestions across skill, memory, cost, and workflow categories",
    shows:
      "A nightly review of the OS's own usage that proposes concrete changes: consolidate skills, curate memory, trim cost, fix a workflow.",
    matters:
      "Improvement becomes a routine instead of a resolution. The OS makes the suggestions and a person decides which ones ship.",
  }),
  shot("connections", {
    title: "Connections",
    alt: "Connections page showing 15 of 15 sources connected with in-dashboard remote terminals and harness status cards",
    shows:
      "Fifteen of fifteen sources connected as captured (harnesses, providers and knowledge bases), with in-dashboard terminals and desktops.",
    matters:
      "A broken integration shows up as a status card, not as a silent failure discovered three days later.",
  }),
  shot("vps-files", {
    title: "Remote files",
    alt: "Remote Files browser showing a remote server filesystem over encrypted SSH with metadata-first listings",
    shows:
      "Remote server filesystems browsed over encrypted private-network SSH, with metadata-first listings and secrets redacted in previews.",
    matters:
      "Inspecting a server shouldn't mean spraying credentials across a screen or a transcript.",
  }),
  shot("mail-desk", {
    title: "Mail Desk",
    alt: "Mail Desk showing company mailbox accounts, an inbox, and a compose pane sending from theharnesslab.com",
    shows:
      "A native inbox and sender for the company mailboxes, built into the OS.",
    matters:
      "Correspondence lives next to the work it's about, and outgoing mail is drafted for a person to send.",
  }),
  shot("settings", {
    title: "Settings",
    alt: "Settings onboarding showing an auto-detected stack and quota-aware fallback across isolated provider lanes",
    shows:
      "Onboarding that detects the installed stack on launch and routes across configured provider lanes when one reaches its quota limit, each workspace isolated.",
    matters:
      "Setup is detected rather than typed in by hand, and hitting a quota ceiling doesn't stop the day's work.",
  }),
];
