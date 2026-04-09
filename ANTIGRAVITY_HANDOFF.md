# Antigravity Handoff Context

## Summary

- The real app root is `/Users/totem/Desktop/Projects/Fundme/Codex`.
- Do not use `/Users/totem/Desktop/Projects/Fundme` as the app root; it has its own `package-lock.json` and a minimal `package.json` that can confuse tooling.
- The Git remote is `git@github.com:CodePuri/fundme-ai.git`.
- The current active working branch is `experiment/fundme-jobright-onboarding-v2`.
- The stable Codex branch is `codex/main`.
- Checkpoint backups use separate `checkpoint/*` branches and must never overwrite `main`.

## Current Repo Context

- Active branch: `experiment/fundme-jobright-onboarding-v2`
- HEAD commit on active branch: `c21e10c` with message `Fix workspace tracking page inconsistencies`
- Remote branch for that experiment currently points to `91de533`, so the latest local experiment commit is ahead of GitHub.
- Important remote branches:
  - `codex/main`
  - `experiment/fundme-jobright-onboarding-v2`
  - `checkpoint/codex-main`
  - `checkpoint/codex-main-20260408-1255`
  - `test/fundme-homepage-recovery-and-demo-expansion`
  - `test/fundme-landing-motion-pass`
  - `google-ai-studio/main`
  - `replit/main`
- Package manager: `pnpm`
- App scripts:
  - `pnpm dev` runs Next.js dev server
  - `pnpm build` runs production build
  - `pnpm checkpoint` runs the repo checkpoint backup script

## Checkpoint Workflow Context

- Repo-local checkpoint script: `/Users/totem/Desktop/Projects/Fundme/Codex/scripts/checkpoint-backup.sh`
- Checkpoints go to a backup branch derived from the current branch, usually `checkpoint/<source-branch-with-slashes-replaced>`
- Checkpoint commits use a structured message format so Codex can scan history quickly:
  - Subject: `checkpoint(<source-branch>): <label>` or `checkpoint(<source-branch>): <file-count> files across <areas>`
  - Body fields:
    - `Source-branch`
    - `Checkpoint-branch`
    - `Created-at`
    - `Validation`
    - `Files-changed`
    - `Diff-stat`
    - `Areas`
    - `Changed-paths`
- If validation/build is broken but a backup is still required, checkpoint flow supports `CHECKPOINT_SKIP_BUILD=1`

## Instructions For Antigravity

- Treat `/Users/totem/Desktop/Projects/Fundme/Codex` as the only source tree for the application.
- Preserve branch separation. Do not collapse work onto `main`.
- Use `experiment/fundme-jobright-onboarding-v2` as the current working context unless explicitly told to switch to `codex/main`.
- Keep `codex/main` as the stable Codex baseline.
- Treat `checkpoint/*` branches as backup lanes, not feature branches.
- Use `pnpm`, not npm, inside `Codex/`.
- If reproducing the current Codex workflow, understand that the latest local experiment commit may not exist on GitHub yet.
- If creating backups, use the repo checkpoint script and preserve the structured checkpoint commit message format.
- Do not use the parent `Fundme/` directory for app startup, dependency management, or build commands.

## Copy-Paste Handoff Prompt

```text
Use /Users/totem/Desktop/Projects/Fundme/Codex as the real project root.

Important:
- Do not use /Users/totem/Desktop/Projects/Fundme as the app root.
- Git remote is git@github.com:CodePuri/fundme-ai.git.
- Current active branch is experiment/fundme-jobright-onboarding-v2.
- Stable Codex branch is codex/main.
- There are backup branches under checkpoint/* and comparison branches under test/*.
- Package manager is pnpm.

Current branch context:
- Active local branch: experiment/fundme-jobright-onboarding-v2
- Local HEAD commit: c21e10c
- Local HEAD message: Fix workspace tracking page inconsistencies
- This local experiment branch is ahead of its remote, so do not assume GitHub has the full latest state.

Checkpoint workflow:
- Repo-local checkpoint script: scripts/checkpoint-backup.sh
- Normal backup entrypoint: pnpm checkpoint
- Dirty backup mode when build is failing: CHECKPOINT_SKIP_BUILD=1 bash scripts/checkpoint-backup.sh
- Checkpoint branches must stay separate from main.
- Checkpoint commit messages are structured and must preserve:
  - Source-branch
  - Checkpoint-branch
  - Created-at
  - Validation
  - Files-changed
  - Diff-stat
  - Areas
  - Changed-paths

Rules:
- Preserve the current branch-based workflow.
- Do not merge everything into main.
- Use pnpm for install/run/build in Codex/.
- Treat codex/main as stable, experiment/* as active work, checkpoint/* as backup history, and test/* as comparison branches.
```

## Assumptions

- The goal is a context transfer only, with no repo mutations performed by Antigravity unless explicitly requested later.
- Antigravity needs operational context and guardrails, not a command sequence.
