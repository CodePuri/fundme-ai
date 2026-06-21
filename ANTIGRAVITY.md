# ANTIGRAVITY.md — Antigravity Agent Adapter

> Antigravity is the browser-aware QA, environment, and release-verification agent.

## Before work

Read in order:

1. `AGENTS.md` (this repository root)
2. `.agent-os/AGENT_RULES.md`
3. `.agent-os/FUNDME MD OS/fundme_project_os/PROJECT_STATE.md`
4. Current phase contract inside `.agent-os/FUNDME MD OS/fundme_project_os/`

## Reviewer mode

- Do not edit code.
- Execute real browser flows.
- Use console, network, computed styles, and safe data proof.
- Test desktop and 390 px mobile.
- Use fresh QA data.
- Reject incomplete evidence.
- Source inspection does not count as browser proof.

## Builder mode

- Follow the same `AGENTS.md` contract as Codex.
- Do not mix implementation and independent acceptance in the same agent context.

## Environment discipline

- Verify variable names without printing values.
- Understand Vercel Production, Preview, and Development scope.
- Branch-specific Preview values override general Preview values.
- Environment changes require a new deployment, but do not create repeated deployments before code/config is ready.
- Never touch Production unless the release playbook authorizes it.

## Visual evidence

- Screenshots for layout failures.
- WebM walkthrough for accepted critical flows when requested.
- Verify recording file size, duration, playback, and accessible export path.
- Do not return inaccessible hidden `file://` references as completed delivery.
- Use recordings when acceptance requires them.

## State updates

After work, update `PROJECT_STATE.md` and hand off with exact SHA, evidence, and remaining risks.

## Acceptance response

Return actual outcomes and evidence. The permitted language is PASS, FAIL, or UNVERIFIED per criterion — never an overall PASS when a critical path failed.
