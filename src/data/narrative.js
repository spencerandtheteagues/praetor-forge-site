// Workflow explorer examples (kept from the live site; verify-redesign.mjs
// clicks "Documents", "Operations", "Client work"). Each example has exactly
// three steps, which map onto the three optical gates of the conduit plate.
export const WORKFLOWS = [
  {
    name: "Documents",
    input: "A folder full of documents",
    steps: ["Read & extract", "Check the details", "Prepare the report"],
    output: "A report ready for review",
    description:
      "Turn scattered PDFs, scans, and spreadsheets into organized information your team can actually use.",
  },
  {
    name: "Operations",
    input: "A new work request",
    steps: ["Understand the job", "Update your systems", "Prepare the handoff"],
    output: "The next step, already prepared",
    description:
      "Connect the handoffs between your inbox, business software, and team so the same details are entered once.",
  },
  {
    name: "Client work",
    input: "A new client enquiry",
    steps: ["Organize the brief", "Create the project", "Draft the response"],
    output: "A client response ready to approve",
    description:
      "Give every enquiry a clear next step, with the context and draft your team needs to respond.",
  },
];

// The three gates painted into /plates/verification-conduit (x/y in % of the
// 16:9 plate, measured on the 1920×1080 render).
export const GATES = [
  {
    numeral: "I",
    name: "Ground",
    body: "Every job starts from the primary source: the document, the record, the live feed. Nothing is answered from memory alone.",
    x: 34,
    y: 50,
  },
  {
    numeral: "II",
    name: "Verify",
    body: "An independent check, often a second model that took no part in the first answer, cross-examines the result before it moves on.",
    x: 53,
    y: 50,
  },
  {
    numeral: "III",
    name: "Release",
    body: "Hard limits are enforced by the system, not trusted to the model, and a person approves anything that spends, sends, or deletes.",
    x: 72,
    y: 50,
  },
];

// The failure modes we diagnose, each paired with the control that fixes it.
// `tag` is what gets toggled into the intake `problems` list.
export const FAILURES = [
  {
    title: "Dropped messages",
    tag: "Dropped messages",
    body: "No acknowledgement, retry queue, or dead-letter path, so customer work quietly disappears.",
    control: "Acknowledged queues with retries and a dead-letter lane someone actually watches.",
  },
  {
    title: "Runaway spend",
    tag: "Runaway cost",
    body: "Agents loop, retry too fast, or use expensive models for cheap work.",
    control: "Budget caps, retry ceilings, and model routing by difficulty, with alerts before the bill.",
  },
  {
    title: "429 storms",
    tag: "429/rate limits",
    body: "Shared keys, no backoff, and too many workers make providers reject useful work.",
    control: "Backoff with jitter, per-lane concurrency limits, and fallback model lanes.",
  },
  {
    title: "Status theater",
    tag: "Fake health checks",
    body: "The health check says the app is running, but no real task is being completed.",
    control: "Canary tasks that prove real work completes, not just that a process is alive.",
  },
  {
    title: "Silent workers",
    tag: "Workers die silently",
    body: "A worker dies or stalls and nobody knows until a client complains.",
    control: "Heartbeats, stall detection, and a ledger of what ran, what retried, and what stopped.",
  },
  {
    title: "Secret leaks",
    tag: "Secret leaks",
    body: "Keys end up in prompts, logs, screenshots, repos, or shell history.",
    control: "Scoped identities, environment templates, and redaction checks on every surface.",
  },
  {
    title: "Missing approval gates",
    tag: "No approval gate",
    body: "Agents can spend, deploy, delete, or message customers without a human checkpoint.",
    control: "Owner approval in Slack, Telegram, email, or the CLI before anything consequential.",
  },
  {
    title: "Browser fragility",
    tag: "Browser breaks",
    body: "Sessions expire, tabs drift, and browser tasks fail without a trace.",
    control: "Isolated sessions, identity checks, and screenshot evidence for every browser step.",
  },
  {
    title: "Duplicate work",
    tag: "Duplicate work",
    body: "Retries or parallel workers process the same task twice and create conflicting output.",
    control: "Idempotency keys and claim-based work queues, so each job runs exactly once.",
  },
  {
    title: "No recovery path",
    tag: "No backup/recovery",
    body: "Backups are missing, stale, or impossible to restore during an incident.",
    control: "Tested restore drills and a written recovery playbook handed over with the system.",
  },
  {
    title: "Model mismatch",
    tag: "Bad model routing",
    body: "One model is used for everything instead of routing by risk, cost, and difficulty.",
    control: "Explicit model lanes: cheap checks stay cheap, hard reasoning gets the strongest model.",
  },
  {
    title: "No handoff proof",
    tag: "No runbook",
    body: "No runbook, no smoke test, and no evidence that the owner can operate it.",
    control: "A runbook, smoke tests, and an evidence bundle you run yourself before sign-off.",
  },
];

