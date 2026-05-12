-- =============================================================
-- Functional Intelligence MVP — Database Schema
-- =============================================================
-- Run this in your Supabase SQL Editor:
--   https://supabase.com/dashboard → SQL Editor
--
-- WARNING: Do NOT run automatically. Manual review required.
-- This script is documentation + executable when ready.
-- =============================================================

-- ─── 1. Assessments Table ─────────────────────────────────────

create table if not exists public.assessments (
  id                uuid primary key default gen_random_uuid(),

  -- Identity (at least one should be populated)
  clerk_user_id     text,                -- set after auth
  anonymous_id      text,                -- set before auth (crypto.randomUUID)
  ip_hash           text,                -- server-side IP hash (for rate limiting)

  -- Inputs
  website_url       text,
  linkedin_url      text,
  startup_name      text,
  startup_notes     text,
  uploaded_files    jsonb default '[]'::jsonb,

  -- Analysis data
  answers_json      jsonb not null default '[]'::jsonb,
  website_extract_json jsonb,            -- full /api/website/extract output
  report_json       jsonb not null,      -- full StructuredReport output

  -- Metadata
  model_provider    text,                -- e.g., "groq", "openai", "anthropic"
  model_name        text,                -- e.g., "llama-3.3-70b-versatile"
  analysis_status   text not null default 'completed',
  -- possible values: pending, processing, completed, failed, fallback

  -- Timestamps
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ─── Indexes ─────────────────────────────────────────────────

create index if not exists idx_assessments_clerk_user
  on public.assessments(clerk_user_id);

create index if not exists idx_assessments_anonymous
  on public.assessments(anonymous_id);

create index if not exists idx_assessments_ip_hash
  on public.assessments(ip_hash);

create index if not exists idx_assessments_created_desc
  on public.assessments(created_at desc);

-- ─── 2. Assessment Rate Limits Table ─────────────────────────

create table if not exists public.assessment_rate_limits (
  id                uuid primary key default gen_random_uuid(),

  -- Identity (at least one populated)
  clerk_user_id     text,
  anonymous_id      text,
  ip_hash           text,

  -- Rate limit period
  date_key          text not null,        -- format: "YYYY-MM-DD"

  -- Usage
  analysis_count    int not null default 1,

  -- Timestamps
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ─── Indexes ─────────────────────────────────────────────────

create index if not exists idx_rate_limit_clerk_user
  on public.assessment_rate_limits(clerk_user_id);

create index if not exists idx_rate_limit_anonymous
  on public.assessment_rate_limits(anonymous_id);

create index if not exists idx_rate_limit_ip_hash
  on public.assessment_rate_limits(ip_hash);

create index if not exists idx_rate_limit_date_key
  on public.assessment_rate_limits(date_key);

create unique index if not exists idx_rate_limit_unique
  on public.assessment_rate_limits(date_key, coalesce(clerk_user_id, ''), coalesce(anonymous_id, ''), coalesce(ip_hash, ''));

-- ─── 3. RLS (service-role bypasses these, but good practice) ──

alter table public.assessments enable row level security;
alter table public.assessment_rate_limits enable row level security;

create policy "service role full access assessments"
  on public.assessments
  as permissive
  for all
  to service_role
  using (true)
  with check (true);

create policy "service role full access rate limits"
  on public.assessment_rate_limits
  as permissive
  for all
  to service_role
  using (true)
  with check (true);

-- ─── Intended Usage Limits ───────────────────────────────────
-- These are NOT enforced by the database.
-- Enforcement happens in API routes (app/api/assessment/*).
--
-- Anonymous users:
--   max 2 analyses per day per IP + anonymous_id
--
-- Signed-in users:
--   max 5 assessments per day per Clerk user
-- =============================================================
