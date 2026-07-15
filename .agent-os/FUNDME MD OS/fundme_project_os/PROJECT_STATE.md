# Project State

## Production Baseline

- **Production domain**: `https://tryfundme.in`
- **Production and `origin/main` SHA at V1 start**: `10409284c56f2b5dea968b9e4b727d420b96aaeb`
- **Production status**: Verified unchanged on 2026-07-15. Vercel deployment `dpl_7gCDSsFZ8J6VfUqLBmv7wrcALbr5` is Ready at the baseline SHA, and the Grill Demo is not live on the Production domain.
- **Preserved dirty branch**: `optimization/live-site-audit-and-speed-pass` at `d684f36c6910c8f67562f1ab604b4ced093493a2`
- **Clerk status**: Development/partial; Production cutover is outside V1 Demo scope.
- **Supabase status**: Existing onboarding persistence only; no V1 Grill tables, policies, or migrations were added.

## V1 Grill Demo

- **Branch**: `codex/v1-grill-demo`
- **Isolated worktree**: `/Users/totem/Desktop/Projects/Fundme-Codex-V1`
- **Runtime**: `demo` locally and in Vercel Preview; Production defaults to an intentionally unconfigured `live` runtime.
- **Accepted Preview**: `https://fundme-ai-git-codex-v1-grill-demo-aakash-s-projects-bf7b5a5e.vercel.app`
- **Preview deployment**: `dpl_GsR4wLCPApdeu2dn2RCnsLrh2Mwa`, immutable URL `https://fundme-hqddvsuwx-aakash-s-projects-bf7b5a5e.vercel.app`, code SHA `5722fe8ba21726d7ddc0fb0e41b8f935fbd97dc7`.
- **Deployment history**: Four Git-triggered attempts used the same branch alias. Three corrective same-branch pushes resolved Preview-only Clerk and route-prefetch failures before final acceptance; no Production deployment or alias was created.
- **Implemented flow**: Four-step founder/startup/evidence/review intake, server-side PDF parsing, deterministic readiness report, local persistence, share card, and locked optimization preview.
- **Data boundary**: Anonymous browser session, browser-local report storage, in-memory request artifacts, no Production Clerk identity mapping, and no Production Supabase mutation.
- **Rubric**: `fundme-v1-demo-rubric@1` with ten fixed dimensions and deterministic lexical retrieval.
- **Local verification**: 66 focused tests pass; clean `pnpm build` passes; touched files have zero lint errors; standalone TypeScript has only the 16 recorded historical failures and none are in V1 paths.
- **Preview acceptance**: Strong 89, weak 13, contradictory 41, and corrupt-deck 77 scenarios passed. Desktop 1440x900, mobile 390x844, reduced motion, validation, refresh persistence, copy/share fallback, 1200x630 download, lock, restart, overflow, console, and network checks all passed.
- **Independent review**: No open P1/P2 findings after adversarial zero-revenue, oversized-input, unsupported-claim, and cross-tab conflict regressions.

## Known Limits

- No public report URLs, account sync, multi-device persistence, payments, live AI recommendations, OCR, image-only deck analysis, or durable uploaded-file storage.
- The score measures evidence-backed funding readiness. It is not a funding probability or investment recommendation.

## Exact Next Step

Implement server-verified Clerk identity mapping behind `IdentityProvider`, then add a non-Production Supabase assessment/report schema with owner-scoped RLS and contract tests. Keep demo adapters and the accepted Preview unchanged; do not merge to `main` or alter Production configuration.
