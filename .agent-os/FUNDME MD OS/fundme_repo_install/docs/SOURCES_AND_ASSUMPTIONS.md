# Sources, Assumptions, and Verification Ledger

> Status: Canonical unless marked otherwise  
> Product: Fundme  
> Last updated: 2026-06-21  
> Production baseline: `main` at `c363eb2`, live at `https://tryfundme.in`  
> Rule: Repository and production behavior override stale documents.


## Internal source material distilled

- `FundMe.AI Master PRD and Operating Context` - product thesis, critique-first wedge, phased business model.
- `Fundme.ai Source of Truth Extraction` - dossier, matching, drafting, tracker, data entities, and scope boundaries.
- `Clean MVP PRD + build handoff` - upload-to-match-to-draft-to-track loop and screens.
- Historical Fundme builder and QA prompts - route history, VUX experiments, branch/deployment lessons.
- Production acceptance reports - accepted release `c363eb2` and live-domain verification.

Historical claims such as `/explore` being protected are superseded by the accepted public route policy.

## External references

### Competitors

- Fundraisly: https://fundraisly.com/
- Fundraisly on Product Hunt: https://www.producthunt.com/products/fundraisly
- VC Boom: https://www.vcboom.com/
- VC Boom on Product Hunt: https://www.producthunt.com/products/vcboom

### Platform

- Next.js proxy file convention: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
- Clerk production deployments: https://clerk.com/docs/deployments/overview
- Clerk environments: https://clerk.com/docs/deployments/environments
- Supabase API keys: https://supabase.com/docs/guides/getting-started/api-keys
- Supabase new key migration: https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys
- Vercel environment variables: https://vercel.com/docs/environment-variables

### Search and discovery

- Google AI features and websites: https://developers.google.com/search/docs/appearance/ai-features
- Google robots.txt: https://developers.google.com/search/docs/crawling-indexing/robots/create-robots-txt
- Google structured data gallery: https://developers.google.com/search/docs/appearance/structured-data/search-gallery
- Organization structured data: https://developers.google.com/search/docs/appearance/structured-data/organization
- SoftwareApplication structured data: https://developers.google.com/search/docs/appearance/structured-data/software-app
- `llms.txt` proposal: https://llmstxt.org/

## Assumptions requiring Phase 0 verification

- Exact current repository folder structure.
- Real versus demo status of authenticated dashboard routes.
- Current Supabase schema beyond `onboarding_submissions`.
- Current opportunity count and source quality.
- Current AI endpoints and provider usage.
- Whether robots, sitemap, metadata, or structured data already exist partially.
- Current analytics tooling.
- Current Clerk development/production instance state.
- Whether historical Supabase credentials were exposed and require rotation/migration.

## Classification labels

- `CURRENT`: verified repository/production truth.
- `SUPERSEDED`: historically true but no longer authoritative.
- `ASSUMPTION`: plausible and requires evidence.
- `DECISION REQUIRED`: owner choice needed.
- `FUTURE`: approved direction, not current behavior.
