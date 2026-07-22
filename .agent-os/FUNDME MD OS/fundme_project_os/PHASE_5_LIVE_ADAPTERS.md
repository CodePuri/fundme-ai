# Active Phase Contract — Phase 5A Identity and Persistence Adapters

Status: Proposed; not approved
Owner: Product + Security + Engineering
Branch: `product/v1-grill`
Worktree: `/Users/totem/Desktop/Projects/Fundme-Product-V1`
Starting SHA: **UNKNOWN — set after Phase 4 and security prerequisites pass**
Preview: Single stable V1 Preview; no Production promotion

## One user outcome

An authenticated founder claims an anonymous assessment session and later retrieves the same privately persisted dossier, assessment, and report state with no silent demo fallback.

## Scope

- Implement the Clerk identity-to-founder mapping and an idempotent anonymous-session claim.
- Implement the accepted founder/startup/session/dossier/assessment/report persistence contract with Supabase repositories and RLS.
- Fail closed when identity or persistence configuration is absent; demo and live modes remain explicit and isolated.
- Add structured, secret-free logging and ownership evidence for this vertical only.
- Exercise changes only in approved non-Production environments.

## Explicit exclusions

- No private artifact storage, background jobs, live AI/provider calls, retrieval/corpus work, share/referral adapters, payment, matching, applications, scraping, browser automation, Production migration/deploy, or destructive data operation.
- No credential rotation/settings change without separate explicit authorization.
- No work before the Step 0 credential disclosure, open redirect, and silent mock-success defects are resolved under a separately approved security contract.
- Later live-adapter verticals require separate bounded contracts; this contract cannot be expanded to absorb them.

## Sources to read

- [PROJECT_STATE.md](./PROJECT_STATE.md)
- [SYSTEM_CONTRACT.md](./SYSTEM_CONTRACT.md)
- [OPERATING_RULES.md](./OPERATING_RULES.md)
- [GAPS_AND_PREREQUISITES.md](./GAPS_AND_PREREQUISITES.md)
- [PRODUCT_GROUND_TRUTH.md](./PRODUCT_GROUND_TRUTH.md)
- [PHASE_2A_DOSSIER_EVIDENCE_CONVERSATION.md](./PHASE_2A_DOSSIER_EVIDENCE_CONVERSATION.md)
- [PHASE_2B_RUBRIC_FINDINGS.md](./PHASE_2B_RUBRIC_FINDINGS.md)

## Existing code to reuse

- Accepted identity, dossier, rubric, and report domain contracts and their demo adapter interfaces.
- Existing Clerk/Supabase code only after security review; mock-success and service-role disclosure paths are rejected, not reused.

## Files/domains allowed to change

- Identity and claim domain: Clerk server integration, claim endpoint, and focused tests.
- Persistence and RLS domain: Supabase repositories, reviewed migrations/policies, and focused tests.
- Contract integration domain: fixtures and integration tests for claim, persistence, ownership, and resume.

## Data contract

- Clerk user owns the founder profile; founders own one or more startups and their sessions, dossiers, assessments, and reports.
- RLS enforces ownership; service role stays server-only; reports are private.
- Anonymous-session claims are single-owner, idempotent, auditable, and reject cross-user takeover.
- Model/provider/rubric/corpus versions and evidence/source references persist with every report.

## Design contract

- Visual authority: `UI_IMPLEMENTATION_CONTRACT.md` and the accepted Grill/share behavior
- External file/frame dependency: None
- Palette: No change
- Mobile: No regression
- Edge states: signed-out claim, expired claim, persistence failure, retry, ownership conflict

## Tests

- unit identity, claim, and repository contract tests
- reviewed local migration dry run and RLS tests with cross-user denial
- integration tests for anonymous claim, idempotent retry, persistence, and authenticated resume
- secret/client-bundle scan
- focused browser E2E on an approved non-Production Preview
- rollback rehearsal for this vertical's schema and adapter boundary

## Evidence

- reviewed migration plan and dry-run output
- RLS matrix and cross-user denial logs
- claim/idempotency and resume proof
- server/client boundary and network proof
- structured logs without secrets
- independent security and browser verdicts

## Exit gate

- One founder claims an anonymous session, persists the accepted dossier/assessment/report state, and resumes it on Preview; ownership, RLS, idempotency, and rollback tests pass; demo cannot mask live failure; Production is unchanged.

## Stop conditions

- Production moved
- secret rotation or platform ownership unverified
- migration/RLS/backup uncertainty
- data loss, cross-user access, or silent fallback
- scope requires storage, jobs, AI, retrieval, share, or referral adapters
- external authorization required
- build or focused checks fail

## Next contract

Phase 5B private artifacts and background jobs contract (create only after Phase 5A acceptance)
