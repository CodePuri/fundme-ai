# V1 Grill Demo Phase Contract

## Status

Accepted branch-only Preview on `codex/v1-grill-demo`, code SHA `5722fe8ba21726d7ddc0fb0e41b8f935fbd97dc7`. This document does not describe a Production release.

## V1 Outcome

Prove the complete Funding Grill experience with real browser intake, bounded server PDF parsing, deterministic scoring, evidence-grounded findings, prioritized actions, a locked optimization preview, local refresh persistence, and private share/download actions.

## Included

- Public `/grill` four-step intake and `/grill/result` report.
- Public `/api/grill/analyze` Node.js route with bounded multipart processing.
- Founder/startup fields, profile text or document, and pitch-deck PDF evidence.
- `fundme-v1-demo-rubric@1`, ten dimensions, lexical corpus retrieval, contradictions, unsupported claims, and missing-evidence findings.
- Browser-local schema version 1 persistence and anonymous local session identity.
- 1200x630 downloadable share card, copy summary, Web Share API with fallback, and no public report URL.
- Preview-only locked optimization UI with no payment processing.

## Excluded

- Production Clerk cutover or Clerk identity mapping.
- Production Supabase schema, policies, storage, or report rows.
- Durable artifact storage, OCR, image-only deck analysis, background jobs, or malware scanning.
- Embeddings, pgvector, generative AI recommendations, Razorpay entitlement, public sharing, or multi-device sync.
- Any merge to `main`, Production deployment, Production domain alias, or Production environment-variable change.

## Runtime Contract

- Local and Vercel Preview default to `demo` unless explicitly configured otherwise.
- Production defaults to `live` and throws an explicit configuration error because live providers are intentionally absent.
- `/grill` bypasses Clerk rendering and middleware; the demo does not depend on Production authentication.
- Demo persistence failures surface to the user and never report fake success.

## Acceptance Contract

- Focused tests, clean production build, touched-path lint, and no new standalone TypeScript failures.
- Strong, weak, contradictory, and corrupt-deck browser scenarios.
- Desktop 1440px, mobile 390px, and reduced-motion checks.
- Validation, back/next, refresh, download/share, lock, restart, overflow, console, and application-request checks.
- Repeat the complete matrix on the stable Vercel branch Preview before completion.

## Exit Gate

Passed on 2026-07-15: 66 focused tests, clean build, touched-path lint, strong/weak/contradictory/corrupt-deck Preview browser scenarios, desktop/mobile/reduced-motion checks, persistence/share/restart checks, and clean console/application network evidence. Independent review has no open P1/P2 findings.

The stable Preview is `https://fundme-ai-git-codex-v1-grill-demo-aakash-s-projects-bf7b5a5e.vercel.app`, backed by deployment `dpl_GsR4wLCPApdeu2dn2RCnsLrh2Mwa`. `https://tryfundme.in` remains on verified Production deployment `dpl_7gCDSsFZ8J6VfUqLBmv7wrcALbr5` and SHA `10409284c56f2b5dea968b9e4b727d420b96aaeb`. Live work now follows `docs/V1_DEMO_TO_LIVE_CONVERSION.md` adapter by adapter.
