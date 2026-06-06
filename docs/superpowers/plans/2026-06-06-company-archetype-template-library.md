# Company Archetype Template Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dispatch the approved research-first company archetype template library task to the VPS Hermes agent and verify the resulting template pack.

**Architecture:** The local repo stores the approved spec and execution plan. The VPS Hermes gateway performs the research and artifact generation in a persistent `dir:/root/harness-lab` workspace. The local Codex session verifies the remote output independently before reporting status.

**Tech Stack:** Hermes Agent v0.14.0, Hermes Kanban, SSH over Tailscale alias `kali`, Markdown templates, shell verification commands.

---

## File Structure

- Existing spec: `docs/superpowers/specs/2026-06-06-company-archetype-template-library-design.md`
- Create remote task prompt: `/root/harness-lab/company-archetype-template-library-task.md`
- Create remote task id record: `/root/harness-lab/company-archetype-template-library.task-id`
- Create remote output directory: `/root/harness-lab/company-archetypes/`
- Expected remote top-level files:
  - `/root/harness-lab/company-archetypes/INDEX.md`
  - `/root/harness-lab/company-archetypes/CUSTOMIZATION-GUIDE.md`
  - `/root/harness-lab/company-archetypes/QUALITY-CHECKLIST.md`
- Expected remote archetype directories:
  - `/root/harness-lab/company-archetypes/saas/`
  - `/root/harness-lab/company-archetypes/agencies/`
  - `/root/harness-lab/company-archetypes/ecommerce/`
  - `/root/harness-lab/company-archetypes/clinics/`
  - `/root/harness-lab/company-archetypes/law-firms/`
  - `/root/harness-lab/company-archetypes/real-estate/`
  - `/root/harness-lab/company-archetypes/trades-local-services/`
  - `/root/harness-lab/company-archetypes/recruiting-staffing/`
  - `/root/harness-lab/company-archetypes/education-coaching/`
  - `/root/harness-lab/company-archetypes/finance-accounting/`
  - `/root/harness-lab/company-archetypes/logistics/`
  - `/root/harness-lab/company-archetypes/internal-ops-teams/`

Each archetype directory must contain:

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

## Task 1: Prepare Remote Prompt

**Files:**
- Read: `docs/superpowers/specs/2026-06-06-company-archetype-template-library-design.md`
- Create: `/root/harness-lab/company-archetype-template-library-task.md`

- [ ] **Step 1: Verify VPS access**

Run:

```bash
ssh -o BatchMode=yes -o ConnectTimeout=8 kali 'hostname; test -d /root/harness-lab; hermes status | sed -n "1,80p"'
```

Expected: output includes the VPS hostname, confirms `/root/harness-lab` exists by exiting successfully, and shows Hermes gateway status.

- [ ] **Step 2: Write the remote task prompt**

Run from `/home/spencer/praetor-forge-site`:

```bash
ssh kali 'cat > /root/harness-lab/company-archetype-template-library-task.md' <<'REMOTE_PROMPT'
# Task: Build Research-First Company Archetype Template Library

You are building a reusable company archetype template library for The Harness Lab.

Read and follow this approved design:

The goal is to create a research-first, reusable company archetype template library that helps quickly turn an encountered company into a likely harness opportunity, discovery path, demo angle, scope boundary, and delivery plan.

Create the output at:

/root/harness-lab/company-archetypes/

Initial archetypes:

- SaaS -> saas
- Agencies -> agencies
- Ecommerce -> ecommerce
- Clinics -> clinics
- Law firms -> law-firms
- Real estate -> real-estate
- Trades and local services -> trades-local-services
- Recruiting and staffing -> recruiting-staffing
- Education and coaching -> education-coaching
- Finance and accounting -> finance-accounting
- Logistics -> logistics
- Internal operations teams -> internal-ops-teams

For each archetype, research public sources first. Focus on durable patterns, not isolated anecdotes.

For each archetype, gather:

- Common business model and operating constraints
- Repetitive workflows worth automating
- Common software stack and integration targets
- Typical failure modes, approval needs, and risk boundaries
- Buyer pain language and discovery questions
- Specialized optional features that may be relevant to that archetype

Each archetype directory must contain:

- profile.md
- pain-signals.md
- harness-opportunities.md
- intake-questions.md
- demo-script.md
- sow-defaults.md
- delivery-runbook-notes.md
- outreach-angles.md
- research-notes.md
- customization-modules.md

Top-level files required:

- INDEX.md
- CUSTOMIZATION-GUIDE.md
- QUALITY-CHECKLIST.md

Quality requirements:

- Keep templates generalized but high quality and easy to customize for a specific prospect.
- Optimize for The Harness Lab: custom agent harness opportunities, approval gates, reliability, client-owned infrastructure, BYOK, runbooks, smoke tests, and handoff.
- Separate sourced facts from synthesis in research-notes.md.
- Cite sources with links in research-notes.md.
- Use fictional or generalized examples only.
- Do not include real client data, credentials, private keys, or secrets.
- For regulated or sensitive domains such as clinics, law firms, finance, and accounting, use conservative language. Mention human approval, audit trails, redaction, and client-controlled credentials. Do not claim compliance certification.
- Align sow-defaults.md with The Harness Lab SOW style: scope, acceptance criteria, explicit exclusions, client responsibilities, provider responsibilities, ownership, confidentiality, and change boundary.
- Align delivery-runbook-notes.md with The Harness Lab runbook style: operating summary, system map, components, environment, secrets, approval path, cost/model routing, smoke tests, failure modes, recovery, and handoff notes.

Before reporting completion, run these verification checks:

1. Confirm all 12 archetype directories exist.
2. Confirm all 10 required files exist in every archetype directory.
3. Confirm INDEX.md, CUSTOMIZATION-GUIDE.md, and QUALITY-CHECKLIST.md exist.
4. Confirm each research-notes.md includes a source list or explicitly marks research as thin.
5. Search the output for placeholder markers and empty sections.
6. Search the output for obvious credential patterns and private key headers.

Write a completion report to:

/root/harness-lab/company-archetypes/COMPLETION-REPORT.md

The completion report must include:

- Final output path
- Archetypes completed
- Verification commands run
- Any weak research areas
- Any files that need manual review
REMOTE_PROMPT
```

