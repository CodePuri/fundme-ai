# FundMe UI Implementation Contract

Status: Canonical visual and interaction authority for engineering
Owner: Aakash Puri + Engineering
Version: 1.2
Date: 2026-07-23

## Authority order

1. Existing FundMe Production design and verified behavior.
2. Existing implemented FundMe components and tokens.
3. Existing accepted homepage and onboarding patterns.
4. Screenshots or visual references explicitly supplied by Aakash.
5. This contract.
6. Supplied `index.html` interaction concepts for the mentor stage only.
7. Old deployments and rejected Codex UI as historical reference or archive only.

No external designer, Figma file, frame, or approval is required for engineering. Future design work may be incorporated only when Aakash explicitly accepts it; its absence is never a blocker.

## Product character

FundMe should feel like a precise founder mentor: calm, editorial, credible, direct, and evidence-led. It must avoid dashboard density, generic-chat emptiness, gamification, false certainty, and speculative intelligence.

The Phase 1 experience extends the existing visual language. It does not invent a replacement design system.

## Production patterns reused

- warm cream page background (`--bg`, `#f6f1ea`)
- white and warm elevated surfaces
- near-black primary text and controls
- orange action accent (`--button-primary-bg`, `#ff6b3d`)
- restrained green/amber/blue semantic accents
- Geist Sans body typography with the existing Instrument Serif/Cormorant editorial accents where already appropriate
- rounded cards and pills, fine low-contrast borders, soft shadows, generous whitespace
- existing responsive page frame, focus ring, reduced-motion handling, and print styles
- `BrandLockup`, `Button`, `Input`, and `Textarea` behavior and styling

## Components adapted

- Homepage CTA links: destination changes to the assessment entry; layout and styling remain unchanged.
- Existing assessment provider: one versioned deterministic browser-local session and explicit Preview boundary.
- File selection: compact founder-profile/deck attachments with visible type/size errors and persisted metadata only.
- Assessment report surfaces: compact card/ring affordances show the accepted evidence-grounded diagnosis, opportunity teaser, and post-value conversion without paywall or fabricated findings.

## New components

- `AssessmentShell`: brand, local Preview label, three-stage progress, responsive frame, and restart control.
- `IntakeGrid`: one-screen founder, LinkedIn/profile source, website, deck, and fallback-description intake.
- `AnalysisProgress`: supported local evidence/scoring stages without fake extraction or percentages.
- `FundingReadinessReport`: compact score hero, dimensions, evidence basis, paired gaps/actions, founder/startup/deck boundaries, opportunity fixtures, export/share, and auth handoff.
- `PreviewDashboard`: saved local score, key weakness, next action, limited fixture matches, free links, and explicitly locked optimization.

## Route map

```text
Homepage assessment CTA
→ /assessment
→ /assessment/analyzing
→ /assessment/result
→ configured Clerk Google or browser-local Preview-profile handoff
→ /app/preview
→ /search
```

Legacy review/mentor/question routes recover to intake; they do not remain primary steps. Download/share lives on the result. The conversion handoff appears only after diagnosis and match-teaser value is visible.

## Desktop structure

- Intake: centered editorial surface with a three-step header and two-column source grid where space permits.
- Analysis: concise editorial explanation plus supported local stage list.
- Result: above-fold score/verdict, dense two-column dimensions, paired gaps/actions, compact founder/startup/deck review, fixture opportunity teaser, then conversion.
- Preview workspace: no sidebar; compact score summary, four categories, limited match list, free links, and locked optimization.

## Mobile structure

- One-column reading order at 390px.
- No persistent sidebar, dashboard rail, or horizontal carousel.
- Profile evidence uses progressive disclosure without hiding required fields.
- Controls remain at least 44px where practical, labels remain visible, and fixed actions must not obscure content or safe-area space.

## Mentor/SERA boundary

The free assessment has no conversational mentor, voice state, chat composer, sidebar, or SERA workspace. Existing mentor/speech code remains historical scaffolding only and is not reachable from the primary flow. The supplied SERA interaction reference may inform a later optimization workspace after its own contract; it cannot authorize Phase 1 behavior.

## Assessment processing states

