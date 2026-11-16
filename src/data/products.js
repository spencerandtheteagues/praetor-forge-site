// Chapter III · The Forge: every product, platform and shipped site.
// Owner: cinema/forge lane. Logos are transparent artwork; `visualScale`
// optically normalizes their height (wide wordmarks read smaller than round
// badges at the same box, so they get more room).
//
// logo.webp     full-size webp (srcset top width)
// logo.w640     optional 640w derivative
// logo.fallback png/svg for browsers without webp
// action        { type: "link", href, external } or
//               { type: "prefill", requestType, product }

export const FORGE_ROWS = [
  {
    id: "flagship",
    letter: "A",
    title: "Flagship title systems",
    kicker: "Oil & gas · in production",
    items: [
      {
        id: "title-desk",
        status: "Live production",
        domain: "title-desk.com",
        name: "Title-Desk",
        placard: "Web platform",
        copy: "The title platform for oil and gas teams: county records, chains of title and ownership workbooks in one source-linked workspace.",
        logo: {
          webp: "/products/titledesk-web-logo.webp",
          w640: "/products/titledesk-web-logo-640.webp",
          fallback: "/products/titledesk-web-logo.png",
          width: 911,
          height: 894,
        },
        visualScale: 1.12,
        action: { type: "link", href: "https://title-desk.com/", external: true, label: "Live site" },
      },
      {
        id: "titledesk",
        status: "Desktop macOS",
        domain: "desktop.title-desk.com",
        name: "TitleDesk Agent",
        placard: "Desktop app",
        copy: "Landman title research, runsheets and offline OCR on the desktop. Courthouse scans are read locally, with no per-page AI cost, and every runsheet line links back to its source instrument.",
        logo: {
          webp: "/products/titledesk-desktop-logo.webp",
          w640: "/products/titledesk-desktop-logo-640.webp",
          fallback: "/products/titledesk-desktop-logo.png",
          width: 1261,
          height: 772,
        },
        visualScale: 1.1,
        action: {
          type: "link",
          href: "https://desktop.title-desk.com/",
          external: true,
          label: "Live site",
        },
        preview: {
          src: "/projects/titledesk-runsheet.webp",
          width: 1440,
          height: 900,
          alt: "TitleDesk Agent runsheet workspace with source-linked records",
          caption: "TitleDesk Agent: the runsheet workspace, each entry linked to its source instrument.",
          label: "Open the runsheet preview",
        },
        serviceLink: {
          href: "/landman-title-workflow-automation/",
          label: "Landman title workflow automation",
        },
      },
      {
        id: "artificial-landman",
        status: "Live production",
        domain: "artificiallandman.io",
        name: "Artificial Landman",
        placard: "Web platform",
        copy: "Autonomous courthouse chain-of-title and net-mineral-acre reconciliation, run by two independent examiners. Courthouse index and image fees pass straight through at five cents an image.",
        logo: {
          // The -640 derivative is the same 592×629 artwork, just lighter.
          webp: "/products/artificial-landman-logo-640.webp",
          fallback: "/products/artificial-landman-logo.png",
          width: 592,
          height: 629,
        },
        visualScale: 1.04,
        action: {
          type: "link",
          href: "https://artificiallandman.io/",
          external: true,
          label: "Live site",
        },
      },
    ],
  },
  {
    id: "foundry",
    letter: "B",
    title: "Operating systems & foundry",
    kicker: "What we run on, and what we build for others",
    items: [
      {
        id: "engineering-studio-card",
        status: "Engineering studio",
        domain: "theharnesslab.dev",
        name: "The Harness Lab · Engineering Studio",
        placard: "theharnesslab.dev",
        copy: "The engineering side of the studio: build notes, harness patterns and the verification methods behind every delivery.",
        logo: {
          webp: "/brand/harness-lab-black-marble.webp",
          w640: "/brand/harness-lab-black-marble-512.webp",
          w640Width: 512,
          fallback: "/brand/harness-lab-black-marble.png",
          width: 1024,
          height: 1024,
        },
        visualScale: 0.98,
        action: {
          type: "link",
          href: "https://theharnesslab.dev/",
          external: true,
          label: "Live site",
        },
      },
      {
        id: "mythos-os",
        status: "Internal OS",
        domain: "17 production surfaces",
        name: "Mythos OS",
        placard: "Studio cockpit",
        copy: "Our own multi-agent operating system: 17 production surfaces for orchestration, work ledgers, memory and human-gated execution.",
        logo: {
          webp: "/products/mythos-os-emblem.webp",
          w640: "/products/mythos-os-emblem-640.webp",
          fallback: "/products/mythos-os-emblem.png",
          width: 954,
          height: 954,
        },
        visualScale: 0.98,
        action: { type: "link", href: "#our-os", label: "Explore the cockpit", arrow: "↓" },
      },
      {
        id: "rogue-agents",
        status: "Agent harness",
        domain: "Multi-worktree swarm",
        name: "Rogue Agents",
        placard: "Private command build",
        copy: "A private multi-agent command harness: specialist agents, shared memory and an operator who approves every consequential move.",
        logo: {
          webp: "/products/rogue-agents-wordmark.webp",
          w640: "/products/rogue-agents-wordmark-640.webp",
          fallback: "/products/rogue-agents-wordmark.png",
          width: 1400,
          height: 608,
        },
        visualScale: 1.08,
        action: {
          type: "prefill",
          requestType: "An AI harness",
          product: "Rogue Agents",
          label: "Scope something similar",
        },
      },
      {
        id: "wealth-powers",
        status: "Private client build",
        domain: "10 investor surfaces",
        name: "Wealth & Powers OS",
        placard: "Client build",
        copy: "An investor command center for a private client: portfolios, dual-audited research and model routing, with approval at every decision point.",
        plaque: {
          webp: "/case-studies/jayson/screen-4-480.webp",
          webpFull: "/case-studies/jayson/screen-4.webp",
          fallback: "/case-studies/jayson/screen-4.jpg",
          width: 480,
          height: 261,
          alt: "Wealth & Powers OS command center screen",
        },
        visualScale: 1.04,
        action: { type: "link", href: "#case-study", label: "Explore the client build", arrow: "↓" },
      },
    ],
  },
  {
    id: "ventures",
    letter: "C",
    title: "Venture platforms & shipped sites",
    kicker: "Platforms in development and websites in the wild",
    items: [
      {
        id: "brandstreams",
        status: "Venture platform",
        domain: "Multi-tenant AI engine",
        name: "BrandStreams",
        placard: "Campaign platform",
        copy: "An AI campaign and social workflow platform for planning campaigns, creating content and managing social publishing.",
        logo: {
          webp: "/products/brandstreams-logo.webp",
          w640: "/products/brandstreams-logo-640.webp",
          fallback: "/products/brandstreams-logo.png",
          width: 1254,
          height: 1254,
        },
        visualScale: 1.02,
        action: {
          type: "prefill",
          requestType: "A website or full-stack app",
          product: "BrandStreams",
          label: "Ask about BrandStreams",
        },
      },
      {
        id: "apex-build",
        status: "In development",
        domain: "github.com/spencerandtheteagues",
        name: "APEX.BUILD",
        placard: "AI development platform",
        copy: "A cloud development environment exploring coordinated AI agents, code generation and model routing.",
        logo: {
          webp: "/products/apex-build-logo.webp",
          w640: "/products/apex-build-logo-640.webp",
          fallback: "/products/apex-build-logo.png",
          width: 1298,
          height: 1091,
        },
        visualScale: 1.04,
        action: {
          type: "link",
          href: "https://github.com/spencerandtheteagues/apex-build-platform",
          external: true,
          label: "Source on GitHub",
        },
      },
      {
        id: "happy-homes",
        status: "Venture platform",
        domain: "Property operations suite",
        name: "Happy Homes",
        placard: "Property operations",
        copy: "Property and resident operations: maintenance requests, scheduling and resident communication in one place.",
        logo: {
          svg: "/products/happy-homes-logo.svg",
          medallionWrap: true,
          width: 64,
          height: 64,
        },
        visualScale: 0.94,
        action: {
          type: "prefill",
          requestType: "A website or full-stack app",
          product: "Happy Homes",
          label: "Ask about Happy Homes",
        },
      },
    ],
  },
];

