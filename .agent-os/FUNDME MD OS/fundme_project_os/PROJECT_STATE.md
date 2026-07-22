# FundMe Project State

Status: Phase 1 functional Grill stub approved; implementation in progress on the isolated development line
Last verified: 2026-07-23 Asia/Kolkata
Evidence root: `/Users/totem/Desktop/Projects/Fundme_Canonicalization/20260723-012638`

## Verified baseline

| Item | Verified value |
|---|---|
| Canonical repository | `/Users/totem/Desktop/Projects/Fundme` |
| Production domain | `https://tryfundme.in` (HTTP 200) |
| Production deployment | `dpl_7gCDSsFZ8J6VfUqLBmv7wrcALbr5` |
| Production SHA | `10409284c56f2b5dea968b9e4b727d420b96aaeb` |
| `origin/main` | `10409284c56f2b5dea968b9e4b727d420b96aaeb` |
| Local `main` | `10409284c56f2b5dea968b9e4b727d420b96aaeb` |
| Release tag | `fundme-homepage-baseline-optimized-1040928` |
| Previous ready Production deployment | `dpl_2x7Cb8Q4YdnmxhRu7ksasK3HnMAw` at `1244802235a73636f9a0be4532252a6d0d47400d` |

Production, `origin/main`, local `main`, and the release tag agree on the accepted homepage baseline.

## Active development line

| Item | Value |
|---|---|
| Worktree | `/Users/totem/Desktop/Projects/Fundme-Product-V1` |
| Branch | `product/v1-grill` |
| Starting SHA | `10409284c56f2b5dea968b9e4b727d420b96aaeb` |
| Upstream before first push | `origin/main` |
| Product implementation in Step 0 | None |

The prior `codex/v1-grill-demo` line is clean and pushed but not accepted. Its five unique commits are classified as REWRITE, REJECT, or ARCHIVE; none is approved for merge or cherry-pick.

## Preserved branches and worktrees

- `/Users/totem/Desktop/Projects/Fundme` — `optimization/live-site-audit-and-speed-pass` at `d684f36`; dirty, 10 commits ahead of its upstream, preservation-only.
- `/Users/totem/Desktop/Projects/Fundme-Codex-V1` — `codex/v1-grill-demo` at `0fdde37`; clean, historical/rewrite reference.
- `/Users/totem/Desktop/Projects/Fundme-Clerk-Cutover` — `safe/clerk-production-cutover` at `1040928`; clean, retained pending a separate Clerk decision.
- `/Users/totem/Desktop/Projects/Fundme-Codex-Audit` — detached `1040928`; clean after verification, candidate for later approved removal.
- One missing/prunable checkpoint registration and five broken Codex-managed detached registrations are recorded in the external worktree evidence. They were not pruned, repaired, moved, or deleted.

## Preview policy

The first authorized documentation push, commit `4588ba5`, automatically created ready Preview `dpl_BfXxsC7K3vBG68ySfATtEzcN1Qvi` and the `fundme-ai-git-product-v1-grill` branch alias through the repository's existing Git integration. No manual Vercel deployment command was run. Subsequent Step 0 documentation pushes may create successor Previews; all such branch builds are non-operative evidence only and do not authorize phase testing, external sharing, promotion, or Production changes. The ready `codex/v1-grill-demo` Preview at deployed SHA `5722fe8` is historical evidence only and must not be promoted. A later approved phase may designate one stable `product/v1-grill` Preview after its contract, build, tests, and review pass.

## Capability summary

Verification baseline at `10409284c56f2b5dea968b9e4b727d420b96aaeb`: the clean audit worktree completed frozen install and build with exit 0, producing 33 static routes while explicitly skipping type validation. Existing lint returned 14 errors and 5 warnings; standalone TypeScript returned 16 errors. The documentation-only active worktree also completed frozen install and the same 33-route build with exit 0. These failures are baseline debt, not repaired or concealed by Step 0.

- **Production:** homepage, public search/explore surface, onboarding UI.
- **Partial:** browser voice input, Clerk provider/middleware, narrow Supabase onboarding path, SEO basics.
- **Mock:** `/app/*`, application workspace, assessment intake/report, file handling.
- **Broken:** onboarding silently returns mock success on persistence failures; assessment scores are randomized; build ignores type errors; lint and standalone typecheck fail.
- **Not built:** dossier/evidence model, deterministic rubric, accepted retrieval/RAG, durable artifacts, persistent reports/shares, referrals, live AI adapters, payments.
- **Critical security debt:** tracked secret-disclosure route, tracked JWT-like service credential, and unvalidated login redirect. Values were not copied or exposed during Step 0.

See [implementation-capability-matrix.md](/Users/totem/Desktop/Projects/Fundme_Canonicalization/20260723-012638/implementation-capability-matrix.md) for external evidence; repository truth is summarized here.

## Platform status

**Clerk:** provider, sign-in/up routes, and middleware exist. Production instance ownership, complete claim flow, and Clerk-to-founder ownership are not proven. Status: **PARTIAL / platform configuration UNKNOWN**.

**Supabase:** onboarding uses a server-side service role but can report false success. Canonical founder/startup ownership, accepted RLS proof, private storage, and backup/restore evidence are absent. A tracked credential must be treated as compromised. Status: **BROKEN/PARTIAL; rotation and platform proof require separate approval**.

## UI status

The obsolete external designer/Figma gate is superseded by D-009. [UI_IMPLEMENTATION_CONTRACT.md](./UI_IMPLEMENTATION_CONTRACT.md) now governs engineering from the verified Production design, implemented components/tokens, accepted homepage/onboarding patterns, and explicitly supplied references. Optional future design input is not a blocker.

## Current phase and blockers

Current phase: **Phase 1 — functional Grill Preview implementation**. Aakash approved the route structure, intake, deterministic mentor/report, email-only early access, local Preview persistence, and removal of the external design dependency.

Blocking later implementation:

- credential rotation and deletion of the secret-disclosure surfaces in a separately approved security contract
- Clerk Production ownership and claim design
- Supabase project tier, RLS, storage, and backup/restore proof
- rubric owner, weights, calibration cases, benchmark permissions, cost/latency budgets
- founder decisions on ICP wording, free/locked copy, referral rule, and share privacy

## Exact next contract

Active contract: [PHASE_1_UI_BASELINE_AND_FLOW.md](./PHASE_1_UI_BASELINE_AND_FLOW.md).

Exact next action: implement and verify the complete local Grill flow test-first, then update only the existing `product/v1-grill` branch Preview and prove Production remains unchanged. The next product contract after acceptance is the intelligence foundation.

## Rollback baseline

Git rollback baseline: `fundme-homepage-baseline-optimized-1040928`.
Current Production remains `dpl_7gCD…` at `1040928`.
Previous ready deployment fallback: `dpl_2x7C…` at `1244802`.

No Production deployment or alias, Production SHA, deployment setting, environment value, Clerk setting, Supabase setting, DNS record, or migration was changed in Step 0. The only deployment-state change was automatic Git-connected Preview creation from the authorized documentation branch push; no manual deploy command, phase testing authorization, external sharing, promotion, rollback, or deletion occurred.