The shared session uses only states backed by real application behavior:

- `preparing` — intake is editable
- `validating` — submitted intake failed or is being checked synchronously
- `questioning` and `ready` — retained for compatibility with structurally valid historical local sessions; not displayed by the primary commercial funnel
- `assessing` — the result route is applying `fundme-demo-rubric@1` locally
- `partial` — a report exists with skipped or missing mentor evidence
- `complete` — all five deterministic mentor questions were answered
- `failed` — a real assessment operation failed
- `recoverable` — stored state was rejected or unavailable and the user can safely resume

No percentage, queue, assistant-response, parser, upload, or AI progress may be shown unless that operation exists.

## Loading and error states

- Hydration/persistence: neutral shell; never flash fabricated default content.
- Analysis: only show organizing submitted evidence, recording metadata/boundaries, checking gaps, scoring the rubric, and selecting deterministic Preview categories.
- Upload: validating, accepted, and rejected states; no parsing claim.
- Persistence unavailable: explicit in-memory warning; never imply durable save.
- Share/clipboard failure: keep the report intact and offer download fallback.
- Route guard: recover to the earliest valid assessment step without losing valid state.

## Recovery behavior

- Browser back/forward uses the three stable funnel routes while one session remains authoritative.
- Refresh reloads a structurally validated current-version session, including accepted artifact metadata and a generated report.
- Corrupt, oversized, or malformed same-version storage is removed and replaced with a clearly labelled recoverable intake; it is never partially reinterpreted.
- Compatible legacy onboarding context maps founder name/role, startup name/website/description, profile link, and file-name metadata, then performs a full assessment remount.
- Restart explicitly clears browser-local assessment state; storage failure falls back to a labelled in-memory restart.
- Deck/profile parsing and website fetching are unavailable in this Preview; submitted metadata remains visible and the assessment continues without a fabricated parsing step.

## Report hierarchy

1. Verdict and Funding Readiness Score.
2. Evidence coverage, confidence, strongest and weakest dimensions.
   The report labels itself `complete` or `partial` and states traction as `missing`, `none`, `positive`, or `contradictory`.
3. Ten-dimension breakdown with score, explanation, evidence used, and missing evidence.
4. Paired `What is missing` / `How to improve it` actions.
5. Founder review.
6. Startup review.
7. Pitch-deck review with an explicit no-extraction boundary.
8. Deterministic opportunity fixtures across four categories.
9. Download, copy/share, and post-value authentication handoff.
10. Minimal saved-assessment Preview workspace with locked optimization.

## Explicit departures from Production

- Assessment CTAs enter `/assessment` rather than legacy onboarding.
- Assessment uses isolated local Preview persistence and deterministic evidence scoring.
- The analysis, diagnosis, auth handoff, and minimal Preview workspace are new, but their visual primitives come from the current site.
- No Production identity, database, file storage, or AI service participates.

## `index.html` ideas reserved

- central mentor presence
- one composer for voice and text
- attachment action
- listening and transcribing states
- conversation-history access
- contextual recommendations and drafts

These are later optimization-workspace references only and are not implemented in Phase 1.

## `index.html` ideas rejected

- initial dashboard and sidebar structure
- Sera name, assistant identity, career language, and hard-coded user information
- XP, streaks, badges, and career-readiness metrics
- exact green palette
- monolithic HTML/CSS/JavaScript structure
- broken or undefined JavaScript behavior
- direct browser speech coupling as the final architecture

## Rejected Codex V1 exclusions

- no component, layout, route behavior, paywall, or styling is accepted because it exists on `codex/v1-grill-demo`
- no commit is cherry-picked wholesale
- bounded domain or test ideas require fresh implementation against the active contract

## Accessibility and motion

- semantic headings, labels, status regions, button names, and keyboard order
- visible focus using existing tokens
- errors associated with fields and not communicated by color alone
- reduced motion removes decorative movement without hiding content
- mentor/analysis status uses polite live regions
- report remains readable and printable without motion

## Acceptance rule

Engineering acceptance is based on the active phase contract, focused tests, desktop/mobile/reduced-motion browser evidence, console/network inspection, independent review, and Production invariants. No external design approval is part of the gate.
