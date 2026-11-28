// Brief builder: turns the shared intake request into the plain-text Work
// Order shown in the preview, copied to the clipboard, and used as the email
// fallback, plus the exact JSON payload the intake Worker receives.
// Pure functions, except copyText(), which only touches the browser when called.
import { FIELD_LIMITS, EMPTY_REQUEST } from "./intake.js";
import { redactSecrets } from "./secretGuard.js";
import { SALES_EMAIL } from "../data/site.js";

// Human labels, shared by the form, the preview and the Secret Guard warning.
export const FIELD_LABELS = {
  name: "Name",
  email: "Email",
  company: "Organization",
  role: "Role",
  website: "Website / repo",
  requestType: "Product",
  urgency: "Urgency",
  approvalPath: "Copy",
  callWindow: "Reply window",
  desiredWorkflow: "Question",
  infrastructure: "Runs on",
  currentStack: "Current stack",
  failureDetails: "What breaks",
  successCriteria: "Success looks like",
  accessPlan: "Access plan",
};

const HEADER_FIELDS = ["company", "role", "website", "urgency", "approvalPath", "callWindow"];
const BODY_FIELDS = [
  "infrastructure",
  "currentStack",
  "failureDetails",
  "successCriteria",
  "accessPlan",
];

const clean = (value, max) =>
  String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .slice(0, max);

/**
 * The payload POSTed to the Worker: only known keys, trimmed and clipped to
 * the Worker's own limits. There is deliberately no `budget` key.
 */
export function buildPayload(request) {
  const payload = {};
  for (const key of Object.keys(EMPTY_REQUEST)) {
    if (key === "problems") {
      payload.problems = Array.isArray(request.problems)
        ? request.problems.map((p) => clean(p, 80)).filter(Boolean)
        : [];
    } else if (key === "hp") {
      payload.hp = String(request.hp ?? "");
    } else {
      payload[key] = clean(request[key], FIELD_LIMITS[key] ?? 200);
    }
  }
  return payload;
}

/**
 * Plain-text Work Order.
 *   redact: replace likely credentials with markers (default true)
 *   blank:  placeholder for empty required fields (preview uses "—")
 */
export function buildBrief(request, { redact = true, blank = "—" } = {}) {
  const r = buildPayload(request);
  const v = (key) => {
    const value = r[key];
    return redact ? redactSecrets(value) : value;
  };
  const lines = ["THE HARNESS LAB · PRODUCT QUESTION", ""];
  lines.push(`Request:  ${v("requestType") || blank}`);
  lines.push(`From:     ${v("name") || blank}`);
  lines.push(`Reply to: ${v("email") || blank}`);
  for (const key of HEADER_FIELDS) {
    if (r[key]) lines.push(`${`${FIELD_LABELS[key]}:`.padEnd(9)} ${v(key)}`);
  }
  lines.push("", "THE IDEA", v("desiredWorkflow") || blank);
  if (r.problems.length) {
    lines.push(
      "",
      "SYMPTOMS FLAGGED",
      ...r.problems.map((p) => `· ${redact ? redactSecrets(p) : p}`),
    );
  }
  for (const key of BODY_FIELDS) {
    if (r[key]) lines.push("", FIELD_LABELS[key].toUpperCase(), v(key));
  }
  return lines.join("\n");
}

/**
 * mailto: fallback for when delivery fails. If the encoded brief would make
 * the URL too long for mail clients (~1,800 chars), the body becomes a short
 * note and `overflow` is true; the caller copies `text` to the clipboard.
 */
export function buildMailto(request, { redact = true, max = 1800 } = {}) {
  const r = buildPayload(request);
  const safe = (value) => (redact ? redactSecrets(value) : value);
  const name = safe(r.name);
  const email = safe(r.email);
  const company = safe(r.company);
  const requestType = safe(r.requestType);
  const subject = `Product question: ${requestType}${company ? ` (${company})` : ""}`;
  const text = buildBrief(request, { redact, blank: "" });
  let body = encodeURIComponent(text);
  let overflow = false;
  if (body.length > max) {
    overflow = true;
    body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Email: ${email}`,
        ...(company ? [`Organization: ${company}`] : []),
        `Request: ${requestType}`,
        "",
        "My full brief was copied to my clipboard. Pasting it below:",
        "",
        "",
      ].join("\n"),
    );
  }
  return {
    href: `mailto:${SALES_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`,
    overflow,
    text,
  };
}

/** Copy text with the async Clipboard API. Resolves false if unavailable. */
export async function copyText(text) {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission denied or insecure context: caller falls back to selection.
  }
  return false;
}
