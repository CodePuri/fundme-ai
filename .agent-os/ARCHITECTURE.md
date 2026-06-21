# Architecture

> Last updated: 2026-06-21
> Repository root: `/Users/totem/Desktop/Projects/Fundme`

## Stack summary

- **Framework**: Next.js 16 (App Router), TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion
- **Authentication**: Clerk
- **Database**: Supabase Postgres
- **Hosting**: Vercel
- **Package manager**: pnpm
- **Middleware**: `proxy.ts` (root-level, Next.js 16 convention)

## Patterns

- **API routes**: Next.js Route Handlers at `app/api/*`
- **Components**: domain-separated under `components/` (app, ui, assessment, startup-programs, public)
- **UI system**: Radix/shadcn-style modular components in `components/ui/`
- **Demo layer**: `DemoProvider` wraps authenticated `/app/*` routes with client-side mock state (not production data)

## Data model

Currently minimal:
- `onboarding_submissions` table in Supabase (via `/api/onboarding`)
- Clerk handles identity
- No application data tables yet

## Canonical technical architecture

For the full target architecture, domain modules, identity model, environment model, database access patterns, async work strategy, API contracts, observability, and performance requirements, see:

`.agent-os/FUNDME MD OS/fundme_project_os/TECHNICAL_ARCHITECTURE.md`
