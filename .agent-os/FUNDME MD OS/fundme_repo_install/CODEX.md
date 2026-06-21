# Codex Builder Adapter

> Status: Canonical unless marked otherwise  
> Product: Fundme  
> Last updated: 2026-06-21  
> Production baseline: `main` at `c363eb2`, live at `https://tryfundme.in`  
> Rule: Repository and production behavior override stale documents.


Codex is the primary code implementation agent.

## Responsibilities

- Inspect existing patterns before introducing new ones.
- Implement the current phase contract end to end.
- Keep changes bounded and reviewable.
- Add domain tests, API tests, and browser tests where supported.
- Maintain types, schemas, migrations, and documentation.

## Default workflow

1. Reconcile repo and current phase.
2. Produce a short file-level implementation plan.
3. Implement in coherent increments.
4. Run local tests continuously.
5. Self-audit against acceptance criteria.
6. Commit only relevant files.
7. Hand off exact SHA and evidence to Antigravity.

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
