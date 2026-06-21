# Opportunity Data, SEO, AEO, and Organic Discovery

> Status: Canonical unless marked otherwise  
> Product: Fundme  
> Last updated: 2026-06-21  
> Production baseline: `main` at `c363eb2`, live at `https://tryfundme.in`  
> Rule: Repository and production behavior override stale documents.


## Strategic purpose

The opportunity database is both a product input and a distribution asset. It must be structured, current, indexable, useful, and defensible.

## Initial coverage

Start curated, not massive.

### Launch categories

- Accelerators.
- Incubators.
- Fellowships.
- Startup competitions.
- University founder programs.
- Cloud, AI, and startup perks.
- Selected structured grants where requirements can be represented reliably.

### Geographic priority

1. India ecosystem depth.
2. Global programs open to Indian/international founders.
3. High-demand US, UK, Europe, MENA, and Asia programs.

## Opportunity schema

Required fields:

- name, slug, operator;
- category and subcategory;
- official URL and application URL;
- geography and countries allowed;
- stage and sector fit;
- incorporation/entity requirements;
- benefits, funding, equity terms, and costs;
- deadline type/date and timezone;
- application status;
- required documents;
- eligibility rules;
- question schema;
- founder and startup emphasis;
- expected effort;
- source URLs;
- `last_verified_at`;
- verification owner/status;
- confidence and notes.

## Freshness system

- Deadline-critical records reviewed more frequently.
- Rolling programs reviewed on a schedule.
- Source changes create review tasks.
- Stale records are labeled or removed from ranking.
- Users can report corrections.
- Admin queue prioritizes traffic, upcoming deadline, and uncertainty.

## Public page architecture

- `/programs/[slug]` or one canonical equivalent.
- `/programs/category/[category]`.
- `/programs/country/[country]`.
- `/programs/stage/[stage]`.
- `/programs/sector/[sector]`.
- Editorial comparisons and application guides only where unique value exists.

Avoid thin combinations that create duplicate or low-value pages.

## SEO foundations

- Unique title and meta description.
- Canonical URL.
- Indexable server-rendered content.
- Internal links from categories, related programs, and guides.
- XML sitemap or sitemap index.
- Root `robots.txt` with sitemap reference.
- Breadcrumbs.
- Organization, SoftwareApplication, BreadcrumbList, and appropriate Article/FAQ structured data only when visible content supports it.
- Open Graph and social previews.
- Search Console and Bing Webmaster verification.
- 404, redirect, and canonical audits.

## AEO principles

Google states that its existing SEO fundamentals apply to AI Overviews and AI Mode; no special AI markup or machine-readable file is required. Therefore AEO work focuses on:

- people-first, factual content;
- clear question-and-answer structure;
- visible text containing important facts;
- source citations and verification dates;
- strong internal linking;
- structured data matching visible content;
- indexability and page experience.

## `llms.txt`

Add it as an experimental orientation file, not as an SEO guarantee. It should summarize the product and link to canonical public content. It must not expose private routes, internal prompts, or sensitive information.

## Content engine

High-intent content clusters:

- Best accelerators for [stage/sector/geography].
- Program deadlines and application cycles.
- Application question breakdowns.
- What specific programs look for.
- Founder/startup readiness guides.
- Grant and perk explainers.
- Program comparisons.
- Outcome-based founder case studies when evidence exists.

## Backlink engine

- Partner with incubators, universities, founder communities, coworking spaces, accelerators, perk providers, and startup newsletters.
- Offer embeddable or shareable verified program pages.
- Publish original data reports only after dataset quality supports them.
- Avoid buying low-quality links or publishing mass AI content.

## SEO acceptance gate

- Crawlable public pages.
- Valid sitemap and robots.
- No private pages indexed.
- No duplicate canonical routes.
- Structured data passes validation.
- Search Console has no critical indexing issue.
- Program pages provide unique decision value beyond copied descriptions.
