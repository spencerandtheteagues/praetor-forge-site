// Single source of truth for contacts, endpoints and intake options.

// Legal entity, from the Texas Comptroller public record (read 2026-11-18).
// Keep in step with ENTITY in scripts/render-legal.mjs. No street address here.
export const LEGAL_NAME = "The Harness Lab LLC";
export const SOS_FILE_NO = "0806765129";
export const SALES_EMAIL = "sales@theharnesslab.com";
export const SPENCER_EMAIL = "spencer@theharnesslab.com";
export const PHONE_DISPLAY = "607-364-7772";
export const PHONE_HREF = "tel:+16073647772"; // render as a link exactly ONCE (contact section)
export const DEV_URL = "https://theharnesslab.dev/";
export const CALENDAR_URL = "https://cal.com/harnesslab/teardown";
export const CAL_NAMESPACE = "teardown";
export const CAL_LINK = "harnesslab/teardown";
export const INTAKE_URL =
  "https://harness-lab-intake.theharnesslab.workers.dev/api/intake";

// Engagement / request types. The first entry users see in the form defaults
// to "Workflow automation" (verify-redesign.mjs asserts that default).
export const REQUEST_TYPES = [
  "Workflow automation",
  "A website or full-stack app",
  "An AI harness",
  "Reliability & security audit",
  "Free teardown & fit call",
  "Ongoing care",
  "Let’s explore an idea",
];
export const DEFAULT_REQUEST_TYPE = "Workflow automation";

// Crawlable service pages that live in public/ and must stay linked.
export const SERVICE_PAGES = [
  { href: "/ai-workflow-automation/", label: "AI workflow automation" },
  { href: "/custom-software-development/", label: "Custom software development" },
  { href: "/website-design-development/", label: "Business website development" },
  { href: "/internal-tools-development/", label: "Custom internal tools" },
  { href: "/api-integrations/", label: "API integration services" },
  {
    href: "/landman-title-workflow-automation/",
    label: "Landman title workflow automation",
  },
];
