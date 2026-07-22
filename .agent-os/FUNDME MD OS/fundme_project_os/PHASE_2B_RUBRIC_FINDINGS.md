# Active Phase Contract — Phase 2B Rubric and Findings

Status: Proposed; not approved
Owner: Product + Rubric reviewer + Engineering
Branch: `product/v1-grill`
Worktree: `/Users/totem/Desktop/Projects/Fundme-Product-V1`
Starting SHA: **UNKNOWN — set from verified branch HEAD at approval**
Preview: None; developer-only calibration output

## One user outcome

A confirmed evidence dossier produces the same transparent funding-readiness score, confidence, dimension scores, and evidence-linked findings every time for one rubric version.

## Scope

- Define rubric version, eleven dimensions, weights, scoring bands, evidence coverage, confidence, and missing-evidence behavior.
- Produce strengths, red flags, contradictions, unsupported claims, missing evidence, and prioritized recommendations with evidence IDs.
- Add human-readable explanations and strong/weak/contradictory/insufficient-evidence calibration fixtures.
- Generate a compact calibration report for reviewer sign-off.

## Explicit exclusions

- No UI, retrieval/RAG, model-generated scoring, live AI, database, Clerk, report rendering, public claims, payment, matching, or Production deployment.
- Score is never a funding probability.

## Sources to read

- [PRODUCT_GROUND_TRUTH.md](./PRODUCT_GROUND_TRUTH.md)
- [SYSTEM_CONTRACT.md](./SYSTEM_CONTRACT.md)
- [BENCHMARK_AND_PROVENANCE_POLICY.md](./BENCHMARK_AND_PROVENANCE_POLICY.md)
- [OPERATING_RULES.md](./OPERATING_RULES.md)
- [PHASE_2A_DOSSIER_EVIDENCE_CONVERSATION.md](./PHASE_2A_DOSSIER_EVIDENCE_CONVERSATION.md)

## Existing code to reuse

- Accepted Phase 2A dossier/evidence contracts.
- No randomized assessment code from `origin/main`.

## Files/domains allowed to change

- `lib/fundme/assessment/**`
- `tests/fundme/assessment/**`
- `tests/fixtures/fundme-assessment/**`

## Data contract

- Assessment includes ID, rubric version, input evidence IDs, coverage, confidence, dimension results, total score, findings, and partial/complete state.
- Every finding includes type, severity, dimension, explanation, evidence references, action, and confidence.
- Missing evidence lowers coverage/confidence and never becomes an invented negative fact.

## Design contract

- Figma file: Not used
- Frame IDs: Not used
- Palette: Not used
- Mobile: Not used
- Edge states: Partial/insufficient/contradictory outcomes covered as fixtures

## Tests

- exact deterministic scoring for fixed fixtures
- weight/band boundary tests
- missing and contradictory evidence tests
- property checks for score bounds and evidence references
- regression test proving repeated runs are identical

## Evidence

- focused test logs
- rubric version/weight table
- fixture expectation table
- calibration report with reviewer verdict

## Exit gate

- Rubric owner approves definitions and fixtures; all findings reference valid evidence or explicit missing-evidence states; deterministic tests pass.

## Stop conditions

- Production moved
- rubric owner/weights unavailable
- unsupported causal or funding-probability claim
- hidden model judgment affects score
- source permission uncertainty
- build or focused checks fail

## Next contract

PHASE_2C_RETRIEVAL_REPORT.md
