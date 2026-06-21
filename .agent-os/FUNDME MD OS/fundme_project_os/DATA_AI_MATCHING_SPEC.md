# Data, AI, Assessment, Matching, and Drafting Specification

> Status: Canonical unless marked otherwise  
> Product: Fundme  
> Last updated: 2026-06-21  
> Production baseline: `main` at `c363eb2`, live at `https://tryfundme.in`  
> Rule: Repository and production behavior override stale documents.


## Core data principle

The system's intelligence is the mapping between verified founder/startup evidence and verified opportunity requirements.

`evidence facts + opportunity requirements -> assessment, match, and grounded draft`

## Proposed core entities

### Identity and workspace

- `users`
- `workspaces`
- `workspace_members`

### Founder and startup

- `founder_profiles`
- `startups`
- `startup_sources`
- `source_files`
- `source_chunks`
- `evidence_facts`
- `dossier_versions`

### Intelligence

- `rubric_versions`
- `assessment_runs`
- `assessment_dimension_scores`
- `assessment_findings`
- `match_rule_versions`
- `match_runs`
- `matches`

### Opportunities

- `opportunities`
- `opportunity_sources`
- `opportunity_requirements`
- `opportunity_questions`
- `opportunity_deadlines`
- `opportunity_benefits`

### Applications

- `application_drafts`
- `application_answers`
- `application_versions`
- `applications`
- `application_events`

### Growth and commercial

- `referrals`
- `entitlements`
- `credit_ledger`
- `subscriptions`

## Evidence fact model

Each fact should store:

- normalized field/key;
- value;
- source ID and source fragment;
- extraction method;
- confidence;
- user verification status;
- created and superseded timestamps;
- dossier version.

No AI output may upgrade an inferred value into a verified fact without explicit user confirmation or reliable source evidence.

## Ingestion pipeline

1. Validate upload/URL.
2. Store raw source.
3. Parse text and metadata.
4. OCR only when needed.
5. Split into traceable chunks.
6. Extract structured candidate facts against a strict JSON schema.
7. Deduplicate and identify conflicts.
8. Ask user to resolve low-confidence or contradictory facts.
9. Publish a dossier version.

## Assessment engine

### Deterministic layer

- Required-field completeness.
- Evidence coverage.
- Numerical traction presence and recency.
- Claim/source consistency.
- Narrative specificity checks.
- Contradiction flags.

### Rubric layer

Versioned weighted dimensions. The rubric must include definitions, scoring anchors, required evidence, and examples.

### AI narrative layer

The model explains the structured result, prioritizes actions, and rewrites only when asked. It cannot silently alter scores or facts.

### Output

- Overall readiness band, not a false precision promise.
- Dimension scores.
- Strengths.
- Critical blockers.
- Missing evidence.
- Top three next actions.
- Confidence and limitations.
- Evidence citations.

## Matching engine

### Step 1 - Hard filters

Examples:

- geography/entity restrictions;
- stage;
- sector exclusions;
- founder/student/age requirements where legally and ethically appropriate;
- deadline status;
- incorporation requirements;
- prior funding limits;
- program availability.

### Step 2 - Weighted score

Example components:

- stage fit;
- sector fit;
- geography fit;
- traction/readiness fit;
- founder profile fit;
- program emphasis fit;
- benefit relevance;
- application effort;
- deadline urgency;
- evidence completeness.

Weights and scoring logic are versioned.

### Step 3 - AI explanation

The model explains the stored score and rules in founder language. It must cite the relevant dossier facts and opportunity requirements.

### Step 4 - Feedback

Shortlist, dismiss, applied, and outcome signals feed analysis but do not automatically retrain production behavior without review.

## Application drafting

### Prompt inputs

- question and constraints;
- opportunity emphasis;
- verified evidence facts;
- relevant source fragments;
- prior approved answers;
- tone preference;
- missing information.

### Output contract

- draft answer;
- facts used;
- unsupported/missing items;
- confidence;
- model and prompt version;
- word/character count;
- alternatives where helpful.

### Safety rules

- Never invent numbers, customers, partnerships, funding, achievements, team members, awards, or eligibility.
- Use placeholders or questions for missing data.
- Never claim guaranteed acceptance or funding.
- User retains final submission control.

## AI evaluation

Maintain a versioned test set covering:

- factual extraction accuracy;
- unsupported claim rate;
- contradiction handling;
- match eligibility precision;
- explanation faithfulness;
- draft specificity;
- instruction adherence;
- latency and cost.

No prompt/model change ships without regression evaluation on this set.

## Provider strategy

Use a provider gateway so models can change without rewriting domain logic. Model selection should be task-specific and evaluated on quality, latency, cost, structured-output reliability, and data policy.
