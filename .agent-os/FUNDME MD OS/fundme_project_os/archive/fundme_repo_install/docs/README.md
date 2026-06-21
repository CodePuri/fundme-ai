# Fundme Product Operating System

> Status: Canonical unless marked otherwise  
> Product: Fundme  
> Last updated: 2026-06-21  
> Production baseline: `main` at `c363eb2`, live at `https://tryfundme.in`  
> Rule: Repository and production behavior override stale documents.


This folder is the canonical operating system for building Fundme across ChatGPT, Codex, Antigravity, Gemini, and future agents.

## Read order

1. `PROJECT_STATE.md` - what is true now.
2. `FUNDME_PROJECT_OS.md` - portable product and operating context.
3. `AGENTS.md` - rules every agent must follow.
4. The phase contract for the task being executed.
5. The specialist specification relevant to the task.

## Authority order

1. Current repository and production behavior.
2. `PROJECT_STATE.md`.
3. Approved documents in this folder.
4. Architecture decisions in `DECISIONS.md`.
5. Current phase contract.
6. Historical prompts and archived reports.

Historical prompts never override current production truth.

## Canonical documents

| File | Purpose |
|---|---|
| `FUNDME_PROJECT_OS.md` | One-file portable context for any new model or agent. |
| `PROJECT_STATE.md` | Current build, routes, real/mock status, environments, blockers, and next milestone. |
| `PRODUCT_CHARTER.md` | Mission, user, positioning, product thesis, non-goals, and defensibility. |
| `MASTER_PRD.md` | End-to-end product requirements and acceptance criteria. |
| `USER_FLOWS_UX.md` | User journeys, route policy, states, and UX rules. |
| `TECHNICAL_ARCHITECTURE.md` | Current and target system architecture. |
| `DATA_AI_MATCHING_SPEC.md` | Data models, AI pipelines, matching, drafting, and evaluation. |
| `OPPORTUNITY_DATA_SEO_AEO.md` | Opportunity database, content, SEO, AEO, and programmatic discovery. |
| `ANALYTICS_GROWTH_VIRALITY.md` | Event taxonomy, metrics, experiments, referrals, and distribution loops. |
| `DESIGN_CONTENT_SYSTEM.md` | Design language, component behavior, brand, and copy standards. |
| `SECURITY_PRIVACY_OPERATIONS.md` | Identity, secrets, RLS, PII, monitoring, recovery, and operations. |
| `DELIVERY_ROADMAP.md` | Calendar, sequencing, dependencies, owners, and phase exit gates. |
| `QUALITY_RELEASE_PLAYBOOK.md` | Testing, evidence, staging, production, rollback, and release proof. |
| `DECISIONS.md` | Product and architecture decisions that agents must not silently reverse. |
| `AGENTS.md` | Universal autonomous-agent contract. |
| `CODEX.md` | Builder adapter. |
| `ANTIGRAVITY.md` | QA, browser, deployment, and UI adapter. |
| `CHATGPT_ORCHESTRATOR.md` | Product orchestrator and prompt-refinement adapter. |
| `PHASE_01_BUILD_CONTRACT.md` | First executable build contract after documentation handoff. |
| `SOURCES_AND_ASSUMPTIONS.md` | Source ledger, assumptions, and items requiring verification. |

## Updating the OS

Every merged phase must update `PROJECT_STATE.md`. Any material change to product direction, architecture, privacy, pricing, or release policy must also update `DECISIONS.md` and the relevant canonical specification.
