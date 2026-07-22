# Design Source of Truth

Status: Canonical policy; required design identifiers remain unknown
Last verified: 2026-07-23

## Verification record

| Required item | Current value |
|---|---|
| Canonical Figma file URL and owner | **UNKNOWN — required** |
| Approved page and desktop frame IDs | **UNKNOWN — required** |
| Approved mobile frame IDs | **UNKNOWN — required** |
| Component library and token/variable page | **UNKNOWN — required** |
| `FUNDME_UI_PALETTE.md` | **UNKNOWN — required** |
| Prototype link and interaction notes | **UNKNOWN — required** |
| Loading, partial, empty, error, microphone, upload, and interruption states | **UNKNOWN — required** |

Resolution is governed by [PHASE_1A_DESIGN_ACCEPTANCE.md](./PHASE_1A_DESIGN_ACCEPTANCE.md). No polished customer-facing implementation is authorized until that contract passes.

## Visual authority

The customer-facing V1 UI must follow:

1. Approved Yasha Figma frames
2. Approved FundMe component and token library
3. Approved `FUNDME_UI_PALETTE.md`
4. This experience contract
5. Existing production homepage only where explicitly retained

Codex must not invent the final visual language.

## Required Figma handoff

Record:

- canonical Figma file URL
- owner
- approved page
- approved frame IDs
- mobile frames
- component library
- token/variable page
- prototype link
- implementation status
- decision links

Until these are recorded, Codex may build only domain logic and an internal developer harness.

## HTML reference

The provided `index.html` is a representation of the desired interaction model, not a code foundation.

Useful patterns:

- central mentor presence
- calm voice orb
- persistent text/voice composer
- attachment entry
- conversation history drawer
- contextual progress panel
- suggested starting actions
- listening, processing and speaking states

Translate for FundMe:

| Reference | FundMe use |
|---|---|
| Voice orb | Mentor listening/thinking/responding |
| Bottom composer | Type, speak, attach deck/profile, add website |
| Conversation drawer | Prior assessment sessions |
| Progress panel | Evidence coverage, unanswered high-value gaps, assessment status |
| Action cards | Assess startup, review deck, review founder profile |

Do not copy:

- Sera branding
- career-assistant copy
- XP
- streaks
- badges
- career skill breakdown
- the exact palette without approval
- hard-coded user data
- monolithic HTML/CSS/JS
- browser speech code as production architecture

## Required screens

- Entry
- Minimal intake
- Artifact upload
- Voice/text mentor
- Evidence confirmation
- Missing-information question
- Processing
- Report overview
- Dimension detail
- Founder/profile review
- Deck review
- Red flags and contradictions
- Action plan
- Download/share
- Early-access referral
- Partial/error states
- Mobile

## Design freeze rule

No polished customer-facing implementation before approved Figma handoff.

Engineering may create:

- schema fixtures
- test reports
- internal harnesses
- unstyled diagnostic pages

These may not be presented as final UI.
