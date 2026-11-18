// The Harness Lab — intake bridge.
//
// The lead form on theharnesslab.com posts here; this emails the lead to
// sales@theharnesslab.com via Resend.
//
// Secrets (set with `wrangler secret put`, never committed):
//   RESEND_API_KEY  — Resend API key
// Vars (wrangler.jsonc):
//   LEAD_EMAIL_TO   — verified studio mailbox where leads land
//   LEAD_EMAIL_FROM — must be on a domain verified in Resend
//   ALLOWED_ORIGIN  — extra CORS origins, comma-separated

interface RateLimiter {
  limit(opts: { key: string }): Promise<{ success: boolean }>;
}

interface Env {
  RESEND_API_KEY: string;
  LEAD_EMAIL_TO: string;
  LEAD_EMAIL_FROM: string;
  ALLOWED_ORIGIN?: string;
  INTAKE_LIMIT?: RateLimiter;
}

const DEFAULT_ORIGINS = [
  'https://theharnesslab.com',
  'https://www.theharnesslab.com',
  'https://theharnesslab.dev',
  'https://www.theharnesslab.dev',
];

const MAX_BODY = 64 * 1024; // 64 KB byte cap
const MAX_PROBLEMS = 20;
const EMAIL_RE = /^[^\s@<>,;:"'\\()[\]]+@[^\s@<>,;:"'\\()[\]]+\.[A-Za-z]{2,63}$/;

// Server-side mirror of src/lib/secretGuard.js so direct POSTs or overridden
// warnings never deliver raw credentials into an email inbox.
const SECRET_PATTERNS: Array<{ label: string; re: RegExp }> = [
  {
    label: 'private key',
    re: /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----[\s\S]*?(?:-----END [A-Z0-9 ]*PRIVATE KEY-----|$)/g,
  },
  { label: 'Stripe key', re: /\b[sr]k_(?:live|test)_[A-Za-z0-9]{8,}/g },
  { label: 'GitHub token', re: /\bgithub_pat_[A-Za-z0-9_]{20,}/g },
  { label: 'GitHub token', re: /\bgh[pousr]_[A-Za-z0-9]{20,}/g },
  { label: 'AWS access key', re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g },
  { label: 'Google API key', re: /\bAIza[0-9A-Za-z_-]{30,}/g },
  { label: 'Slack token', re: /\bxox[baprs]-[A-Za-z0-9-]{10,}/g },
  {
    label: 'signed token (JWT)',
    re: /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g,
  },
  { label: 'API key', re: /\bsk-[A-Za-z0-9_-]{16,}/g },
];

function redactSecrets(input: string): string {
  let out = input;
  for (const { label, re } of SECRET_PATTERNS) {
    re.lastIndex = 0;
    out = out.replace(re, `[REDACTED ${label}]`);
  }
  return out;
}

function allowedOrigins(env: Env): Set<string> {
  return new Set(
    [...DEFAULT_ORIGINS, ...(env.ALLOWED_ORIGIN || '').split(',')]
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const h: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
    'X-Content-Type-Options': 'nosniff',
  };
  if (origin && allowedOrigins(env).has(origin)) h['Access-Control-Allow-Origin'] = origin;
  return h;
}

function json(body: unknown, status: number, extra: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra },
  });
}

const clipLine = (v: unknown, n: number): string =>
  v == null
    ? ''
    : redactSecrets(String(v))
        .replace(/[\r\n\t\x00-\x1f\x7f]+/g, ' ')
        .trim()
        .slice(0, n);

const clipBlock = (v: unknown, n: number): string =>
  v == null
    ? ''
    : redactSecrets(String(v))
        .replace(/\r\n?/g, '\n')
        .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '')
        .trim()
        .slice(0, n);

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  );

const FIELDS: Array<[key: string, label: string, max: number, multiline?: boolean]> = [
  ['name', 'Name', 120],
  ['email', 'Email', 160],
  ['company', 'Company', 160],
  ['role', 'Role', 120],
  ['website', 'Site / repo', 200],
  ['requestType', 'Request type', 80],
  ['urgency', 'Urgency', 60],
  ['callWindow', 'Call window', 160],
  ['approvalPath', 'Approval path', 80],
  ['infrastructure', 'Runs on', 300, true],
  ['currentStack', 'Current stack', 500, true],
  ['desiredWorkflow', 'Desired workflow', 700, true],
  ['failureDetails', 'Failure details', 700, true],
  ['successCriteria', 'Success criteria', 500, true],
  ['accessPlan', 'Access plan', 400, true],
];

async function readBoundedUtf8(request: Request, maxBytes: number): Promise<{ ok: true; text: string } | { ok: false }> {
  const declared = Number(request.headers.get('Content-Length') || '0');
  if (Number.isFinite(declared) && declared > maxBytes) return { ok: false };
  if (!request.body) return { ok: true, text: '' };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        total += value.byteLength;
        if (total > maxBytes) {
          await reader.cancel().catch(() => {});
          return { ok: false };
        }
        chunks.push(value);
      }
    }
  } finally {
    reader.releaseLock();
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.byteLength;
  }
  return { ok: true, text: new TextDecoder().decode(merged) };
}

