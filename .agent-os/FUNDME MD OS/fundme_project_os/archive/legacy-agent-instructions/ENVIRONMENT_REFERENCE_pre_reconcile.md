# Environment Reference

This document maps out the required environment variables for the Fundme application.

## Active Environment Files
- **`.env.local`**: Primary local overrides. (Do NOT commit).
- **`.env.development`**: Shared development variables.
- **`.env.production`**: Production variables (or configured via Vercel).

*Note: Legacy preview and testing `.env` files have been archived in `infrastructure/env-archive/` to prevent configuration sprawl.*

## Critical Variables
- `SUPABASE_SERVICE_ROLE_KEY`: Required for the `/api/onboarding` endpoints to bypass RLS and insert securely. Hardcoded fallbacks are strictly prohibited.
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public client key.
- Clerk Auth variables (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`).
