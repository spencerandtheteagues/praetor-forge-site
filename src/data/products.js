// Chapters III, IV & VI — custom harnesses, the products they built, the
// landing-page gallery, and the Studio Cinema cuts.
// Copy rules for theharnesslab.com: no dollar characters in visible copy,
// whole rounded-up months only, and outbound links strictly limited to the
// live product domains + theharnesslab.dev (verify-redesign.mjs enforces).

// Screenshot helper: every product capture ships a full-size WebP plus a 640px
// rail/thumbnail rendition next to it.
const shot = (path, width, height, title, caption, alt = caption) => ({
  src: `/showcase/${path}.webp`,
  src640: `/showcase/${path}-640.webp`,
  width,
  height,
  title,
  caption,
  alt,
});
const WIDE = [2880, 1800];

/* ------------------------------------------------------------------------ */
/* Chapter III·A — Rogue Agents (custom-built multi-agent command center)    */
/* ------------------------------------------------------------------------ */
export const ROGUE_AGENTS = {
  telemetry: [
    ["22,582", "Authored LOC"],
    ["103", "Commits (Nov 2026)"],
    ["730 / 730", "Tests green"],
    ["1 Month", "Rapid sprint"],
  ],
  shots: [
    shot(
      "rogue-agents/01-command-center-overview",
      1440,
      900,
      "Multi-agent command center",
      "The cockpit: Claude, Codex, Antigravity and Grok co-leads side by side, a subordinate Ollama Cloud worker bar, and live quota meters so every lane shows its remaining capacity before work is dispatched.",
      "Rogue Agents multi-agent command center with four co-lead agent cards, an Ollama worker bar, and quota meters",
    ),
    shot(
      "rogue-agents/02-connections-models-setup",
      1440,
      900,
      "Model routing & worktree isolation",
      "Multi-provider routing setup: each co-lead is bound to an isolated provider lane and reasoning level, and every execution job gets a separate Git worktree so parallel agents never write over each other.",
      "Rogue Agents setup dialog assigning a model and reasoning level to each co-lead and enabling a Git worktree per job",
    ),
    shot(
      "rogue-agents/03-council-workspace-debate",
      1440,
      900,
      "4-agent council debate",
      "A live council task: cross-provider peer consultations, verified outcomes with evidence, and a four-agent plan-endorsement vote that has to pass before the plan executes.",
      "Rogue Agents council workspace showing a four-agent plan vote with every agent agreeing and verified outcomes",
    ),
    shot(
      "rogue-agents/04-voice-brainstorm-final-report",
      1440,
      900,
      "Voice brainstorm & final report",
      "A spoken brainstorm with all four agents beside the final summary: what each agent contributed, the independent verification run, and the evidence bundle handed back for sign-off.",
      "Rogue Agents voice brainstorm panel beside the final verified summary report",
    ),
  ],
};

