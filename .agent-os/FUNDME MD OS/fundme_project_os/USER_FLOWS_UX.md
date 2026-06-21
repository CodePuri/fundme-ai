# User Flows and UX Specification

> Status: Canonical unless marked otherwise  
> Product: Fundme  
> Last updated: 2026-06-21  
> Production baseline: `main` at `c363eb2`, live at `https://tryfundme.in`  
> Rule: Repository and production behavior override stale documents.


## Experience promise

Fundme must feel like a serious founder workbench that is actively understanding the startup - not a school form, content directory, or generic chatbot.

## Public route policy

| Route family | Access |
|---|---|
| Homepage, content, opportunity pages, `/explore`, `/search` | Public |
| Assessment entry and minimum pre-value flow | Public where feasible |
| Saved dossier, reports, drafts, tracker, settings | Authenticated |
| Admin | Authorized internal users only |

Authentication must occur after enough value or intent is visible, except where saving private data requires it.

## Flow A - Discover and explore

1. User lands on homepage, article, category page, or opportunity page.
2. User can browse without auth.
3. User sees a clear primary action: assess funding fit.
4. Opportunity pages show truthful source and freshness.
5. User can start an assessment from any relevant page.

## Flow B - Assessment and dossier creation

1. Collect minimum contact and startup context.
2. Ask for website, deck, memo, notes, or prior answers.
3. Show ingestion progress with truthful states.
4. Present extracted dossier for correction.
5. Ask only high-information questions not recoverable from sources.
6. Generate readiness assessment.
7. Save gate occurs before private report persistence if user is not authenticated.

### Required states

- Empty.
- Validating.
- Uploading.
- Parsing.
- Extracting.
- Needs correction.
- Ready to assess.
- Assessing.
- Completed.
- Partial failure with manual continuation.

## Flow C - Improve

1. Assessment names the top weaknesses.
2. Each weakness has evidence and why it matters.
3. User can edit dossier facts or request an improvement draft.
4. Paid boundary appears at a moment of demonstrated intent, not before value.
5. Reassessment shows before/after changes.

## Flow D - Match

1. User chooses Find Matches.
2. System removes hard-ineligible opportunities.
3. Results show fit score, deadline, benefits, effort, and risks.
4. User can shortlist, dismiss, or inspect.
5. Dismiss reasons are captured for learning.

## Flow E - Program detail and drafting

1. Show verified program information.
2. Show why the startup fits and where it is weak.
3. Show required materials and questions.
4. Generate a draft only from verified dossier facts.
5. Mark missing claims and request user input.
6. Save versions and completion state.
7. Export/copy or later assist with form entry.

## Flow F - Tracker

1. Dashboard groups applications by next action and urgency.
2. User sees deadlines, missing work, and response state.
3. User records interview, rejection, acceptance, or withdrawal.
4. System learns from outcomes without making unsupported causal claims.

## UX principles

- One dominant action per screen.
- Show progress and outcome, not administrative step count alone.
- Never hide uncertainty.
- Ask fewer but higher-information questions.
- Preserve user work automatically.
- Make corrections easy and reversible.
- Keep public discovery fast and ungated.
- Locked features may be previewed, but must not masquerade as functional.
- No dead buttons, fake loading states, or demo numbers represented as user-specific output.

## Error behavior

Every error must provide:

1. what failed;
2. whether user data is safe;
3. what can be retried;
4. a manual fallback when possible;
5. a trace/error ID for support on server failures.

## Design freeze rule

Do not redesign the full visual system until dossier, assessment, matching, drafting, and tracking work. Design work is allowed when it removes usability, accessibility, credibility, or conversion blockers.
