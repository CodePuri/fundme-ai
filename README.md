# Fundme.ai

Fundme.ai is a Next.js product demo for founders preparing startup applications. The current project focuses on compressing a founder workflow into one system: collect startup context, assess fit, surface relevant programs, generate drafts, and keep application work tracked in one place.

## Current product surface

- Marketing landing page and early-access entry flow
- Authentication shell with Clerk and a local demo provider
- Founder onboarding and startup intake
- In-app workflow pages for upload, startup profile, founder profile, matches, programs, applications, tracker, and settings
- Supplemental routes such as `explore`, `search`, `roast`, `startup-programs`, and `thank-you`

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Clerk
- Supabase
- pnpm

## Local development

```bash
pnpm install
pnpm dev
```

The local app runs at `http://localhost:3000`.

Useful commands:

```bash
pnpm lint
pnpm build
pnpm checkpoint
```

## Environment

The repository code currently requires these Supabase variables for the onboarding API route:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

If Clerk-backed auth flows are enabled in your environment, provide the standard Clerk project keys as well.

## Project layout

```text
app/
  page.tsx                  Landing page
  onboarding/               Founder onboarding flow
  app/                      Authenticated application workspace
  api/                      Route handlers
components/
  app/                      App shell and dashboard components
  ui/                       Shared UI primitives
lib/
  demo-data.ts              Demo content and seed data
  utils.ts                  Shared utilities
```

## Branch note

This README was added on the active feature branch and is intentionally not introduced through `main` as part of this change.
