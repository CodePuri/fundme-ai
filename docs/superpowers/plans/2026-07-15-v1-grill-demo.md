# Fundme V1 Grill Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy an isolated, deterministic, evidence-backed Fundme Grill Demo from the accepted Production homepage to a locally persisted visual report and share card.

**Architecture:** Keep the existing Next.js modular monolith and add a public `/grill` flow plus `/api/grill/analyze`. Shared contracts define identity, persistence, artifact, grill, retrieval, and entitlement boundaries; demo adapters use anonymous browser identity, versioned local storage, server-side PDF extraction, deterministic scoring, and a local corpus. `FUNDME_RUNTIME_MODE` resolves to demo locally/on Preview and refuses an unconfigured live runtime.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Node test runner through `tsx`, `unpdf`, Playwright CLI, Vercel Preview deployment.

---

## File Map

- `lib/grill/types.ts`: serializable intake, dossier, evidence, score, finding, artifact, and report contracts.
- `lib/grill/contracts.ts`: provider interfaces and live-conversion boundaries.
- `lib/grill/validation.ts`: intake, upload, API response, missing-information, and filename validation.
- `lib/grill/evidence.ts`: normalize founder-entered and parser-extracted evidence into the dossier.
- `lib/grill/retrieval.ts`: deterministic lexical/tag retrieval over the curated corpus.
- `lib/grill/engine.ts`: versioned deterministic rubric, contradictions, unsupported claims, and recommendations.
- `lib/grill/runtime.ts`: one server runtime selector and explicit live-mode failure.
- `lib/grill/server/corpus.ts`: server-only curated guidance with stable provenance.
- `lib/grill/server/pdf.ts`: bounded PDF/text extraction and graceful parser failure.
- `lib/grill/server/demo-runtime.ts`: composes demo server providers.
- `lib/grill/client/repository.ts`: versioned local browser persistence with explicit failure.
- `lib/grill/client/identity.ts`: anonymous demo-session identity.
- `lib/grill/client/analyze.ts`: multipart request and real upload progress.
- `lib/grill/client/share.ts`: summary, Web Share, clipboard, and PNG share-card generation.
- `app/api/grill/analyze/route.ts`: public, sanitized multipart analysis boundary.
- `app/grill/page.tsx`, `app/grill/grill-client.tsx`: four-step founder/startup/evidence/review intake.
- `app/grill/result/page.tsx`, `app/grill/result/result-client.tsx`: report, locked preview, persistence, restart, and sharing.
- `components/grill/*`: focused intake and report visual components.
- `tests/grill/*.test.ts`: deterministic engine, retrieval, validation, runtime, API schema, PDF, repository, and redirect tests.
- `docs/V1_DEMO_TO_LIVE_CONVERSION.md`: exact adapter replacement matrix.
- `.agent-os/FUNDME MD OS/fundme_project_os/PROJECT_STATE.md`: Preview-only project state after acceptance.

## Task 1: Establish Test Harness And Red Contracts

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `tests/grill/fixtures.ts`
- Create: `tests/grill/engine.test.ts`
- Create: `tests/grill/retrieval.test.ts`
- Create: `tests/grill/validation.test.ts`
- Create: `tests/grill/runtime.test.ts`
- Create: `tests/grill/repository.test.ts`
- Create: `tests/grill/redirects.test.ts`

- [x] **Step 1: Add only required dependencies**

Run `pnpm add unpdf && pnpm add -D tsx`, add `test:grill` as `tsx --test tests/grill/*.test.ts`, and do not add a browser test framework because the installed Playwright CLI is sufficient.

- [x] **Step 2: Write fixture inputs and failing behavior tests**

Fixtures must include strong, weak, and contradictory founders. Assertions must cover score bounds, strong > weak by at least 15 points, same-input deep equality, contradiction/confidence handling, missing evidence, unsupported claims, stable retrieval ordering, upload signatures and limits, response schema rejection, local persistence failure, internal redirects, and live-runtime refusal.

- [x] **Step 3: Verify RED**

Run `pnpm test:grill`. Expected: failure because `lib/grill/*` and `lib/security/redirects.ts` do not exist.

## Task 2: Implement Shared Contracts, Evidence, Retrieval, And Rubric

**Files:**
- Create: `lib/grill/types.ts`
- Create: `lib/grill/contracts.ts`
- Create: `lib/grill/validation.ts`
- Create: `lib/grill/evidence.ts`
- Create: `lib/grill/retrieval.ts`
- Create: `lib/grill/engine.ts`
- Create: `lib/grill/runtime.ts`
- Create: `lib/grill/server/corpus.ts`
- Create: `lib/security/redirects.ts`

- [x] **Step 1: Define serializable boundaries**

Use these provider shapes without production connections:

```ts
interface IdentityProvider { getIdentity(): Promise<DemoIdentity> }
interface AssessmentRepository { load(): PersistedGrillState | null; save(state: PersistedGrillState): void; clear(): void }
interface ArtifactProcessor { process(file: File, kind: ArtifactKind): Promise<ArtifactResult> }
interface GrillEngine { analyze(dossier: GrillDossier, guidance: RetrievedGuidance[]): GrillReport }
interface KnowledgeRetriever { retrieve(dossier: GrillDossier, limit?: number): RetrievedGuidance[] }
interface OptimizationEntitlementProvider { getEntitlement(identity: DemoIdentity): Promise<OptimizationEntitlement> }
```

- [x] **Step 2: Build the evidence dossier**

Every important fact records source type, source label, text, confidence, and whether it was founder-entered or parser-extracted. Deck parsing failure produces no deck facts and an explicit unavailable status.

- [x] **Step 3: Implement deterministic retrieval**

Token/tag overlap determines rank, stable ID breaks ties, and the top guidance IDs are returned with the report. Corpus entries include stable ID, title, source/provenance, category, tags, and short original guidance.

- [x] **Step 4: Implement `fundme-v1-demo-rubric@1`**

Score ten dimensions from 0-100 with fixed weights and clamping. Produce overall readiness, coverage, confidence, strengths, red flags, contradictions, unsupported claims, missing evidence, deck/profile findings, and specific prioritized actions. No randomness, funding probability, or invented facts.

- [x] **Step 5: Verify GREEN**

Run `pnpm test:grill`. Engine, retrieval, validation, runtime, and redirect tests must pass; repository/PDF tests may remain red until their adapters exist.

## Task 3: Implement Bounded Artifact Processing And Analysis API

**Files:**
- Create: `lib/grill/server/pdf.ts`
- Create: `lib/grill/server/demo-runtime.ts`
- Create: `app/api/grill/analyze/route.ts`
- Modify: `middleware.ts`
- Test: `tests/grill/pdf.test.ts`
- Test: `tests/grill/api-schema.test.ts`

- [x] **Step 1: Write failing PDF and API tests**

Assert PDF-only deck validation, PDF magic bytes, safe filenames, 3.5 MB per-file and 4 MB combined limits, at most 20 parsed pages, at most 50,000 extracted characters, text profile support, unparseable partial state, and a sanitized response envelope.

- [x] **Step 2: Implement server artifact processing**

Use `unpdf`'s serverless PDF.js document proxy and page-by-page extraction. Always destroy the proxy, never log file contents, and return explicit `parsed`, `unavailable`, or `not_provided` status.

- [x] **Step 3: Implement the route**

Accept multipart `intake`, optional `profileFile`, and optional `deckFile`. Reject malformed/oversized requests with 400/413, use Node runtime, return partial 200 only for genuine parser failure, and return generic 500 errors without stack traces or environment details.

- [x] **Step 4: Verify GREEN**

Run `pnpm test:grill`. All server-focused tests must pass.

## Task 4: Implement Demo Identity, Persistence, And Four-Step Intake

**Files:**
- Create: `lib/grill/client/identity.ts`
- Create: `lib/grill/client/repository.ts`
- Create: `lib/grill/client/analyze.ts`
- Create: `app/grill/page.tsx`
- Create: `app/grill/grill-client.tsx`
- Create: `components/grill/grill-shell.tsx`
- Create: `components/grill/file-evidence-input.tsx`
- Create: `components/grill/review-evidence.tsx`
- Test: `tests/grill/repository.test.ts`

- [x] **Step 1: Write failing persistence tests**

Assert schema version 1, session stability, report survival, explicit restart, corrupt-data recovery, and thrown persistence errors instead of fake success.

- [x] **Step 2: Implement browser adapters**

Use local storage only, dispatch a same-tab change event, expose a stable string snapshot for `useSyncExternalStore`, and label this as Preview browser storage. Do not use local storage as production identity or ownership proof.

- [x] **Step 3: Implement intake**

Create Founder, Startup, Evidence, and Review steps with required fields, back/next controls, inline validation, editable review sections, weak/missing evidence, PDF/text constraints, and XHR upload progress. The demo must not require Clerk.

- [x] **Step 4: Verify GREEN and lint touched code**

Run `pnpm test:grill` and `pnpm exec eslint app/grill components/grill lib/grill app/api/grill middleware.ts lib/security/redirects.ts`.

## Task 5: Implement Visual Report, Locked Preview, And Sharing

**Files:**
- Create: `app/grill/result/page.tsx`
- Create: `app/grill/result/result-client.tsx`
- Create: `components/grill/score-ring.tsx`
- Create: `components/grill/dimension-breakdown.tsx`
- Create: `components/grill/finding-list.tsx`
- Create: `components/grill/locked-optimization.tsx`
- Create: `lib/grill/client/share.ts`

- [x] **Step 1: Implement report hierarchy**