/* ------------------------------------------------------------------------ */
/* Chapter IV — Evidence: three live flagships + two prior platforms         */
/* ------------------------------------------------------------------------ */
export const PRODUCT_SHOWCASES = [
  {
    id: "title-desk",
    name: "Title-Desk",
    alsoName: "Title-Desk Agent",
    domain: "title-desk.com",
    href: "https://title-desk.com/",
    secondaryLink: {
      domain: "desktop.title-desk.com",
      href: "https://desktop.title-desk.com/",
    },
    status: "Live production",
    placard: "Texas mineral title · Hosted web platform + native desktop app",
    lede:
      "Hosted Texas mineral title examination for independent landmen and abstractors at title-desk.com, paired with Title-Desk Agent (the Title-Desk desktop app) at desktop.title-desk.com: reads crooked courthouse scans, rebuilds the chain of title, computes exact mineral-interest fractions, checks the final answer with an independent third model against page images, and produces a source-linked draft four-sheet workbook for review by a qualified landman or attorney.",
    logo: {
      webp: "/products/titledesk-web-seal.webp",
      w640: "/products/titledesk-web-seal-640.webp",
      fallback: "/products/titledesk-web-seal.png",
      width: 1024,
      height: 1024,
    },
    stats: [
      ["262,305", "Core engine LOC"],
      ["1,662", "Campaign commits"],
      ["7,070", "Engine tests"],
      ["4 Months", "Aug–Nov 2026"],
    ],
    breakdown: [
      ["22,638", "Title-Desk hosted web layer"],
      ["23,148", "Artificial Landman hosted layer (shared engine)"],
      ["22,810", "AI Landman service layer (shared engine)"],
      ["4,288", "TractPilot prototype"],
    ],
    serviceLink: {
      href: "/landman-title-workflow-automation/",
      label: "Landman title software",
    },
    groups: [
      {
        label: "Title-Desk · title-desk.com",
        shots: [
          shot("titledesk-hosted/01-landing", ...WIDE, "Survey landing page", "The title-desk.com landing page: a surveyed Texas land layer introducing the upload-and-examine mineral workflow for independent landmen and abstractors.", "Title-Desk landing page with a topographic Texas survey hero"),
          shot("titledesk-hosted/03-workspace-intake-verifier", ...WIDE, "Pre-run intake verifier", "Before an examination run starts, a deterministic scope check reconciles tract acreage, abstracts and attached instruments, and lists what to review.", "Title-Desk intake workspace with assignment tracts, instruments, and a scope-check guide"),
          shot("titledesk-hosted/04-workspace-live-examination", ...WIDE, "Live dual-examiner run", "Two Gemini sessions examine the records separately while an independent third model checks the final answer against page images; unresolved tracts stay proposals leading the curative requirements.", "Title-Desk live examination screen with a run timer and cross-family examiner status"),
          shot("titledesk-hosted/05-workspace-workbook", ...WIDE, "Four-sheet draft workbook", "The delivered draft record: source-linked mineral ownership with exact fractions, net mineral acres, and curative requirements ready for review by a qualified landman or attorney.", "Title-Desk source-linked draft mineral ownership workbook"),
        ],
      },
      {
        label: "Title-Desk Agent · desktop.title-desk.com",
        shots: [
          shot("titledesk/01b-desktop-agent-landing", ...WIDE, "Title-Desk Agent landing", "Title-Desk Agent, the Title-Desk desktop app across Windows, macOS, and Linux: local OCR, local projects, and a built-in title assistant on the landman's own computer.", "Title-Desk Agent landing page"),
          shot("titledesk/04-workspace-runsheet", ...WIDE, "Source-linked runsheet", "Accepted instruments in chronological order; rows that break the chain are flagged and every entry links to its recorded book and page.", "Title-Desk Agent runsheet workspace with chronological instruments"),
          shot("titledesk/05b-workspace-mineral-ownership", ...WIDE, "Exact mineral ownership", "Mineral ownership is computed with exact rational fractions, never decimals; a tract that does not total unity shows the exact fractional shortfall.", "Title-Desk Agent ownership table with exact fractions and net mineral acres per owner"),
          shot("titledesk/06-workspace-heirship-tree", ...WIDE, "Heirship tree", "Family graph, determinations and curative issues for estates that pass mineral interest without a recorded deed.", "Title-Desk Agent heirship family graph workspace"),
        ],
      },
    ],
  },
  {
    id: "artificial-landman",
    name: "Artificial Landman",
    domain: "artificiallandman.io",
    href: "https://artificiallandman.io/",
    status: "Live production",
    placard: "Texas mineral title · Built for land teams, brokerages & operators",
    lede:
      "Hosted Texas mineral title examination for land teams, brokerages and operators who run many assignments. Artificial Landman runs the same Texas mineral-interest engine as Title-Desk, packaged, sold and supported on its own with a dedicated brass-and-topographic workspace.",
    logo: {
      webp: "/products/artificial-landman-seal.webp",
      w640: "/products/artificial-landman-seal-640.webp",
      fallback: "/products/artificial-landman-seal.png",
      width: 1024,
      height: 1024,
    },
    stats: [
      ["23,148", "Hosted LOC"],
      ["54", "Hosted commits"],
      ["4-Sheet", "Source-linked draft"],
      ["1 Month", "Nov 2026 sprint"],
    ],
    breakdown: [
      ["262,305", "Shared Texas mineral-interest engine"],
      ["Aug–Nov 2026", "Title engineering campaign"],
    ],
    groups: [
      {
        label: "Landing & running workspace",
        shots: [
          shot("artificial-landman/01-landing", ...WIDE, "Brass & topographic landing", "The Artificial Landman landing page for land teams, brokerages and operators, built around its own brass-and-topography identity.", "Artificial Landman landing page"),
          shot("artificial-landman/03-workspace-intake-verifier", ...WIDE, "Pre-run intake verifier", "Deterministic scope check reconciling Texas county acreage, abstracts and recited source deeds before examination runs.", "Artificial Landman intake verifier workspace"),
          shot("artificial-landman/04-workspace-live-examination", ...WIDE, "Live dual-examiner run", "Two separate Gemini sessions plus an independent third-model check against page images; unresolved tracts stay proposals with findings listed first in curative requirements.", "Artificial Landman live examination screen"),
          shot("artificial-landman/05-workspace-workbook", ...WIDE, "Delivered draft workbook", "The source-linked draft mineral ownership workbook with exact fractions, ready for review by a qualified landman or attorney.", "Artificial Landman draft mineral ownership workbook"),
        ],
      },
    ],
  },
  {
    id: "ai-landman",
    name: "AI Landman",
    domain: "ailandman.io",
    href: "https://ailandman.io/",
    status: "Live production",
    placard: "Texas mineral title · All 254 Texas counties · Upload or full-service",
    lede:
      "Remote Texas oil and gas mineral title examination across all 254 Texas counties at ailandman.io. Paste a client’s assignment instructions to upload courthouse records you already hold or request full-service county clerk retrieval — two separate Gemini sessions examine the deeds, deterministic code checks every mineral fraction, an independent third model audits the final answer against page images, and the source-linked draft Excel workbook arrives by email for final review by a qualified landman or attorney.",
    logo: {
      webp: "/products/ai-landman-seal.webp",
      w640: "/products/ai-landman-seal-640.webp",
      fallback: "/products/ai-landman-seal.png",
      width: 1024,
      height: 1024,
    },
    stats: [
      ["22,810", "Service LOC"],
      ["121", "Commits (Nov 2026)"],
      ["254", "Texas counties"],
      ["1 Month", "Rapid sprint"],
    ],
    breakdown: [
      ["262,305", "Shared Texas mineral-interest engine"],
      ["6-Sheet", "Source-linked sample workbook"],
    ],
    serviceLink: {
      href: "/landman-title-workflow-automation/",
      label: "Landman title software",
    },
    groups: [
      {
        label: "Landing & sample deliverable",
        shots: [
          shot("ai-landman/01-landing", ...WIDE, "Statewide Texas landing", "The ailandman.io landing page introducing remote mineral title examination across all 254 Texas counties — paste an assignment, upload records or request county clerk retrieval, and receive the finished draft workbook by email.", "AI Landman landing page with a surveyor automaton reading a courthouse deed book"),
          shot("ai-landman/03-run-options", ...WIDE, "Upload & full-service runs", "Run-scope options comparing uploaded deed packets against full-service county clerk research and record purchasing with an operator-approved copy budget.", "AI Landman run options comparing uploaded document runs and full-service county record retrieval"),
          shot("ai-landman/04-sample-workbook", ...WIDE, "Verified sample workbook", "Inspectable Reeves County sample deliverable tracing mineral ownership across two tracts with exact rational fractions, net mineral acres, and cited source deeds.", "AI Landman verified mineral ownership sample workbook table for Reeves County, Texas"),
          shot("ai-landman/05-verification-flow", ...WIDE, "Dual-examiner verification flow", "End-to-end delivery flow: two Gemini sessions examine the records separately, deterministic code checks every fraction, an independent third model checks the final answer against page images, and unresolved items lead the curative requirements.", "AI Landman verification workflow showing dual-examiner review and emailed Excel workbook delivery"),
        ],
      },
    ],
  },
  {
    id: "brandstreams",
    name: "BrandStreams",
    domain: "brandstream.my",
    href: "https://brandstream.my/",
    status: "Past flagship · Live",
    placard: "AI social media agency SaaS · Evolved from MyAIMediaMgr",
    lede:
      "Nine architectural generations took MyAIMediaMgr from an early AI social tool to BrandStreams: coordinated multi-slot campaigns, multi-model brainstorming, a content calendar, an approval queue, and default-deny human-gated publishing.",
    logo: {
      webp: "/products/brandstreams-logo.webp",
      w640: "/products/brandstreams-logo-640.webp",
      fallback: "/products/brandstreams-logo.png",
      width: 1254,
      height: 1254,
    },
    stats: [
      ["81,254", "Authored LOC"],
      ["1,364", "Commits (2025–2026)"],
      ["424", "Source files"],
      ["14 Months", "9 Generations"],
    ],
    comparison: {
      before: shot("brandstreams/01-maimm-pre-rename-landing", ...WIDE, "Before · MyAIMediaMgr", "The pre-rename MyAIMediaMgr landing page.", "MyAIMediaMgr landing page before the rename"),
      after: shot("brandstreams/05-brandstreams-post-rename-landing", ...WIDE, "After · BrandStreams", "The rebuilt BrandStreams landing page after the rename.", "BrandStreams landing page after the rename"),
    },
    groups: [
      {
        label: "Running workspace",
        shots: [
          shot("brandstreams/08-brandstreams-workspace-campaign-board", ...WIDE, "Campaign board", "Coordinated multi-slot campaigns: each slot is generated, scheduled and approved as part of one launch.", "BrandStreams campaign workspace with scheduled campaign slots"),
          shot("brandstreams/11-brandstreams-workspace-ai-brainstorm", ...WIDE, "AI brainstorm", "A multi-model brainstorm for campaign concepts before anything is drafted.", "BrandStreams multi-model AI brainstorm"),
          shot("brandstreams/13-brandstreams-workspace-calendar", ...WIDE, "Content calendar", "Draft calendar for intended use dates; entries never publish externally on their own.", "BrandStreams draft content calendar"),
          shot("brandstreams/14-brandstreams-workspace-approval-queue", ...WIDE, "Approval queue", "Every post waits in the approval queue for a person before it can be published.", "BrandStreams content approval queue"),
        ],
      },
    ],
  },
  {
    id: "apex-build",
    name: "APEX.BUILD",
    domain: "apex-build.dev",
    href: "https://apex-build.dev/",
    status: "Past flagship · Live",
    placard: "Multi-AI cloud development platform",
    lede:
      "A multi-AI cloud development platform where a nine-agent build team plans, codes, tests and verifies an app inside a cloud IDE — with dead-agent heartbeats, backpressure routing, spend telemetry, and bring-your-own-key provider routing.",
    logo: {
      webp: "/products/apex-build-logo.webp",
      w640: "/products/apex-build-logo-640.webp",
      fallback: "/products/apex-build-logo.png",
      width: 1024,
      height: 1024,
    },
    stats: [
      ["377,197", "Authored LOC"],
      ["966", "Main commits"],
      ["852", "Source files"],
      ["5 Months", "Build window"],
    ],
    breakdown: [["1,064", "Commits across all branches"]],
    groups: [
      {
        label: "Landing & running workspace",
        shots: [
          shot("apex-build/03-landing-latest-blue-steel-1440x900", ...WIDE, "Blue-steel landing", "The current APEX.BUILD landing page.", "APEX.BUILD blue-steel landing page"),
          shot("apex-build/04-landing-latest-9agent-system-1440x900", ...WIDE, "Nine-agent system", "How the nine-agent build team divides planning, implementation, testing and verification.", "APEX.BUILD nine-agent system overview"),
          shot("apex-build/08-workspace-builder-command-studio-1440x900", ...WIDE, "Builder command", "Describe the app; the command screen turns it into a staged build plan.", "APEX.BUILD builder command screen"),
          shot("apex-build/09-workspace-active-9agent-build-1440x900", ...WIDE, "Active nine-agent build", "A live build with every agent's lane, heartbeat and verification status on one screen.", "APEX.BUILD active nine-agent build"),
          shot("apex-build/11-workspace-cloud-ide-monaco-editor-1440x900", ...WIDE, "Cloud IDE", "The Monaco-based cloud IDE where generated code can be inspected and edited.", "APEX.BUILD cloud IDE with Monaco editor"),
          shot("apex-build/14-workspace-settings-byok-routing-1440x900", ...WIDE, "Bring-your-own-key routing", "Users can route builds through their own provider keys, encrypted at rest and never shown again after saving.", "APEX.BUILD bring-your-own-key provider routing settings"),
        ],
      },
    ],
  },
];