function buildEmail(r: Record<string, unknown>): { subject: string; text: string; html: string } {
  const name = clipLine(r.name, 120) || 'Unknown';
  const company = clipLine(r.company, 160);
  const subject = `New Harness Lab lead — ${name}${company ? ` (${company})` : ''}`;

  const rows: Array<[string, string]> = [];
  for (const [key, label, max, multiline] of FIELDS) {
    const v = multiline ? clipBlock(r[key], max) : clipLine(r[key], max);
    if (v) rows.push([label, v]);
  }
  if (Array.isArray(r.problems) && r.problems.length) {
    const cleanProblems = r.problems
      .slice(0, MAX_PROBLEMS)
      .map((item) => clipLine(item, 80))
      .filter(Boolean);
    if (cleanProblems.length) {
      rows.push(['Problems', cleanProblems.join(', ').slice(0, 400)]);
    }
  }

  const text =
    rows.map(([l, v]) => `${l}: ${v}`).join('\n') + '\n\n— via the theharnesslab.com intake form\n';

  const html =
    `<h2 style="margin:0 0 16px;font:600 18px system-ui,sans-serif">${escapeHtml(subject)}</h2>` +
    '<table cellpadding="6" cellspacing="0" style="border-collapse:collapse;font:14px system-ui,sans-serif">' +
    rows
      .map(
        ([l, v]) =>
          `<tr><td style="vertical-align:top;color:#666;white-space:nowrap">${escapeHtml(l)}</td>` +
          `<td style="vertical-align:top;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
      )
      .join('') +
    '</table>' +
    '<p style="color:#888;font:12px system-ui,sans-serif">via the theharnesslab.com intake form</p>';

  return { subject, text, html };
}

async function sendEmail(env: Env, r: Record<string, unknown>, leadEmail: string): Promise<void> {
  const { subject, text, html } = buildEmail(r);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.LEAD_EMAIL_FROM,
      to: [env.LEAD_EMAIL_TO],
      reply_to: leadEmail,
      subject,
      text,
      html,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`resend ${res.status}: ${detail.slice(0, 300)}`);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = corsHeaders(request, env);
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    if (request.method === 'GET' && url.pathname === '/api/health') {
      return json({ ok: true, ts: Date.now() }, 200, cors);
    }

    if (request.method === 'POST' && url.pathname === '/api/intake') {
      const origin = request.headers.get('Origin') || '';
      if (!origin || !allowedOrigins(env).has(origin)) {
        return json({ ok: false, error: 'forbidden_origin' }, 403, cors);
      }

      const contentType = (request.headers.get('Content-Type') || '').toLowerCase();
      if (!contentType.startsWith('application/json')) {
        return json({ ok: false, error: 'unsupported_media_type' }, 415, cors);
      }

      const bodyRes = await readBoundedUtf8(request, MAX_BODY);
      if (!bodyRes.ok) return json({ ok: false, error: 'too_large' }, 413, cors);

      let r: Record<string, unknown>;
      try {
        const parsed = JSON.parse(bodyRes.text || '{}');
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          return json({ ok: false, error: 'bad_json' }, 400, cors);
        }
        r = parsed as Record<string, unknown>;
      } catch {
        return json({ ok: false, error: 'bad_json' }, 400, cors);
      }

      // Check honeypot before consuming per-IP rate-limit quota or Resend calls.
      if (r.hp) return json({ ok: true }, 200, cors);

      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      if (env.INTAKE_LIMIT) {
        const { success } = await env.INTAKE_LIMIT.limit({ key: ip });
        if (!success) return json({ ok: false, error: 'rate_limited' }, 429, cors);
      }

      const cleanName = clipLine(r.name, 120);
      const cleanEmail = clipLine(r.email, 160);
      const cleanWorkflow = clipBlock(r.desiredWorkflow, 700);
      if (!cleanName || !cleanEmail || !cleanWorkflow) {
        return json({ ok: false, error: 'missing_fields' }, 400, cors);
      }
      if (!EMAIL_RE.test(cleanEmail)) {
        return json({ ok: false, error: 'invalid_email' }, 400, cors);
      }

      if (!env.RESEND_API_KEY || !env.LEAD_EMAIL_TO || !env.LEAD_EMAIL_FROM) {
        console.error('intake misconfigured: missing RESEND_API_KEY, LEAD_EMAIL_TO or LEAD_EMAIL_FROM');
        return json({ ok: false, error: 'server_misconfigured' }, 500, cors);
      }

      try {
        await sendEmail(env, r, cleanEmail);
        return json({ ok: true }, 200, cors);
      } catch (e) {
        console.error('lead email failed:', (e as Error).message);
        return json({ ok: false, error: 'delivery_failed' }, 502, cors);
      }
    }

    return json({ ok: false, error: 'not_found' }, 404, cors);
  },
};
