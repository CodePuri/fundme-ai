# Delivery Roadmap and Phase Build Plan

> Status: Canonical unless marked otherwise  
> Product: Fundme  
> Last updated: 2026-06-21  
> Repository root: `/Users/totem/Desktop/Projects/Fundme`  
> Production baseline: `main` at `c363eb2`, live at `https://tryfundme.in`  
> Rule: Repository and production behavior override stale documents.


## Delivery model

Aggressive target with two bounded autonomous workstreams: **8 weeks**. A single serial agent should expect **10-12 weeks**.

The calendar below assumes kickoff on 2026-06-22 and prioritizes a functional beta over redesign.

## Calendar

| Phase | Dates | Outcome |
|---|---|---|
| Phase 0 | Jun 22-24 | Canonical docs, repo truth audit, backlog lock |
| Phase 1 | Jun 25-30 | Clerk production, stable staging, observability, analytics baseline |
| Phase 2A | Jul 1-10 | Opportunity schema, admin, data expansion, SEO foundations |
| Phase 2B | Jul 1-12 | Startup dossier, uploads, extraction, evidence model |
| Phase 3 | Jul 13-21 | Versioned readiness assessment engine |
| Phase 4 | Jul 22-30 | Eligibility and explainable matching engine |
| Phase 5 | Jul 31-Aug 9 | Program application workspace and grounded drafting |
| Phase 6 | Aug 10-16 | Tracker, reminders, outcome capture, retention |
| Phase 7 | Aug 17-23 | Monetization, referrals, lifecycle, beta hardening |
| Beta gate | Aug 24 | Functional private/public beta candidate |

Dates are targets, not permission to skip exit gates.

## Phase 0 - Truth lock

**Deliverables**

- Install this operating system in repo.
- Audit current routes, components, data, APIs, env names, and mocks.
- Update `PROJECT_STATE.md` with repository evidence.
- Create a single prioritized backlog.
- Classify old documents as canonical, superseded, or archive.

**Exit gate**

A new agent can identify current production truth and next work without reading chat history.

## Phase 1 - Platform foundation

**Deliverables**

- Clerk production instance, domain, OAuth, paths, webhooks, and branding.
- Clerk-to-Supabase user sync.
- Persistent staging environment and branch policy.
- Environment parity checklist.
- Error monitoring and structured logging.
- Analytics SDK and core events.
- Database migration baseline and RLS audit.
- Secret-key migration plan.

**Exit gate**

Production auth works across clean browsers/devices; staging is stable; critical failures are observable.

## Phase 2A - Opportunity data and discovery

**Deliverables**

- Canonical opportunity schema.
- Admin CRUD and verification queue.
- Curated expansion of India/global opportunities.
- Public canonical opportunity pages.
- Categories and internal linking.
- Metadata, robots, sitemap, structured data, Search Console.
- Experimental `llms.txt`.

**Exit gate**

At least 100 high-quality opportunities are structured and source-verifiable, or a smaller number if quality cannot be maintained. Public pages are indexable and useful.

## Phase 2B - Startup dossier and ingestion

**Deliverables**

- Authenticated startup workspace.
- Website, document, and text source intake.
- Storage and parsing.
- Evidence facts with confidence and source trace.
- Editable founder and startup dossier.
- Version history.

**Exit gate**

A founder can create, correct, and save a reusable evidence-backed dossier from imperfect inputs.

## Phase 3 - Assessment engine

**Deliverables**

- Versioned rubric.
- Deterministic completeness and evidence checks.
- Model-generated explanation grounded in findings.
- Report UI and saved versions.
- Reassessment after edits.
- Evaluation dataset.

**Exit gate**

Ten representative QA cases pass factuality and consistency review; no unsupported claims in critical fields.

## Phase 4 - Matching

**Deliverables**

- Eligibility rule engine.
- Weighted scoring.
- Match explanation.
- Risks and missing requirements.
- Shortlist/dismiss feedback.
- Match-run versioning.

**Exit gate**

Known ineligible fixtures are excluded; relevant fixtures rank sensibly; scores are reproducible.

## Phase 5 - Application workspace

**Deliverables**

- Question schema and program requirements.
- Evidence retrieval per question.
- Grounded drafts with missing-information flags.
- Editing, autosave, versioning, export/copy.
- Attachment checklist.

**Exit gate**

A founder can complete one real accelerator/fellowship application package end to end without invented facts.

## Phase 6 - Tracker and retention

**Deliverables**

- Application statuses and timeline.
- Deadline and next action.
- Notifications/reminders.
- Outcome capture.
- Weekly opportunity and task digest.
- Optional Gmail response-signal prototype behind a flag.

**Exit gate**

Users can manage active applications and know the next action from one dashboard.

## Phase 7 - Monetization and virality

**Deliverables**

- Entitlement and credit model.
- Payment integration.
- Paid improvement and drafting actions.
- Shareable assessment summary.
- Referral loop.
- Lifecycle messaging.
- Conversion and retention dashboards.

**Exit gate**

The product can charge for a demonstrated intent moment and attribute acquisition-to-value.

## Phase 8 - Later, evidence-gated

- Selective autofill.
- Full agentic submission for approved portals.
- Broad grant-specific workflows.
- Program-manager portal.
- Investor/scout surfaces.
- Team collaboration.

## Parallel ownership

### Product engine

Dossier, assessment, matching, drafting, tracker.

### Distribution engine

Opportunity data, public pages, SEO, content, partnerships, referrals.

### Platform quality

Auth, data, analytics, monitoring, security, tests, release.

Only one agent may write within the same domain at a time.

## Weekly operating cadence

- Monday: current-state sync, phase scope, metrics.
- Daily: agent check-in through updated task log, not repeated user approvals.
- Midweek: integration and reviewer pass.
- Friday: accepted increments, docs update, metrics, risks, next contracts.
