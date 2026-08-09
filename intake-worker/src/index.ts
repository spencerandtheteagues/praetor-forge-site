// The Harness Lab — intake bridge, as a Cloudflare Worker.
//
// A port of intake-service/server.mjs, which ran on a Render `starter` instance.
// Behaviour is deliberately identical: same origins, same validation, same
// honeypot, same Telegram message shape. What changed is the runtime, because a
// lead form should not be the reason the company site is billable.
//
// Secrets (set with `wrangler secret put`, never in this file or wrangler.jsonc):
//   TELEGRAM_BOT_TOKEN  — the Hermes bot token used to post the lead
// Vars (wrangler.jsonc):
//   LEAD_CHAT_ID        — target chat id
//   ALLOWED_ORIGIN      — extra CORS origins, comma-separated

interface RateLimiter {
  limit(opts: { key: string }): Promise<{ success: boolean }>;
}

interface Env {
  TELEGRAM_BOT_TOKEN: string;
  LEAD_CHAT_ID: string;
  ALLOWED_ORIGIN?: string;
  // The Node server kept a per-IP Map, which worked because Render ran exactly
  // one always-on instance. Workers run many isolates, so that Map would reset
  // unpredictably and enforce nothing. This is the platform's own limiter.
  INTAKE_LIMIT?: RateLimiter;
}

const DEFAULT_ORIGINS = [
  'https://theharnesslab.com',
  'https://www.theharnesslab.com',
  'https://theharnesslab.dev',
  'https://www.theharnesslab.dev',
];

const MAX_BODY = 64 * 1024; // 64 KB
const TG_LIMIT = 3900; // keep under Telegram's 4096

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

function formatLead(r: Record<string, unknown>): string {
  const L: string[] = [];
  L.push('🔔 NEW HARNESS LAB LEAD');
  L.push(`Type: ${clip(r.requestType, 80) || '—'}`);
  L.push(`Urgency: ${clip(r.urgency, 60) || '—'}   Budget: ${clip(r.budget, 60) || '—'}`);
  L.push('');
  L.push(`Name: ${clip(r.name, 120) || '—'}`);
  L.push(`Email: ${clip(r.email, 160) || '—'}`);
  if (r.company) L.push(`Company: ${clip(r.company, 160)}`);
  if (r.website) L.push(`Site/repo: ${clip(r.website, 200)}`);
  if (r.role) L.push(`Role: ${clip(r.role, 120)}`);
  if (r.callWindow) L.push(`Call window: ${clip(r.callWindow, 160)}`);
  if (Array.isArray(r.problems) && r.problems.length)
    L.push(`Problems: ${clip(r.problems.join(', '), 400)}`);
  if (r.currentStack) L.push(`\nStack: ${clip(r.currentStack, 500)}`);
  if (r.infrastructure) L.push(`Runs on: ${clip(r.infrastructure, 300)}`);
  if (r.approvalPath) L.push(`Approval: ${clip(r.approvalPath, 80)}`);
  if (r.desiredWorkflow) L.push(`\nDesired workflow: ${clip(r.desiredWorkflow, 700)}`);
  if (r.failureDetails) L.push(`\nFailure details: ${clip(r.failureDetails, 700)}`);
  if (r.successCriteria) L.push(`\nSuccess criteria: ${clip(r.successCriteria, 500)}`);
  if (r.accessPlan) L.push(`\nAccess plan: ${clip(r.accessPlan, 400)}`);
  L.push('\n— via theharnesslab.com intake');
  return L.join('\n').slice(0, TG_LIMIT);
}

async function sendTelegram(env: Env, text: string): Promise<void> {
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: env.LEAD_CHAT_ID,
      text,
      disable_web_page_preview: true,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const parsed = (await res.json()) as { ok?: boolean; description?: string };
  if (!parsed.ok) throw new Error(parsed.description || 'telegram error');
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
      if (!env.TELEGRAM_BOT_TOKEN || !env.LEAD_CHAT_ID) {
        console.error('intake misconfigured: missing TELEGRAM_BOT_TOKEN or LEAD_CHAT_ID');
        return json({ ok: false, error: 'server_misconfigured' }, 500, cors);
      }

      try {
        await sendTelegram(env, formatLead(r));
        return json({ ok: true }, 200, cors);
      } catch (e) {
        // The lead is the product here, so a delivery failure is loud on purpose.
        console.error('telegram send failed:', (e as Error).message);
        return json({ ok: false, error: 'delivery_failed' }, 502, cors);
      }
    }

    return json({ ok: false, error: 'not_found' }, 404, cors);
  },
};
