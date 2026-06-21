# Phase 1 Build Contract — Platform Foundation

> Status: Ready — Phase 0 (truth lock) complete
> Target window: 2026-06-25 to 2026-06-30
> Depends on: Documentation installation and `PROJECT_STATE.md` verification (done)
> Repository root: `/Users/totem/Desktop/Projects/Fundme`
> Current HEAD: `ee58eeaec6ecb5e4f4f3bc0c1889c3b510d5ae04`

## Required reading

1. `.agent-os/FUNDME MD OS/fundme_project_os/PROJECT_STATE.md`
2. `.agent-os/FUNDME MD OS/fundme_project_os/FUNDME_PROJECT_OS.md`
3. `AGENTS.md` (repository root)
4. This contract
5. `.agent-os/FUNDME MD OS/fundme_project_os/TECHNICAL_ARCHITECTURE.md`
6. `.agent-os/FUNDME MD OS/fundme_project_os/ANALYTICS_GROWTH_VIRALITY.md`

## Outcome

Make identity, environments, database access, observability, analytics, and releases dependable before building the intelligence engine.

## Exact files and domains in scope

- `app/sign-in/`, `app/sign-up/`, `app/login/`, `app/account-save/` — Clerk auth routes
- `proxy.ts` — middleware auth guards
- `app/api/onboarding/route.ts` — existing Supabase persistence
- `app/api/env/route.ts` — must be secured or removed
- `lib/supabase.ts` — client configuration
- `.env.local`, `.env.production` — environment variables (names only, not values)
- `infrastructure/db-scripts/` — migration scripts
- `app/layout.tsx` — analytics SDK insertion point
- `components/app/` — dashboard auth patterns

## Explicit non-goals

- No assessment engine.
- No new opportunity ingestion system.
- No redesign.
- No billing.
- No browser automation.
- No new routes or pages.
- No changes to the public homepage or onboarding flow behavior.

## Dependencies

- Clerk production instance access (requires user action: create/configure in Clerk dashboard)
- Supabase project access (existing)
- Vercel project access (existing)
- Error monitoring service selection (Sentry recommended; requires user decision)
- Analytics service selection (PostHog, Mixpanel, or similar; requires user decision)

## Required implementation

### 1. Repository truth audit (COMPLETE)

- ✅ Verified production SHA and tag.
- ✅ Inventoried routes, APIs, tables, mocks, AI endpoints, auth configuration.
- ✅ Updated `PROJECT_STATE.md` with capability truth matrix.

### 2. Clerk production migration

- Create/activate Production instance.
- Configure `tryfundme.in` domain and required DNS.
- Configure production OAuth credentials.
- Recreate paths, integrations, and webhooks that do not clone automatically.
- Replace production environment keys.
- Brand sign-in/sign-up.
- Test clean browser and second-device flows.

### 3. Identity sync

- Create internal user/workspace profile on authenticated signup or first use.
- Store Clerk user ID mapping in Supabase `users` table.
- Define server-side authorization helper.
- Audit all `/app/*` data access.

### 4. Environments

- Define Production, persistent Staging, and Local.
- Create environment-name inventory.
- Eliminate stale branch-specific overrides.
- Add parity check script that validates names only.

### 5. Database and security baseline

- Version existing schema as migrations in `infrastructure/db-scripts/`.
- Audit RLS and elevated-key usage.
- Create backup and rollback notes.
- Plan migration from legacy `service_role` to Supabase secret key.
- Secure or remove `/api/env` debug endpoint.

### 6. Observability

- Browser/server error monitoring.
- Request IDs for APIs.
- Structured error codes.
- Deployment smoke check.
- AI call logging wrapper even if current AI usage is limited.

### 7. Analytics baseline

Implement the acquisition and onboarding events required by `ANALYTICS_GROWTH_VIRALITY.md`, with privacy-safe properties.

## Implementation order

1. Secure `/api/env` endpoint.
2. Clerk production instance setup and configuration.
3. Identity sync table and helper.
4. Environment inventory and parity check.
5. Database migration baseline.
6. RLS audit and fixes.
7. Error monitoring integration.
8. Analytics SDK and core events.

## Database and API contracts

- New `users` table: `id`, `clerk_id`, `email`, `created_at`, `updated_at`
- New `workspaces` table: `id`, `user_id`, `name`, `created_at`, `updated_at`
- Authorization helper: `getAuthenticatedUser(request) → { userId, workspaceId } | 401`
- All new API routes return `{ success, id?, version?, requestId }` or `{ error, code, requestId }`

## Analytics requirements

- `page_view` with route and referrer
- `onboarding_started`
- `onboarding_step_completed` with step number
- `onboarding_submitted`
- `auth_sign_up`
- `auth_sign_in`
- Identity transition on authentication

## Automated tests

- Auth flow: unauthenticated user redirected from `/app/*`
- Auth flow: authenticated user can access `/app/*`
- API: `/api/onboarding` POST returns success with valid payload
- API: `/api/onboarding` POST returns error with invalid payload
- Environment: all required env vars present (name check only)

## Browser verification

- Clean browser sign-up at `tryfundme.in` (production Clerk)
- Second-device sign-in
- Public routes remain accessible without auth
- Dashboard routes require auth

## Documentation updates

- Update `PROJECT_STATE.md` with new tables, auth status, and monitoring status
- Update `TECHNICAL_ARCHITECTURE.md` if environment model changes materially

## Commit policy

- Coherent increments, not one massive commit
- Each commit message describes the change clearly
- Do not combine unrelated changes

## Deployment policy

- All changes verified locally and in staging before production
- Production deployment requires independent review (not self-certified by builder)
- No deployment during this documentation-only task

## Rollback policy

- Database migrations must be reversible where practical
- Feature flags for new behavior where risk is non-trivial
- Previous production SHA `c363eb2` remains the rollback target

## Acceptance

- Production Clerk instance works at the live domain without development mode.
- New user can authenticate in a clean browser and on a second device.
- Public routes remain public and `/app/*` remains protected.
- Clerk user maps to one internal workspace/profile.
- No cross-user access in authorization tests.
- Staging is stable and documented.
- Missing environment names fail preflight before deployment.
- Critical browser/server failures reach monitoring.
- Core acquisition and onboarding events appear once with correct identity transition.
- Build, local tests, staging E2E, and independent review pass.
- `PROJECT_STATE.md` is updated.

## Handoff

Return SHA, migration list, environment-name matrix, route test matrix, auth evidence, analytics evidence, monitoring evidence, known risks, and next phase readiness.
