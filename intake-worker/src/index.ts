// The Harness Lab — intake bridge.
//
// The lead form on theharnesslab.com posts here; this emails the lead to
// spencer. It replaced a Render `starter` service that posted into a Telegram
// group — the site and that API shared a service group, so when the paid plan
// lapsed the marketing site went down with it.
//
// Delivery is email rather than Telegram because the Telegram group belonged to
// retired infrastructure: the bot token was still valid but the chat no longer
// accepted messages, which is a silent way to lose a sales lead.
//
// Secrets (set with `wrangler secret put`, never committed):
//   RESEND_API_KEY  — same Resend account the licensing worker uses
// Vars (wrangler.jsonc):
//   LEAD_EMAIL_TO   — where leads land
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
  // The old Node server kept a per-IP Map, which worked only because Render ran
  // exactly one always-on instance. Workers run many isolates, so that Map would
  // reset unpredictably and enforce nothing. This is the platform's own limiter.
  INTAKE_LIMIT?: RateLimiter;
}

const DEFAULT_ORIGINS = [
  'https://theharnesslab.com',
  'https://www.theharnesslab.com',
  'https://theharnesslab.dev',
  'https://www.theharnesslab.dev',
];

const MAX_BODY = 64 * 1024; // 64 KB

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
  };
  // Reflect the caller's origin only when it is on the list, so apex and www of
  // both domains work without a redeploy and nothing else is granted access.
  if (origin && allowedOrigins(env).has(origin)) h['Access-Control-Allow-Origin'] = origin;
  return h;
}

function json(body: unknown, status: number, extra: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra },
  });
}

const clip = (v: unknown, n: number): string => (v == null ? '' : String(v).slice(0, n));

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  );

// Field order is deliberate: who and how to reach them first, because that is
// what gets acted on; the long free-text answers last.
const FIELDS: Array<[key: string, label: string, max: number]> = [
  ['name', 'Name', 120],
  ['email', 'Email', 160],
  ['company', 'Company', 160],
  ['role', 'Role', 120],
  ['website', 'Site / repo', 200],
  ['requestType', 'Request type', 80],
  ['urgency', 'Urgency', 60],
  ['budget', 'Budget', 60],
  ['callWindow', 'Call window', 160],
  ['approvalPath', 'Approval path', 80],
  ['infrastructure', 'Runs on', 300],
  ['currentStack', 'Current stack', 500],
  ['desiredWorkflow', 'Desired workflow', 700],
  ['failureDetails', 'Failure details', 700],
  ['successCriteria', 'Success criteria', 500],
  ['accessPlan', 'Access plan', 400],
];

function buildEmail(r: Record<string, unknown>): { subject: string; text: string; html: string } {
  const name = clip(r.name, 120) || 'Unknown';
  const company = clip(r.company, 160);
  const subject = `New Harness Lab lead — ${name}${company ? ` (${company})` : ''}`;

  const rows: Array<[string, string]> = [];
  for (const [key, label, max] of FIELDS) {
    const v = clip(r[key], max);
    if (v) rows.push([label, v]);
  }
  if (Array.isArray(r.problems) && r.problems.length) {
    rows.push(['Problems', clip(r.problems.join(', '), 400)]);
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

async function sendEmail(env: Env, r: Record<string, unknown>): Promise<void> {
  const { subject, text, html } = buildEmail(r);
  const leadEmail = clip(r.email, 160);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.LEAD_EMAIL_FROM,
      to: [env.LEAD_EMAIL_TO],
      // Replying to the notification replies to the lead, not to the worker.
      reply_to: leadEmail && leadEmail.includes('@') ? leadEmail : undefined,
      subject,
      text,
      html,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    // Surface Resend's own reason; "delivery_failed" with no detail is what made
    // the Telegram version take so long to diagnose.
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
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      if (env.INTAKE_LIMIT) {
        const { success } = await env.INTAKE_LIMIT.limit({ key: ip });
        if (!success) return json({ ok: false, error: 'rate_limited' }, 429, cors);
      }

      const raw = await request.text();
      if (raw.length > MAX_BODY) return json({ ok: false, error: 'too_large' }, 413, cors);

      let r: Record<string, unknown>;
      try {
        r = JSON.parse(raw || '{}');
      } catch {
        return json({ ok: false, error: 'bad_json' }, 400, cors);
      }

      // honeypot: bots fill the hidden field -> accept silently, drop
      if (r.hp) return json({ ok: true }, 200, cors);

      if (!r.name || !r.email || !String(r.email).includes('@')) {
        return json({ ok: false, error: 'missing_fields' }, 400, cors);
      }
      if (!env.RESEND_API_KEY || !env.LEAD_EMAIL_TO || !env.LEAD_EMAIL_FROM) {
        console.error('intake misconfigured: missing RESEND_API_KEY, LEAD_EMAIL_TO or LEAD_EMAIL_FROM');
        return json({ ok: false, error: 'server_misconfigured' }, 500, cors);
      }

      try {
        await sendEmail(env, r);
        return json({ ok: true }, 200, cors);
      } catch (e) {
        // The lead is the product here, so a delivery failure is loud on purpose
        // and the reason is logged rather than swallowed.
        console.error('lead email failed:', (e as Error).message);
        return json({ ok: false, error: 'delivery_failed' }, 502, cors);
      }
    }

    return json({ ok: false, error: 'not_found' }, 404, cors);
  },
};
