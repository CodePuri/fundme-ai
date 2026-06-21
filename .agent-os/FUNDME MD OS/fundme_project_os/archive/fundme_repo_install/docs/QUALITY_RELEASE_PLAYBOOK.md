# Quality and Release Playbook

> Status: Canonical unless marked otherwise  
> Product: Fundme  
> Last updated: 2026-06-21  
> Production baseline: `main` at `c363eb2`, live at `https://tryfundme.in`  
> Rule: Repository and production behavior override stale documents.


## Core rule

`Build success != browser success != product success.`

A release requires all three.

## Branch and environment policy

- `main` is Production.
- Establish one persistent staging/integration branch and environment in Phase 1.
- Do not create branches or deployments for every micro-fix.
- At most one active implementation branch per bounded phase/domain unless parallel work is explicitly planned.
- Every branch and deployment must be recorded in `PROJECT_STATE.md` or the current phase log.
- Production deploys require an accepted staging candidate.

## Required test layers

### Static

- Typecheck.
- Lint.
- Build.
- Schema/migration validation.
- Secret scan.

### Unit/domain

- Eligibility rules.
- Match scoring.
- Assessment calculations.
- Data transformations.
- Permissions.

### Integration

- API to database.
- Clerk identity mapping.
- Storage upload and parsing.
- AI structured output validation.
- Idempotent writes.

### Browser E2E

- Public discovery.
- Auth.
- Dossier creation.
- Assessment.
- Match.
- Draft.
- Tracker.
- Mobile 390px.
- Console and failed network requests.

### AI evaluation

- Factuality.
- Unsupported claims.
- Schema validity.
- Consistency.
- Explanation faithfulness.
- Cost and latency.

## Evidence standard

A PASS requires one of:

- visible browser state;
- resulting URL;
- network status and response;
- safe database proof;
- test output;
- recorded walkthrough.

Code-line inspection is not browser evidence.

## Agent roles

### Builder

Implements and runs local tests. Cannot independently accept its own release.

### Reviewer

Runs browser/network/data acceptance without modifying code.

### Orchestrator

Resolves product ambiguity, validates scope, and authorizes production according to policy.

## Release sequence

1. Clean branch and known SHA.
2. Build and automated tests.
3. Stable staging deployment.
4. Builder E2E.
5. Independent reviewer E2E with fresh data.
6. Evidence artifacts.
7. Production promotion/merge.
8. Production smoke and critical write.
9. Tag and update `PROJECT_STATE.md`.

## Rollback triggers

- Homepage unavailable.
- Auth loop or public route gated.
- Critical data write fails.
- User data exposure or authorization failure.
- Repeated hydration/runtime crash.
- AI output corrupts or fabricates persisted facts.

After rollback, do not hotfix blindly in Production.

## Test data

- Use clearly labeled QA accounts and records.
- Avoid destructive cleanup without scoped IDs.
- Never use real founder data in public recordings.
- Keep reusable fixtures for regression.

## Documentation gate

No phase is complete until:

- `PROJECT_STATE.md` updated;
- changed APIs/schemas documented;
- decisions recorded;
- known limitations explicit;
- next phase contract prepared.
