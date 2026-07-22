# Canonical Source Map

Status: Canonical authority index
Last reconciled: 2026-07-23

## Authority order

1. Current code and verified Production behavior
2. [PROJECT_STATE.md](./PROJECT_STATE.md)
3. [PRODUCT_GROUND_TRUTH.md](./PRODUCT_GROUND_TRUTH.md)
4. [ACTIVE_PHASE_CONTRACT.md](./ACTIVE_PHASE_CONTRACT.md) and its named phase contract
5. [UI_IMPLEMENTATION_CONTRACT.md](./UI_IMPLEMENTATION_CONTRACT.md), grounded in existing Production design and implemented tokens/components
6. [SYSTEM_CONTRACT.md](./SYSTEM_CONTRACT.md) and [BENCHMARK_AND_PROVENANCE_POLICY.md](./BENCHMARK_AND_PROVENANCE_POLICY.md)
7. [DECISIONS.md](./DECISIONS.md)
8. [OPERATING_RULES.md](./OPERATING_RULES.md)
9. Supporting specifications explicitly listed below
10. Historical audits, handoffs, screenshots, old prompts, deployments, and [archive](./archive/README.md)

Lower levels may inform but never override higher levels.

## Canonical active documents

| Document | Purpose | Update cadence |
|---|---|---|
| [PROJECT_STATE.md](./PROJECT_STATE.md) | Verified implementation, Git, deployment, platform status, blockers, and exact next contract | Every accepted milestone |
| [PRODUCT_GROUND_TRUTH.md](./PRODUCT_GROUND_TRUTH.md) | User, promise, scope, business model, and product boundaries | Durable product change only |
| [ACTIVE_PHASE_CONTRACT.md](./ACTIVE_PHASE_CONTRACT.md) | The single proposed/approved phase currently governing work | Once per phase |
| [UI_IMPLEMENTATION_CONTRACT.md](./UI_IMPLEMENTATION_CONTRACT.md) | Engineering-owned visual authority, reused production patterns, route hierarchy, responsive behavior, and edge states | Every accepted UI contract change |
| [SYSTEM_CONTRACT.md](./SYSTEM_CONTRACT.md) | Stable domain, data, runtime, and provider boundaries | Accepted architecture change only |
| [BENCHMARK_AND_PROVENANCE_POLICY.md](./BENCHMARK_AND_PROVENANCE_POLICY.md) | Permitted sources, provenance metadata, and language rules | Accepted intelligence-policy change |
| [EXECUTION_ROADMAP.md](./EXECUTION_ROADMAP.md) | Ordered gates; not permission to implement future phases | Durable sequence change only |
| [OPERATING_RULES.md](./OPERATING_RULES.md) | Git, worktree, deployment, testing, security, and token discipline | Rarely |
| [GAPS_AND_PREREQUISITES.md](./GAPS_AND_PREREQUISITES.md) | Verified unresolved decisions and external prerequisites | Every resolved blocker |
| [DECISIONS.md](./DECISIONS.md) | Append-only durable decisions | On accepted durable decision |

## Prepared phase contracts

Only the contract named by `ACTIVE_PHASE_CONTRACT.md` may be approved for execution.

- [PHASE_1_UI_BASELINE_AND_FLOW.md](./PHASE_1_UI_BASELINE_AND_FLOW.md) — approved and active
- [PHASE_2A_DOSSIER_EVIDENCE_CONVERSATION.md](./PHASE_2A_DOSSIER_EVIDENCE_CONVERSATION.md)
- [PHASE_2B_RUBRIC_FINDINGS.md](./PHASE_2B_RUBRIC_FINDINGS.md)
- [PHASE_2C_RETRIEVAL_REPORT.md](./PHASE_2C_RETRIEVAL_REPORT.md)
- [PHASE_3_GRILL_EXPERIENCE.md](./PHASE_3_GRILL_EXPERIENCE.md) — superseded by the active Phase 1 contract; retained for history only
- [PHASE_4_SHARE_REFERRAL.md](./PHASE_4_SHARE_REFERRAL.md)
- [PHASE_5_LIVE_ADAPTERS.md](./PHASE_5_LIVE_ADAPTERS.md)

Prepared does not mean approved.

## Supporting specifications

- [supporting/V1_EXPERIENCE_CONTRACT.md](./supporting/V1_EXPERIENCE_CONTRACT.md) — interaction and report hierarchy; subordinate to product truth, the UI implementation contract, and active phase scope.
- [templates/ACTIVE_PHASE_CONTRACT_TEMPLATE.md](./templates/ACTIVE_PHASE_CONTRACT_TEMPLATE.md) — required structure for future contracts.
- Repository `BRAIN.md` — supporting engineering incident memory only.
- `docs/references/` and `docs/incidents/` — historical/reference material only; not active truth.

## Design authority

Product documents control the user, problem, feature scope, evidence/scoring rules, privacy, security, and release sequence. Existing Production design and implemented components/tokens lead visual decisions; Aakash-supplied references and the UI implementation contract resolve the bounded extension. Code controls implemented behavior.

The supplied `index.html` is mentor-interaction reference only. It cannot override FundMe identity, components, tokens, route scope, or architecture. Optional future visual work becomes authoritative only through an explicit Aakash decision; it is not an engineering dependency.

## Archive rule

Anything under [archive/](./archive/README.md) or repository `docs/archive/` is historical and must not be implemented without a new accepted decision. External audit/handoff packs are evidence, never authority.
