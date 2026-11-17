// Hard, verifiable git repository forensics extracted from Spencer Teague's
// production trees on Mac, Ubuntu workstation, and GitHub.

export const STUDIO_MONUMENTS = [
  {
    value: "5.5 MOS",
    subValue: "1,662 COMMITS · 305+ BRANCHES",
    label: "Non-stop grind taking TitleDesk Agent to working online county runs",
  },
  {
    value: "9 GENS",
    subValue: "14+ MONTHS · 932+ V8+ COMMITS",
    label: "Rebuilding MyAIMediaMgr from V1–V8.1 into BrandStreams without quitting",
  },
  {
    value: "1,426+",
    subValue: "DOCUMENTED BUG & SECURITY KILLS",
    label: "Edge cases, race conditions, OAuth walls, and IDORs hunted down in git",
  },
  {
    value: "247",
    subValue: "COMMITS BETWEEN 12 AM & 6 AM",
    label: "Overnight trench sessions on Title-Desk alone until every gate passed",
  },
];

export const TRENCH_CAMPAIGNS = [
  {
    id: "titledesk",
    tab: "Title-Desk & Artificial Landman",
    meta: "5.5 Months · 1,662 Commits · 305+ Branches",
    emblem: {
      webp: "/products/titledesk-web-seal.webp",
      fallback: "/products/titledesk-web-seal.png",
      alt: "Title-Desk sculpted white Carrara marble and bronze medallion",
    },
    secondEmblem: {
      webp: "/products/artificial-landman-seal.webp",
      fallback: "/products/artificial-landman-seal.png",
      alt: "Artificial Landman sculpted white Carrara marble and gold-wire medallion",
    },
    headline: "5.5 straight months refusing to let Texas courthouse title break us.",
    summary:
      "Getting an AI demo to summarize one clean PDF takes an afternoon. Getting an autonomous oil-and-gas title engine to survive crooked 1938 scans, missing clerk index rows, namesake decedents, and exact net-mineral-acre math online took 5.5 months of non-stop war across 305+ git branches, 40 isolated agent worktrees, 64 packaged release builds, and 24 GB of primary-source audit proof.",
    metrics: [
      ["1,662", "Unique git commits"],
      ["305+", "Branches & 40 worktrees"],
      ["64", "Packaged release builds"],
      ["321", "Hard edge-case fixes"],
      ["560+ hrs", "Git-logged session time (1,200+ wall hrs)"],
      ["24 GB", "Primary-source audit evidence"],
    ],
    walls: [
      {
        broke: "100-year-old crooked courthouse scans & runaway vision API bills",
        solved:
          "Built local zero-cost OCR inside Electron's main process (tesseract.js + @napi-rs/canvas) plus automatic second-reads when tract legal descriptions spill onto attached exhibits.",
      },
      {
        broke: "CourthouseDirect & TexasFile session locks and missing clerk index rows",
        solved:
          "Engineered persistent browser profiles and a stated-source-deed fallback lookup that pulls instruments directly when a county clerk's index omits a recited book and page.",
      },
      {
        broke: "Hallucinated mineral fractions, sheriff deeds & namesake decedents",
        solved:
          "Wrote a typed chain-of-title derivation engine where a sheriff or the State is never mistaken for a surname, initialed decedents never corrupt estates, and two independent examiners + a validator must reconcile 212.5400 net mineral acres before export.",
      },
      {
        broke: "Stalled runs at 16%, provider rate-limit storms & silent worker deaths",
        solved:
          "Wired five-account model failover across Gemini, Ollama Cloud, Claude, and Codex, persistent replay checkpoints, and built Perihelion Loop (klh v2.2 + hardened cloudroom.dev fabric) to seed regressions and prove autonomous repair across 7,070 TitleDesk tests.",
      },
      {
        broke: "Google OAuth & CASA verification walls blocking landmen",
        solved:
          "Bypassed brittle OAuth prompts on desktop with direct Drive-for-desktop mount detection and company-vs-personal boundaries, then split web intake from dedicated worker servers to take title-desk.com and artificiallandman.io live online.",
      },
    ],
    gitLog: [
      ["2026-11-15", "artificiallandman/main", "Verified live Reeves County dual-examiner run + 4-tab .xlsx export & Resend delivery"],
      ["2026-11-14", "site/survey-redesign", "Publish the TitleDesk survey redesign with staged workspace launch"],
      ["2026-11-13", "experimental/under-1hr", "Allow Gemini 4 Hydrogen as a page-image reader (GOLD002TX harness)"],
      ["2026-11-06", "HARNESS-LAB-BUILDS", "Five readers: two Ollama Cloud rows beside the three Gemini accounts"],
      ["2026-11-04", "claude/gte002tx-fixround", "A second read that quotes 'all the minerals reserved unto Grantor' back states the reservation claim"],
      ["2026-11-03", "codex/close-source-facts", "Bound source correction passes to verified image evidence and persistent progress limits"],
      ["2026-10-27", "HARNESS-LAB-BUILDS", "Fix progress bar stalling at 16% across Round 1 reading and derivation"],
      ["2026-10-16", "codex/courthousedirect", "Look up a stated source deed on CourthouseDirect when the records index has no row for it"],
      ["2026-10-07", "HARNESS-LAB-BUILDS", "Engine: a decedent written with an initial who could be either of two namesake holders takes no estate"],
      ["2026-10-01", "HARNESS-LAB-BUILDS", "A sheriff and the State are not surnames; the index is merged once per search, not once per row"],
      ["2026-08-06", "root/initial", "TitleDesk Agent — offline title research assistant for landmen"],
    ],
    liveLinks: [
      { label: "Launch title-desk.com", href: "https://title-desk.com/" },
      { label: "Launch artificiallandman.io", href: "https://artificiallandman.io/" },
      { label: "Desktop edition", href: "https://desktop.title-desk.com/" },
    ],
  },
  {
    id: "brandstreams",
    tab: "MyAIMediaMgr → BrandStreams",
    meta: "14+ Months · 9 Generations · 932+ V8+ Commits",
    emblem: {
      webp: "/products/brandstreams-logo.webp",
      fallback: "/products/brandstreams-logo.png",
      alt: "BrandStreams 3D emblem",
    },
    headline: "Nine architectural generations — because we refused to ship a broken wrapper.",
    summary:
      "MyAIMediaMgr (myaimediamgr.com / MAIMM) took even longer than Title-Desk. Before the V8.1 repository even opened in August 2025, eight prior versions were torn down and rebuilt as real social APIs, credit ledgers, and multi-tenant edge cases exposed every shortcut. Since V8.1 alone: 932+ git commits, 400+ bugfix and security commits, and a ruthless 16-defect production hardening into BrandStreams.",
    metrics: [
      ["9 Gens", "V1 → V8.1 → MAIMM → BrandStreams"],
      ["932+", "Commits since V8.1 alone"],
      ["400+", "Bugfix & security commits"],
      ["30", "Active git branches"],
      ["16", "Critical audit defects closed"],
      ["14+ Mos", "Continuous engineering"],
    ],
    walls: [
      {
        broke: "Multi-tenant social publishing routing every user's post to one account",
        solved:
          "Uncovered that bare Ayrshare credentials ignore request-body user IDs; re-engineered server/ayrshare.ts to default-deny without isolated per-tenant Profile-Keys and closed 9 schedule & campaign IDORs.",
      },
      {
        broke: "TikTok, LinkedIn, Facebook & Instagram OAuth and compliance mazes",
        solved:
          "Built end-to-end OAuth callback verification, token refresh lifecycles, webhook listeners, and mandatory platform data-deletion endpoints.",
      },
      {
        broke: "Credit-balance race conditions & foreign-key user-deletion deadlocks",
        solved:
          "Reconciled split ledger vs users.credits state under concurrent generation jobs and stripped duplicate NO ACTION foreign keys that vetoed account deletion in production Postgres.",
      },
      {
        broke: "Stripe webhook fail-open risk, broken payment returns & container sandboxes",
        solved:
          "Hardened Stripe webhooks to fail closed when secrets are absent, repaired payment-return 404s and admin-escalation paths, and solved Linux container bubblewrap & CLI trust traps.",
      },
    ],
    gitLog: [
      ["2026-08-27", "BrandStreams/main", "48ff5c71 · fix production database migration constraints"],
      ["2026-08-26", "BrandStreams/main", "3184db68 · fix: harden customer readiness and release gates"],
      ["2026-08-26", "BrandStreams/main", "da1e97e3 · fix(admin-test-mode): codex image path cannot use bubblewrap in a container"],
      ["2026-08-25", "fix/audit-critical", "22a26d27 · fix(security): scope Ayrshare publishing per user, close schedule IDORs"],
      ["2026-08-25", "fix/audit-critical", "1f011b93 · fix: repair payment return path, broken endpoints, and admin escalation"],
      ["2026-08-25", "fix/audit-critical", "c24aae2c · fix(billing): fail closed when the Stripe webhook secret is missing"],
      ["2026-08-25", "fix/audit-critical", "f7bd678e · fix(db): drop duplicate NO ACTION foreign keys that veto user deletion"],
      ["2026-01-19", "MAIMM_FINAL_PROD", "a05130f2 · Fix credit balance check to use max of ledger and users.credits"],
      ["2025-11-08", "MAIMM_FINAL_PROD", "14fda2de · Register TikTok and LinkedIn OAuth routes & Meta compliance webhooks"],
      ["2025-08-31", "MAIMM_FINAL_PROD", "Initial commit of MYAIMEDIAMANAGER-V8.1 (following 8 prior full rebuilds)"],
    ],
    liveLinks: [],
  },
  {
    id: "foundry",
    tab: "APEX.BUILD · Rogue Agents · Perihelion Loop",
    meta: "1,320+ Commits · Karpathy Loop + cloudroom.dev",
    emblem: {
      webp: "/brand/harness-lab-black-marble.webp",
      fallback: "/brand/harness-lab-black-marble.png",
      alt: "theharnesslab.dev Black Marble Engineering Seal",
    },
    secondEmblem: {
      webp: "/products/apex-build-logo.webp",
      fallback: "/products/apex-build-logo.png",
      alt: "APEX.BUILD 3D emblem",
    },
    headline: "When off-the-shelf AI loops stalled or lied, we built Perihelion Loop and our own machinery.",
    summary:
      "Standard agent wrappers claim 'done' while tests are failing or workers are dead. Across 1,064 commits on APEX.BUILD, 120 commits on Rogue Agents, 65+ commits on Perihelion Loop (klh v2.2 + our hardened open-source cloudroom.dev VM fabric), and 17 production surfaces inside Mythos OS, we built the deterministic harnesses, Frontier Councils, and zero-trust sandboxes that create, fix, and no-copy reverse-engineer software at verified quality.",
    metrics: [
      ["1,064", "APEX.BUILD commits"],
      ["7,070 / 0", "TitleDesk tests green via Perihelion"],
      ["730 / 0", "Rogue Agents tests green"],
      ["65+", "Perihelion Loop (klh v2.2) commits"],
      ["17", "Live Mythos OS surfaces"],
      ["20,911", "Knowledge-graph nodes"],
    ],
    walls: [
      {
        broke: "Agents claiming 'tests pass' without fresh commands or untampered sandboxes",
        solved:
          "Built Perihelion Loop (klh v2.2) combining Andrej Karpathy's keep-or-revert loop and typed DAGs with a fail-closed Apache-2.0 cloudroom.dev sandbox fabric: pre-execution SHA-256 exact-bytes manifest checks, quarantined output pull, independent holdout verification, and null_tested_regression gates.",
      },
      {
        broke: "Creating, fixing, or re-engineering complex software without IP contamination",
        solved:
          "Engineered forge, run, and harden recipes with OS kernel walls (sandbox-exec / bubblewrap) where only rea-agents inspects a lawfully held subject to emit a behaviour-only spec while downstream builders are kernel-blocked and verified for zero code, text, or asset overlap.",
      },
      {
        broke: "Dead background agents, rate-limit cascades & subscription exhaustion",
        solved:
          "Engineered heartbeat dead-agent detection, backpressure queues, and All-Account Frontier Council routing across Claude Fable, Gemini Carbon, Codex GPT-6 Astra, Claude Opus, and Grok on existing studio subscriptions and free-tier cloud credits.",
      },
      {
        broke: "Coordinating parallel builders across Mac, Ubuntu workstation & VPS nodes",
        solved:
          "Built Mythos OS and Rogue Agents with isolated git worktrees, shared 20,911-node knowledge graphs, Agent Browser Hub, and single human approval gates at irreversible boundaries.",
      },
    ],
    gitLog: [
      ["2026-11-12", "karpathy-loop-harness", "A Gemini sitting whose sign-in copy was removed is not trusted; log scrubbed of tokens"],
      ["2026-11-12", "perihelion/kiln", "klh integrate: verified native macOS SwiftUI Kiln forge milestones inside Seatbelt & Cloudroom fabric"],
      ["2026-11-05", "Rogue-Agents", "Integrate verified local toolkit shared with Perihelion across 22 branches"],
      ["2026-11-05", "karpathy-loop-harness", "Build Perihelion Loop (Karpathy Loop + Graph harness, Phases A–D) with adversarial hardening"],
      ["2026-10-26", "Rogue-Agents", "Give all Rogue Agents and Ollama workers access to Agent Browser Hub"],
      ["2026-10-17", "Rogue-Agents", "Require main-leader dispatch approval and recover stalled planning"],
      ["2026-06-05", "apex-build-platform", "Add runtime stability smoke tests, heartbeat/dead-agent checks & backpressure policy"],
      ["2026-01-22", "apex-build-platform", "Initial commit: Multi-AI cloud development platform (1,064-commit run)"],
    ],
    liveLinks: [
      { label: "Perihelion Loop on .dev", href: "https://theharnesslab.dev/#perihelion-loop" },
      { label: "Explore theharnesslab.dev", href: "https://theharnesslab.dev/" },
      { label: "Open-source cloudroom.dev", href: "https://www.cloudroom.dev" },
      { label: "APEX.BUILD on GitHub", href: "https://github.com/spencerandtheteagues/apex-build-platform" },
    ],
  },
];
