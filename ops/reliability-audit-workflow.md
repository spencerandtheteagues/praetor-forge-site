# Reliability Audit Workflow

The Reliability Audit is the default first paid engagement when the failure mode is unclear. It should produce a decision-grade report, not a vague consultation summary.

## Outcome

The client receives:

- Failure map
- Risk/cost review
- Secret-handling notes
- Prioritized fix list
- Recommended package or no-build recommendation
- 30-minute handoff call

## Timeline

Target: 3-5 business days after intake and safe access are complete.

## Inputs

Required:

- Target workflow description
- Current stack/tools
- Known failure symptoms
- Success criteria
- Access plan
- Deployment/infrastructure notes

Optional:

- Redacted logs
- Repo access
- Screenshots
- Existing prompts/configs
- Runbook or setup notes
- Cost/billing screenshots with sensitive data removed

Never request raw API keys, passwords, private keys, unredacted `.env` files, or production secrets in first contact.

## Audit Steps

### 1. Intake Triage

Classify the request:

- Existing workflow repair
- New Foundation Harness
- Multi-agent system rescue
- Enterprise/fleet scope
- Not a fit

Record:

- Client goal
- Current workflow
- Failure mode
- Business risk
- Technical risk
- Deadline
- Constraints

### 2. Workflow Map

Write the workflow as a simple path:

```text
trigger -> input -> agent/action -> approval -> output -> handoff/recovery
```

Identify:

- Who starts it
- What data enters
- What tools it can touch
- What it is allowed to change
- Where humans approve/reject
- Where output lands
- How failure is noticed

### 3. Authority And Secrets Review

Check:

- Agent authority boundaries
- Tool permissions
- API-key exposure
- Secret storage
- Environment templates
- Logs that may leak data
- Approval gates before expensive or destructive actions

### 4. Reliability Review

Check:

- Agent loops or stalls
- Empty response handling
- Retry behavior
- Timeout behavior
- Queue/task state
- Cost limits
- Model routing
- Fallback behavior
- Observability/logging
- Restart/recovery path

### 5. Evidence Review

Check whether the system has evidence, not just a demo:

- Smoke tests
- Eval examples
- Failure-path test
- Approval/rejection test
- Cost-limit test
- Restart test
- Handoff commands
- Incident notes

### 6. Recommendation

Choose one:

- No-build: client should simplify or use an off-the-shelf tool.
- Audit-only fix list: client can repair internally.
- Foundation Harness: one scoped workflow is enough.
- Multi-Agent Harness: routing/handoffs across agents are central.
- Enterprise Fleet: tenant/client boundaries or governance are material.

## Audit Report Format

Use `ops/templates/evidence-report-template.md`.

Required sections:

- Executive finding
- Current state
- Failure map
- Severity table
- Security/secret notes
- Cost and model-routing notes
- Recommended scope
- Not included
- Next steps

## Handoff Call Agenda

1. Confirm goal and current failure mode.
2. Walk through the top 3 risks.
3. Explain what should be fixed first.
4. Recommend package or no-build path.
5. Confirm scope boundaries for any next engagement.

## Completion Criteria

Audit is complete when:

- Report is delivered.
- Client has a prioritized fix path.
- Next package recommendation is clear.
- Any implementation request is converted into a separate scope.
