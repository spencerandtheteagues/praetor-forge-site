# Intake worker

The lead form on theharnesslab.com posts here; this emails the lead to spencer
via Resend. `intake-service/server.mjs` is the retired Node original, kept for
reference and no longer deployed.

## Why it moved twice

**Off Render**, because the site and the intake API were two services in one
Render group and the API was on the paid `starter` plan. When that lapsed the
whole group was suspended — including the static marketing site, which had no
reason to be billable. Splitting them means the site cannot be taken down by the
API again.

**Off Telegram**, because the destination had quietly died. The bot token was
valid (`getMe` returned `HermesTheMasterPlanBot`) but the group no longer
accepted messages, so every submitted lead returned `delivery_failed`. A lead
form whose delivery target belongs to retired infrastructure is worse than no
form: it looks like it works.

## Configuration

| Setting | Where | Value |
|---|---|---|
| `RESEND_API_KEY` | secret | `wrangler secret put RESEND_API_KEY` |
| `LEAD_EMAIL_TO` | `wrangler.jsonc` | where leads land |
| `LEAD_EMAIL_FROM` | `wrangler.jsonc` | must be on a Resend-verified domain |

`reply_to` is set to the lead's own address, so replying to the notification
replies to the prospect rather than to the worker.

## The domain slot

Resend's free plan verifies **one** domain. `apex-build.dev` held it until
2026-08-09 and was deleted to make room for `theharnesslab.com` — which also
means any other sender still using `apex-build.dev` is now broken and needs
re-pointing.

Only three DNS records are required (DKIM TXT, SPF MX, SPF TXT), all on the
`send` / `resend._domainkey` subdomains. **Do not add the `MX @` record Resend
offers under "Enable Receiving."** It is optional, and on this domain it would
take inbound mail away from Namecheap Private Email — breaking every
@theharnesslab.com mailbox.

## Deploying

```
npm install
npm run deploy
```

## Checking it

```
curl -sS https://harness-lab-intake.theharnesslab.workers.dev/api/health
```

A misconfigured worker answers `500 server_misconfigured` and a failed send
answers `502 delivery_failed` with Resend's own reason in the logs
(`wrangler tail`). Both are deliberately loud: a silently dropped lead is the
failure that costs real money.
