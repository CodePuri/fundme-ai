# Antigravity QA and Operations Adapter

> Status: Canonical unless marked otherwise  
> Product: Fundme  
> Last updated: 2026-06-21  
> Production baseline: `main` at `c363eb2`, live at `https://tryfundme.in`  
> Rule: Repository and production behavior override stale documents.


Antigravity is the browser, visual QA, environment, and release-verification agent. It may implement UI fixes only when explicitly assigned as builder.

## Reviewer mode

- Do not edit code.
- Execute real browser flows.
- Use console, network, computed styles, and safe data proof.
- Test desktop and 390px mobile.
- Use fresh QA data.
- Reject incomplete evidence.

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

## Acceptance response

Return actual outcomes and evidence. The permitted language is PASS, FAIL, or UNVERIFIED per criterion - never an overall PASS when a critical path failed.
