# Analytics, Growth, and Virality

> Status: Canonical unless marked otherwise  
> Product: Fundme  
> Last updated: 2026-06-21  
> Production baseline: `main` at `c363eb2`, live at `https://tryfundme.in`  
> Rule: Repository and production behavior override stale documents.


## Analytics purpose

Analytics exists to answer product decisions, not to produce dashboards for their own sake.

## Identity and properties

Track anonymous visitor ID, Clerk user ID after authentication, workspace/startup ID, acquisition source, experiment assignments, plan/entitlement, and current lifecycle state. Never put raw sensitive dossier text into analytics properties.

## Core event taxonomy

### Acquisition

- `landing_viewed`
- `program_page_viewed`
- `organic_entry_landed`
- `referral_landed`
- `primary_cta_clicked`

### Assessment and dossier

- `assessment_started`
- `source_added`
- `source_parse_completed`
- `source_parse_failed`
- `dossier_generated`
- `dossier_fact_corrected`
- `assessment_submitted`
- `assessment_generated`
- `report_viewed`
- `improvement_action_clicked`

### Matching

- `match_run_completed`
- `match_viewed`
- `match_shortlisted`
- `match_dismissed`
- `program_application_opened`

### Drafting and applications

- `draft_started`
- `draft_generated`
- `draft_fact_requested`
- `draft_edited`
- `draft_exported`
- `application_marked_submitted`
- `application_status_changed`
- `outcome_recorded`

### Commercial and viral

- `paywall_viewed`
- `checkout_started`
- `subscription_started`
- `credits_used`
- `report_shared`
- `referral_invite_sent`
- `referral_activated`

## Funnel metrics

1. Landing to assessment start.
2. Assessment start to complete.
3. Time to first report.
4. Report to dossier correction.
5. Report to match view.
6. Match to shortlist.
7. Shortlist to draft.
8. Draft to submitted.
9. Submitted to recorded outcome.

## Product quality metrics

- Unsupported-claim rate.
- User fact-correction rate.
- Parse failure rate.
- Low-confidence fact rate.
- Ineligible match exposure rate.
- Match dismissal reason distribution.
- Draft regeneration rate.
- Draft edit distance.
- API/job failure rate.
- AI cost per activated founder.

## Retention

- Weekly active founders performing a workflow action.
- Return for a new deadline/opportunity.
- Repeat application drafts.
- Tracker updates.
- Outcome reporting.

## Viral loops

### Shareable assessment

A founder can share a privacy-safe readiness summary or progress score. Private source evidence stays hidden.

### Referral incentive

Invite a founder and unlock a defined credit/action after successful activation, not merely signup.

### Opportunity sharing

Public program pages have clean share cards and useful deadline/context snippets.

### Collaborative review later

Founder can invite a cofounder or advisor to review a draft, creating qualified invitations without building a social feed.

### Outcome loop

Accepted founders may share a verified outcome card or case study, with explicit consent.

## Distribution engine

- Programmatic SEO from verified opportunity data.
- Founder guides and application teardowns.
- Partnerships with accelerators and communities.
- Email deadline and opportunity digest.
- Founder assessment tools as lead magnets.
- Product Hunt and community launches after the real assessment loop exists.

## Experiment discipline

Each experiment must state:

- hypothesis;
- primary metric;
- guardrail metrics;
- audience;
- sample/time requirement;
- implementation owner;
- decision rule;
- cleanup plan.

Do not run simultaneous experiments on the same critical funnel without isolation.
