# FundMe Commercial Funnel Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the functional Grill stub's long mentor-first journey and oversized report with a compact, truthful value-before-auth funnel that demonstrates FundMe's diagnosis and opportunity moat in the existing branch Preview.

**Architecture:** Keep the versioned browser-local assessment session and deterministic rubric. Route a validated intake through a real deterministic analysis state into a compact diagnosis, then offer either configured Clerk sign-in or an explicitly local Preview profile. Store only founder-supplied local Preview data and deterministic fixture matches; do not add Production persistence, matching, payments, or a second auth system.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Clerk 6, Node 24 test runner, existing Vercel Git integration.

**Execution:** Inline in the existing `product/v1-grill` worktree after Aakash's explicit `AUTHORIZE UX REBUILD`; no additional design approval pause.

---

### Task 1: Lock the new route, state, and evidence contract

**Files:**
- Modify: `tests/assessment/routes.test.mjs`
- Modify: `tests/assessment/session-contract.test.mjs`
- Modify: `tests/assessment/engine.test.mjs`
- Modify: `lib/assessment/types.ts`
- Modify: `lib/assessment/validation.ts`
- Modify: `lib/assessment/engine.ts`

- [ ] Add failing tests for intake → analyzing → result, compatibility redirects, exact public-route boundaries, evidence-derived scoring, no-deck disclosure, and strong/weak deterministic fixture separation.
- [ ] Run the focused tests and record RED.
- [ ] Extend the existing session/engine coherently without fabricating evidence or weakening corruption recovery.
- [ ] Run the focused tests and record GREEN.

### Task 2: Build the minimal intake and truthful analysis route

**Files:**
- Modify: `components/assessment/assessment-provider.tsx`
- Modify: `components/assessment/assessment-shell.tsx`
- Modify: `components/assessment/intake-grid.tsx`
- Modify: `app/assessment/page.tsx`
- Modify: `app/assessment/analyzing/page.tsx`
- Create: `components/assessment/analysis-progress.tsx`

- [ ] Add failing source-contract tests for one-screen intake, optional deck/profile evidence, accessible errors, and real processing states.
- [ ] Submit the minimum context directly to `/assessment/analyzing`.
- [ ] Generate the deterministic report once and recover safely after refresh or invalid state.
- [ ] Redirect legacy review/mentor routes to the nearest safe funnel step.

### Task 3: Rebuild the diagnosis around commercial value

**Files:**
- Modify: `components/assessment/funding-readiness-report.tsx`
- Modify: `app/assessment/result/page.tsx`
- Create: `lib/assessment/preview-matches.ts`
- Create: `tests/assessment/commercial-funnel.test.mjs`

- [ ] Add failing tests for the compact score hero, dense dimension grid, paired gaps/actions, deterministic match teaser, download/share, and no empty-analysis claims.
- [ ] Implement the compact diagnosis using the existing FundMe tokens and components.
- [ ] Place the saved-assessment / see-matches action only after value is visible.
- [ ] Label fixture counts and opportunity data as Preview data, never live verified matching.

### Task 4: Add the honest auth handoff and minimal Preview workspace

**Files:**
- Modify: `components/providers/route-clerk-provider.tsx`
- Modify: `lib/assessment/public-routes.ts`
- Modify: `components/app/dashboard-frame.tsx`
- Create: `app/app/preview/page.tsx`
- Create: `components/assessment/preview-dashboard.tsx`
- Modify: `tests/assessment/routes.test.mjs`

- [ ] Add failing tests for exact `/app/preview` public boundaries and continued protection of private `/app/*` routes.
- [ ] Use Clerk only when its publishable key is configured; otherwise provide a clearly labelled browser-local Preview profile.
- [ ] Render a compact saved-assessment workspace without the legacy large dashboard/sidebar.
- [ ] Keep optimization actions locked and labelled; add no payment or fake persistence.

### Task 5: Clarify Explore entry without broad redesign

**Files:**
- Modify: `components/startup-programs/search-shell.tsx`
- Modify: `app/search/page.tsx`
- Modify: `tests/assessment/routes.test.mjs`

- [ ] Route the assessment entry CTA to `/assessment`.
- [ ] Clarify the four opportunity categories while preserving existing search behavior and data boundaries.
- [ ] Verify keyboard focus, responsive wrapping, and exact route matching.

### Task 6: Verify, review, and update the existing branch Preview

**Files:**
- Modify only the active canonical phase/state documents when verified state materially changes.

- [ ] Run all assessment tests, changed-scope ESLint, the recorded TypeScript baseline, and `pnpm build`.
- [ ] Run one bounded code/security review over the implementation and evidence.
- [ ] Stage explicit files only and create a clearly reported Preview checkpoint commit.
- [ ] Push only `product/v1-grill`; allow existing Vercel Git integration to update the branch Preview.
- [ ] Test homepage, assessment, analyzing, result, auth fallback, Preview workspace, Explore, desktop, 390px mobile, reduced motion, console, and network.
- [ ] Recheck `https://tryfundme.in` and prove Production still resolves to `10409284c56f2b5dea968b9e4b727d420b96aaeb`.
- [ ] Stop for Aakash's visible review without merging or promoting.
