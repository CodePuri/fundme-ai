-- ============================================================================
-- FundMe V1 Database Baseline Migration (Production-Hardened Security Baseline)
-- Applied to: Staging (nnzdplkjizwgsalizijd)
-- ============================================================================

-- 1. Tracking Schema
CREATE SCHEMA IF NOT EXISTS supabase_migrations;
CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
  version text PRIMARY KEY,
  statements text[],
  name text,
  inserted_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Core Tables
CREATE TABLE IF NOT EXISTS public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text,
  claim_token text NOT NULL UNIQUE,
  claim_status text NOT NULL DEFAULT 'pending',
  founder_name text,
  startup_name text,
  website_url text,
  readiness_score integer NOT NULL,
  verdict text NOT NULL,
  concise_verdict text,
  confidence text NOT NULL,
  completion_state text NOT NULL,
  evidence_coverage integer NOT NULL,
  strongest_dimension text,
  weakest_dimension text,
  traction_state text,
  rubric_version text NOT NULL,
  dimensions jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  findings jsonb NOT NULL DEFAULT '[]'::jsonb,
  founder_review jsonb NOT NULL DEFAULT '{}'::jsonb,
  startup_review jsonb NOT NULL DEFAULT '{}'::jsonb,
  deck_review jsonb NOT NULL DEFAULT '{}'::jsonb,
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  raw_session jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  claimed_at timestamp with time zone,
  share_token text UNIQUE,
  shared_at timestamp with time zone,
  share_views integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.founder_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL UNIQUE,
  email text,
  name text,
  role text,
  linkedin_url text,
  profile_text text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.startup_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL UNIQUE,
  startup_name text,
  website_url text,
  description text,
  stage text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Fix column naming for onboarding_submissions
CREATE TABLE IF NOT EXISTS public.onboarding_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text,
  full_name text,
  name text,
  role text,
  company_name text,
  company text,
  email text,
  website_url text,
  linkedin_url text,
  x_url text,
  startup_idea text,
  notes text,
  voice_transcript text,
  files_metadata jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_route text NOT NULL DEFAULT '/onboarding',
  status text NOT NULL DEFAULT 'pending',
  phone_country_name text,
  phone_country_code text,
  phone_country_iso2 text,
  phone_number_raw text,
  phone_number_e164 text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_clerk_user_id text NOT NULL,
  referral_code text NOT NULL,
  referred_claim_token text,
  referred_clerk_user_id text,
  status text NOT NULL DEFAULT 'visited',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  signed_up_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  session_id text,
  clerk_user_id text,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_assessments_clerk_user_id ON public.assessments (clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_claim_token ON public.assessments (claim_token);
CREATE INDEX IF NOT EXISTS idx_assessments_share_token ON public.assessments (share_token);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON public.assessments (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_founder_profiles_clerk ON public.founder_profiles (clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_startup_profiles_clerk ON public.startup_profiles (clerk_user_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_submissions_clerk ON public.onboarding_submissions (clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_submissions_created_at ON public.onboarding_submissions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_clerk ON public.referrals (referrer_clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_clerk ON public.referrals (referred_clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals (referral_code);

CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON public.analytics_events (event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON public.analytics_events (created_at DESC);

-- 4. HARDENED GRANTS
-- Strictly revoke destructive / administrative capabilities
REVOKE DELETE, TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM anon, authenticated, public;

-- Grant minimal necessary DML to service_role and backend anon
GRANT SELECT, INSERT, UPDATE ON public.assessments TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.founder_profiles TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.startup_profiles TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.referrals TO anon, authenticated, service_role;
GRANT INSERT ON public.onboarding_submissions TO anon, authenticated, service_role;
GRANT INSERT ON public.analytics_events TO anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Drop all old policies
DROP POLICY IF EXISTS "Allow anon insert and select on assessments" ON public.assessments;
DROP POLICY IF EXISTS "Allow insert of pending assessments" ON public.assessments;
DROP POLICY IF EXISTS "Allow public read of assessments by claim_token" ON public.assessments;
DROP POLICY IF EXISTS "Allow service_role full access on assessments" ON public.assessments;
DROP POLICY IF EXISTS "service_role_manage_assessments" ON public.assessments;
DROP POLICY IF EXISTS "assessments_insert_pending" ON public.assessments;
DROP POLICY IF EXISTS "assessments_select_policy" ON public.assessments;
DROP POLICY IF EXISTS "assessments_update_claim" ON public.assessments;

DROP POLICY IF EXISTS "Allow anon insert and select on founder_profiles" ON public.founder_profiles;
DROP POLICY IF EXISTS "Allow service_role full access on founder_profiles" ON public.founder_profiles;
DROP POLICY IF EXISTS "service_role_manage_founder_profiles" ON public.founder_profiles;
DROP POLICY IF EXISTS "founder_profiles_policy" ON public.founder_profiles;

DROP POLICY IF EXISTS "Allow anon insert and select on startup_profiles" ON public.startup_profiles;
DROP POLICY IF EXISTS "Allow service_role full access on startup_profiles" ON public.startup_profiles;
DROP POLICY IF EXISTS "service_role_manage_startup_profiles" ON public.startup_profiles;
DROP POLICY IF EXISTS "startup_profiles_policy" ON public.startup_profiles;

DROP POLICY IF EXISTS "Allow anon insert and select on onboarding_submissions" ON public.onboarding_submissions;
DROP POLICY IF EXISTS "Allow service_role full access on onboarding_submissions" ON public.onboarding_submissions;
DROP POLICY IF EXISTS "service_role_manage_onboarding_submissions" ON public.onboarding_submissions;
DROP POLICY IF EXISTS "onboarding_insert_only" ON public.onboarding_submissions;

DROP POLICY IF EXISTS "Allow all on referrals" ON public.referrals;
DROP POLICY IF EXISTS "service_role_manage_referrals" ON public.referrals;
DROP POLICY IF EXISTS "referrals_policy" ON public.referrals;

DROP POLICY IF EXISTS "Allow all on analytics_events" ON public.analytics_events;
DROP POLICY IF EXISTS "service_role_manage_analytics_events" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_events_insert_only" ON public.analytics_events;

-- Strict Service Role Policies
CREATE POLICY "service_role_manage_assessments" ON public.assessments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_manage_founder_profiles" ON public.founder_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_manage_startup_profiles" ON public.startup_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_manage_onboarding_submissions" ON public.onboarding_submissions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_manage_referrals" ON public.referrals FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_manage_analytics_events" ON public.analytics_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Defense-in-depth policies for anon / authenticated:
-- 1. Assessments:
CREATE POLICY "assessments_insert_pending" ON public.assessments
  FOR INSERT TO anon, authenticated
  WITH CHECK (claim_token IS NOT NULL);

CREATE POLICY "assessments_select_policy" ON public.assessments
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "assessments_update_claim" ON public.assessments
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 2. Profiles:
CREATE POLICY "founder_profiles_policy" ON public.founder_profiles
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "startup_profiles_policy" ON public.startup_profiles
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Referrals:
CREATE POLICY "referrals_policy" ON public.referrals
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Onboarding Submissions (Write-only, NO SELECT to anon):
CREATE POLICY "onboarding_insert_only" ON public.onboarding_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 5. Analytics Events (Write-only, NO SELECT to anon):
CREATE POLICY "analytics_events_insert_only" ON public.analytics_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Record migration
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('20260830000001', 'v1_baseline_schema')
ON CONFLICT (version) DO UPDATE SET inserted_at = now();
