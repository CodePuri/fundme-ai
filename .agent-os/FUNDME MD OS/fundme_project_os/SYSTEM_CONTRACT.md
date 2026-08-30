# System Contract

## Architecture principle

Build a modular monolith with production-shaped adapters.

Do not create microservices for V1.

## Runtime modes

```text
demo
live
```

Demo mode:

- isolated from Production
- clearly labelled
- deterministic
- no Production secrets
- no silent database writes
- no fake successful live behavior

Live mode:

- fails safely when configuration is absent
- never falls back silently to demo
- uses verified identity, persistence, storage and providers

## Core domains

### Identity

Default:

```text
one Clerk user
→ one founder profile
→ one or more startup profiles
```

No Supabase Auth in parallel.
No generic workspace abstraction in V1.

### Dossier

Founder and startup facts normalized from:

- user input
- voice transcript
- website
- deck
- founder profile/resume
- LinkedIn text
- notes

### Evidence

Every important value contains:

- ID
- source type
- source label
- raw value
- normalized value
- submitted/extracted/inferred state
- confidence
- founder confirmation
- timestamp
- artifact/session reference

Inference is a hypothesis until confirmed.

### Conversation

Events:

- user text
- voice transcript
- mentor acknowledgement
- mentor question
- answer
- evidence proposed
- evidence confirmed
- contradiction detected
- question skipped
- session state change
- error and retry

### Artifacts

Types:

- pitch deck
- founder profile/resume
- profile text
- notes
- website snapshot

States:

- selected
- validating
- accepted
- rejected
- uploading
- parsing
- partial
- parsed
- failed

### Assessment

Versioned rubric dimensions:

1. Founder credibility
2. Founder-market fit
3. Problem clarity
4. Solution clarity
5. Market quality
6. Differentiation
7. Product maturity
8. Traction and proof
9. Funding narrative
10. Pitch-deck readiness
11. Founder/LinkedIn positioning

### Findings

- strength
- red flag
- contradiction
- unsupported claim
- missing evidence
- recommendation

Each finding includes:

- severity
- dimension
- explanation
- evidence references
- action
- confidence

### Retrieval

Corpus record:

- stable ID
- title
- provenance
- source URL/reference
- license/permission
- source type
- category
- stage
- tags
- guidance
- verification date

Initial retrieval may be deterministic lexical/tag based.
The report contract must remain compatible with later pgvector retrieval.

## Provider boundaries

Use interfaces only where they serve a current adapter:

- `IdentityProvider`
- `FounderStartupRepository`
- `ArtifactProcessor`
- `ConversationProvider`
- `AssessmentEngine`
- `KnowledgeRetriever`
- `ReportRepository`
- `ReferralRepository`
- `EntitlementProvider`

Do not implement live adapters until their phase.

## Report contract

Report consumers receive structured data, not raw model prose.

Required metadata:

- assessment ID
- rubric version
- model/provider versions where used
- evidence coverage
- confidence
- retrieved source IDs
- generated timestamp
- partial/complete state

## Production durability requirements

Before payments:

- Clerk Production complete
- ownership and claim flow complete
- Supabase RLS tested
- migrations repeatable
- backups and restore verified
- service role server-only
- storage private
- webhook signatures verified
- idempotent payment processing
- durable entitlements
- monitoring and rollback