Expected: command exits with status 0.

- [ ] **Step 3: Verify the prompt was written**

Run:

```bash
ssh kali 'test -s /root/harness-lab/company-archetype-template-library-task.md && sed -n "1,40p" /root/harness-lab/company-archetype-template-library-task.md'
```

Expected: output begins with `# Task: Build Research-First Company Archetype Template Library`.

## Task 2: Dispatch VPS Hermes Kanban Task

**Files:**
- Read: `/root/harness-lab/company-archetype-template-library-task.md`
- Create via Hermes Kanban: one remote task assigned to the default worker profile

- [ ] **Step 1: Create the Kanban task**

Run:

```bash
ssh kali 'set -euo pipefail
TASK_JSON=$(hermes kanban create "Build company archetype template library" --body "$(cat /root/harness-lab/company-archetype-template-library-task.md)" --assignee default --workspace dir:/root/harness-lab --priority 100 --max-runtime 4h --idempotency-key company-archetype-template-library-2026-06-06 --json)
printf "%s\n" "$TASK_JSON"
TASK_JSON="$TASK_JSON" python3 - <<'"'"'PY'"'"' > /root/harness-lab/company-archetype-template-library.task-id
import json
import os

data = json.loads(os.environ["TASK_JSON"])

def find_id(value):
    if isinstance(value, dict):
        for key in ("id", "task_id"):
            found = value.get(key)
            if isinstance(found, str) and found:
                return found
        for found in value.values():
            result = find_id(found)
            if result:
                return result
    if isinstance(value, list):
        for found in value:
            result = find_id(found)
            if result:
                return result
    return ""

task_id = find_id(data)
if not task_id:
    raise SystemExit("Could not find task id in Hermes JSON output")
print(task_id)
PY'
```

Expected: JSON output contains a task id and `/root/harness-lab/company-archetype-template-library.task-id` contains that id.

- [ ] **Step 2: Record the task id**

Run:

```bash
ssh kali 'cat /root/harness-lab/company-archetype-template-library.task-id; hermes kanban list | sed -n "1,80p"'
```

Expected: output includes `Build company archetype template library`.

- [ ] **Step 3: Send the task to Telegram**

Run:

```bash
ssh kali 'TASK_ID=$(cat /root/harness-lab/company-archetype-template-library.task-id); hermes send --to telegram "Hermes VPS task created: Build company archetype template library
Task: ${TASK_ID}
Workspace: /root/harness-lab
Output target: /root/harness-lab/company-archetypes
Status: queued for Hermes Kanban dispatch"'
```

Expected: Hermes reports successful Telegram delivery.

- [ ] **Step 4: Trigger a dispatcher pass**

Run:

```bash
ssh kali 'hermes kanban dispatch'
```

Expected: command exits with status 0 and may print worker dispatch information.

## Task 3: Monitor Remote Execution

**Files:**
- Read via Hermes Kanban: task status, worker logs, output directory

- [ ] **Step 1: Poll task list**

