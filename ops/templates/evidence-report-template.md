# Reliability Evidence Report Template

Client: [client]

Package: [Reliability Audit/Foundation Harness/Multi-Agent Harness/Enterprise Fleet]

Date: [date]

Prepared by: The Harness Lab

## Executive Finding

[One paragraph stating the current state, main risk, and recommended next action.]

Verdict:

- [ ] No-build / simplify
- [ ] Client can fix internally
- [ ] Foundation Harness recommended
- [ ] Multi-Agent Harness recommended
- [ ] Enterprise Fleet discovery recommended

## Current State

Workflow:

[workflow summary]

Current stack:

[tools/models/infrastructure]

Known symptoms:

- [symptom]
- [symptom]

## Failure Map

| Failure mode | Severity | Evidence | Recommended action |
|---|---|---|---|
| [failure] | [low/medium/high/critical] | [evidence] | [action] |

## Authority And Approval Review

Agent authority:

[notes]

Approval gates:

[notes]

Risk:

[notes]

## Secret Handling

Checked:

- [ ] No raw secrets in intake
- [ ] No hardcoded keys observed
- [ ] Env template exists or is recommended
- [ ] Logs reviewed for obvious secret exposure
- [ ] Repo ignore rules reviewed

Notes:

[notes]

## Cost And Model Routing

Current routing:

[notes]

Cost risk:

[notes]

Recommended lanes:

| Lane | Purpose | Model/provider | Limit |
|---|---|---|---|
| [lane] | [purpose] | [model] | [limit] |

## Evidence Reviewed

- [ ] Repo/config
- [ ] Redacted logs
- [ ] Existing runbook
- [ ] Existing prompts
- [ ] Screenshots
- [ ] Live walkthrough
- [ ] Test run

## Recommended Scope

Recommended package:

[package]

Why:

[reason]

Included next work:

- [item]
- [item]

Not included:

- [item]
- [item]

## Next Steps

1. [step]
2. [step]
3. [step]

## Client Questions

- [question]
- [question]
