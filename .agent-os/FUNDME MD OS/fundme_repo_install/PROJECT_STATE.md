# Fundme - Current Project State

> Status: Canonical unless marked otherwise  
> Product: Fundme  
> Last updated: 2026-06-21  
> Production baseline: `main` at `c363eb2`, live at `https://tryfundme.in`  
> Rule: Repository and production behavior override stale documents.


## Verified production baseline

| Item | Current truth |
|---|---|
| Product domain | `tryfundme.in` and `www.tryfundme.in` |
| Production branch | `main` |
| Accepted release | `c363eb2` |
| Release tag | `fundme-early-access-accepted-c363eb2` |
| Framework | Next.js App Router, TypeScript |
| Package manager | pnpm (`pnpm@10.12.4` reported) |
| Hosting | Vercel |
| Authentication | Clerk integration present; full production-instance migration remains a planned platform task |
| Database | Supabase Postgres |
| Current API | `/api/onboarding` persists early-access submissions |
| Routing boundary | Root `proxy.ts` is valid for the reported Next.js 16 codebase |

## What is real and working

- Public marketing homepage.
- Public `/explore` and `/search` opportunity browsing surfaces.
- Four-step founder/startup onboarding.
- Mandatory email and international phone capture.
- Server-side persistence to `onboarding_submissions`.
- `/account-save` handoff to Clerk.
- Protected `/app/*` routes.
- Desktop and 390px mobile acceptance for the accepted release.
- Core CTAs, marquee, footer branding, and hydration stability fixed in the accepted release.

## What exists but must be audited before extension

- Founder profile, startup profile, matches, applications, tracker, program details, workspace, settings, and upload routes under `/app` have existed in prior builds. Their real-versus-demo status must be inspected in the repository before any phase claims them as complete.
- GROQ-backed or critique routes have existed historically. Their current production role, prompt quality, costs, and persistence must be verified.
- The current opportunity directory contains a limited curated dataset. Exact count, source provenance, freshness, and coverage must be verified from the database or source files.

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

## Current strategic state

The landing page is no longer the project. It is the acquisition surface for the product loop:

`diagnose -> improve -> match -> draft -> track -> learn`

## Current highest-priority milestone

**Milestone: Platform foundation plus canonical startup dossier.**

The next implementation work must establish:

1. Clerk production-instance migration and identity sync.
2. Stable staging and environment parity.
3. Observability and analytics baseline.
4. Versioned founder/startup dossier and evidence model.
5. Opportunity schema and data quality workflow.

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
