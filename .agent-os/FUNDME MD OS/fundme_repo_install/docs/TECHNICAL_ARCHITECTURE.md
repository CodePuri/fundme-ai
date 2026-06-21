# Technical Architecture

> Status: Canonical unless marked otherwise  
> Product: Fundme  
> Last updated: 2026-06-21  
> Production baseline: `main` at `c363eb2`, live at `https://tryfundme.in`  
> Rule: Repository and production behavior override stale documents.


## Architecture objective

Extend the existing Next.js application into a reliable modular monolith before considering microservices. Keep product velocity high while separating domains cleanly enough to move long-running jobs later.

## Current platform

- Next.js App Router and TypeScript.
- pnpm.
- Vercel deployment.
- Clerk authentication.
- Supabase Postgres.
- Root `proxy.ts` for request-time auth/routing under the reported Next.js 16 setup.
- Existing onboarding API and early-access storage.

## Target architecture

```text
Browser
  |
Next.js application
  |- Public web and SEO routes
  |- Authenticated workspace routes
  |- Server actions / route handlers
  |- Domain services
  |
  +-- Clerk identity
  +-- Supabase Postgres + Storage
  +-- AI provider gateway
  +-- Queue/job runner when long-running work requires it
  +-- Analytics + error monitoring
  +-- Email provider / Gmail later
```

## Domain modules

```text
src or root domains/
  identity/
  founders/
  startups/
  ingestion/
  evidence/
  assessments/
  opportunities/
  matching/
  applications/
  tracker/
  billing/
  referrals/
  analytics/
  admin/
```

The exact folder structure may adapt to the current repository. The domain boundaries must not be replaced by a speculative rewrite.

## Identity model

- Clerk is the identity provider.
- Supabase stores application profiles and domain data.
- Maintain a mapping table between Clerk user ID and internal user/workspace ID.
- Use production Clerk instance for production traffic.
- User-specific tables require RLS and server authorization.
- Public opportunity data is read-only to anonymous users.

## Environment model

### Production

- `main` only.
- `tryfundme.in`.
- Production Clerk instance and production keys.
- Production Supabase project or explicitly approved shared project.

### Staging

- One stable staging deployment and domain/environment.
- Persistent integration branch, not a new Preview for every micro-fix.
- Staging auth must be deliberately configured; Clerk does not provide a native third environment, so use a separate Clerk application if isolated staging identity is required.

### Local

- `.env.local`, never committed.
- Local test users and isolated test fixtures where possible.

## Database access

- Browser uses only publishable/anon access where appropriate.
- Elevated secret/service-role access stays in server-only code.
- Migrate from legacy `service_role` to Supabase secret keys when compatibility is verified, because Supabase recommends the newer publishable/secret key model.
- Migrations are version-controlled and reversible where practical.

## Synchronous versus asynchronous work

### Synchronous initially

- CRUD.
- Small structured assessment calls under acceptable timeout.
- Match scoring.
- Draft generation for one question or small group.

### Move to queue when needed

- Website crawling.
- Multi-file extraction.
- OCR.
- Full deck analysis.
- Large assessment generation.
- Opportunity refresh jobs.
- Bulk re-matching.
- Notifications.

Every asynchronous job needs status, retries, timeout, idempotency key, error code, and user-visible recovery.

## API contracts

Prefer typed schemas shared between UI and server. Validate at every external boundary using a schema validator.

Critical writes must return:

```json
{
  "success": true,
  "id": "...",
  "version": 1,
  "requestId": "..."
}
```

Errors must return stable codes, not only prose.

## Observability

- Error monitoring for browser and server.
- Structured server logs with request IDs.
- AI call cost, latency, provider, model, prompt version, and outcome.
- Job failure dashboard.
- Vercel deployment and function monitoring.
- Synthetic smoke test for homepage, auth, opportunity browse, and one non-destructive critical flow.

## Performance

- Static or cached public opportunity pages where appropriate.
- Server rendering for indexable content.
- Avoid loading application workspace JS on public pages.
- Paginate or virtualize large lists.
- Cache normalized opportunity reads and invalidate on admin update.
- Do not cache private founder data across users.

## Build versus buy

Use managed services while product risk is higher than infrastructure risk. Do not add Kubernetes, microservices, or custom vector infrastructure without measured need.
