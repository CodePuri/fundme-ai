# Fundme - Current Project State

> Status: Canonical unless marked otherwise
> Product: Fundme
> Last updated: 2026-06-21
> Repository root: `/Users/totem/Desktop/Projects/Fundme` (flattened; `Codex/` eliminated)
> Production baseline: `main` at `c363eb2`, live at `https://tryfundme.in`
> Current repository HEAD: `61a14c16316e80241fb688575eebc68e9fcc3163`
> Rule: Repository and production behavior override stale documents.


## Verified production baseline

| Item | Current truth |
|---|---|
| Product domain | `tryfundme.in` and `www.tryfundme.in` |
| Production branch | `main` |
| Accepted production release SHA | `c363eb2` |
| Release tag | `fundme-early-access-accepted-c363eb2` |
| Current repository HEAD | `61a14c16316e80241fb688575eebc68e9fcc3163` |
| Framework | Next.js 16 App Router, TypeScript |
| Package manager | pnpm v10.12.4 |
| Hosting | Vercel |
| Authentication | Clerk (development instance; production migration pending) |
| Database | Supabase Postgres |
| Current API | `/api/onboarding` persists early-access submissions |
| Middleware | Root `proxy.ts` (Next.js 16 convention) |
| Build tool | Tailwind CSS v4 (no `postcss.config.mjs`; Next.js handles Tailwind natively) |

## Repository structure change

The repository was flattened on 2026-06-21. The Next.js application previously lived in `Codex/` and now lives at the repository root. All paths referencing `Codex/` are obsolete.

## Capability truth matrix

| Capability | Status | Evidence |
|---|---|---|
| Production landing page | PRODUCTION | Live at `tryfundme.in`, static render |
| Four-step onboarding flow | PRODUCTION | `/onboarding` with Supabase persistence via `/api/onboarding` |
| Clerk authentication | PARTIAL | Sign-in/sign-up routes exist; using development instance, not production Clerk |
| Supabase persistence | PARTIAL | Only `onboarding_submissions` table; no application data tables |
| Explore page | PRODUCTION | `/explore` renders curated program data from `lib/startup-programs.ts` |
| Search page | PRODUCTION | `/search` with client-side filtering |
| Opportunity data | PARTIAL | ~50 curated programs in `lib/startup-programs.ts`; no database table, no admin |
| Public program detail pages | PRODUCTION | `/search/[slug]/draft` renders program details |
| Assessment engine | MOCK | `/assessment/*` routes exist with `AssessmentProvider` client-side state; no real AI assessment |
| Matching engine | MOCK | `/app/matches` and `/matches` exist with `DemoProvider` mock data |
| Application drafting | MOCK | `/app/workspace/[slug]` exists with `DemoProvider` mock data |
| Tracker | MOCK | `/app/tracker` exists with `DemoProvider` mock data |
| Founder profile | MOCK | `/app/founder-profile` exists with `DemoProvider` mock state |
| Startup profile | MOCK | `/app/startup-profile` exists with `DemoProvider` mock state |
| Analytics | NOT BUILT | No analytics SDK or event tracking |
| SEO metadata | PARTIAL | OG tags and structured data in root layout; `robots.ts` and `sitemap.ts` exist |
| AEO | NOT BUILT | No Answer Engine Optimization |
| Sitemap | PARTIAL | `app/sitemap.ts` exists (needs audit of generated URLs) |
| Robots | PARTIAL | `app/robots.ts` exists (needs audit) |
| Structured data | PARTIAL | JSON-LD `WebApplication` in root layout |
| `llms.txt` | NOT BUILT | No `llms.txt` file |
| Referrals | NOT BUILT | No referral system |
| Monetization | NOT BUILT | No billing, credits, or entitlements |
| Monitoring | NOT BUILT | No error monitoring or structured logging |
| Automated QA | NOT BUILT | `tests-acceptance/` directory exists but no automated test suite |
| API `/api/roast` | PARTIAL | Legacy GROQ-based critique endpoint; role and cost unverified |
| API `/api/env` | PARTIAL | Debug endpoint exposing service role key length; should be removed or secured |

## What is real and working

- Public marketing homepage.
- Public `/explore` and `/search` opportunity browsing surfaces.
- Four-step founder/startup onboarding.
- Mandatory email and international phone capture.
- Server-side persistence to `onboarding_submissions`.
- `/account-save` handoff to Clerk.
- Protected `/app/*` routes.
- Desktop and 390 px mobile acceptance for the accepted release.
- Core CTAs, marquee, footer branding, and hydration stability fixed in the accepted release.

## What exists as client-side demo only

- Founder profile, startup profile, matches, applications, tracker, workspace, settings, and upload routes under `/app` are wrapped in `DemoProvider` and use client-side mock state from `lib/demo-data.ts`. They are not connected to real persistence.
- Assessment flow (`/assessment/*`) uses `AssessmentProvider` with client-side state. No real AI assessment runs.

## What is not yet the real product

- No canonical startup dossier with versioned evidence.
- No production document and website ingestion pipeline.
- No versioned funding-readiness assessment engine.
- No deterministic eligibility and weighted matching engine tied to verified opportunity requirements.
- No evidence-grounded, program-specific application drafting workflow.
- No complete application tracker with reminders and outcome learning.
- No production analytics taxonomy and decision dashboard.
- No systematic SEO/AEO and opportunity-page publishing engine.
- No referral or viral loop.
- No production monetization architecture.
- No selective application automation.

## Current active phase

Phase 1: Platform Foundation. In progress.

## Frozen items

Until the functional core exists:

- No broad visual redesign.
- No autonomous browser application bot.
- No broad government-grants engine.
- No investor CRM or mass outreach product.
- No social/community layer.
- No ungrounded AI scoring.
- No additional landing-page polish unless it fixes a measured conversion, trust, accessibility, or usability defect.

## Known operational lessons

- Do not create a new branch or Preview deployment for every micro-fix.
- Do not treat code inspection as browser verification.
- Do not declare PASS without executed evidence.
- Preview and Production environment variables must be managed deliberately; branch-specific Preview overrides can create drift.
- Elevated Supabase keys must remain server-side and never appear in client bundles, documents, screenshots, or logs.
- The `postcss.config.mjs` was removed during restructuring because Tailwind CSS v4 with Next.js 16 handles PostCSS natively. The backup `postcss.config.mjs.bak` remains for reference.
