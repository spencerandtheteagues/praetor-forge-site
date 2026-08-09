# Intake worker

The lead form on theharnesslab.com posts here; this posts it into the team's
Telegram group. A port of `intake-service/server.mjs`, which is kept for
reference and is no longer deployed.

## Why it moved

The site and the intake API were two services in one Render group, and the
intake service was on the paid `starter` plan. When that lapsed the whole group
was suspended — including the static marketing site, which had no reason to be
billable at all. Splitting them means the site cannot be taken down by the API
again.

Behaviour is deliberately identical to the Node version: the same allowed
origins, the same validation, the same honeypot, the same Telegram message
format. Two things necessarily changed:

- **Rate limiting.** The Node server kept a per-IP `Map`, which enforced
  something real only because Render ran exactly one always-on instance. Workers
  run many isolates, so that Map would reset unpredictably. It now uses the
  platform rate limiter — same budget, 6 requests per 60s per IP.
- **The legacy `theharnesslab.dev` -> `.com` redirect** is gone. It belonged to
  a host serving the site, and this worker never serves HTML. `.dev` origins are
  still accepted for CORS.

## Deploying

```
npm install
npm run deploy
```

## The one secret

`LEAD_CHAT_ID` is in `wrangler.jsonc` because a chat id is useless on its own.
The bot token is not, and is never committed:

```
npx wrangler secret put TELEGRAM_BOT_TOKEN
```

Until it is set, `/api/intake` returns `500 server_misconfigured` rather than
accepting a lead it cannot deliver. Check it end to end with:

```
curl -sS https://harness-lab-intake.theharnesslab.workers.dev/api/health
```
