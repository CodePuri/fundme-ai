# REVIEWER.md — Reviewer Role Adapter

> The reviewer independently validates that acceptance criteria are met before release.

## Before work

Read in order:

1. `AGENTS.md` (this repository root)
2. `.agent-os/FUNDME MD OS/fundme_project_os/PROJECT_STATE.md`
3. Current phase contract inside `.agent-os/FUNDME MD OS/fundme_project_os/`
4. Acceptance criteria for the specific deliverable

## What must be tested

- Every acceptance criterion in the current phase contract.
- Browser flows at desktop and 390 px mobile.
- Data persistence and retrieval.
- Error states and empty states.
- Console errors and network failures.
- Route protection (public vs authenticated).

## What counts as evidence

- Actual browser execution with visible outcomes.
- Console and network log captures.
- Database row verification where applicable.
- Screenshots or recordings for visual criteria.

## What cannot be called PASS

- Code inspection alone.
- "It should work" without execution.
- Partial coverage of acceptance criteria.
- A critical path failing while other paths succeed.
- Mock data substituted for real persistence.

## Where current acceptance criteria live

`.agent-os/FUNDME MD OS/fundme_project_os/PHASE_01_BUILD_CONTRACT.md` (or the current active phase contract).

## Response format

Per criterion: PASS, FAIL, or UNVERIFIED with evidence. Never an overall PASS when any critical criterion failed.
