// The Harness Lab — intake bridge.
// Receives the website intake POST and delivers the lead into the Telegram group
// the team operates from (durable record + instant notification). Zero deps.
//
// Env:
//   PORT                (provided by Render)
//   TELEGRAM_BOT_TOKEN  (required) — Hermes bot token, used to post the lead
//   LEAD_CHAT_ID        (required) — target chat id (e.g. -5036189020)
//   ALLOWED_ORIGIN      (optional) — extra CORS origins, comma-separated; these
//                       are added to the built-in canonical hosts below.
import http from 'node:http';
import https from 'node:https';

const PORT = process.env.PORT || 8080;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const LEAD_CHAT_ID = process.env.LEAD_CHAT_ID || '';
// Browser origins we accept. Union of the canonical hosts (.com is the main site,
// .dev kept for the transition) plus anything in ALLOWED_ORIGIN. We reflect the
// caller's Origin when it is on the list, so apex + www of both domains work
// through the .dev -> .com switch without a redeploy.
const DEFAULT_ORIGINS = [
  'https://theharnesslab.com',
  'https://www.theharnesslab.com',
  'https://theharnesslab.dev',
  'https://www.theharnesslab.dev',
];
const ALLOWED_ORIGINS = new Set(
  [...DEFAULT_ORIGINS, ...(process.env.ALLOWED_ORIGIN || '').split(',')]
    .map((s) => s.trim())
    .filter(Boolean),
);
const LEGACY_HOSTS = new Set(['theharnesslab.dev', 'www.theharnesslab.dev']);
const pickOrigin = (req) => {
  const o = req.headers.origin;
  return o && ALLOWED_ORIGINS.has(o) ? o : '';
};
const MAX_BODY = 64 * 1024; // 64 KB
const TG_LIMIT = 3900; // keep under Telegram's 4096

// --- tiny in-memory rate limit (single always-on instance) ---
const hits = new Map(); // ip -> [timestamps]
function rateLimited(ip) {
  const now = Date.now();
  const windowMs = 60_000;
  const max = 6;
  const arr = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > max;
}

function cors(res) {
  if (res.__allowOrigin) res.setHeader('Access-Control-Allow-Origin', res.__allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
}
function json(res, code, obj) {
  cors(res);
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

function redirectLegacyDomain(req, res) {
  const host = String(req.headers.host || '').split(':')[0].toLowerCase();
  if (!LEGACY_HOSTS.has(host) || (req.method !== 'GET' && req.method !== 'HEAD')) return false;
  const path = String(req.url || '/').startsWith('/') ? req.url : '/';
  res.writeHead(301, { Location: `https://theharnesslab.com${path}` });
  res.end();
  return true;
}

function sendTelegram(text) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      chat_id: LEAD_CHAT_ID,
      text,
      disable_web_page_preview: true,
    });
    const req = https.request(
      {
        hostname: 'api.telegram.org',
        path: `/bot${BOT_TOKEN}/sendMessage`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
        timeout: 10_000,
      },
      (r) => {
        let data = '';
        r.on('data', (c) => (data += c));
        r.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            parsed.ok ? resolve(parsed) : reject(new Error(parsed.description || 'telegram error'));
          } catch (e) {
            reject(e);
          }
        });
      },
    );
    req.on('timeout', () => req.destroy(new Error('telegram timeout')));
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

const clip = (v, n) => (v == null ? '' : String(v).slice(0, n));

function formatLead(r) {
  const L = [];
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
  if (Array.isArray(r.problems) && r.problems.length) L.push(`Problems: ${clip(r.problems.join(', '), 400)}`);
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

const server = http.createServer((req, res) => {
  if (redirectLegacyDomain(req, res)) return;
  res.__allowOrigin = pickOrigin(req);
  if (req.method === 'OPTIONS') {
    cors(res);
    res.writeHead(204);
    return res.end();
  }
  if (req.method === 'GET' && req.url === '/api/health') {
    return json(res, 200, { ok: true, ts: Date.now() });
  }
  if (req.method === 'POST' && req.url === '/api/intake') {
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
    if (rateLimited(ip)) return json(res, 429, { ok: false, error: 'rate_limited' });

    let body = '';
    let aborted = false;
    req.on('data', (c) => {
      body += c;
      if (body.length > MAX_BODY) {
        aborted = true;
        json(res, 413, { ok: false, error: 'too_large' });
        req.destroy();
      }
    });
    req.on('end', async () => {
      if (aborted) return;
      let r;
      try {
        r = JSON.parse(body || '{}');
      } catch {
        return json(res, 400, { ok: false, error: 'bad_json' });
      }
      // honeypot: bots fill hidden field -> accept silently, drop
      if (r.hp) return json(res, 200, { ok: true });
      if (!r.name || !r.email || !String(r.email).includes('@')) {
        return json(res, 400, { ok: false, error: 'missing_fields' });
      }
      if (!BOT_TOKEN || !LEAD_CHAT_ID) {
        console.error('intake misconfigured: missing TELEGRAM_BOT_TOKEN or LEAD_CHAT_ID');
        return json(res, 500, { ok: false, error: 'server_misconfigured' });
      }
      try {
        await sendTelegram(formatLead(r));
        return json(res, 200, { ok: true });
      } catch (e) {
        console.error('telegram send failed:', e.message);
        return json(res, 502, { ok: false, error: 'delivery_failed' });
      }
    });
    return;
  }
  json(res, 404, { ok: false, error: 'not_found' });
});

server.listen(PORT, () => console.log(`harness-lab intake listening on :${PORT}`));
