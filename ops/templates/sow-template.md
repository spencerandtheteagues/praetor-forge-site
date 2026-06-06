# The Harness Lab Statement Of Work Template

Use this for paid audits and builds. Replace bracketed fields before sending.

## Parties

Client: [client/company]

Provider: The Harness Lab

Date: [date]

Primary contact: [name/email]

## Package

Selected package:

- [ ] Reliability Audit - $750 fixed fee
- [ ] Foundation Harness - $3,000-$7,000
- [ ] Multi-Agent Harness - $8,000-$18,000
- [ ] Enterprise Fleet - $20,000-$50,000

Final agreed fee: $[amount]

Payment terms: [deposit/milestone/full upfront]

## Project Goal

[One paragraph describing the business workflow and the reliability outcome.]

## Scope

Included:

- [deliverable 1]
- [deliverable 2]
- [deliverable 3]

Explicit limits:

- Workflow count: [number]
- Agent role count: [number]
- Integration count: [number/list]
- Approval path: [Telegram/Slack/CLI/manual/etc.]
- Deployment target: [client environment]
- Handoff format: [call/recording/docs]

## Acceptance Criteria

The work is accepted when:

- [criterion 1]
- [criterion 2]
- [criterion 3]

Minimum acceptance evidence:

- Smoke test result
- Approval/rejection path proof
- Secret-handling check
- Runbook delivered
- Handoff completed

## Client Responsibilities

Client will:

- Complete intake within [number] business days.
- Provide safe access through [screen share/repo/temp user/redacted logs].
- Keep API keys and credentials in client-controlled infrastructure.
- Review questions within [number] business days.
- Confirm acceptance criteria before build starts.

Do not send raw API keys, passwords, private keys, unredacted `.env` files, or production secrets through email or intake.

## Provider Responsibilities

The Harness Lab will:

- Work within the agreed scope.
- Avoid storing client secrets.
- Document setup and operating steps.
- Provide failure-path notes where relevant.
- Deliver code/config/docs owned by the client after payment terms are satisfied.

## Out Of Scope

Unless added by written change order, the following are excluded:

- Additional workflows
- New integrations
- New approval paths
- 24/7 monitoring
- Compliance certification
- Custom dashboard/UI work
- Production incident response after handoff
- Client data cleanup
- Legal, financial, medical, or regulated decision automation

## Change Orders

Any scope expansion must be agreed in writing before work begins. Change orders must list the change, price, timeline impact, and acceptance condition.

## Timeline

Start condition: [payment/access/intake complete]

Target delivery: [date/range]

Handoff: [date/range]

## Ownership

After final payment, client owns delivered code, configuration, prompts, runbook, and operating documentation specific to the engagement.

The Harness Lab may retain general know-how, reusable patterns, and non-client-specific methods.

## Confidentiality And Access

Both parties will protect confidential technical and business information. The Harness Lab will remove temporary access after handoff unless separate support access is agreed in writing.

## Signoff

Client:

Name:

Signature:

Date:

Provider:

Name:

Signature:

Date:
