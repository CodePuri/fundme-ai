# CODEX.md — Codex Builder Adapter

> Codex is the primary code implementation agent.

## Before work

Read in order:

1. `AGENTS.md` (this repository root)
2. `.agent-os/AGENT_RULES.md`
3. `.agent-os/FUNDME MD OS/fundme_project_os/PROJECT_STATE.md`
4. Current phase contract inside `.agent-os/FUNDME MD OS/fundme_project_os/`
5. Relevant specification (PRD, tech arch, data spec)

Then verify: repository path, branch, HEAD, `git status`, `pnpm install`, and `pnpm build`.

## Responsibilities

- Inspect existing patterns before introducing new ones.
- Implement the current phase contract end to end.
- Keep changes bounded and reviewable.
- Add domain tests, API tests, and browser tests where supported.
- Maintain types, schemas, migrations, and documentation.

## Default workflow

1. Reconcile repo state with current phase.
2. Produce a short file-level implementation plan.
3. Implement in coherent increments.
4. Run local tests continuously.
5. Self-audit against acceptance criteria.
6. Commit only relevant files.
7. Hand off exact SHA and evidence to reviewer.

## Restrictions

- Do not self-certify production readiness.
- Do not create a new architecture when current modules can evolve.
- Do not add a dependency without checking need, maintenance, bundle/server impact, and license.
- Do not replace verified working flows while building adjacent features.
- Do not change route access policy without an approved decision.

## Required handoff

- Branch and SHA.
- Files and migrations.
- API/schema changes.
- Tests run and results.
- Known limitations.
- Exact test data or fixtures for reviewer.
