# Handoff Checklist

Client: [client]

Package: [package]

Handoff date: [date]

## Before Handoff

- [ ] Scope and acceptance criteria confirmed
- [ ] Final repo/package is clean
- [ ] No secrets committed
- [ ] `.env` or secrets template is redacted
- [ ] Setup/run commands tested
- [ ] Restart/recovery command tested
- [ ] Approval path tested
- [ ] Rejection path tested
- [ ] Cost-limit behavior tested or documented
- [ ] Failure-path notes written
- [ ] Runbook completed
- [ ] Evidence report completed

## Handoff Session

Show the client:

- [ ] Repo/package structure
- [ ] How to start the harness
- [ ] How to stop/restart it
- [ ] Where logs live
- [ ] Where secrets live
- [ ] How approval/rejection works
- [ ] How to run smoke tests
- [ ] What is out of scope after acceptance

## Access Cleanup

- [ ] Remove temporary provider SSH access
- [ ] Remove provider repo access if no support agreement exists
- [ ] Confirm client owns repo/package
- [ ] Confirm client owns secrets and API keys
- [ ] Confirm no production credentials remain in provider notes

## Acceptance

Client accepts when:

- [ ] Required acceptance criteria are met
- [ ] Handoff materials are delivered
- [ ] Client can operate the harness using the runbook
- [ ] Open issues are documented as either accepted limitations or change-order items

Client signoff:

Name:

Date:

Notes:
