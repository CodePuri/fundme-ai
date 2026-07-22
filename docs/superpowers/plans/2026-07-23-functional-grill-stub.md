# Functional Grill Stub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify the complete deterministic FundMe Grill stub from homepage entry through local Preview report, sharing, and email-only optimization early access without modifying Production.

**Architecture:** Keep the existing global assessment provider boundary but replace its randomized state with a versioned `GrillSession`. Four routes (`/assessment`, `/assessment/review`, `/assessment/mentor`, `/assessment/result`) consume pure validation, question-selection, scoring, persistence, and share helpers. Browser speech is isolated behind an adapter; all data remains explicitly local Preview data.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Lucide, Node 24 built-in test runner, existing Vercel Git integration.

**Execution:** Inline in the current Goal-mode session per Aakash's explicit instruction; no additional routine approval pause.

---

## File map

- `lib/assessment/types.ts` — versioned session, evidence, conversation, report, and early-access contracts.
- `lib/assessment/validation.ts` — intake/email/file validation and route-completion guards.
- `lib/assessment/questions.ts` — deterministic maximum-five mentor question selection.
- `lib/assessment/engine.ts` — `fundme-demo-rubric@1` scoring and findings.
- `lib/assessment/persistence.ts` — injected `Storage` adapter, hydration, save, and reset.
- `lib/assessment/share.ts` — report serialization, download payload, native share/clipboard fallback, referral stub.
- `components/assessment/assessment-provider.tsx` — one typed state and action boundary for every route/modality.
- `components/assessment/assessment-shell.tsx` — brand, local Preview disclosure, progress, responsive frame, restart.
- `components/assessment/intake-grid.tsx` — four primary cards, optional sources, validation.
- `components/assessment/submission-review.tsx` — source-labelled review and edit actions.
- `components/assessment/browser-speech-adapter.ts` — isolated Web Speech capability and state callbacks.
- `components/assessment/mentor-experience.tsx` — central mentor, composer, history, evidence context, question progression.
- `components/assessment/funding-readiness-report.tsx` — report hierarchy, actions, and early access.
- `app/assessment/{page.tsx,review/page.tsx,mentor/page.tsx,result/page.tsx}` — thin route composition.
- `app/assessment/{questions,analyzing,report}/page.tsx` — compatibility redirects to approved routes.
- `components/public/homepage/public-homepage.tsx` — assessment CTA destinations only.
- `tests/assessment/*.test.mjs` — pure contract tests run with Node 24 type stripping.

### Task 1: Establish the focused test harness and session contract

**Files:**
- Modify: `package.json`
- Create: `tests/assessment/session-contract.test.mjs`
- Create: `lib/assessment/types.ts`
- Create: `lib/assessment/validation.ts`

- [ ] **Step 1: Add the failing validation and route tests**

```js
test("requires the four minimum founder/startup fields", async () => {
  const { validateIntake } = await loadValidation();
  assert.equal(validateIntake(emptyInput).valid, false);
  assert.deepEqual(validateIntake(strongInput).errors, {});
});

test("routes incomplete sessions to the earliest valid step", async () => {
  const { earliestValidRoute } = await loadValidation();
  assert.equal(earliestValidRoute(emptySession), "/assessment");
  assert.equal(earliestValidRoute(reviewedSession), "/assessment/mentor");
});
```

- [ ] **Step 2: Run RED**

Run: `node --test --experimental-strip-types tests/assessment/session-contract.test.mjs`
Expected: assertion failures because validation/route functions are unavailable.

- [ ] **Step 3: Implement the minimal typed contract and validation**

Define `GRILL_SESSION_VERSION = 1`, `GrillSession`, `StartupInput`, `ArtifactMetadata`, `ConversationEvent`, `MentorAnswer`, `FundingReadinessReport`, and `EarlyAccessState`. Implement:

```ts
export function validateIntake(input: StartupInput): IntakeValidation;
export function validateFile(file: Pick<File, "name" | "size" | "type">): FileValidation;
export function validateEmail(value: string): string | null;
export function earliestValidRoute(session: GrillSession): AssessmentRoute;
```

File policy: PDF/DOC/DOCX/TXT, maximum 10 MiB; pitch deck accepts PDF only. Minimum context requires founder name, role, startup name or valid website, and one-line description.

- [ ] **Step 4: Run GREEN**

Run: `pnpm test:assessment`
Expected: session-contract tests pass.

### Task 2: Build deterministic question selection and assessment

**Files:**
- Create: `tests/assessment/questions.test.mjs`
- Create: `tests/assessment/engine.test.mjs`
- Create: `lib/assessment/questions.ts`
- Create: `lib/assessment/engine.ts`

- [ ] **Step 1: Write failing question-priority tests**

Assert missing stage, traction, founder fit, differentiation, and funding outcome are asked in that order, answered/skipped items are omitted, and the result never exceeds five.

- [ ] **Step 2: Run RED**

Run: `node --test --experimental-strip-types tests/assessment/questions.test.mjs`
Expected: assertion failure because `selectMentorQuestions` is unavailable.

- [ ] **Step 3: Implement question selection**

```ts
export function selectMentorQuestions(session: GrillSession): MentorQuestion[];
export function nextMentorQuestion(session: GrillSession): MentorQuestion | null;
```

Use stable IDs `stage`, `traction`, `founder-fit`, `differentiation`, and `funding-outcome`. Selection depends only on submitted/answered evidence.

- [ ] **Step 4: Run GREEN, then write failing engine tests**

Assert:
- identical session + generated timestamp deep-equals
- strong fixture scores above weak fixture
- absent evidence is named, not invented
- pre-launch plus revenue/paying-customer traction creates a contradiction and lowers confidence
- no deck returns the exact no-analysis boundary
- deck metadata says received but detailed slide analysis unavailable

- [ ] **Step 5: Run RED**

Run: `node --test --experimental-strip-types tests/assessment/engine.test.mjs`
Expected: assertion failures because `assessSession` is unavailable.

- [ ] **Step 6: Implement `fundme-demo-rubric@1`**

```ts
export const DEMO_RUBRIC_VERSION = "fundme-demo-rubric@1";
export function assessSession(session: GrillSession, generatedAt: string): FundingReadinessReport;
```

Return ten deterministic dimensions, evidence coverage, confidence, strongest/weakest dimensions, findings, founder/startup/deck reviews, and Fix now/Fix next/Improve later actions. Clamp all scores to 0–100 and never parse or summarize file contents.

- [ ] **Step 7: Run GREEN**

Run: `pnpm test:assessment`
Expected: all question and engine tests pass.

### Task 3: Build persistence, export, share, and referral helpers

**Files:**
- Create: `tests/assessment/persistence-share.test.mjs`
- Create: `lib/assessment/persistence.ts`
- Create: `lib/assessment/share.ts`

- [ ] **Step 1: Write failing adapter tests**

Test versioned round-trip, invalid JSON recovery, explicit reset, text serialization, native share, clipboard fallback, rejected share fallback, email validation, and stable Preview referral code generation.

- [ ] **Step 2: Run RED**

Run: `node --test --experimental-strip-types tests/assessment/persistence-share.test.mjs`
Expected: assertion failures because adapters are unavailable.

- [ ] **Step 3: Implement adapters**

```ts
export const GRILL_STORAGE_KEY = "fundme-grill-preview-v1";
export function loadSession(storage: StorageLike): GrillSession;
export function saveSession(storage: StorageLike, session: GrillSession): PersistenceResult;
export function clearSession(storage: StorageLike): void;
export function serializeReport(report: FundingReadinessReport): string;
export async function shareReport(input: ShareInput): Promise<"shared" | "copied">;
export function createPreviewReferralCode(email: string): string;
```

Never include file/profile contents in URLs. Referral links use only the local Preview code and state that no signup or priority is durably recorded.

- [ ] **Step 4: Run GREEN**

Run: `pnpm test:assessment`
Expected: all focused adapter tests pass.

### Task 4: Replace the provider and compose intake/review routes

**Files:**
- Modify: `components/assessment/assessment-provider.tsx`
- Create: `components/assessment/assessment-shell.tsx`
- Create: `components/assessment/intake-grid.tsx`
- Create: `components/assessment/submission-review.tsx`
- Modify: `app/assessment/page.tsx`
- Create: `app/assessment/review/page.tsx`

- [ ] **Step 1: Extend route/session tests to fail on required transitions**

Assert `submitIntake` advances to review, editing returns to intake without data loss, and explicit restart restores the initial session.

- [ ] **Step 2: Run RED**, then implement provider actions and rerun GREEN.

- [ ] **Step 3: Build the shared shell and visual input grid**

Use existing variables, `BrandLockup`, `Button`, `Input`, `Textarea`, and current card/border/shadow language. Render four primary cards, optional secondary evidence, local Preview disclosure, inline errors, and one primary action.

- [ ] **Step 4: Build the review route**

Display founder/startup/website/description/files with `Entered by founder`, `Attached`, `Unavailable`, or `Pending analysis` labels. Provide Edit, Add another source, and Continue to mentor.

- [ ] **Step 5: Run changed-file lint and focused tests**

Run: `pnpm exec eslint app/assessment/page.tsx app/assessment/review/page.tsx components/assessment/assessment-provider.tsx components/assessment/assessment-shell.tsx components/assessment/intake-grid.tsx components/assessment/submission-review.tsx lib/assessment tests/assessment`
Expected: zero changed-file lint errors.

### Task 5: Build the deterministic mentor and voice adapter

**Files:**
- Create: `components/assessment/browser-speech-adapter.ts`
- Create: `components/assessment/mentor-experience.tsx`
- Create: `app/assessment/mentor/page.tsx`

- [ ] **Step 1: Extend tests for one shared draft/event stream**

Assert typed and voice transcript actions update the same draft, submission creates one founder-answer event, skip records a skip without fabricated evidence, and no more than five questions occur.

- [ ] **Step 2: Run RED**, implement actions, then rerun GREEN.

- [ ] **Step 3: Implement browser speech boundary**

Expose `supported`, `start`, and `stop`; map permission/listening/transcribing/ready/failed/unavailable states without touching the typed draft on failure. No autoplay or speech output.

- [ ] **Step 4: Implement mentor UI**

Use central mentor presence, one composer, microphone/attachment actions, deterministic question, history, contextual evidence, skip, and Continue to assessment. Desktop uses a narrow evidence rail; mobile uses collapsible evidence/history.

- [ ] **Step 5: Run changed-file lint and focused tests**.

### Task 6: Build result, report, download/share, and early access

**Files:**
- Create: `components/assessment/funding-readiness-report.tsx`
- Create: `app/assessment/result/page.tsx`

- [ ] **Step 1: Extend tests for result completion and early access**

Assert analysis generates once per changed session, report survives refresh, invalid email stays error, valid email creates a local success/referral state, and no durable-save claim is produced.

- [ ] **Step 2: Run RED**, implement actions, then rerun GREEN.

- [ ] **Step 3: Implement truthful analysis and report hierarchy**

Run actual deterministic phases: structure evidence, check contradictions, score rubric, prepare actions. Render verdict, score, evidence coverage/confidence, strongest/weakest, ten dimensions, Grill, founder/startup/deck reviews, and action ladder.

- [ ] **Step 4: Implement actions and email-only early access**

Download `.txt`, copy summary, native Web Share with clipboard fallback, privacy notice, explicit local Preview success/failure, and non-durable referral code/link. No public report page or payment.

- [ ] **Step 5: Run changed-file lint and focused tests**.

### Task 7: Route compatibility and homepage entry

**Files:**
- Modify: `components/public/homepage/public-homepage.tsx`
- Replace: `app/assessment/questions/page.tsx`
- Replace: `app/assessment/analyzing/page.tsx`
- Replace: `app/assessment/report/page.tsx`

- [ ] **Step 1: Add a failing static route-contract test**

Read homepage source and assert every approved assessment CTA targets `/assessment`; assert legacy pages contain redirects to mentor/result rather than questionnaires, random scoring, or paywall UI.

- [ ] **Step 2: Run RED**, update only CTA destinations and compatibility redirects, then rerun GREEN.

- [ ] **Step 3: Confirm no `Math.random`, paywall, live API, Supabase, or Clerk dependency remains under approved assessment routes**.

### Task 8: Local acceptance and three-cycle repair budget

**Files:**
- Update only observed-defect files within the three approved domains.

- [ ] Run `pnpm test:assessment`.
- [ ] Run changed-file ESLint.
- [ ] Run `pnpm exec tsc --noEmit`; compare with the verified baseline and prove no new errors.
- [ ] Run `pnpm build`.
- [ ] Start local server and complete strong, weak, contradictory, no-deck, and microphone-denied scenarios at 1440px and 390px.
- [ ] Repeat essential flow with reduced motion.
- [ ] Verify back/edit, refresh, restart, file validation, download, copy/share, email success/failure, no horizontal overflow, console, and network.
- [ ] Fix observed defects test-first; maximum three complete repair cycles.

### Task 9: Review, documentation, commit, Preview, and Production proof

**Files:**
- Modify: `.agent-os/FUNDME MD OS/fundme_project_os/PROJECT_STATE.md`
- Modify: `.agent-os/FUNDME MD OS/fundme_project_os/UI_IMPLEMENTATION_CONTRACT.md` only for verified departures
- Modify: `.agent-os/FUNDME MD OS/fundme_project_os/PHASE_1_UI_BASELINE_AND_FLOW.md` acceptance evidence/status

- [ ] Run independent review against the approved requirements and current diff.
- [ ] Commit bounded implementation and test changes with explicit staging; never use `git add -A`.
- [ ] Re-fetch and verify `origin/main` remains `1040928…`.
- [ ] Push only `product/v1-grill` and let existing Git integration update one branch Preview.
- [ ] Inspect the ready Preview and repeat full desktop/mobile/reduced-motion acceptance with clean console/network.
- [ ] Inspect `tryfundme.in`; prove the Production deployment and source SHA remain unchanged.
- [ ] Update canonical state with exact tests, Preview URL/SHA, limitations, and next intelligence-foundation contract.
- [ ] Run final requirements audit before marking the Goal complete.

## Plan self-review

- Spec coverage: every approved intake, review, mentor, voice, deterministic rubric, report, share/download, early-access, persistence, browser, Preview, and Production invariant maps to a task.
- Scope: three domains only; no dashboard, live provider, database, payment, matching, or Production work.
- Types: one `GrillSession` and `FundingReadinessReport` contract is shared across domain, provider, routes, persistence, and export.
- Placeholders: none; later intelligence work is an explicit next contract, not unfinished Phase 1 behavior.
