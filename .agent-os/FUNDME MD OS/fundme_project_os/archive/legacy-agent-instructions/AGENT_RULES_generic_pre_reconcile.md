# Agent Rules & Directives

> **This is the single source of truth for agent constraints and behavior.**

## General Constraints
- **Do not modify production databases** without explicit approval.
- **Do not read files out of scope**: Grep before reading whole files. Never read an entire file to find one thing.
- **No dead code**: No debug logging left in.

## Project-Specific Constraints
- **Supabase Persistence**: The API must insert/upsert rows to `onboarding_submissions`. The API must not fake success; if Supabase fails, it must return a non-2xx status.
- **Service Role Keys**: Hardcoded fallbacks for `SUPABASE_SERVICE_ROLE_KEY` are strictly prohibited.
- **Forbidden Copy**: Active onboarding and thank-you paths MUST NOT contain legacy "roast" language (e.g., "Fix my deck", "Your deck, destroyed", "roast", "mercy").

## Interaction Directives
- **Escalate to Project Owner when**:
  - A fix requires a product or business decision.
  - There is genuine ambiguity regarding the product specification.
  - Introducing changes with significant long-term architectural consequences.
