# FundMe V1 closeout — 2026-10-10 (Asia/Kolkata)

## Current release state

- V1 code changes are on `fix/fundme-v1-closeout` and the existing `staging` branch at code checkpoint `2fec1e5ba507fd20308649669407984f97771ab4`. PR [#46](https://github.com/CodePuri/fundme-ai/pull/46) is open, mergeable, and has successful GitGuardian and Vercel checks. It has **not** been merged into `main`.
- The staging deployment `dpl_4BjSd5BJ7AqB9gj4HZgLh7QGZVcH` is Ready and aliased to https://staging.tryfundme.in. Production remained on its prior hotfix deployment; no Production environment variable was changed during this closeout.
- Production and staging Supabase project refs are `wduygrhtijvaevcwptnr` and `nnzdplkjizwgsalizijd` respectively. The staging Preview URL and privileged service-role credential match and are isolated from Production. The effective Production Vercel URL/key pair remains unverified because its Sensitive values are not exposed by Vercel CLI. A local legacy Production service-role JWT matched the Production project and was active; it also appears in Git history and requires rotation before launch.
- Old branch-specific Vercel scopes were left in place because those branches still existed. They are cleanup-only, not a V1 gate.
- PostHog setup is intentionally deferred at the founder's request. Do not treat it as blocking independent V1 engineering work.
- Separate Resend credentials are configured for Production and staging and the sending domain was verified. Database-side first-save delivery idempotency is covered by staging integration tests; actual inbox receipt awaits a signed-in browser run.

## Verification evidence

- `pnpm test:assessment`: 80/80 passing; `pnpm test:staging-integration`: 11/11 passing against the staging Supabase project.
- `pnpm exec tsc --noEmit`, targeted ESLint excluding the nested worktree, and `pnpm build`: passed on `2fec1e5`.
- Live staging browser: anonymous intake → analysis → result → Save auth choice → Preview workspace; report persisted after reload; Save made no anonymous `/api/assessment/save` request. Zero browser console errors (one expected Clerk development-key warning).
- Staging sign-in page rendered the Clerk options, but no personal Google OAuth flow or two-user authenticated browser E2E was performed.
- https://tryfundme.in and https://staging.tryfundme.in returned HTTP 200 on `/`, `/assessment`, and `/search` on 2026-10-10.
- The account-isolation and saved-report changes received independent code review with no remaining critical or important finding. Scoring internals were not changed.

## Remaining launch gates

1. Rotate the exposed **Production** Supabase service-role credential in the existing Production project, replace the Vercel Production Sensitive value, verify the Production URL/key pair, redeploy, and revoke the exposed legacy credential. This requires explicit founder authorization because the prior instruction was not to modify Production variables. Never paste the credential in a chat or commit it.
2. Exercise the signed-in/returning-user browser loop with a dedicated staging test identity: Google sign-in, anonymous-result handoff, server save/reload, second-account isolation, share/referral, and first-save email receipt. The current CLI is not logged into Clerk, and the available Clerk API skill requires a separately approved credentialed write for synthetic user/session creation; no test user was created.
3. After gates 1–2 pass, merge PR #46 through review (not a direct push to `main`), verify the resulting Production deployment and rollback path, then make the launch decision.

The existing `.agent-os/FUNDME MD OS/fundme_project_os/PROJECT_STATE.md` has unrelated uncommitted user edits and was not staged or modified by this closeout. Browser artifacts and the prior security-hotfix worktree were also preserved.
