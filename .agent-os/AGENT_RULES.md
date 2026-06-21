# Agent Rules & Directives

> Last updated: 2026-06-21
> This file provides repository-level agent constraints. Product-specific rules live in `.agent-os/FUNDME MD OS/fundme_project_os/`.

## Canonical product truth

All product specifications, architecture, roadmap, and current state are maintained in:
`.agent-os/FUNDME MD OS/fundme_project_os/`

Do not duplicate product truth in this file or other generic Agent OS files.

## Repository constraints

- **Package manager**: pnpm only
- **No production database modifications** without explicit approval
- **Service role keys**: Hardcoded fallbacks for `SUPABASE_SERVICE_ROLE_KEY` are strictly prohibited
- **Forbidden copy**: Active onboarding and thank-you paths must not contain legacy "roast" language
- **No dead code**: No debug logging left in committed code
- **No secrets in client bundles**: Elevated Supabase keys remain server-side only

## Escalation triggers

Escalate to the project owner when:

- A fix requires a product or business decision
- There is genuine ambiguity regarding the product specification
- Introducing changes with significant long-term architectural consequences
- Security or privacy tradeoffs are involved
- Production release is requested outside the release playbook

## Agent discovery

For universal agent rules, source-of-truth precedence, and mandatory reading order, see `AGENTS.md` at the repository root.

For product-specific operating instructions, see:
`.agent-os/FUNDME MD OS/fundme_project_os/FUNDME_PROJECT_OS.md`
