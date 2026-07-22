# Active Phase Contract — Phase 2C Retrieval and Report Contract

Status: Proposed; not approved
Owner: Product + Engineering
Branch: `product/v1-grill`
Worktree: `/Users/totem/Desktop/Projects/Fundme-Product-V1`
Starting SHA: **UNKNOWN — set from verified branch HEAD at approval**
Preview: None; developer-only JSON evidence

## One user outcome

An accepted assessment retrieves permitted, traceable guidance and returns a structured partial-or-complete report JSON in which every external recommendation cites a verified source record.

## Scope

- Create a curated source registry with required provenance, permission, verification, category, stage, geography, and guidance metadata.
- Implement deterministic lexical/tag retrieval with stable ordering and explicit no-result behavior.
- Define report JSON, partial-result semantics, source references, provider/version metadata, and top-action ordering.
- Add fixtures proving relevant, irrelevant, stale, restricted, and missing-source behavior.

## Explicit exclusions

- No embeddings/pgvector, broad crawl, restricted scraping, live model prose, UI, PDF export, sharing, database, payment, matching, or Production change.
- No “winning,” “guaranteed,” or outcome claim without verified provenance.

## Sources to read

- [PRODUCT_GROUND_TRUTH.md](./PRODUCT_GROUND_TRUTH.md)
- [SYSTEM_CONTRACT.md](./SYSTEM_CONTRACT.md)
- [BENCHMARK_AND_PROVENANCE_POLICY.md](./BENCHMARK_AND_PROVENANCE_POLICY.md)
- [OPERATING_RULES.md](./OPERATING_RULES.md)
- [PHASE_2B_RUBRIC_FINDINGS.md](./PHASE_2B_RUBRIC_FINDINGS.md)
- [GAPS_AND_PREREQUISITES.md](./GAPS_AND_PREREQUISITES.md)

## Existing code to reuse

- Accepted Phase 2A evidence IDs and Phase 2B assessment/findings contracts.
- No prior unverified corpus or generated report prose.

## Files/domains allowed to change

- `lib/fundme/retrieval/**`
- `lib/fundme/report/**`
- `tests/fundme/retrieval-report/**`

## Data contract

- Corpus records contain stable ID, title, publisher, source, permission/license, outcome verification, tags, guidance, and verification date.
- Report contains assessment/rubric versions, evidence coverage/confidence, findings, actions, retrieved source IDs, generator metadata, timestamp, and partial/complete state.
- Retrieval is deterministic for a fixed registry/query/version.

## Design contract

- Figma file: Not used
- Frame IDs: Not used
- Palette: Not used
- Mobile: Not used
- Edge states: Structured partial/no-source/error JSON only

## Tests

- relevance and stable-order tests
- permission/staleness exclusion tests
- report schema validation
- dangling evidence/source reference tests
- partial-result and no-result regression tests

## Evidence

- source registry sample with provenance
- focused test logs
- deterministic retrieval snapshots
- report JSON fixtures and schema-validation output

## Exit gate

- Every included source passes provenance policy, report fixtures validate, references resolve, and partial behavior is useful without fabricated guidance.

## Stop conditions

- Production moved
- source rights or outcome verification uncertain
- report requires unsupported prose/fact
- retrieval becomes non-deterministic
- fourth code domain required
- build or focused checks fail

## Next contract

PHASE_3_GRILL_EXPERIENCE.md
