# Company Archetype Template Library Design

Date: 2026-06-06

Owner: The Harness Lab

Target executor: VPS Hermes agent via `ssh kali`

## Goal

Create a research-first, reusable company archetype template library for The Harness Lab. The library should help quickly turn an encountered company into a likely harness opportunity, discovery path, demo angle, scope boundary, and delivery plan.

The library must be generalized enough for repeated use, but detailed enough to feel credible when customized for a specific prospect.

## Selected Approach

Use a hybrid archetype library organized by company type, not by named companies and not only by workflow.

The initial archetypes are:

- SaaS
- Agencies
- Ecommerce
- Clinics
- Law firms
- Real estate
- Trades and local services
- Recruiting and staffing
- Education and coaching
- Finance and accounting
- Logistics
- Internal operations teams

This approach matches how prospects describe themselves while still making it easy to map each archetype to repeatable workflows such as intake, support, routing, approvals, reporting, and handoff.

## Research Requirements

Hermes should research each archetype before writing templates. Research should use public sources and focus on durable patterns, not isolated anecdotes.

For each archetype, Hermes should gather:

- Common business model and operating constraints
- Repetitive workflows worth automating
- Common software stack and integration targets
- Typical failure modes, approval needs, and risk boundaries
- Buyer pain language and discovery questions
- Specialized optional features that may be relevant to that archetype

Each archetype should include `research-notes.md` with concise source notes and links. The notes should separate sourced facts from Hermes's synthesis.

## Output Structure

Hermes should create a top-level directory:

```text
company-archetypes/
```

Each archetype should live in a slugged subdirectory:

```text
company-archetypes/saas/
company-archetypes/agencies/
company-archetypes/ecommerce/
...
```

Each archetype directory should contain:

- `profile.md`
- `pain-signals.md`
- `harness-opportunities.md`
- `intake-questions.md`
- `demo-script.md`
- `sow-defaults.md`
- `delivery-runbook-notes.md`
- `outreach-angles.md`
- `research-notes.md`
- `customization-modules.md`

The top-level directory should contain:

- `INDEX.md`
- `CUSTOMIZATION-GUIDE.md`
- `QUALITY-CHECKLIST.md`

## Artifact Requirements

`profile.md` should summarize the archetype, buyer, operating model, likely stakeholders, and where agent harnesses can create leverage.

`pain-signals.md` should list signals that a company has automation pain. Include language that might appear in calls, job posts, support pages, reviews, founder posts, or operational docs.

`harness-opportunities.md` should translate pains into specific harness opportunities. Each opportunity should include the workflow, trigger, tools/integrations, approval gate, output, and expected business value.

`intake-questions.md` should provide practical discovery questions. Questions should surface scope, credentials, current tools, approval needs, risk boundaries, handoff expectations, and acceptance criteria.

`demo-script.md` should give a short demo narrative tailored to the archetype. It should describe what Spencer would show in a call or Loom, including a credible before-and-after workflow.

`sow-defaults.md` should provide default scope language, acceptance criteria, explicit exclusions, client responsibilities, and optional add-ons. It should align with the existing SOW style in `ops/templates/sow-template.md`.

`delivery-runbook-notes.md` should provide operating notes for a delivery runbook. It should align with `ops/templates/delivery-runbook-template.md` and include smoke tests, failure modes, recovery steps, and secret-handling notes.

`outreach-angles.md` should include concise DM/email angles for the archetype. They should be specific to operational pain and avoid overpromising.

`research-notes.md` should cite sources and summarize the durable patterns extracted from them.

`customization-modules.md` should list optional specialized features, such as CRM integration, HIPAA-aware routing, lead scoring, quote generation, ticket triage, calendar routing, review monitoring, approval workflows, or cost controls.

## Data Flow

1. Hermes researches an archetype.
2. Hermes writes `research-notes.md`.
3. Hermes synthesizes the reusable template files from the research.
4. Hermes checks the archetype against `QUALITY-CHECKLIST.md`.
5. Hermes writes or updates `INDEX.md` so a future prospect can be mapped to the closest archetype.
6. Hermes reports completion with file paths, a summary of coverage, and any weak areas needing manual review.

## Quality Bar

The output should be useful in sales and delivery.

Sales-ready means:

- The pain language is concrete.
- The first harness opportunities are easy to explain.
- The demo script can be used in a call without sounding generic.
- Outreach angles sound specific to the company's operations.

Delivery-safe means:

- Approval gates are explicit.
- Risk boundaries are named.
- Secrets remain client-controlled.
- Scope limits are clear.
- Smoke tests and recovery paths are included.
- Regulated or sensitive domains avoid unsupported legal, financial, medical, or compliance promises.

## Error Handling And Constraints

If research is thin for an archetype, Hermes should still create the files but mark weak sections in `research-notes.md` and `QUALITY-CHECKLIST.md`.

If an archetype needs regulated-domain handling, Hermes should make the template conservative. Examples include clinics, law firms, finance, and accounting. Templates may mention human approval, audit trails, redaction, and client-controlled credentials, but must not claim compliance certification.

If two archetypes overlap, Hermes should keep both but use `INDEX.md` to explain the distinction. Example: real estate agency versus general services agency.

Hermes should not include client secrets, production credentials, private keys, or real customer data. All examples must be fictional or generalized.

## Testing And Verification

Hermes should run these checks before reporting completion:

- Confirm every archetype directory exists.
- Confirm every required file exists for every archetype.
- Confirm top-level `INDEX.md`, `CUSTOMIZATION-GUIDE.md`, and `QUALITY-CHECKLIST.md` exist.
- Confirm each `research-notes.md` includes at least a short source list or an explicit note that research was thin.
- Run a text scan for obvious placeholder markers and empty sections.
- Run a secret scan or at least search for obvious credential terms such as `API_KEY=`, `password=`, `token=`, and private key headers.

## Delegation Plan

After this spec is reviewed, create a VPS Hermes task over the tailnet alias:

```bash
ssh kali
```

The task should instruct the VPS Hermes agent to research and create the full `company-archetypes/` library for The Harness Lab. The expected destination should be inside the project workspace used for The Harness Lab operational assets. If the VPS uses `/root/harness-lab`, Hermes should place the library there and report the final path. If it has access to a synced repo, it should use that repo and avoid overwriting unrelated files.

## Acceptance Criteria

The work is acceptable when:

- All 12 archetypes exist.
- Each archetype has the 10 required files.
- The top-level 3 guide/checklist files exist.
- The templates are generalized but directly usable for prospect qualification, outreach, SOW drafting, demo planning, and delivery runbook drafting.
- Research notes cite sources or clearly flag thin research.
- The output includes a completion report with file paths and known gaps.