// Shipped business websites (Row C, second band). Full-page captures.
export const SHIPPED_SITES = [
  {
    id: "davis",
    name: "Davis Moore Electric",
    place: "Lubbock, Texas",
    trade: "Licensed electricians",
    src: "/davis-site.webp",
    width: 1280,
    height: 3536,
  },
  {
    id: "dooley",
    name: "Dooley A/C & Heating",
    place: "San Angelo, Texas",
    trade: "Air conditioning & heating",
    src: "/dooley-site.webp",
    width: 720,
    height: 4373,
  },
  {
    id: "freds",
    name: "Fred’s Radiator & Auto",
    place: "Waco, Texas",
    trade: "Auto repair",
    src: "/freds-site.webp",
    width: 1280,
    height: 3693,
  },
];

// Chapter II cuts. Chapter seek points sit cleanly after each 0.8s crossfade
// completes so clicking any chapter button lands with zero ghost-frame bleed.
export const CINEMA_CUTS = [
  {
    id: "showcase",
    tab: "Studio Showcase",
    meta: "16:9 · 27s",
    src: "/video/harnesslab-widescreen-2027.mp4",
    poster: "/video/harnesslab-widescreen-poster.webp",
    width: 1920,
    height: 1080,
    shape: "wide",
    hasAudio: true,
    caption: "The 2027 studio film, with its music bed: thesis, title systems, the TitleDesk seal, Mythos OS and our client builds.",
    chapters: [
      { t: 0, label: "Thesis" },
      { t: 6.2, label: "Title-Desk & Artificial Landman" },
      { t: 11.4, label: "Orbital Seal" },
      { t: 17.1, label: "Mythos OS & Rogue Agents" },
      { t: 22.3, label: "Client & Venture Builds" },
    ],
  },
  {
    id: "architecture",
    tab: "Sovereign Architecture",
    meta: "16:9 · 22s",
    src: "/video/sovereign-systems-2027.mp4",
    poster: "/video/sovereign-systems-poster.webp",
    width: 1920,
    height: 1080,
    shape: "wide",
    hasAudio: true,
    caption: "Verification gates, the 17-surface Mythos OS cockpit, bespoke domain runs, and sovereign repository handover.",
    chapters: [
      { t: 0, label: "Verification Gates" },
      { t: 6.2, label: "Mythos OS Cockpit" },
      { t: 11.4, label: "Domain Workflows" },
      { t: 16.6, label: "Sovereign Vault" },
    ],
  },
  {
    id: "spin",
    tab: "TitleDesk Spin",
    meta: "Loop",
    src: "/video/titledesk-spin.mp4",
    poster: null,
    width: 1280,
    height: 720,
    shape: "compact",
    hasAudio: false,
    caption: "The Title-Desk seal, turning. A 7.5-second loop shown at its native size.",
    chapters: [],
  },
  // The archival vertical reel (/video/harnesslab-reel-vertical.mp4, 1080×1920,
  // 56s, AAC) is intentionally NOT listed: its frames burn in the retired price
  // ladder ("$750 fixed fee" … "$20,000–$50,000"), "8 of 10 spots remaining" and
  // "30% OFF | NEXT 8", which contradict the live no-prices/no-scarcity policy.
  // Pending Spencer's call (re-cut vs approve). To restore it, add back:
  // { id: "archival", tab: "Archival Vertical Reel", meta: "9:16 · 56s",
  //   src: "/video/harnesslab-reel-vertical.mp4",
  //   poster: "/video/harnesslab-reel-endcard-poster.webp", width: 1080,
  //   height: 1920, shape: "tall", hasAudio: true, archival: true,
  //   caption: "Archival studio promo reel.", chapters: [] }
];
