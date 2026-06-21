# Phase 1 Build Contract - Platform Foundation

> Status: Ready after repository truth audit  
> Target window: 2026-06-25 to 2026-06-30  
> Depends on: Documentation installation and `PROJECT_STATE.md` repo verification

## Outcome

Make identity, environments, database access, observability, analytics, and releases dependable before building the intelligence engine.

## Required implementation

### 1. Repository truth audit

- Verify production SHA and tag.
- Inventory routes, APIs, tables, mocks, AI endpoints, auth configuration, and environment variable names.
- Update `PROJECT_STATE.md` with repository evidence.

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
- Store Clerk user ID mapping.
- Define authorization helper.
- Audit all `/app/*` data access.

### 4. Environments

- Define Production, persistent Staging, and Local.
- Create environment-name inventory.
- Eliminate stale branch-specific overrides.
- Add parity check script that validates names only.

### 5. Database and security baseline

- Version existing schema as migrations.
- Audit RLS and elevated-key usage.
- Create backup and rollback notes.
- Plan migration from legacy `service_role` to Supabase secret key.

### 6. Observability

- Browser/server error monitoring.
- Request IDs for APIs.
- Structured error codes.
- Deployment smoke check.
- AI call logging wrapper even if current AI usage is limited.

### 7. Analytics baseline

Implement the acquisition and onboarding events required by `ANALYTICS_GROWTH_VIRALITY.md`, with privacy-safe properties.

## Non-goals

- No assessment engine.
- No new opportunity ingestion system.
- No redesign.
- No billing.
- No browser automation.

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

Return branch/SHA, migration list, environment-name matrix, route test matrix, auth evidence, analytics evidence, monitoring evidence, known risks, and next phase readiness.
