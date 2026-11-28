// Workflow explorer examples (verify-redesign.mjs clicks "Documents",
// "Operations", "Records"). Each example has exactly three steps, which map
// onto the three optical gates of the conduit plate.
export const WORKFLOWS = [
  {
    name: "Documents",
    input: "County records",
    steps: ["Read the documents", "Check the details", "Prepare the runsheet"],
    output: "A runsheet ready for review",
    description:
      "Title-Desk reads the documents it is given and organizes them for the chain of title.",
  },
  {
    name: "Operations",
    input: "A requested record set",
    steps: ["Take the request", "Read the records", "Prepare the chain"],
    output: "The chain of title, prepared",
    description:
      "The same software runs for every customer, whether the records were uploaded or requested.",
  },
  {
    name: "Records",
    input: "Uploaded or requested county records",
    steps: ["Read the documents", "Build the chain", "Compute net acres"],
    output: "Ownership and net mineral acres",
    description:
      "Title-Desk builds the chain of title and runsheet, resolves mineral ownership and computes net mineral acres.",
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
    control: "Tested restore drills and a written recovery playbook for the software.",
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
    control: "A runbook, smoke tests, and an evidence bundle for the software before it ships.",
  },
];

export const DELIVERABLES = [
  ["Title-Desk", "Landman title research software. Every customer runs the same product."],
  ["Upload or request", "Bring county records you already hold, or request them through the product."],
  ["Reads the documents", "The software reads the records for the assignment."],
  ["Chain of title", "It builds the chain of title from those documents."],
  ["Runsheet", "It builds the runsheet from the same records."],
  ["Mineral ownership", "It resolves mineral ownership from the chain."],
  ["Net mineral acres", "It computes net mineral acres."],
  ["Desktop by subscription", "The Title-Desk desktop app is sold by subscription."],
  ["Hosted, paid per run", "The hosted web app is paid per run."],
];

export const PROCESS = [
  {
    step: "01",
    title: "Upload or request records",
    body: "Every customer starts the same way: upload county records, or request them.",
    artifact: "The same Title-Desk software",
  },
  {
    step: "02",
    title: "The software reads the documents",
    body: "Title-Desk reads the documents. The same product does this for every customer.",
    artifact: "Documents in, text out",
  },
  {
    step: "03",
    title: "Chain of title and runsheet",
    body: "It builds the chain of title and the runsheet from those records.",
    artifact: "Chain of title · runsheet",
  },
  {
    step: "04",
    title: "Ownership and net mineral acres",
    body: "It resolves mineral ownership and computes net mineral acres.",
    artifact: "Ownership · net mineral acres",
  },
];

export const BUILT_FOR = [
  "Independent landmen and abstractors",
  "Oil and gas land teams",
  "Mineral title brokerages",
  "Operators",
  "Teams who upload county records",
  "Teams who request county records",
];

// Products for sale. No prices in visible copy (verify-redesign.mjs forbids $ figures).
export const ENGAGEMENTS = [
  {
    numeral: "I",
    name: "Title-Desk",
    summary:
      "Landman title research software. Upload or request county records. It reads the documents, builds the chain of title and runsheet, resolves mineral ownership and computes net mineral acres.",
    includes: [
      "Desktop app by subscription",
      "Hosted web app paid per run",
      "The same software for every customer",
    ],
    href: "https://title-desk.com/",
    cta: "Try Title-Desk",
    tag: "Subscription and per run",
    note: "title-desk.com",
  },
  {
    numeral: "II",
    name: "AI Landman",
    summary: "Hosted landman title product on the same platform.",
    includes: [
      "Hosted title product",
      "Same platform as Title-Desk",
      "The same software for every customer",
    ],
    href: "https://ailandman.io/",
    cta: "See AI Landman",
    tag: "Hosted product",
    note: "ailandman.io",
  },
  {
    numeral: "III",
    name: "Artificial Landman",
    summary:
      "Hosted Texas mineral title examination for land teams, brokerages and operators.",
    includes: [
      "For land teams, brokerages and operators",
      "Hosted examination",
      "The same software for every customer",
    ],
    href: "https://artificiallandman.io/",
    cta: "See Artificial Landman",
    tag: "Hosted product",
    note: "artificiallandman.io",
  },
];
