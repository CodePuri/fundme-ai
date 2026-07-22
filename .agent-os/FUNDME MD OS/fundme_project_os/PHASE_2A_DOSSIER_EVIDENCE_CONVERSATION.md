# Active Phase Contract — Phase 2A Dossier, Evidence, and Conversation

Status: Proposed; not approved
Owner: Product + Engineering
Branch: `product/v1-grill`
Worktree: `/Users/totem/Desktop/Projects/Fundme-Product-V1`
Starting SHA: **UNKNOWN — set from verified branch HEAD at approval**
Preview: None; developer-only local harness permitted

## One user outcome

A founder can supply minimal startup context, artifact descriptors, and text/voice transcript events, confirm or correct proposed facts, and resume one deterministic dossier session without losing evidence provenance.

## Scope

- Define strongly typed founder/startup dossier, evidence, artifact-state, conversation-event, and session-state contracts.
- Implement deterministic normalization, confirmation/correction, contradiction capture, and next-best-missing-question ranking.
- Provide strong, sparse, contradictory, partial-parser, and interrupted-session fixtures.
- Persist only through an in-memory demo adapter; no silent database writes.

## Explicit exclusions

- No polished UI, live voice/AI, website crawl, PDF parser, database migration, Clerk ownership, retrieval, scoring, report, share, matching, payment, or Production behavior.
- No cherry-pick of unreviewed Codex V1 UI.

## Sources to read

- [PROJECT_STATE.md](./PROJECT_STATE.md)
- [PRODUCT_GROUND_TRUTH.md](./PRODUCT_GROUND_TRUTH.md)
- [supporting/V1_EXPERIENCE_CONTRACT.md](./supporting/V1_EXPERIENCE_CONTRACT.md)
- [SYSTEM_CONTRACT.md](./SYSTEM_CONTRACT.md)
- [OPERATING_RULES.md](./OPERATING_RULES.md)
- [GAPS_AND_PREREQUISITES.md](./GAPS_AND_PREREQUISITES.md)

## Existing code to reuse

- TypeScript/tooling conventions from the repository.
- Codex V1 domain/test ideas may be reviewed as reference, but code is rewritten against this contract.

## Files/domains allowed to change

- `lib/fundme/dossier/**`
- `lib/fundme/conversation/**`
- `tests/fundme/dossier-conversation/**`

## Data contract

- Evidence records require stable ID, source, raw/normalized values, submitted/extracted/inferred state, confidence, confirmation, timestamps, and artifact/session references.
- Inference remains a hypothesis until founder confirmation.
- Voice transcript and typed text enter the same ordered conversation-event stream.
- Ranking output contains question ID, targeted gap/contradiction, materiality reason, and deterministic priority.

## Design contract

- Figma file: Not used
- Frame IDs: Not used
- Palette: Not used
- Mobile: Not used
- Edge states: Represented as typed states and fixtures only

## Tests

- unit tests for normalization, confirmation, correction, contradiction, and ranking
- state-transition tests including retries/interruption
- deterministic fixture snapshots
- security tests rejecting unsafe/unbounded artifact metadata
- regression test proving voice/text share one state

## Evidence

- passing focused test log
- fixture-to-state transition table
- typecheck/lint for allowed domains
- proof that demo mode performs no external write

## Exit gate

- All contracts and fixtures pass; no unsupported fact becomes confirmed evidence; the same input returns the same question ranking.

## Stop conditions

- Production moved
- source-of-truth conflict
- contract requires a fourth code domain
- any external write or live provider is required
- baseline security defect leaks into new code
- build or focused checks fail

## Next contract

PHASE_2B_RUBRIC_FINDINGS.md
