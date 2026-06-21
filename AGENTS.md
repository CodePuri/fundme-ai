# AGENTS.md — Universal Agent Contract

> Every agent working in this repository must read this file first.

## Source-of-truth precedence

1. Current repository code and verified production behavior.
2. `.agent-os/FUNDME MD OS/fundme_project_os/PROJECT_STATE.md`
3. `.agent-os/FUNDME MD OS/fundme_project_os/FUNDME_PROJECT_OS.md`
4. Approved specifications inside `.agent-os/FUNDME MD OS/fundme_project_os/`
5. `.agent-os/FUNDME MD OS/fundme_project_os/DECISIONS.md`
6. Current phase contract (e.g. `PHASE_01_BUILD_CONTRACT.md`)
7. Root-level agent adapters (`ANTIGRAVITY.md`, `CODEX.md`, `CHATGPT_ORCHESTRATOR.md`)
8. `.agent-os/` generic repository rules
9. Archived historical material (read-only reference)

When a contradiction is found between layers, the higher-numbered source is overridden by the lower-numbered source. Stop the conflicting action, document the discrepancy, and resolve before continuing.

## Mandatory reading order

1. This file (`AGENTS.md`)
2. `PROJECT_STATE.md` — at `.agent-os/FUNDME MD OS/fundme_project_os/PROJECT_STATE.md`
3. `FUNDME_PROJECT_OS.md` — at `.agent-os/FUNDME MD OS/fundme_project_os/FUNDME_PROJECT_OS.md`
4. Current phase contract inside `.agent-os/FUNDME MD OS/fundme_project_os/`
5. Relevant specialist specification (PRD, tech arch, data spec, etc.)

Then verify: repository path, branch, HEAD, `git status`, package manager, and build.

## Repository rules

- Use pnpm. Do not use npm or yarn.
- Do not create branches or deployments without the current phase policy.
- Do not use `git add -A`. Stage files deliberately.
- Do not commit secrets, logs, screenshots, or generated evidence.
- Do not delete unknown files without classification.
- Keep the working tree understandable.

## Quality rules

- Never declare PASS from code inspection alone.
- Run the actual browser flow.
- Capture console, network, and persistence evidence.
- The builder cannot be the sole release reviewer.
- Do not hide unexecuted tests behind confident language.
- Distinguish real, mock, partial, and planned behavior explicitly.
- No fake PASS reports.

## Data and AI rules

- No invented founder facts.
- All AI outputs validate against schemas.
- Persist prompt/model/version metadata.
- Elevated credentials remain server-only.
- Respect user ownership and deletion.

## Scope rules

- Execute the complete assigned phase contract.
- Repair directly related defects necessary to satisfy acceptance.
- Do not expand product scope because something is technically interesting.
- No production deployment without explicit release authority.
- No concurrent editing of the same domain by multiple agents.

## Completion requirements

After every material change, update:

- `PROJECT_STATE.md`
- Current phase status
- API/schema documentation
- Decisions if changed
- Test evidence summary
- Known limitations
- Next exact task

## Response style

Return concise engineering facts: what changed, why, evidence, remaining risks, exact next state. Do not repeat prompts. Do not write ceremonial sections. Do not manufacture certainty.
