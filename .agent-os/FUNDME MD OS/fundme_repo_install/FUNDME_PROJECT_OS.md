# Fundme Project Operating System

> Status: Canonical unless marked otherwise  
> Product: Fundme  
> Last updated: 2026-06-21  
> Production baseline: `main` at `c363eb2`, live at `https://tryfundme.in`  
> Rule: Repository and production behavior override stale documents.


## Portable context

Fundme is a founder application intelligence platform. A founder provides startup and founder context through forms, URLs, a deck, memos, notes, or prior answers. Fundme converts that context into a structured, editable dossier; diagnoses weaknesses; identifies relevant opportunities; explains fit and eligibility; drafts grounded application answers; and tracks progress.

The core loop is:

`ingest -> evidence -> dossier -> diagnose -> improve -> match -> draft -> track -> outcome learning`

## Product hierarchy

### Layer 1 - Acquisition and public intelligence

- Homepage and onboarding entry.
- Public opportunity discovery.
- Program pages and educational content.
- Search, SEO, AEO, shareable reports, referrals.

### Layer 2 - Founder source of truth

- Founder profile.
- Startup dossier.
- Source uploads and URLs.
- Evidence facts, confidence, and missing information.
- Version history.

### Layer 3 - Intelligence

- Readiness assessment.
- Opportunity eligibility and fit.
- Program-specific emphasis.
- Application answer grounding.
- Confidence and explanation.

### Layer 4 - Execution

- Draft workspace.
- Attachments checklist.
- Status tracker.
- Deadlines and reminders.
- Response and outcome capture.

### Layer 5 - Monetization and network

- Paid improvements and drafts.
- Credits for heavy AI or execution actions.
- Referrals and shared reports.
- Selective automation.
- Program-manager and investor surfaces after critical mass.

## Canonical user journey

1. Founder discovers Fundme through a program page, search result, partner, referral, or homepage.
2. Founder explores relevant opportunities without authentication.
3. Founder starts an assessment and provides minimum context.
4. Fundme creates or updates a saved startup dossier.
5. Fundme produces an evidence-backed readiness report.
6. Founder edits missing or incorrect dossier facts.
7. Fundme shows qualified opportunities with fit reasons and risks.
8. Founder opens one opportunity and sees requirements, missing information, and application questions.
9. Fundme generates grounded draft answers.
10. Founder edits, saves, exports, and marks the application status.
11. Fundme tracks deadlines, responses, and outcomes.
12. Outcomes improve future recommendations and benchmark intelligence.

## Product stages

### Stage A - Functional early access

Already live: marketing, onboarding, public directory, Supabase submission, Clerk handoff.

### Stage B - Minimum lovable intelligence product

- Saved startup dossier.
- Real readiness assessment.
- Explainable matching.
- One complete program application workspace.
- Tracker.

### Stage C - Growth and monetization

- Programmatic opportunity pages.
- Content and backlink engine.
- Paid fixes and drafting.
- Referrals and shared reports.
- Lifecycle communication.

### Stage D - Execution and network

- Selective autofill.
- Email/status sync.
- Program-manager data portal.
- Curated founder discovery.

## Decision framework

When an agent faces an ambiguous choice, it should prefer the option that:

1. strengthens the dossier-to-application loop;
2. preserves verified user evidence;
3. reduces future rework;
4. is observable and testable;
5. does not require broad infrastructure before demand;
6. avoids weakening public discovery or private data boundaries;
7. can be explained to a founder in plain language.

## Autonomy boundary

Agents may autonomously choose implementation details, refactor within scope, add tests, repair related defects, and improve internal abstractions. They may not silently change product positioning, pricing, route access policy, data retention, security boundaries, production release policy, or the phase order.

## Definition of a finished feature

A feature is complete only when:

- the real user journey works in browser;
- data persists correctly;
- errors and empty states are designed;
- analytics events exist;
- accessibility and mobile are checked;
- tests cover the critical path;
- documentation and `PROJECT_STATE.md` are updated;
- no mock behavior is represented as real;
- a reviewer independently validates the outcome.