export const DELIVERABLES = [
  ["Private Git repository", "The code, configuration, and history belong to you from day one."],
  ["Reproducible setup", "One script brings the system up on your machine or your cloud."],
  ["Secrets stay yours", "Bring your own keys. An env template and redaction checks keep them out of code and logs."],
  ["Operator runbook", "Plain-language instructions for running, changing, and recovering the system."],
  ["Automated smoke tests", "Checks that prove the real workflow completes, not just that it starts."],
  ["Evidence bundle", "What was tested, what failed, what was fixed, and how it was verified."],
  ["Human approval gates", "You approve anything that spends money, sends messages, or deletes data."],
  ["Cost & rate-limit breakers", "Budget caps, backoff, and fallback lanes so a loop never becomes a bill."],
  ["Recovery playbook", "Backups, restore steps, and incident notes you have already rehearsed."],
];

export const PROCESS = [
  {
    step: "01",
    title: "Understand & tear down",
    body: "We map the workflow, the tools you already use, where it breaks today, and what “done” has to mean.",
    artifact: "Written scope & acceptance criteria",
  },
  {
    step: "02",
    title: "Engineer the system",
    body: "Spencer builds the software, automation, or harness against that scope, in a repository you own.",
    artifact: "Customer-owned repo & setup",
  },
  {
    step: "03",
    title: "Prove it against failure",
    body: "We test the happy path and the hard ones: rejection, restart, budget limits, bad input, and secret handling.",
    artifact: "Smoke tests & evidence notes",
  },
  {
    step: "04",
    title: "Hand over full ownership",
    body: "You run the setup and the tests on your own machine. Handoff happens when you can operate it without us.",
    artifact: "Runbook & acceptance sign-off",
  },
];

export const BUILT_FOR = [
  "Owner-operated businesses with repeated paperwork",
  "Oil & gas, land, and title teams",
  "Agencies delivering automation to their clients",
  "SaaS teams shipping AI features",
  "Support and operations teams",
  "Founders turning a prototype into a product",
];

// Engagement tiers. Deliberately no prices or scarcity language: every
// engagement is scoped on a call (verify-redesign.mjs forbids $ figures).
export const ENGAGEMENTS = [
  {
    numeral: "I",
    name: "Free teardown & fit call",
    requestType: "Free teardown & fit call",
    summary: "Twenty focused minutes on your workflow, where it breaks, and whether we are the right fit.",
    includes: ["Likely failure points named", "The right next step", "No credentials, no pressure"],
    cal: true,
  },
  {
    numeral: "II",
    name: "Reliability & security audit",
    requestType: "Reliability & security audit",
    summary: "A structured teardown of an existing automation or agent system: failures, cost exposure, security gaps.",
    includes: ["Written failure map", "Prioritized fix list", "Walkthrough call"],
  },
  {
    numeral: "III",
    name: "Workflow automation",
    requestType: "Workflow automation",
    summary: "One repeated workflow, from documents, requests, or client work, turned into a tested, owned system.",
    includes: ["Connected to your tools", "Human approval where it matters", "Runbook & smoke tests"],
  },
  {
    numeral: "IV",
    name: "Custom websites & full-stack apps",
    requestType: "A website or full-stack app",
    summary: "Business websites, internal tools, and full products, designed and engineered end to end.",
    includes: ["Design & build", "API integrations", "Deployment you control"],
  },
  {
    numeral: "V",
    name: "Foundation & multi-agent AI harnesses",
    requestType: "An AI harness",
    summary: "The operating layer for AI agents: routing, model lanes, approvals, budgets, verification, and recovery.",
    includes: ["One agent or a fleet", "Multi-model verification", "Evidence bundle & handoff"],
  },
  {
    numeral: "VI",
    name: "Ongoing care",
    requestType: "Ongoing care",
    summary: "Health checks, model and provider updates, small fixes, and a regular reliability review.",
    includes: ["Scheduled checks", "Provider change review", "A clear support lane"],
  },
];
