# V1 Demo to Live Conversion

## Conversion Rule

Replace one adapter boundary at a time. Keep `fundme-v1-demo-rubric@1` as the regression oracle until the corresponding live provider has contract, integration, security, and browser tests. Never point a demo adapter at Production data.

The accepted demo baseline is Preview code SHA `5722fe8ba21726d7ddc0fb0e41b8f935fbd97dc7`. Each live change must preserve that behavior in demo mode and use non-Production services until its gate passes.

| Demo adapter | Live replacement | Required environment | Data migration | Test gate |
| ------------ | ---------------- | -------------------- | -------------- | --------- |
| Anonymous local session identity | Clerk-backed `IdentityProvider` with server-verified user and organization IDs | Production Clerk publishable/secret keys scoped through existing secret management | Map opted-in local reports only through an explicit authenticated import; never infer ownership | Signed-in, signed-out, expired-session, organization-boundary, and IDOR tests |
| Versioned browser `AssessmentRepository` | Supabase repository with user-owned assessments, reports, and RLS | Supabase URL, server key handling, migrations, and least-privilege client key | Add versioned tables, backfill only user-confirmed imports, and retain local schema migration support | Migration, RLS, cross-user isolation, persistence-failure, and refresh tests |
| In-request PDF/TXT `ArtifactProcessor` | Private object storage plus queued extraction, OCR, malware scanning, and processing status | Private storage bucket, signed-upload service, queue/worker credentials, scanner, and retention policy | Upload only after consent; record checksum, owner, status, extractor version, and deletion deadline | Unsafe type, oversize, malware, OCR, retry, timeout, ownership, deletion, and no-fabrication tests |
| Versioned local lexical `KnowledgeRetriever` | Curated corpus in Postgres with pgvector/embeddings and lexical fallback | Embedding provider, pgvector extension, corpus ingestion job, and corpus version | Ingest reviewed corpus chunks with source, license, version, and deprecation metadata | Ranking fixtures, provenance, tenant isolation, corpus-version, fallback, and latency tests |
| Deterministic local recommendation generator | Structured AI provider behind `GrillEngine`/recommendation contract | Approved AI provider key, model allowlist, schema validation, redaction, rate limits, and observability | Preserve deterministic report fields; store model/version/prompt hashes only with consent | JSON-schema, prompt-injection, evidence-citation, no-fabrication, retry, cost, and deterministic fallback tests |
| Always-locked `OptimizationEntitlementProvider` | Razorpay order, webhook, and entitlement service | Razorpay keys, webhook secret, product/price config, tax/refund policy | Create entitlement records from verified idempotent webhooks; no client-side unlock authority | Signature, replay, duplicate, refund, failed-payment, price-integrity, and authorization tests |
| Client-generated local share card | Authorized persistent share-report service with revocation and expiry | Private report store, signing key, public share domain, retention/abuse controls | Publish only a user-selected redacted snapshot; default private; support revoke and expiry | PII redaction, unpredictable IDs, authorization, expiry, revocation, crawler metadata, and abuse tests |

## Ordered Implementation Contract

1. Implement Clerk identity mapping and authorization tests without changing the demo route default. `IdentityProvider` must return a server-verified immutable Clerk user ID, optional organization ID, and explicit anonymous/authenticated state; reject forged client identity and fail closed on invalid or expired sessions.
2. Add Supabase assessment/report schema and RLS in a non-Production environment; pass migration and isolation gates.
3. Move artifact persistence and extraction to private storage/jobs with lifecycle controls.
4. Add versioned pgvector retrieval while retaining lexical fallback and provenance.
5. Introduce structured AI recommendations with evidence citations and deterministic fallback.
6. Add Razorpay entitlements from verified webhooks; keep the Preview lock until the full payment gate passes.
7. Add explicit, redacted, revocable persistent sharing.
8. Run full staging acceptance, security review, migration rehearsal, and rollback rehearsal before any Production cutover.

## First Live Slice Exit Gate

The next implementation slice ends only when signed-in, signed-out, expired-session, and organization-boundary tests pass; the authenticated user ID is available to server repository operations; demo mode remains anonymous and deterministic; and no Production Clerk, Supabase, alias, or environment state has changed. The following slice may then add versioned `assessments`, `reports`, and ownership tables with owner-scoped RLS in a non-Production Supabase project.

## Accepted Demo Evidence

- 66 focused tests, clean build, zero touched-path lint errors, and no new standalone TypeScript errors.
- Preview browser matrix passed strong, weak, contradictory, and corrupt-deck inputs at desktop, mobile, and reduced-motion settings.
- All four analysis requests returned 200; no failed application requests, console errors, page errors, overflow, fabricated deck content, or fake persistence/share success remained.
- Independent adversarial review found no open P1/P2 issues after regressions for zero revenue, oversized strings, unsupported claim context, and cross-tab conflict handling.
- `https://tryfundme.in` remained Ready on SHA `10409284c56f2b5dea968b9e4b727d420b96aaeb` and the Preview had no Production alias.

## Current Demo Limits

The Preview is single-browser and anonymous. Files are processed only for the active request. Image-only PDFs may be unavailable. Reports are not synced, publicly hosted, or recoverable after local storage is cleared. Optimization output is intentionally locked and no payment is accepted.