Run:

```bash
ssh kali 'hermes kanban list | sed -n "1,120p"'
```

Expected: task status is one of `running`, `done`, `blocked`, or queued for execution.

- [ ] **Step 2: Inspect task logs if running or blocked**

Run:

```bash
ssh kali 'TASK_ID=$(cat /root/harness-lab/company-archetype-template-library.task-id); hermes kanban log "$TASK_ID" | tail -120'
```

Expected: log explains current work, completion, or blocker.

- [ ] **Step 3: Continue polling until terminal state**

Run:

```bash
ssh kali 'hermes kanban list | sed -n "1,120p"'
```

Expected: task eventually reaches `done` or `blocked`. If blocked, inspect the task with:

```bash
ssh kali 'TASK_ID=$(cat /root/harness-lab/company-archetype-template-library.task-id); hermes kanban show "$TASK_ID"'
```

Then report the blocker.

## Task 4: Verify Remote Output Independently

**Files:**
- Read: `/root/harness-lab/company-archetypes/`

- [ ] **Step 1: Count archetype directories**

Run:

```bash
ssh kali 'find /root/harness-lab/company-archetypes -mindepth 1 -maxdepth 1 -type d | wc -l'
```

Expected: `12`.

- [ ] **Step 2: Check required files**

Run:

```bash
ssh kali 'python3 - <<'"'"'PY'"'"'
from pathlib import Path

base = Path("/root/harness-lab/company-archetypes")
archetypes = [
    "saas",
    "agencies",
    "ecommerce",
    "clinics",
    "law-firms",
    "real-estate",
    "trades-local-services",
    "recruiting-staffing",
    "education-coaching",
    "finance-accounting",
    "logistics",
    "internal-ops-teams",
]
required = [
    "profile.md",
    "pain-signals.md",
    "harness-opportunities.md",
    "intake-questions.md",
    "demo-script.md",
    "sow-defaults.md",
    "delivery-runbook-notes.md",
    "outreach-angles.md",
    "research-notes.md",
    "customization-modules.md",
]
top = ["INDEX.md", "CUSTOMIZATION-GUIDE.md", "QUALITY-CHECKLIST.md", "COMPLETION-REPORT.md"]
missing = []
for name in top:
    if not (base / name).is_file():
        missing.append(str(base / name))
for archetype in archetypes:
    for name in required:
        path = base / archetype / name
        if not path.is_file() or path.stat().st_size == 0:
            missing.append(str(path))
if missing:
    print("MISSING_OR_EMPTY")
    print("\n".join(missing))
    raise SystemExit(1)
print("all-required-files-present")
PY'
```

Expected: `all-required-files-present`.

- [ ] **Step 3: Scan for placeholder markers**

Run:

```bash
ssh kali 'if grep -RInE "T[B]D|TO[D]O|P[L]ACEHOLDER|\\[insert|\\[client|\\[date|lorem ipsum" /root/harness-lab/company-archetypes; then exit 1; else echo "no-placeholder-markers"; fi'
```

Expected: `no-placeholder-markers`.

- [ ] **Step 4: Scan for obvious secrets**

Run:

```bash
ssh kali 'if grep -RInE "API_KEY=|password=|token=|BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY" /root/harness-lab/company-archetypes; then exit 1; else echo "no-obvious-secrets"; fi'
```

Expected: `no-obvious-secrets`.

- [ ] **Step 5: Inspect completion report**

Run:

```bash
ssh kali 'sed -n "1,220p" /root/harness-lab/company-archetypes/COMPLETION-REPORT.md'
```

Expected: report includes final output path, completed archetypes, verification commands, weak research areas, and manual-review notes.

## Task 5: Bring Back Local Copy

**Files:**
- Create locally: `/home/spencer/Desktop/Harness Lab/company-archetypes/`
- Optional local repo copy after review: `/home/spencer/praetor-forge-site/ops/company-archetypes/`

- [ ] **Step 1: Copy remote output to Desktop folder**

Run:

```bash
rsync -av --delete kali:/root/harness-lab/company-archetypes/ "/home/spencer/Desktop/Harness Lab/company-archetypes/"
```

Expected: rsync reports copied markdown files and exits with status 0.

- [ ] **Step 2: Verify Desktop copy**

Run:

```bash
find "/home/spencer/Desktop/Harness Lab/company-archetypes" -type f -name "*.md" | wc -l
```

Expected: at least `124` markdown files: 12 archetypes times 10 files, plus 4 top-level files.

- [ ] **Step 3: Report result**

Report the remote path, local Desktop path, Hermes task id, verification results, and any gaps from `COMPLETION-REPORT.md`.
