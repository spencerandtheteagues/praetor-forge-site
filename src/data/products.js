// Chapters III, IV & VI — custom harnesses, the products they built, the
// landing-page gallery, and the Studio Cinema cuts.
// Copy rules for theharnesslab.com: no dollar characters in visible copy,
// whole rounded-up months only, and outbound links strictly limited to the
// four live product domains + theharnesslab.dev (verify-redesign.mjs enforces).

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
    ["103", "Commits"],
    ["730 / 730", "Tests green"],
    ["1 Month", "Rapid sprint"],
  ],
  shots: [
    shot(
      "rogue-agents/01-command-center-overview",
      1440,
      900,
      "Multi-agent command center",
      "The cockpit: Claude, Codex, Antigravity and Grok co-leads side by side, a subordinate Ollama Cloud worker bar, and live subscription allowance meters so every lane shows its remaining capacity before work is dispatched.",
      "Rogue Agents multi-agent command center with four co-lead agent cards, an Ollama worker bar, and allowance meters",
    ),
    shot(
      "rogue-agents/02-connections-models-setup",
      1440,
      900,
      "Model routing & worktree isolation",
      "Multi-provider routing setup: each co-lead is bound to its own signed-in subscription and reasoning level, and every execution job gets a separate Git worktree so parallel agents never write over each other.",
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
/* Chapter IV — Evidence: four live products, landing + running workspaces   */
/* ------------------------------------------------------------------------ */
export const PRODUCT_SHOWCASES = [
  {
    id: "title-desk",
    name: "Title-Desk",
    alsoName: "TitleDesk Agent Desktop",
    domain: "title-desk.com",
    href: "https://title-desk.com/",
    status: "Live production",
    placard: "Texas oil & gas title · Web platform + native desktop workstation",
    lede:
      "Online county record examination and a native desktop workstation for landmen: it reads crooked courthouse scans with zero-cost local OCR, rebuilds the chain of title, computes exact mineral fractions, and hands over a four-sheet workbook where every row links back to its recorded instrument.",
    logo: {
      webp: "/products/titledesk-web-seal.webp",
      w640: "/products/titledesk-web-seal-640.webp",
      fallback: "/products/titledesk-web-seal.png",
      width: 1024,
      height: 1024,
    },
    stats: [
      ["312,379", "Ecosystem LOC"],
      ["1,662", "Campaign commits"],
      ["7,070", "Passing tests"],
      ["6 Months", "Title campaign"],
    ],
    breakdown: [
      ["262,305", "Desktop core engine (4 Months core repo)"],
      ["22,638", "Hosted web platform"],
      ["23,148", "Artificial Landman"],
      ["4,288", "TractPilot prototype"],
    ],
    serviceLink: {
      href: "/landman-title-workflow-automation/",
      label: "Landman title workflow automation",
    },
    groups: [
      {
        label: "Title-Desk Web",
        shots: [
          shot("titledesk-hosted/01-landing", ...WIDE, "Survey landing page", "The title-desk.com landing page: a surveyed Texas land layer that introduces the upload-and-examine workflow.", "Title-Desk web landing page with a topographic Texas survey hero"),
          shot("titledesk-hosted/03-workspace-intake-verifier", ...WIDE, "Pre-run intake verifier", "Before any paid run starts, a deterministic scope check reconciles tract acreage, abstracts and attached instruments, and lists exactly what to fix.", "Title-Desk intake workspace with assignment tracts, instruments, and a scope-check guide"),
          shot("titledesk-hosted/04-workspace-live-examination", ...WIDE, "Live dual-examiner run", "Two blind examiners and an independent validator read every instrument while the run clock and current page stay visible.", "Title-Desk live examination screen with a run timer and three-model examiner status"),
          shot("titledesk-hosted/05-workspace-workbook", ...WIDE, "Four-sheet workbook", "The delivered record: verified mineral ownership with exact fractions and net mineral acres, ready for the landman's review.", "Title-Desk verified mineral ownership workbook"),
        ],
      },
      {
        label: "TitleDesk Agent Desktop",
        shots: [
          shot("titledesk/01b-desktop-agent-landing", ...WIDE, "Desktop agent landing", "The TitleDesk Agent desktop edition: local OCR, local projects, and a built-in agent working beside the landman.", "TitleDesk Agent desktop edition landing page"),
          shot("titledesk/04-workspace-runsheet", ...WIDE, "Source-linked runsheet", "Accepted instruments in chronological order; rows that break the chain are flagged and every entry links to its recorded book and page.", "TitleDesk Agent runsheet workspace with chronological instruments"),
          shot("titledesk/05b-workspace-mineral-ownership", ...WIDE, "Exact mineral ownership", "Ownership is computed with exact fractions, never decimals; a tract that does not total exactly one shows the shortfall as a fraction.", "TitleDesk Agent ownership table with exact fractions and net acres per owner"),
          shot("titledesk/06-workspace-heirship-tree", ...WIDE, "Heirship tree", "Family graph, determinations and curative issues for estates that pass interest without a recorded deed.", "TitleDesk Agent heirship family graph workspace"),
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
    placard: "Hosted dual-examiner title engine · Expanding to New Mexico",
    lede:
      "The hosted dual-examiner title platform built on the Title-Desk engine, with its own brass-and-topographic identity. Artificial Landman is also expanding to become New Mexico's dedicated version of Title-Desk.",
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
      ["282 / 282", "Web suite tests"],
      ["1 Month", "Rapid sprint"],
    ],
    breakdown: [
      ["262,305", "Title-Desk engine underneath"],
      ["6 Months", "Inside the title campaign"],
    ],
    groups: [
      {
        label: "Landing & running workspace",
        shots: [
          shot("artificial-landman/01-landing", ...WIDE, "Brass & topographic landing", "The Artificial Landman landing page, built around a brass-and-topography identity of its own.", "Artificial Landman landing page"),
          shot("artificial-landman/03-workspace-intake-verifier", ...WIDE, "Pre-run intake verifier", "The same deterministic scope check: acreage, abstracts and recited source deeds reconciled before a run is allowed to start.", "Artificial Landman intake verifier workspace"),
          shot("artificial-landman/04-workspace-live-examination", ...WIDE, "Live dual-examiner run", "Blind first and second examiners plus a cross-family validator, with the current instrument and page always on screen.", "Artificial Landman live examination screen"),
          shot("artificial-landman/05-workspace-workbook", ...WIDE, "Delivered workbook", "The verified mineral ownership workbook, ready for review and download.", "Artificial Landman verified mineral ownership workbook"),
        ],
      },
    ],
  },
  {
    id: "brandstreams",
    name: "BrandStreams",
    domain: null,
    href: null,
    cutoverNote: "DNS cutover in progress",
    status: "Past flagship",
    placard: "AI social media agency SaaS · Evolved from MyAIMediaMgr",
    lede:
      "Nine architectural generations took MyAIMediaMgr from an early AI social tool to BrandStreams: coordinated multi-slot campaigns, multi-model brainstorming, a content calendar, an approval queue, and default-deny tenant-isolated publishing.",
    logo: {
      webp: "/products/brandstreams-logo.webp",
      w640: "/products/brandstreams-logo-640.webp",
      fallback: "/products/brandstreams-logo.png",
      width: 1254,
      height: 1254,
    },
    stats: [
      ["81,254", "Authored LOC"],
      ["1,364", "Commits"],
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
          shot("brandstreams/11-brandstreams-workspace-ai-brainstorm", ...WIDE, "AI brainstorm studio", "A multi-model brainstorm studio for campaign concepts before anything is drafted.", "BrandStreams multi-model AI brainstorm studio"),
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
      width: 1298,
      height: 1091,
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
          shot("apex-build/08-workspace-builder-command-studio-1440x900", ...WIDE, "Builder command studio", "Describe the app; the command studio turns it into a staged build plan.", "APEX.BUILD builder command studio"),
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
    kind: "Native macOS utility",
    body: "Native macOS disk and build-artifact cleaner, forged through Perihelion Loop with proportional hazard gates before anything is removed.",
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
    kind: "Research studio",
    body: "Source-grounded research studio with live web-page ingestion, so every answer can point back to what it read.",
    src: "/showcase/samara/01-landing.webp",
    thumb: "/showcase/samara/01-landing-640.webp",
    width: 2880,
    height: 1800,
  },
  {
    id: "voxscript",
    name: "VoxScript",
    kind: "Transcription studio",
    body: "Local-first audio transcription and structured document studio — recordings stay on the machine that made them.",
    src: "/showcase/voxscript/01-landing.webp",
    thumb: "/showcase/voxscript/01-landing-640.webp",
    width: 2880,
    height: 1800,
  },
  {
    id: "davis",
    name: "Davis Moore Electric",
    kind: "Licensed electricians · Lubbock, Texas",
    body: "Full-length custom commercial website shipped for licensed electricians in Lubbock, Texas.",
    src: "/davis-site.webp",
    width: 1280,
    height: 3536,
    page: true,
  },
  {
    id: "dooley",
    name: "Dooley A/C & Heating",
    kind: "HVAC contractor · San Angelo, Texas",
    body: "Full-length custom commercial website shipped for an HVAC contractor in San Angelo, Texas.",
    src: "/dooley-site.webp",
    width: 720,
    height: 4373,
    page: true,
  },
  {
    id: "freds",
    name: "Fred’s Radiator & Auto",
    kind: "Automotive shop · Waco, Texas",
    body: "Full-length custom commercial website shipped for an automotive shop in Waco, Texas.",
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
    meta: "16:9 · 3m 44s",
    src: "/video/titledesk-sales-demo-2027.mp4",
    poster: "/video/titledesk-sales-demo-poster.webp",
    width: 1920,
    height: 1080,
    shape: "wide",
    hasAudio: true,
    caption:
      "End-to-end Title-Desk tour: interactive Texas land layers, pre-run scope check, live twelve-instrument examination, emailed deliverable, and pause-verifiable four-sheet workbook. Demonstration with a sample assignment; run time shortened.",
    chapters: [
      { t: 0, label: "Site & Scope Check" },
      { t: 78.3, label: "Live 12-Deed Run" },
      { t: 126.1, label: "Email & Curatives" },
      { t: 165.2, label: "4-Sheet Workbook" },
    ],
  },
  {
    id: "showcase",
    tab: "Studio Showcase",
    meta: "16:9 · 22s",
    src: "/video/harnesslab-showcase-2027.mp4",
    poster: "/video/harnesslab-showcase-poster.webp",
    width: 1920,
    height: 1080,
    shape: "wide",
    hasAudio: true,
    caption:
      "The 2027 studio film: our zero-quit thesis, Title-Desk & Artificial Landman, Mythos OS & Rogue Agents, and BrandStreams & APEX.BUILD.",
    chapters: [
      { t: 0, label: "Zero-Quit Thesis" },
      { t: 6.2, label: "Title-Desk & Artificial Landman" },
      { t: 11.4, label: "Mythos OS & Rogue Agents" },
      { t: 16.6, label: "BrandStreams & APEX.BUILD" },
    ],
  },
  {
    id: "architecture",
    tab: "Verification & Handover",
    meta: "16:9 · 22s",
    src: "/video/verification-handover-2027.mp4",
    poster: "/video/verification-handover-poster.webp",
    width: 1920,
    height: 1080,
    shape: "wide",
    hasAudio: true,
    caption:
      "Primary-source verification gates, 20,911 knowledge-graph nodes, private operator desks, and 100% client-owned handover.",
    chapters: [
      { t: 0, label: "Primary-Source Gates" },
      { t: 6.2, label: "Operator Desks" },
      { t: 11.4, label: "Seven Harnesses" },
      { t: 16.6, label: "Customer-Owned Vault" },
    ],
  },
];