/* ------------------------------------------------------------------------ */
/* Chapter VI — Landing pages gallery (no addresses, no outbound links)      */
/* ------------------------------------------------------------------------ */
export const LANDING_GALLERY = [
  {
    id: "spectre",
    name: "Spectre",
    kind: "Threat-intelligence console",
    body: "Onion and mesh threat-intelligence monitoring overview, designed for high-density dark-mode telemetry.",
    src: "/showcase/spectre/01-entry-intelligence-overview-1440x900.webp",
    thumb: "/showcase/spectre/01-entry-intelligence-overview-1440x900-640.webp",
    width: 2880,
    height: 1800,
  },
  {
    id: "kiln",
    name: "Kiln",
    kind: "Native macOS utility · Phase-1 foundation",
    body: "Native macOS disk and build-artifact cleaner: 29-feature behavioral specification, 15-screen interface design, and Phase-1 SwiftUI foundation forged through Perihelion Loop with proportional hazard gates.",
    src: "/showcase/kiln/01-overview-scan-summary.webp",
    thumb: "/showcase/kiln/01-overview-scan-summary-640.webp",
    width: 1440,
    height: 900,
  },
  {
    id: "silverguard",
    name: "SilverGuard",
    kind: "Family caregiving app",
    body: "Cross-platform family caregiver and senior wellness companion, starting from a calm, legible welcome experience.",
    src: "/showcase/silverguard-eldercare/01-welcome-login.webp",
    thumb: "/showcase/silverguard-eldercare/01-welcome-login-640.webp",
    width: 2880,
    height: 1800,
  },
  {
    id: "samara",
    name: "Samara",
    kind: "Research workspace",
    body: "Source-grounded research workspace with live web-page ingestion, so every answer can point back to what it read.",
    src: "/showcase/samara/01-landing.webp",
    thumb: "/showcase/samara/01-landing-640.webp",
    width: 2880,
    height: 1800,
  },
  {
    id: "voxscript",
    name: "VoxScript",
    kind: "Transcription workspace",
    body: "AI-powered video and audio transcription workspace built on Whisper — turning recordings into searchable transcripts and structured summaries.",
    src: "/showcase/voxscript/01-landing.webp",
    thumb: "/showcase/voxscript/01-landing-640.webp",
    width: 2880,
    height: 1800,
  },
  {
    id: "davis",
    name: "Davis Moore Electric",
    kind: "Licensed electricians · Lubbock, Texas",
    body: "Website for licensed electricians in Lubbock, Texas.",
    src: "/davis-site.webp",
    width: 1280,
    height: 3536,
    page: true,
  },
  {
    id: "dooley",
    name: "Dooley A/C & Heating",
    kind: "HVAC contractor · San Angelo, Texas",
    body: "Website for an HVAC contractor in San Angelo, Texas.",
    src: "/dooley-site.webp",
    width: 720,
    height: 4373,
    page: true,
  },
  {
    id: "freds",
    name: "Fred’s Radiator & Auto",
    kind: "Automotive shop · Waco, Texas",
    body: "Website for an automotive shop in Waco, Texas.",
    src: "/freds-site.webp",
    width: 1280,
    height: 3693,
    page: true,
  },
];

