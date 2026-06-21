# Environment Policy

> Status: Canonical
> Product: Fundme
> Last updated: 2026-06-21

## Environments

### 1. Local Development
- Target: Local machine (`localhost:3000`)
- Variables: Stored in `.env.local` (ignored by git).
- Secrets: Development keys for Clerk, local/development Supabase instance.
- Rule: Do not use production keys locally unless debugging a specific production data issue with explicit permission.

### 2. Stable Staging
- Target: `staging.tryfundme.in` (Vercel Preview or dedicated project tied to `staging` branch).
- Variables: Configured in Vercel project settings for the Preview/Staging environment.
- Purpose: Used for QA, E2E testing, and reviewer acceptance before merging to `main`.
- Rule: No branch-specific Preview overrides that cause configuration drift. There is only ONE stable staging environment.

### 3. Production
- Target: `tryfundme.in` (Vercel Production tied to `main` branch).
- Variables: Configured in Vercel project settings for the Production environment.
- Secrets: Production Clerk keys, Production Supabase keys.
- Rule: Only merged code from an accepted staging release can be deployed. No direct commits or direct push to `main` without review.

## Variable Policies

- **Required Variables**: All environments must provide `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- **Public Variables**: Any variable prefixed with `NEXT_PUBLIC_` is shipped to the browser. Do not place secrets here.
- **Server-Only Variables**: Variables without the prefix (e.g., `CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are kept on the server.
- **Missing Variables**: Missing required variables should fail the build preflight check.
- **Secret Rotation**: Rotate immediately upon exposure. Update in Vercel, then redeploy the affected environment.
