# Master Product Requirements Document

> Status: Canonical unless marked otherwise  
> Product: Fundme  
> Last updated: 2026-06-21  
> Production baseline: `main` at `c363eb2`, live at `https://tryfundme.in`  
> Rule: Repository and production behavior override stale documents.


## 1. Product outcome

Fundme must enable a founder to move from fragmented startup materials to a credible, tracked application for a relevant opportunity without repeatedly rebuilding context.

## 2. Primary personas

### Persona A - Active applicant

- Applying to multiple accelerators/fellowships within 90 days.
- Has a deck and website, but inconsistent answers.
- Highest-value initial persona.

### Persona B - Underprepared founder

- Has an idea/product but weak positioning and missing evidence.
- Needs diagnosis and improvement before matching.

### Persona C - International or India-first founder

- Needs help navigating geography, entity, sector, stage, and program-specific eligibility.

### Future persona D - Program or ecosystem operator

- Wants qualified, structured founder submissions.
- Not an MVP user.

## 3. Core capabilities

### Capability 1 - Public opportunity intelligence

**Requirements**

- Browse without authentication.
- Search and filter by category, geography, stage, sector, funding/benefit type, equity model, deadline status, and format.
- Each opportunity has a canonical public page.
- Every record displays source, last verified date, and application status.
- Program pages contain requirements, benefits, deadline, application link, likely emphasis, and caveats.

**Acceptance**

- Public URL returns 200 and is indexable.
- Filters are URL-addressable where useful.
- Stale or uncertain information is clearly marked.
- No program is represented as active without verification rules.

### Capability 2 - Founder and startup dossier

**Requirements**

- Founder can create a startup workspace.
- Intake supports manual fields, website URL, pitch deck PDF, memo/notes, and prior application answers.
- Extracted values are editable.
- Each extracted fact stores source, confidence, and verification state.
- Missing facts are explicit.
- Dossier is versioned.

**Acceptance**

- Founder can correct extraction without losing original source.
- The system never invents traction, achievements, customer names, funding, or eligibility.
- A user can see why a fact exists and where it came from.

### Capability 3 - Funding readiness assessment

**Requirements**

- Score only defined dimensions with a versioned rubric.
- Separate deterministic checks from narrative AI explanation.
- Output strengths, blockers, missing evidence, priority actions, and confidence.
- Cite dossier facts or source fragments.
- Allow reassessment after edits.

**Initial dimensions**

- Founder credibility and unfair advantage.
- Problem clarity.
- Solution clarity.
- Market and ICP specificity.
- Traction and proof.
- Team completeness.
- Differentiation/moat.
- Why now.
- Program readiness.
- Evidence completeness.

**Acceptance**

- Same input and rubric version produce materially consistent structured results.
- Unsupported claims are never included as facts.
- Founder can understand the top three actions in under one minute.

### Capability 4 - Matching

**Requirements**

- Hard eligibility rules run before scoring.
- Weighted scoring is transparent and versioned.
- AI explains an existing score; it does not invent the score.
- Match view shows fit, eligibility, risks, missing requirements, deadline, and effort.
- User can dismiss or shortlist and provide a reason.

**Acceptance**

- Ineligible opportunities are not presented as strong matches.
- Every score is reproducible from stored inputs and rule version.
- Explanations cite the contributing facts and requirements.

### Capability 5 - Application workspace

**Requirements**

- Import or maintain program question schema.
- Map each question to relevant verified facts.
- Draft answers in the founder's chosen tone.
- Flag unsupported or missing evidence.
- Allow manual editing, version history, copy/export, and completion state.
- Show attachments checklist.

**Acceptance**

- Generated answers contain no unsupported metrics or achievements.
- User can inspect the facts used.
- Drafts are specific to the opportunity, not generic startup prose.

### Capability 6 - Tracker

**Statuses**

`discovered -> shortlisted -> drafting -> ready -> submitted -> interview -> rejected | accepted | withdrawn`

**Requirements**

- Deadline and next action.
- Notes and activity timeline.
- Draft/version links.
- Outcome and reason capture.
- Optional email response signals later.

**Acceptance**

- User can answer "what should I do next?" from the dashboard.
- Outcome data can feed future matching and assessment analysis.

### Capability 7 - Admin and data operations

- Create, edit, deactivate, verify, and source opportunities.
- See stale records and upcoming deadlines.
- Maintain question schemas and requirements.
- Review user-reported corrections.
- Audit AI prompt/rubric versions and failures.

## 4. Non-functional requirements

- Mobile usable at 390px.
- WCAG-oriented keyboard, focus, contrast, and semantic behavior.
- Server-side secrets never shipped to browser.
- User-specific data protected by authorization and RLS.
- P95 public page target under 2.5 seconds on realistic mobile where feasible.
- Long AI jobs must survive client disconnects once asynchronous processing is introduced.
- Every critical write must be idempotent or duplicate-safe.
- Every AI output records model, prompt version, input version, timestamp, cost, latency, and status.

## 5. Monetization requirements

### Free

- Public exploration.
- One startup dossier.
- Limited assessment report.
- Limited matches.
- Limited draft preview.

### Paid intent trigger

`Fix this for me` after the user sees a specific weakness.

### Pro direction

- Full assessment and revisions.
- More matches and filters.
- Full application drafting and versioning.
- Tracker, reminders, and exports.
- Recurring credits for expensive AI actions.

Pricing is not locked and must be tested after real activation data.

## 6. Product exclusions until earned

- Full autonomous application submission.
- Broad government-grant coverage without structured compliance support.
- Mass investor outreach.
- Investor CRM.
- Community/social feed.
- Startup idea entertainment scores.
- Multi-user enterprise collaboration unless demanded.

## 7. Success metrics

- Assessment start to completion.
- Time to first useful result.
- Dossier completion and correction rate.
- Match shortlist rate.
- First draft generated.
- Draft completion/export.
- Application marked submitted.
- Weekly return rate.
- Outcome capture rate.
- Unsupported-claim rate.
