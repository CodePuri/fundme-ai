# FundMe UI Implementation Contract

Status: Canonical visual and interaction authority for engineering
Owner: Aakash Puri + Engineering
Version: 1.0
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
- Existing assessment provider: replaced with one versioned, deterministic Grill session and explicit local Preview repository boundary.
- File selection: compact intake and mentor attachments with visible file type/size errors and persisted metadata.
- Assessment report surfaces: retain existing card/ring affordances only where they display the accepted evidence-grounded report contract; remove paywall and fabricated/random findings.

## New components

- `AssessmentShell`: brand, local Preview label, four-stage progress, responsive content frame, and restart control.
- `IntakeGrid`: maximum four primary input cards plus optional secondary evidence.
- `SubmissionReview`: source-labelled founder/startup/file summary with edit and continue actions.
- `MentorPresence`: central FundMe mentor/orb state without audio autoplay or assistant branding.
- `MentorComposer`: one typed/voice draft with microphone and attachment actions.
- `ConversationHistory`: deterministic mentor questions, founder answers, skips, and status events.
- `EvidenceContext`: submitted, attached, missing, and pending-analysis summary.
- `FundingReadinessReport`: verdict, score, evidence coverage, dimensions, Grill, founder/startup/deck reviews, and prioritized actions.
- `ReportActions`: text download, copy, native share, and fallback states.
- `OptimizationEarlyAccess`: email-only local Preview form, privacy notice, success/failure state, and clearly non-durable referral stub.

## Route map

```text
Homepage assessment CTA
→ /assessment
→ /assessment/review
→ /assessment/mentor
→ /assessment/result
```

`/assessment/result` owns short truthful analysis progress before revealing the report. Download/share and early access live within the result experience rather than creating unnecessary routes. Old assessment subroutes may redirect to the nearest valid approved route; they do not remain separate question flows.

## Desktop structure

- Intake/review: centered maximum-width editorial surface with a compact progress header and two-column input/review grid where space permits.
- Mentor: dominant conversation column and narrow evidence/progress rail; history remains directly accessible.
- Result: strong verdict/score opening, then evidence coverage, dimension grid, Grill, founder/startup/deck sections, action ladder, export, and early access.

## Mobile structure

- One-column reading order at 390px.
- No persistent sidebar, dashboard rail, or horizontal carousel.
- Evidence and history become collapsible sections without losing state.
- Controls remain at least 44px where practical, labels remain visible, and fixed actions must not obscure content or safe-area space.

## Voice and mentor states

| State | UI behavior |
|---|---|
| Idle | Typed composer and microphone action available |
| Requesting permission | Clear permission status; draft remains editable |
| Listening | Orange-accent mentor presence and explicit stop action |
| Transcribing | Preserve typed draft while the adapter finalizes transcript |
| Transcript ready | Transcript appears in the same composer for editing/submission |
| Processing | Short truthful deterministic question/report work only |
| Responding | Mentor response receives restrained visual emphasis; no audio autoplay |
| Failed | Specific recoverable message and typed fallback |
| Unavailable | Explain browser limitation; typed flow remains complete |

Browser speech is behind a small adapter. It is a Preview capability, not the final transcription architecture.

## Loading and error states

- Hydration/persistence: neutral shell; never flash fabricated default content.
- Analysis: only show structuring evidence, checking contradictions, scoring the rubric, and preparing actions when those steps run.
- Upload: validating, accepted, and rejected states; no parsing claim.
- Persistence unavailable: explicit in-memory warning; never imply durable save.
- Share/clipboard/email failure: keep the report intact and offer retry or manual copy.
- Route guard: recover to the earliest valid assessment step without losing valid state.

## Report hierarchy

1. Verdict and Funding Readiness Score.
2. Evidence coverage, confidence, strongest and weakest dimensions.
3. Ten-dimension breakdown with score, explanation, evidence used, and missing evidence.
4. The Grill: red flags, contradictions, unsupported claims, and weak proof.
5. Founder review.
6. Startup review.
7. Pitch-deck review with an explicit no-extraction boundary.
8. Fix now, Fix next, Improve later.
9. Download, copy, and share.
10. Optimization early access and referral Preview stub.

## Explicit departures from Production

- Assessment CTAs enter `/assessment` rather than legacy onboarding.
- Assessment uses isolated local Preview persistence and deterministic evidence scoring.
- The mentor interaction and report are new, but their visual primitives come from the current site.
- No Production identity, database, file storage, or AI service participates.

## `index.html` ideas retained

- central mentor presence
- one composer for voice and text
- attachment action
- listening, transcribing, processing, and responding states
- conversation-history access
- contextual progress/evidence display

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