Render hero verdict, score, coverage, confidence, strongest/weakest dimensions, ten dimension bars, the Grill, founder/profile review, deck review, prioritized actions, methodology/version, and local-storage notice.

- [x] **Step 2: Implement locked early-access state**

Show an interactive but unpurchased `Optimize my funding fit` preview with rewrite categories and `Coming in Early Access`. Do not process payment or imply entitlement.

- [x] **Step 3: Implement sharing**

Generate a 1200x630 PNG card from a canvas, copy a PII-minimized summary, use Web Share when available, and fall back to clipboard/download without creating a public personal-data URL.

- [x] **Step 4: Verify refresh and restart behavior**

The report must survive refresh in the same browser; restart must clear the report and return to `/grill`.

## Task 6: Wire Homepage And Scoped Security Fixes

**Files:**
- Modify: `components/public/homepage/public-homepage.tsx`
- Modify: `app/login/page.tsx`
- Delete: `app/api/env/route.ts`
- Delete: `infrastructure/scratch-supabase.js`

- [x] **Step 1: Point Preview funding-readiness CTAs to `/grill`**

Preserve all homepage structure, styling, and animation props. Change only the relevant destinations/copy; Explore and Search remain available.

- [x] **Step 2: Enforce internal login redirects**

Allow only paths beginning with one `/`, reject protocol-relative and external URLs, and fall back to `/onboarding`.

- [x] **Step 3: Remove secret exposure paths**

Delete `/api/env` and the tracked scratch credential file. Do not change Production environment variables or Supabase.

- [x] **Step 4: Commit vertical slice 1**

Stage explicit files and commit `feat: build deterministic Fundme grill flow`.

## Task 7: Local Quality And Browser Acceptance

**Files:**
- Create locally only: `output/playwright/*` (ignored, never committed)

- [x] **Step 1: Run automated gates**

Run `pnpm test:grill`, touched-path ESLint, `pnpm build`, standalone TypeScript and compare it with the recorded baseline. No new errors may appear.

- [x] **Step 2: Run browser matrix**

Start the app and use Playwright CLI at 1440px, 390px, and reduced motion. Execute strong, weak, contradictory, and deck-failure scenarios; verify back/next, validation, refresh, report, download/share, lock, restart, overflow, loading, console, and failed network requests.

- [x] **Step 3: Fix every observed defect with a failing regression test where practical**

Repeat focused tests, build, and affected browser scenarios until clean.

- [x] **Step 4: Commit vertical slice 2**

Stage explicit report/share/UI files and commit `feat: add visual report and demo sharing`.

## Task 8: Review, Documentation, Commit, And Preview

**Files:**
- Create: `docs/V1_DEMO_TO_LIVE_CONVERSION.md`
- Modify: `.agent-os/FUNDME MD OS/fundme_project_os/PROJECT_STATE.md`
- Modify if present: `.agent-os/FUNDME MD OS/fundme_project_os/DECISIONS.md`
- Create: `.agent-os/FUNDME MD OS/fundme_project_os/V1_GRILL_DEMO_PHASE_CONTRACT.md`

- [x] **Step 1: Run independent review**

Review `origin/main...HEAD`, provider boundaries, determinism, evidence grounding, security, mobile UI, browser evidence, Production isolation, and fake-success paths. Resolve every important finding and rerun affected gates.

- [x] **Step 2: Document demo-to-live conversion**

Map anonymous identity to Clerk, browser storage to Supabase, local parsing to Storage/jobs, lexical retrieval to pgvector/embeddings, deterministic templates to a structured AI provider, locked preview to Razorpay, and local share card to persistent shares. Include environment, migration, and test gates.

- [x] **Step 3: Commit final verification slice**

Stage explicit tests/docs/fixes and commit `test: validate grill engine and preview experience`.

- [x] **Step 4: Reverify the Production baseline and push**

Fetch `origin/main`; require SHA `10409284c56f2b5dea968b9e4b727d420b96aaeb`; push only `codex/v1-grill-demo`.

- [x] **Step 5: Verify the one existing-project Preview**

Obtain the stable branch Preview URL from Vercel, confirm `FUNDME_RUNTIME_MODE=demo` by safe branch default or Preview-only variable, run the complete browser matrix there, and fix Preview-only defects on the same branch.

- [x] **Step 6: Prove Production unchanged**

Verify `tryfundme.in` still serves deployment commit `10409284c56f2b5dea968b9e4b727d420b96aaeb`, the Preview is not aliased to the Production domains, and no Production Clerk, Supabase, or Vercel configuration changed.

## Self-Review

- Spec coverage: all objective sections map to Tasks 1-8.
- Placeholders: no `TBD`, deferred implementation, or unspecified error handling remains.
- Type consistency: provider, dossier, artifact, and report names are stable across tasks.
- Scope: one public demo vertical slice; `/app/*`, Production Clerk, Production Supabase, AI providers, and payments remain untouched.
