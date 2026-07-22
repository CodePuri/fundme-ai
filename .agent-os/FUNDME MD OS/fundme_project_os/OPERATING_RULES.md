# Operating Rules

## Agent roles

- ChatGPT: product and architecture orchestrator
- Codex: bounded implementation and repository work
- Yasha-owned, explicitly approved Figma handoff: customer-facing design source of truth
- Claude and other design assistants: non-authoritative reference and production support only
- Antigravity: browser walkthrough and independent QA
- Reviewer: acceptance without implementation

## Token-efficiency rules

1. One vertical outcome per Codex task.
2. Read no more than eight documents by default.
3. Change no more than three domains per phase unless explicitly approved.
4. Do not repeat repository-wide audits after Step 0.
5. Use targeted searches and file reads.
6. Store raw logs outside Git.
7. Summarize test output; preserve exact files.
8. Maximum three autonomous fix/test cycles before reporting a real blocker.
9. No visual polishing without approved Figma.
10. No speculative abstractions.
11. No implementation of future phases “for completeness.”
12. No full roadmap pasted into every task.

## Git policy

- `main` is Production.
- One active implementation branch per phase.
- One permanent V1 worktree.
- Stage explicit files.
- No `git add -A`.
- Do not reset, stash or clean preserved dirty branches.
- Re-fetch `origin/main` before push and release.
- Do not combine Git-triggered deployment and `vercel --prod`.
- No empty commits to force redeployment.

## Worktree policy

Never move a Git worktree manually.

For retired worktrees:

1. record path, branch, SHA and dirty state
2. create recovery bundle/patch if necessary
3. confirm branch exists remotely or in bundle
4. use `git worktree remove` only when clean and approved
5. archive metadata, not a broken moved checkout

## Deployment policy

- one Production
- one active Preview
- old deployments classified
- 401 means protected until proven deleted
- do not recover every deployment
- recreate only when unique approved value exists
- do not delete without separate approval

## Test policy

A build is not a product PASS.

Required as applicable:

- build
- focused typecheck/lint
- domain tests
- integration tests
- browser desktop
- mobile 390px
- reduced motion
- console
- network
- safe persistence proof
- independent review

## Security

- no secrets in prompts/logs/client bundles
- no service role in browser
- no open redirects
- no silent mock success
- no restricted scraping
- private uploads and reports by default
- explicit user action before external submission or messaging

## Documentation

Update only:

- `PROJECT_STATE.md`
- active phase contract
- `DECISIONS.md` for durable changes
- system/design contract when their subject changes

Do not create duplicate root truth files.
