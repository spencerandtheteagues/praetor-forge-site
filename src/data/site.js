// Single source of truth for contacts, endpoints and intake options.

// Legal entity, from the Texas Comptroller public record (read 2026-11-18).
// Keep in step with ENTITY in scripts/render-legal.mjs. No street address here.
export const LEGAL_NAME = "The Harness Lab LLC";
export const SOS_FILE_NO = "806765129";
export const SALES_EMAIL = "spencer@theharnesslab.com";
export const SPENCER_EMAIL = "spencer@theharnesslab.com";
export const PHONE_DISPLAY = "607-364-7772";
export const PHONE_HREF = "tel:+16073647772"; // render as a link exactly ONCE (contact section)
export const DEV_URL = "https://theharnesslab.dev/";
export const TITLE_DESK_URL = "https://title-desk.com/";
export const AI_LANDMAN_URL = "https://ailandman.io/";
export const ARTIFICIAL_LANDMAN_URL = "https://artificiallandman.io/";
export const INTAKE_URL =
  "https://harness-lab-intake.theharnesslab.workers.dev/api/intake";
export const VOICE_SESSION_URL =
  "https://harness-lab-intake.theharnesslab.workers.dev/api/voice-session";

// Product questions. The first entry is the form default.
export const REQUEST_TYPES = [
  "Title-Desk",
  "AI Landman",
  "Artificial Landman",
  "A question about the products",
];
export const DEFAULT_REQUEST_TYPE = "Title-Desk";

// Crawlable product pages that live in public/ and must stay linked.
export const SERVICE_PAGES = [
  { href: "/landman-title-workflow-automation/", label: "Landman title software" },
  { href: "/custom-software-development/", label: "Mineral title products" },
  { href: "/internal-tools-development/", label: "Title-Desk desktop and web" },
  { href: "/ai-workflow-automation/", label: "How the products read title" },
  { href: "/api-integrations/", label: "Same software, every customer" },
  { href: "/website-design-development/", label: "Earlier websites" },
];
