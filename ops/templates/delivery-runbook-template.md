# Harness Delivery Runbook Template

Client: [client]

Package: [package]

Workflow: [workflow]

Owner/operator: [person/team]

## Operating Summary

This harness controls:

[plain-language workflow description]

It is allowed to:

- [allowed action]
- [allowed action]

It is not allowed to:

- [forbidden action]
- [forbidden action]

## System Map

```text
[trigger] -> [agent/step] -> [approval gate] -> [output] -> [recovery path]
```

## Components

| Component | Purpose | Owner |
|---|---|---|
| [component] | [purpose] | [client/provider] |

## Environment

Deployment target: [local/VPS/cloud/Render/etc.]

Repo/package: [URL or path]

Runtime command:

```bash
[command]
```

Health check command:

```bash
[command]
```

Restart command:

```bash
[command]
```

## Secrets

Secrets live in:

[client-controlled location]

Never commit:

- `.env`
- API keys
- private keys
- tokens
- production credentials

## Approval Path

Approval system: [Telegram/Slack/CLI/manual]

Approval is required for:

- [action]
- [action]

Rejection behavior:

[what happens when human rejects]

## Cost And Model Routing

| Lane | Model/provider | Used for | Limit |
|---|---|---|---|
| [lane] | [model] | [task] | [limit] |

Cost-control behavior:

[pause/alert/fallback behavior]

## Smoke Tests

Run before handoff and after major changes.

- [ ] Happy-path test
- [ ] Approval test
- [ ] Rejection test
- [ ] Cost-limit test
- [ ] Restart test
- [ ] Secret/log redaction check

## Failure Modes

| Failure | Signal | Response |
|---|---|---|
| Agent loop/stall | [signal] | [response] |
| Tool failure | [signal] | [response] |
| Model outage | [signal] | [response] |
| Cost limit hit | [signal] | [response] |

## Recovery

If the harness stops responding:

1. [step]
2. [step]
3. [step]

If secrets are exposed:

1. Stop the affected process.
2. Rotate the exposed credential.
3. Remove leaked material from logs/repo where possible.
4. Record the incident.

## Handoff Notes

Delivered files:

- [file]
- [file]

Client can operate independently when:

- [ ] Client can start/restart the harness.
- [ ] Client can read logs.
- [ ] Client knows where secrets live.
- [ ] Client understands approval/rejection behavior.
- [ ] Client has smoke-test commands.

## Change Boundary

The following are not covered after handoff unless separately quoted:

- New workflows
- New integrations
- New approval paths
- Model/provider migrations
- Ongoing incident response