/* ------------------------------------------------------------------------ */
/* Chapter IV · Studio Cinema — the walkthrough leads                        */
/* ------------------------------------------------------------------------ */
export const CINEMA_CUTS = [
  {
    id: "titledesk-walkthrough",
    tab: "Title-Desk Walkthrough",
    meta: "16:9 · 2m 29s",
    src: "/video/titledesk-sales-demo-2027.mp4",
    poster: "/video/titledesk-sales-demo-poster.webp",
    width: 1920,
    height: 1080,
    shape: "wide",
    hasAudio: true,
    caption:
      "End-to-end Title-Desk workspace tour: passwordless sign-in, pre-run scope check, live twelve-instrument examination, emailed deliverable, and pause-verifiable four-sheet draft workbook. Demonstration with a sample assignment; run time shortened. In production, the third-model check allows one repair and keeps any still-unresolved tract as a proposal leading curative requirements.",
    chapters: [
      { t: 0, label: "Sign-In & Scope Check" },
      { t: 30.3, label: "Live 12-Deed Run" },
      { t: 51.1, label: "Email & Curatives" },
      { t: 90.2, label: "4-Sheet Workbook" },
    ],
  },
  {
    id: "showcase",
    tab: "Product film",
    meta: "16:9 · 22s",
    src: "/video/harnesslab-showcase-2027.mp4",
    poster: "/video/harnesslab-showcase-poster.webp",
    width: 1920,
    height: 1080,
    shape: "wide",
    hasAudio: true,
    caption:
      "Product film: Title-Desk and Artificial Landman, then BrandStreams and APEX.BUILD.",
    chapters: [
      { t: 0, label: "Zero-Quit Thesis" },
      { t: 6.2, label: "Title-Desk & Artificial Landman" },
      { t: 11.4, label: "Mythos OS & Rogue Agents" },
      { t: 16.6, label: "BrandStreams & APEX.BUILD" },
    ],
  },
  {
    id: "architecture",
    tab: "Verification",
    meta: "16:9 · 22s",
    src: "/video/verification-handover-2027.mp4",
    poster: "/video/verification-handover-poster.webp",
    width: 1920,
    height: 1080,
    shape: "wide",
    hasAudio: true,
    caption:
      "Primary-source verification gates, 20,911 knowledge-graph nodes, and private operator desks.",
    chapters: [
      { t: 0, label: "Primary-Source Gates" },
      { t: 6.2, label: "Operator Desks" },
      { t: 11.4, label: "Seven Harnesses" },
      { t: 16.6, label: "Closing frame" },
    ],
  },
];
