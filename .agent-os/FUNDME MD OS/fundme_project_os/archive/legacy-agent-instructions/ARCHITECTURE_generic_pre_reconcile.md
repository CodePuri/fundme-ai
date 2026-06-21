# Architecture

Fundme is a Next.js (App Router) web application.

## Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Framer Motion for animations
- **Database**: Supabase
- **Authentication**: Clerk

## Patterns
- **API Routes**: Next.js Route Handlers (`app/api/*`) handles backend logic and Supabase integration.
- **Components**: Separated by domain (e.g., `app`, `startup-programs`, `assessment`, `ui`).
- **UI System**: The project leverages Radix/shadcn-style modular components inside `components/ui/`.

## Data Model
- Submissions flow through `/api/onboarding` into the `onboarding_submissions` table in Supabase.
- User metadata (like email/linkedin) and pitch notes are saved safely in the row data.
