# Durable Decisions

Status: Canonical, append-only
Owner: Aakash Puri

New entries may supersede earlier decisions but must not silently rewrite them.

## 2026-07-23 — D-001: Production baseline

**Decision:** `main`, `origin/main`, the release tag, and Vercel Production at SHA `10409284c56f2b5dea968b9e4b727d420b96aaeb` are the accepted rollback baseline.

**Evidence:** Authenticated Git/Vercel inspection and HTTP 200 checks in the Step 0 evidence root.

**Consequence:** No branch, Preview, or newer-looking UI may replace Production truth without an approved release gate.

## 2026-07-23 — D-002: Active engineering line

**Decision:** The single active engineering worktree is `/Users/totem/Desktop/Projects/Fundme-Product-V1` on `product/v1-grill`, created from verified `origin/main`.

**Consequence:** The dirty Ponytail checkout, Clerk cutover, audit worktree, and Codex V1 worktree remain preserved and are not implementation sources.

## 2026-07-23 — D-003: Existing Codex V1 disposition

**Decision:** No unique commit on `codex/v1-grill-demo` is accepted wholesale. Domain/test ideas may be reviewed and rewritten under their bounded phase contracts; the unreviewed UI and route changes must not be cherry-picked.

**Consequence:** The branch and Preview are historical evidence, not active product truth.

## 2026-07-23 — D-004: Canonical documentation hierarchy

**Decision:** [CANONICAL_SOURCE_MAP.md](./CANONICAL_SOURCE_MAP.md) governs authority. Root `BRAIN.md` is supporting engineering memory, not product or deployment truth. Archived material cannot authorize work.

**Consequence:** Every implementation task must name one active phase contract and update only canonical state/decision documents when warranted.

## 2026-07-23 — D-005: Design gate

**Decision:** Approved Yasha/Figma desktop and mobile frames, tokens, palette, prototype behavior, and edge states control polished customer UI.

**Consequence:** No UI redesign or final Grill implementation before Phase 1A acceptance. Internal domain fixtures/harnesses remain allowed only in their later approved contracts.

## 2026-07-23 — D-006: Preview and release policy

**Decision:** Maintain at most one active V1 Preview from `product/v1-grill`; Production moves once after full release acceptance. Historical previews are not recovered by default.

**Consequence:** No Step 0 deployment, promotion, rollback, or deployment deletion.

## 2026-07-23 — D-007: Security debt isolation

**Decision:** The tracked service-role disclosure, tracked credential, open redirect, mock-success persistence, and disabled type gate are verified blockers. Step 0 records but does not fix them.

**Consequence:** Credential rotation and code cleanup require a separately approved security contract before live adapters or payment work.

## 2026-07-23 — D-008: Automatic Preview clarification

**Decision:** Clarify the D-006 phrase “No Step 0 deployment”: it prohibits manual and phase-approved deployment actions but does not claim that authorized Git pushes produce no deployment state. The first documentation push, commit `4588ba5`, automatically created ready Preview `dpl_BfXxsC7K3vBG68ySfATtEzcN1Qvi` through the existing Git integration. This entry supersedes only that ambiguous phrase; the remainder of D-006 stands.

**Consequence:** Automatic `product/v1-grill` branch builds are non-operative evidence until a later contract accepts one. Step 0 authorizes no manual deploy command, phase testing, external sharing, promotion, Production change, rollback, deletion, or deployment-setting change.
