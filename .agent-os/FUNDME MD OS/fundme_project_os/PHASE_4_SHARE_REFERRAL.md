# Active Phase Contract — Phase 4 Share and Referral

Status: Proposed; not approved
Owner: Product + Engineering
Branch: `product/v1-grill`
Worktree: `/Users/totem/Desktop/Projects/Fundme-Product-V1`
Starting SHA: **UNKNOWN — set after Phase 3 acceptance**
Preview: Continue the single accepted V1 Preview

## One user outcome

A founder downloads or deliberately shares a privacy-safe assessment summary, joins optimization early access, and receives referral credit only after a verified referred signup.

## Scope

- Generate a downloadable assessment artifact from accepted report data.
- Implement private-by-default share tokens with explicit founder action and revocation/expiry behavior.
- Implement early-access signup, attributable referral links, verified-signup credit, and transparent priority state.
- Add funnel events that contain no private report evidence.

## Explicit exclusions

- No public report by default, raw evidence in share metadata, click-based priority, fake queue numbers, payments, matching, email automation, browser agent, or Production release.
- No live external messaging without separate approval.

## Sources to read

- [PRODUCT_GROUND_TRUTH.md](./PRODUCT_GROUND_TRUTH.md)
- [supporting/V1_EXPERIENCE_CONTRACT.md](./supporting/V1_EXPERIENCE_CONTRACT.md)
- [SYSTEM_CONTRACT.md](./SYSTEM_CONTRACT.md)
- [OPERATING_RULES.md](./OPERATING_RULES.md)
- [PHASE_3_GRILL_EXPERIENCE.md](./PHASE_3_GRILL_EXPERIENCE.md)

## Existing code to reuse

- Accepted report schema and Grill report components.
- No localStorage-only or unauthenticated public-sharing pattern.

## Files/domains allowed to change

- `lib/fundme/share-referral/**`
- `app/api/share-referral/**`
- `tests/fundme/share-referral/**`

## Data contract

- Share record: opaque token hash, report/version, owner/session, visibility, created/expiry/revoked timestamps.
- Referral record: referrer, opaque code, referred signup, verification timestamp, attribution source, idempotency key.
- Analytics excludes evidence, transcript, deck contents, and private report text.

## Design contract

- Figma file: Accepted Phase 1A file
- Frame IDs: Download/share/early-access/referral states required
- Palette: Accepted token set
- Mobile: Complete 390px states
- Edge states: expired/revoked link, download failure, duplicate signup, self-referral, attribution conflict

## Tests

- token entropy, expiry, revocation, authorization, and privacy tests
- idempotent verified-referral integration tests
- download content/schema tests
- desktop/mobile browser flow
- analytics payload allow-list regression

## Evidence

- focused test and security logs
- generated artifact fixture
- private-share network trace
- referral attribution table
- browser screenshots with no private data

## Exit gate

- Share is private by default, revocable, and evidence-safe; only verified unique signup changes priority; download and mobile flows pass.

## Stop conditions

- Production moved
- referral formula or public-share policy unapproved
- private evidence appears in URLs/metadata/analytics
- durable identity/persistence unavailable
- authorization or idempotency uncertainty
- build or focused checks fail

## Next contract

PHASE_5_LIVE_ADAPTERS.md
