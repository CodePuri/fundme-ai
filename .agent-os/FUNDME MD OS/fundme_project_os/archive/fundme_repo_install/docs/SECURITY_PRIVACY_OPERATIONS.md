# Security, Privacy, and Operations

> Status: Canonical unless marked otherwise  
> Product: Fundme  
> Last updated: 2026-06-21  
> Production baseline: `main` at `c363eb2`, live at `https://tryfundme.in`  
> Rule: Repository and production behavior override stale documents.


## Data sensitivity

Fundme may store founder identity, startup strategy, traction, pitch decks, financial claims, application answers, and private documents. Treat all startup workspace data as confidential.

## Identity and authorization

- Clerk authenticates users.
- Internal authorization determines workspace access.
- Clerk user ID alone is not sufficient authorization for arbitrary resource IDs.
- Admin access uses explicit roles and audit logs.
- Production Clerk instance must replace development mode before broad acquisition.

## Database controls

- RLS for user/workspace-owned tables.
- Public opportunity tables expose only approved fields.
- Elevated server key bypasses RLS and therefore must be isolated to trusted server code.
- Prefer newer Supabase secret keys over legacy service-role keys after compatibility testing.
- Database migrations are committed, reviewed, and applied with backups/rollback consideration.

## Secret handling

- `.env*` ignored except templates.
- Never print secrets in agent logs or command transcripts.
- Never include secrets in prompts, screenshots, recordings, URLs, query strings, or client code.
- Rotate credentials after suspected exposure.
- Maintain an environment-variable name inventory without values.

## Upload security

- Validate file type, size, and content.
- Store outside public buckets unless intentionally public.
- Use signed URLs.
- Scan uploads where feasible.
- Prevent active content execution.
- Set retention and deletion policies.

## Privacy

- Explain what data is collected and how AI providers process it.
- Provide deletion/export paths.
- Do not scrape restricted personal sources without authorization.
- LinkedIn support should be URL/manual context or user-authorized data, not unauthorized scraping.
- Do not train shared models on private founder data without explicit consent and contractual support.

## AI operations

- Record provider, model, prompt version, latency, cost, and status.
- Redact or minimize unnecessary sensitive data sent to models.
- Support provider failure and retry behavior.
- Maintain a human-editable workflow.
- Never auto-submit or send external communication without explicit user action until a later approved automation phase.

## Reliability

- Daily database backups or managed equivalent.
- Error monitoring and alert thresholds.
- Synthetic smoke tests.
- Incident log and rollback runbook.
- Dependency and security update cadence.
- Rate limiting for public and expensive endpoints.
- Abuse detection for uploads and generation.

## Operational ownership

Every production service must have:

- owner;
- environment inventory;
- health signal;
- failure alert;
- recovery procedure;
- cost visibility;
- data retention policy.
