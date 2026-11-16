// Client-side Secret Guard. Spots likely credentials before an enquiry leaves
// the browser, redacts them in every preview, and lets the form refuse to send
// until the user removes them or confirms they are not secrets.
// Pure functions only: safe to import during SSR.

// Order matters for redaction: the multi-line private-key block goes first so
// its body is replaced whole, and the more specific prefixes precede `sk-`.
export const SECRET_PATTERNS = [
  {
    id: "private-key",
    label: "private key",
    re: /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----[\s\S]*?(?:-----END [A-Z0-9 ]*PRIVATE KEY-----|$)/g,
  },
  { id: "stripe", label: "Stripe key", re: /\b[sr]k_(?:live|test)_[A-Za-z0-9]{8,}/g },
  { id: "github-pat", label: "GitHub token", re: /\bgithub_pat_[A-Za-z0-9_]{20,}/g },
  { id: "github", label: "GitHub token", re: /\bgh[pousr]_[A-Za-z0-9]{20,}/g },
  { id: "aws", label: "AWS access key", re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g },
  { id: "google", label: "Google API key", re: /\bAIza[0-9A-Za-z_-]{30,}/g },
  { id: "slack", label: "Slack token", re: /\bxox[baprs]-[A-Za-z0-9-]{10,}/g },
  {
    id: "jwt",
    label: "signed token (JWT)",
    re: /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g,
  },
  { id: "api-key", label: "API key", re: /\bsk-[A-Za-z0-9_-]{16,}/g },
];

// Free-text request fields worth scanning (selects, chips and the honeypot
// cannot carry a pasted credential).
export const SCANNED_FIELDS = [
  "name",
  "email",
  "company",
  "role",
  "website",
  "desiredWorkflow",
  "infrastructure",
  "currentStack",
  "failureDetails",
  "successCriteria",
  "accessPlan",
  "callWindow",
];

/** Every likely credential in `text`, as [{ id, label, match }]. */
export function findSecrets(text) {
  if (!text) return [];
  const hits = [];
  let rest = String(text);
  for (const { id, label, re } of SECRET_PATTERNS) {
    re.lastIndex = 0;
    rest = rest.replace(re, (match) => {
      hits.push({ id, label, match });
      return " ";
    });
  }
  return hits;
}

/** Replace every likely credential with a visible marker. */
export function redactSecrets(text) {
  if (!text) return text;
  let out = String(text);
  for (const { label, re } of SECRET_PATTERNS) {
    re.lastIndex = 0;
    out = out.replace(re, `[REDACTED ${label}]`);
  }
  return out;
}

/**
 * Scan a whole intake request.
 * Returns { hits: [{ field, labels: [..] }], signature } where `signature`
 * changes whenever the set of detected values changes (so a "not a secret"
 * confirmation never carries over to a newly pasted value). The signature is
 * held in memory only and never rendered or sent.
 */
export function scanRequest(request) {
  const hits = [];
  const parts = [];
  for (const field of SCANNED_FIELDS) {
    const found = findSecrets(request?.[field]);
    if (!found.length) continue;
    hits.push({ field, labels: [...new Set(found.map((f) => f.label))] });
    parts.push(`${field}:${found.map((f) => f.match).join("|")}`);
  }
  return { hits, signature: parts.join(";") };
}
