# The Harness Lab Scope And Package Rules

Use this file to keep sales, intake, delivery, and change orders aligned. Public prices stay at the early-customer ladder until there are enough paid customers or case studies to justify raising them.

## Positioning

The Harness Lab sells customer-owned reliability harnesses for AI agent workflows.

A harness is the operating layer around an agent: routing, approvals, evals, alerts, smoke tests, cost limits, recovery, and handoff documentation.

The offer is not generic AI automation, not a chatbot build, and not a hosted agent SaaS. The customer owns the code, repo, runbook, and operating model. Customer secrets stay in the customer's environment.

## Public Package Ladder

| Package | Public price | Scope boundary |
|---|---:|---|
| Reliability Audit | $750 fixed fee | Diagnostic only. No implementation unless explicitly quoted. |
| Foundation Harness | $3,000-$7,000 | One workflow, one repo, one approval path, one handoff package. |
| Multi-Agent Harness | $8,000-$18,000 | 2-10 agents, routing, model lanes, handoffs, gates, cost limits, health checks. |
| Enterprise Fleet | $20,000-$50,000 | Larger scoped build with multiple repos, tenants, clients, or security boundaries. |

Do not publish the higher research-backed pricing yet. Keep it as a future pricing option after early customer proof.

## Universal Included Deliverables

- Written scope and acceptance criteria
- Customer-owned repo or package
- Setup notes or setup script
- Environment template without secrets
- Approval path definition
- Failure-path notes
- Smoke test checklist
- Runbook
- Handoff call or recording notes

## Universal Exclusions

These require a separate quote or written change order:

- Additional workflows
- Additional approval paths
- Extra integrations not listed in the scope
- Production incident support after handoff
- New model/provider migration after acceptance
- Ongoing monitoring by The Harness Lab
- Compliance certification
- Security audit beyond secret-handling and operational risk review
- Legal, financial, medical, or regulated decision automation
- Client-side data cleanup
- Large custom UI/dashboard work

## Reliability Audit Scope

Goal: identify what is broken, risky, expensive, or underspecified, then recommend the fastest repair path.

Included:

- Intake review
- Workflow/failure-mode interview or async review
- Repo/config/log review when access is provided safely
- Agent role and authority review
- Secret-handling and API-key exposure review
- Cost and model routing risk review
- Failure map
- Prioritized fix list
- 30-minute handoff call

Not included:

- Patching production code
- Building new agents
- Taking ownership of live operations
- Debugging unrelated infrastructure
- Handling secrets directly

Acceptance:

- Client receives a written report with clear next actions.
- Report identifies whether the next step is no-build, fix, Foundation Harness, Multi-Agent Harness, or Enterprise Fleet.

## Foundation Harness Scope

Goal: deliver one controlled agent workflow that the customer can operate.

Included:

- One workflow
- One repo/package
- One approval path
- One environment template
- One runbook
- Smoke tests
- Failure-path walkthrough
- Handoff call or recording notes

Scope caps:

- Up to 3 agent roles unless otherwise quoted
- Up to 3 core integrations unless otherwise quoted
- One deployment target
- One operator/team path
- One round of acceptance fixes

## Multi-Agent Harness Scope

Goal: make a more complex agent system controllable, inspectable, and recoverable.

Included:

- 2-10 agents
- Routing and handoff rules
- Model lanes and cost limits
- Human approval gates
- Failure and retry behavior
- Smoke tests
- Health checks
- Recovery documentation
- Handoff package

Scope caps:

- One primary business workflow or tightly related workflow family
- Up to 10 agent roles
- Up to 6 core integrations unless otherwise quoted
- One primary deployment environment
- No guaranteed 24/7 production support unless separately quoted

## Enterprise Fleet Scope

Goal: support larger operations with multiple clients, repos, tenants, or security boundaries.

Enterprise work must be scoped after an audit or paid discovery. Do not treat the public range as a fixed maximum when the project includes compliance, tenant isolation, large data flows, custom dashboards, or multiple deployment environments.

Minimum required scoping:

- Tenant/client boundaries
- Repository boundaries
- Secret boundaries
- Approval authority
- Incident ownership
- Monitoring responsibility
- Support expectations
- Acceptance criteria

## Change Order Rules

A change order is required when the client asks for work outside the accepted scope.

Change orders must state:

- Requested change
- Why it is outside original scope
- Price
- Timeline impact
- Acceptance condition

Never add a new workflow, integration, or approval path informally. Write the change order first.

## Sales Guardrails

Use these guardrails before taking money:

- Confirm the client is technical enough to evaluate the handoff.
- Confirm who owns the infrastructure and API keys.
- Confirm no secrets will be pasted into intake.
- Confirm the acceptance criteria before build starts.
- Confirm whether this is audit-only, repair, or build.
- Confirm whether the client expects ongoing operation after handoff.

If the customer expects The Harness Lab to run their agents forever, this is not a fit without a separate operations agreement.
