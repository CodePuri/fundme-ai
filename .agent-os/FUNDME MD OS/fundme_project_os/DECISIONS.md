# Product and Architecture Decisions

> Status: Canonical unless marked otherwise  
> Product: Fundme  
> Last updated: 2026-06-21  
> Production baseline: `main` at `c363eb2`, live at `https://tryfundme.in`  
> Rule: Repository and production behavior override stale documents.


These decisions remain active until explicitly superseded.

## D-001 - Diagnosis before automation

Fundme starts with diagnosis and improvement. Full browser automation is later because it is brittle, expensive, and does not solve trust or application quality first.

## D-002 - One reusable dossier

Founder and startup context is captured once as a versioned evidence-backed dossier. All assessments, matches, and drafts derive from it.

## D-003 - Deterministic matching before AI explanation

Hard filters first, weighted scoring second, AI explanation third. AI does not determine raw eligibility truth.

## D-004 - Public opportunity discovery

Opportunity browsing and canonical program pages are public. Private founder workspace and drafts require authentication.

## D-005 - Curated data before scale

A smaller sourced, fresh dataset is more valuable than thousands of stale records.

## D-006 - Modular monolith first

Continue with Next.js and managed services. Add queue/workers for long tasks when required. Do not introduce microservices for status.

## D-007 - Functional core before redesign

No broad cosmetic redesign before dossier, assessment, matching, drafting, and tracker are functional.

## D-008 - No unsupported founder claims

AI may not invent or silently infer traction, customers, achievements, funding, team, or eligibility.

## D-009 - Stable staging instead of deployment sprawl

Create one persistent staging path and limit branch/deployment creation. Preview environment drift is an operational defect.

## D-010 - Fundme is the canonical brand

Use Fundme in product surfaces. Do not alternate names without a deliberate brand decision.

## D-011 - Analytics is part of feature completion

Critical product actions require events and error observability before phase acceptance.

## D-012 - `llms.txt` is optional and experimental

It may help machine orientation but is not treated as a ranking requirement or substitute for SEO.

## D-013 - Phase 1 blocked for external configuration

Platform foundational setup (Clerk production keys, Sentry DSN, PostHog tokens) requires explicit user creation in external dashboards before production cutover can proceed.

