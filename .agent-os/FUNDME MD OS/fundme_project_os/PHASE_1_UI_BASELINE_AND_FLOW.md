# Active Phase Contract — Phase 1 UI Baseline and Functional Grill Flow

Status: Approved for execution
Owner: Aakash Puri + Engineering
Branch: `product/v1-grill`
Worktree: `/Users/totem/Desktop/Projects/Fundme-Product-V1`
Starting SHA: `1f3500ea237b3ef3089f0280b3b5cb5cd1c7ee3a`
Preview: Use the existing Git-connected `product/v1-grill` Preview only after local acceptance; never promote it

## One user outcome

A founder moves from the existing FundMe homepage through a minimal startup intake, review, deterministic voice/text mentor conversation, evidence-grounded funding-readiness report, download/share actions, and an email-only optimization early-access state.

## Scope

- Route approved assessment CTAs from the existing homepage to `/assessment` without redesigning the homepage.
- Implement the bounded `/assessment`, `/assessment/review`, `/assessment/mentor`, and `/assessment/result` flow, or a smaller equivalent only when the current Next.js architecture clearly improves recovery.
- Use one shared, versioned browser state for intake, file metadata, mentor events, voice/text continuity, report, early access, referral stub, and explicit restart.
- Ask at most five deterministic high-value mentor questions selected from missing context.
- Generate `fundme-demo-rubric@1` deterministically from founder-submitted evidence and explicit missing-evidence states.
- Deliver a useful report, text download, copy/native-share fallback, and email-only local Preview early-access success/failure flow.
- Preserve current FundMe production typography, tokens, components, spacing, cards, buttons, navigation, motion restraint, and responsive behavior.

## Explicit exclusions

- No homepage redesign, dashboard, generic chatbot, separate page per question, rejected Codex V1 UI, Sera branding, career terminology, XP, badges, streaks, or copied green palette/sidebar.
- No live AI/RAG, website or deck parsing, Production Clerk, Production Supabase writes, schema/migration, payment, matching, Gmail, LinkedIn scraping, browser agents, application tracker, or Production deployment.
- No public report page, private file/profile content in URLs, fake queue position, durable-signup claim, or active payment wall.
- No external designer, Figma file, frame, or approval dependency. Optional visual input supplied later by Aakash may be evaluated but cannot block this phase.

## Sources to read

- [PROJECT_STATE.md](./PROJECT_STATE.md)
- [PRODUCT_GROUND_TRUTH.md](./PRODUCT_GROUND_TRUTH.md)
- [supporting/V1_EXPERIENCE_CONTRACT.md](./supporting/V1_EXPERIENCE_CONTRACT.md)
- [SYSTEM_CONTRACT.md](./SYSTEM_CONTRACT.md)
- [UI_IMPLEMENTATION_CONTRACT.md](./UI_IMPLEMENTATION_CONTRACT.md)
- [OPERATING_RULES.md](./OPERATING_RULES.md)
- [DECISIONS.md](./DECISIONS.md)

## Existing code to reuse

- Existing homepage composition and CTA styling; change assessment destinations only.
- Existing FundMe CSS variables, public/onboarding surface patterns, `BrandLockup`, `Button`, `Input`, `Textarea`, reduced-motion conventions, and Framer Motion dependency.
- Existing assessment routes may be replaced where they contain random scoring, paywall behavior, fabricated analysis, or questionnaire patterns that conflict with this contract.

## Files/domains allowed to change

- Assessment experience: `app/assessment/**` and `components/assessment/**`.
- Deterministic demo domain: `lib/assessment/**` and focused tests.
- Preview entry/export behavior: homepage assessment links, versioned browser persistence, download/share/referral helpers, and focused tests.

## Data contract

- Session data is explicitly `demo` mode, versioned, local to the browser, and never silently written to a live service.
- Intake stores founder-entered fields and accepted file metadata only; file bytes are not persisted or uploaded.
- Voice and typed input append to the same conversation event stream.
- Every score/finding refers to submitted evidence or an explicit missing-evidence state; no deck, website, traction, revenue, market, founder, or investor fact is invented.
- The report includes rubric version, deterministic dimension scores, evidence coverage, findings, actions, generated timestamp, and complete/partial state.
- Early-access email and referral code are local Preview data; the UI states that neither is durably stored or a waitlist position.

## Design contract

- Authority: follow [UI_IMPLEMENTATION_CONTRACT.md](./UI_IMPLEMENTATION_CONTRACT.md).
- Desktop: centered editorial assessment shell with stage progress; mentor conversation plus contextual evidence rail; report optimized for scan and print.
- Mobile: one-column 390px flow, collapsible history/evidence, sticky primary actions only where they do not hide content, and no horizontal overflow.
- Voice states: idle, requesting permission, listening, transcribing, transcript ready, processing, responding, failed, and unavailable; typed fallback always visible.
- Edge states: invalid/missing input, rejected file, persistence unavailable, microphone denied/unavailable, empty/skipped answer, missing deck, share unavailable, clipboard failure, invalid early-access email, and explicit restart.

## Tests

- focused unit tests for same-input determinism, strong/weak fixtures, missing evidence, contradiction findings, deck non-fabrication, question priority, validation, persistence, route completion, and share fallback
- changed-file lint and TypeScript checks with no new errors
- full build
- local desktop 1440px, mobile 390px, and reduced-motion browser acceptance
- strong, weak, contradictory, no-deck, and microphone-denied scenarios
- refresh, back/edit, restart, download, share, early-access, console, network, and no-Production-dependency checks
- repeat the complete browser flow on one branch Preview

## Evidence

- red/green focused test logs and final test summary
- build and changed-file lint/type evidence
- local and Preview route/state acceptance matrix
- desktop/mobile/reduced-motion screenshots
- console and network inspection with no unexpected errors or Production writes
- independent review verdict
- final Vercel Production deployment/SHA inspection proving Production remained unchanged

## Exit gate

- The complete approved flow works locally and on one ready `product/v1-grill` Preview; results are deterministic and evidence-grounded; desktop/mobile/reduced-motion acceptance passes; download/share/early-access/restart work; no new lint/type/console/network defect or secret is introduced; Production remains at `10409284c56f2b5dea968b9e4b727d420b96aaeb`.

## Stop conditions

- Production baseline or aliases move.
- Repository/worktree state becomes unsafe or conflicts cannot be recovered without destructive action.
- A security, credential, platform-setting, or service action requires owner authorization.
- Local acceptance still fails after three complete repair cycles.
- A usage-limit warning occurs; save `PHASE_1_RESUME_STATE.md` and stop without repeated retries.

## Next contract

Intelligence foundation: replace heuristic demo analysis with accepted dossier/evidence, rubric calibration, retrieval, and report contracts without changing the accepted Phase 1 flow.
