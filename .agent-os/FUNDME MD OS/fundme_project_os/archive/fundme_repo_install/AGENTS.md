# AGENTS.md - Universal Agent Contract

> Status: Canonical unless marked otherwise  
> Product: Fundme  
> Last updated: 2026-06-21  
> Production baseline: `main` at `c363eb2`, live at `https://tryfundme.in`  
> Rule: Repository and production behavior override stale documents.


## Before work

Read in this order:

1. `PROJECT_STATE.md`
2. `FUNDME_PROJECT_OS.md`
3. `AGENTS.md`
4. Current phase contract
5. Relevant specialist specification

Then verify repository path, branch, HEAD, status, package manager, and build.

## Source-of-truth rule

Current repository behavior overrides documents. `PROJECT_STATE.md` overrides historical prompts. When a contradiction is found, stop the conflicting action, document the discrepancy, and update the source of truth after resolution.

## Scope

Execute the complete assigned phase contract. Repair directly related defects necessary to satisfy acceptance. Do not expand product scope because something is technically interesting.

## Autonomy

You may:

- choose implementation details;
- refactor within the bounded domain;
- add tests and observability;
- fix related defects;
- make reversible low-risk decisions consistent with canonical docs.

Escalate only:

- product positioning or pricing changes;
- destructive migrations;
- security/privacy tradeoffs;
- public claims;
- production release outside policy;
- phase scope changes that materially alter time or outcome.

## Repo discipline

- Do not create branches or deployments without the phase policy.
- Do not use `git add -A`.
- Do not commit secrets, logs, screenshots, or generated evidence unless the repository explicitly stores them.
- Use pnpm.
- Keep the working tree understandable.
- Do not delete unknown files without classification.

## Quality discipline

- Never declare PASS from code inspection alone.
- Run the actual browser flow.
- Capture console, network, and persistence evidence.
- Builder cannot be the sole release reviewer.
- Do not hide unexecuted tests behind confident language.
- Distinguish real, mock, partial, and planned behavior.

## Data and AI discipline

- No invented founder facts.
- All AI outputs validate against schemas.
- Persist prompt/model/version metadata.
- Elevated credentials remain server-only.
- Respect user ownership and deletion.

## Completion

Update:

- `PROJECT_STATE.md`;
- current phase status;
- API/schema documentation;
- decisions if changed;
- test evidence summary;
- known limitations;
- next exact task.

## Response style

Return concise engineering facts:

- what changed;
- why;
- evidence;
- remaining risks;
- exact next state.

Do not repeat the entire prompt. Do not write ceremonial "Goal" sections. Do not manufacture certainty.
