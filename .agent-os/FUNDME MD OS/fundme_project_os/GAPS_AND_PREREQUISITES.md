# Gaps and Prerequisites

Status: Canonical unresolved-items register
Last verified: 2026-07-23

## Resolved during Step 0

- Canonical repository: `/Users/totem/Desktop/Projects/Fundme`.
- `origin/main`, local `main`, release tag, and current Production: `10409284c56f2b5dea968b9e4b727d420b96aaeb`.
- Current Production deployment: `dpl_7gCDSsFZ8J6VfUqLBmv7wrcALbr5`.
- Previous ready Production candidate: `dpl_2x7Cb8Q4YdnmxhRu7ksasK3HnMAw` at `1244802`.
- Dirty Ponytail line: preserved at `d684f36`; no reset, stash, clean, commit, or worktree edit.
- Active clean development line: `/Users/totem/Desktop/Projects/Fundme-Product-V1`, branch `product/v1-grill`, created from verified `origin/main`.
- Existing Codex V1 line: clean historical/rewrite reference; no unique commit accepted for merge.
- Vercel retained inventory: 50 deployments, 49 ready and one failed; no deletion action.
- Current implementation classification: recorded in `PROJECT_STATE.md` and external evidence.

## Blocking security prerequisites

- Rotate the Supabase service-role credential found in tracked history and treat it as compromised.
- Remove the service-role disclosure route and tracked credential file under a separately approved, tested security contract.
- Fix and regression-test login redirect validation.
- Remove mock-success persistence behavior before relying on onboarding data.
- Restore type validation to the release gate after existing type errors are resolved.

Step 0 documents these defects but does not change application code, credentials, settings, or history.

## Resolved UI prerequisites

- D-009 removed the external designer and Figma dependency.
- Existing Production design and implemented components/tokens are the baseline.
- `UI_IMPLEMENTATION_CONTRACT.md` defines desktop/mobile structure, mentor/voice states, loading/error states, report hierarchy, retained interaction concepts, and explicit exclusions.
- Aakash approved the Phase 1 route, interaction, deterministic demo, and email-only early-access structure.

These items no longer block Phase 1 implementation.

## Product decisions

- initial ICP emphasis
- final primary CTA wording
- free-versus-locked copy
- referral priority formula
- private download/team share versus public share pages in V1
- report tone and hierarchy approval

## Intelligence prerequisites

- rubric owner/reviewer and initial weights
- benchmark source registry and usage permissions
- human calibration fixtures and acceptance thresholds
- target latency and per-assessment cost budget
- live AI provider decision for Phase 5

## Voice and artifacts prerequisites

- V1 transcription target and typed fallback
- PDF parser and failure policy
- file type, size, and page limits
- website ingestion and robots/permission policy
- audio/transcript retention and deletion policy

## Platform prerequisites

- Clerk Production ownership, keys, redirects, and anonymous-claim design
- Supabase tier, canonical schema, RLS evidence, backups/restore, and private storage policy
- server-only secret rotation evidence
- monitoring and analytics providers
- payment provider/webhook environment only after identity, persistence, RLS, backup, and entitlement gates

Unknown platform values remain explicitly unknown; Step 0 did not probe or change protected dashboard settings.

## Active approved work

Execute [PHASE_1_UI_BASELINE_AND_FLOW.md](./PHASE_1_UI_BASELINE_AND_FLOW.md). Do not expand into live identity, Production persistence, payments, matching, or later intelligence work during this phase.
