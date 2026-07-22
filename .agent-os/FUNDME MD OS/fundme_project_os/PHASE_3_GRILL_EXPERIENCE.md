# Active Phase Contract — Phase 3 Grill Experience

Status: Proposed; not approved
Owner: Product + Design + Engineering
Branch: `product/v1-grill`
Worktree: `/Users/totem/Desktop/Projects/Fundme-Product-V1`
Starting SHA: **UNKNOWN — set after Phases 1A and 2A–2C acceptance**
Preview: One stable Preview may be created after local acceptance

## One user outcome

A founder completes minimal intake, one voice/text mentor conversation, evidence confirmation, deterministic assessment, and a useful responsive report using the approved design.

## Scope

- Implement only approved Entry, intake, artifact, mentor, confirmation, next-question, processing, report, and recoverable-error states.
- Bind UI to accepted Phase 2 contracts and deterministic demo adapters.
- Preserve modality state when switching between voice and text.
- Deliver complete desktop, 390px mobile, keyboard, and reduced-motion flows.

## Explicit exclusions

- No dashboard, matching, application drafting, referral, payment, live Clerk/Supabase/storage/AI adapters, public share, or Production deployment.
- No design invention or cherry-pick of Codex V1 UI.

## Sources to read

- [PROJECT_STATE.md](./PROJECT_STATE.md)
- [PRODUCT_GROUND_TRUTH.md](./PRODUCT_GROUND_TRUTH.md)
- [DESIGN_SOURCE_OF_TRUTH.md](./DESIGN_SOURCE_OF_TRUTH.md)
- [supporting/V1_EXPERIENCE_CONTRACT.md](./supporting/V1_EXPERIENCE_CONTRACT.md)
- [SYSTEM_CONTRACT.md](./SYSTEM_CONTRACT.md)
- [PHASE_2C_RETRIEVAL_REPORT.md](./PHASE_2C_RETRIEVAL_REPORT.md)

## Existing code to reuse

- Accepted Phase 2 contracts/adapters.
- Existing shared controls only when they match approved Figma and accessibility requirements.

## Files/domains allowed to change

- `app/grill/**`
- `components/grill/**`
- `tests/e2e/grill/**`

## Data contract

- UI consumes accepted dossier, conversation, assessment, retrieval, and report types unchanged.
- Demo mode is labelled, deterministic, and isolated from Production; live mode is not implemented.

## Design contract

- Figma file: Required from accepted Phase 1A
- Frame IDs: Required from accepted Phase 1A
- Palette: Required from accepted Phase 1A
- Mobile: 390px frames required
- Edge states: microphone denied, transcription failed, upload rejected, parsing partial/failed, interrupted, assessment failed, partial report

## Tests

- component/state tests for all approved states
- desktop and 390px Playwright flow
- keyboard/focus, reduced-motion, contrast, and screen-reader checks
- voice-to-text continuity regression
- console/network assertion: no unexpected errors or Production writes

## Evidence

- local test/build/type/lint logs for changed domains
- desktop/mobile screenshots
- console/network captures
- state-coverage matrix
- one stable Preview and independent browser review only after local acceptance

## Exit gate

- Complete approved flow passes locally and on one Preview; report is deterministic/useful; design and independent reviewers accept; Production remains unchanged.

## Stop conditions

- Production moved
- approved Figma detail missing/conflicting
- Phase 2 contract mismatch
- accessibility or mobile acceptance fails
- any silent live/demo fallback
- build or focused checks fail

## Next contract

PHASE_4_SHARE_REFERRAL.md
