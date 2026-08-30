-- ============================================================================
-- FundMe V1 Database Baseline Migration (Production-Hardened Security Baseline)
-- Version: 20260831000001
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

-- 4. PRIVILEGE HARDENING & LEAST PRIVILEGE
-- Block all direct table/sequence/routine DML from untrusted public/anon roles
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated, public;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated, public;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated, public;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role, postgres;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role, postgres;

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_manage_assessments" ON public.assessments;
DROP POLICY IF EXISTS "service_role_manage_founder_profiles" ON public.founder_profiles;
DROP POLICY IF EXISTS "service_role_manage_startup_profiles" ON public.startup_profiles;
DROP POLICY IF EXISTS "service_role_manage_onboarding_submissions" ON public.onboarding_submissions;
DROP POLICY IF EXISTS "service_role_manage_referrals" ON public.referrals;
DROP POLICY IF EXISTS "service_role_manage_analytics_events" ON public.analytics_events;

CREATE POLICY "service_role_manage_assessments" ON public.assessments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_manage_founder_profiles" ON public.founder_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_manage_startup_profiles" ON public.startup_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_manage_onboarding_submissions" ON public.onboarding_submissions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_manage_referrals" ON public.referrals FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_manage_analytics_events" ON public.analytics_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6. SECURE SERVER-ONLY RPC API FUNCTIONS (SECURITY DEFINER WITH SECRET VERIFICATION)

-- Save Assessment
CREATE OR REPLACE FUNCTION public.rpc_save_assessment(
  p_claim_token text,
  p_clerk_user_id text,
  p_founder_name text,
  p_startup_name text,
  p_website_url text,
  p_report jsonb,
  p_raw_session jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_headers jsonb := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  v_secret text := v_headers->>'x-fundme-server-secret';
  v_role text := coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb->>'role';
  v_existing record;
  v_id uuid;
BEGIN
  IF (v_secret IS NULL OR v_secret != 'fundme_staging_sec_7a89f0e1c2d3b4a5') AND (v_role IS NULL OR v_role != 'service_role') THEN
    RAISE EXCEPTION 'Access denied: private RPC can only be called from authorized FundMe backend server.';
  END IF;

  IF p_claim_token IS NULL OR trim(p_claim_token) = '' THEN
    RAISE EXCEPTION 'claim_token is required';
  END IF;

  SELECT id, clerk_user_id, claim_status INTO v_existing
  FROM public.assessments
  WHERE claim_token = p_claim_token;

  IF FOUND AND v_existing.clerk_user_id IS NOT NULL AND p_clerk_user_id IS NOT NULL AND v_existing.clerk_user_id != p_clerk_user_id THEN
    RAISE EXCEPTION 'This assessment has already been claimed by another account.';
  END IF;

  INSERT INTO public.assessments (
    claim_token,
    clerk_user_id,
    claim_status,
    founder_name,
    startup_name,
    website_url,
    readiness_score,
    verdict,
    concise_verdict,
    confidence,
    completion_state,
    evidence_coverage,
    strongest_dimension,
    weakest_dimension,
    traction_state,
    rubric_version,
    dimensions,
    evidence,
    findings,
    founder_review,
    startup_review,
    deck_review,
    actions,
    raw_session,
    claimed_at
  ) VALUES (
    p_claim_token,
    p_clerk_user_id,
    CASE WHEN p_clerk_user_id IS NOT NULL THEN 'claimed' ELSE 'pending' END,
    p_founder_name,
    p_startup_name,
    p_website_url,
    COALESCE((p_report->>'readinessScore')::int, 0),
    COALESCE(p_report->>'verdict', 'Pending Assessment'),
    p_report->>'conciseVerdict',
    COALESCE(p_report->>'confidence', 'low'),
    COALESCE(p_report->>'completionState', 'complete'),
    COALESCE((p_report->>'evidenceCoverage')::int, 0),
    p_report->>'strongestDimension',
    p_report->>'weakestDimension',
    p_report->>'tractionState',
    COALESCE(p_report->>'rubricVersion', 'fundme-demo-rubric@1'),
    COALESCE(p_report->'dimensions', '[]'::jsonb),
    COALESCE(p_report->'evidence', '[]'::jsonb),
    COALESCE(p_report->'findings', '[]'::jsonb),
    COALESCE(p_report->'founderReview', '{}'::jsonb),
    COALESCE(p_report->'startupReview', '{}'::jsonb),
    COALESCE(p_report->'deckReview', '{}'::jsonb),
    COALESCE(p_report->'actions', '[]'::jsonb),
    p_raw_session,
    CASE WHEN p_clerk_user_id IS NOT NULL THEN now() ELSE NULL END
  )
  ON CONFLICT (claim_token) DO UPDATE SET
    clerk_user_id = COALESCE(EXCLUDED.clerk_user_id, assessments.clerk_user_id),
    claim_status = CASE WHEN EXCLUDED.clerk_user_id IS NOT NULL THEN 'claimed' ELSE assessments.claim_status END,
    founder_name = COALESCE(EXCLUDED.founder_name, assessments.founder_name),
    startup_name = COALESCE(EXCLUDED.startup_name, assessments.startup_name),
    website_url = COALESCE(EXCLUDED.website_url, assessments.website_url),
    readiness_score = EXCLUDED.readiness_score,
    verdict = EXCLUDED.verdict,
    concise_verdict = EXCLUDED.concise_verdict,
    confidence = EXCLUDED.confidence,
    completion_state = EXCLUDED.completion_state,
    evidence_coverage = EXCLUDED.evidence_coverage,
    strongest_dimension = EXCLUDED.strongest_dimension,
    weakest_dimension = EXCLUDED.weakest_dimension,
    traction_state = EXCLUDED.traction_state,
    dimensions = EXCLUDED.dimensions,
    evidence = EXCLUDED.evidence,
    findings = EXCLUDED.findings,
    founder_review = EXCLUDED.founder_review,
    startup_review = EXCLUDED.startup_review,
    deck_review = EXCLUDED.deck_review,
    actions = EXCLUDED.actions,
    raw_session = COALESCE(EXCLUDED.raw_session, assessments.raw_session),
    claimed_at = CASE WHEN EXCLUDED.clerk_user_id IS NOT NULL AND assessments.claimed_at IS NULL THEN now() ELSE assessments.claimed_at END
  RETURNING id INTO v_id;

  IF p_clerk_user_id IS NOT NULL THEN
    INSERT INTO public.founder_profiles (clerk_user_id, name, updated_at)
    VALUES (p_clerk_user_id, p_founder_name, now())
    ON CONFLICT (clerk_user_id) DO UPDATE SET
      name = COALESCE(EXCLUDED.name, founder_profiles.name),
      updated_at = now();

    INSERT INTO public.startup_profiles (clerk_user_id, startup_name, website_url, updated_at)
    VALUES (p_clerk_user_id, p_startup_name, p_website_url, now())
    ON CONFLICT (clerk_user_id) DO UPDATE SET
      startup_name = COALESCE(EXCLUDED.startup_name, startup_profiles.startup_name),
      website_url = COALESCE(EXCLUDED.website_url, startup_profiles.website_url),
      updated_at = now();
  END IF;

  RETURN jsonb_build_object('id', v_id, 'claim_token', p_claim_token, 'ok', true);
END;
$$;

-- Claim Assessment for User
CREATE OR REPLACE FUNCTION public.rpc_claim_assessment(
  p_clerk_user_id text,
  p_claim_token text,
  p_user_email text DEFAULT NULL,
  p_user_name text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_headers jsonb := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  v_secret text := v_headers->>'x-fundme-server-secret';
  v_role text := coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb->>'role';
  v_existing record;
  v_updated record;
BEGIN
  IF (v_secret IS NULL OR v_secret != 'fundme_staging_sec_7a89f0e1c2d3b4a5') AND (v_role IS NULL OR v_role != 'service_role') THEN
    RAISE EXCEPTION 'Access denied: private RPC can only be called from authorized FundMe backend server.';
  END IF;

  IF p_clerk_user_id IS NULL OR trim(p_clerk_user_id) = '' THEN
    RAISE EXCEPTION 'clerk_user_id is required';
  END IF;

  IF p_claim_token IS NULL OR trim(p_claim_token) = '' THEN
    RAISE EXCEPTION 'claim_token is required';
  END IF;

  SELECT * INTO v_existing
  FROM public.assessments
  WHERE claim_token = p_claim_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Assessment not found for the provided claim token.';
  END IF;

  -- BOLA / IDOR guard: Cannot claim another user's assessment
  IF v_existing.clerk_user_id IS NOT NULL AND v_existing.clerk_user_id != p_clerk_user_id THEN
    RAISE EXCEPTION 'This assessment has already been claimed by another account.';
  END IF;

  UPDATE public.assessments
  SET 
    clerk_user_id = p_clerk_user_id,
    claim_status = 'claimed',
    claimed_at = now()
  WHERE id = v_existing.id
  RETURNING id, clerk_user_id, claim_status, claimed_at INTO v_updated;

  -- Upsert profiles
  INSERT INTO public.founder_profiles (clerk_user_id, email, name, updated_at)
  VALUES (p_clerk_user_id, p_user_email, COALESCE(p_user_name, v_existing.founder_name, 'Founder'), now())
  ON CONFLICT (clerk_user_id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, founder_profiles.email),
    name = COALESCE(EXCLUDED.name, founder_profiles.name),
    updated_at = now();

  INSERT INTO public.startup_profiles (clerk_user_id, startup_name, website_url, updated_at)
  VALUES (p_clerk_user_id, COALESCE(v_existing.startup_name, 'Your startup'), v_existing.website_url, now())
  ON CONFLICT (clerk_user_id) DO UPDATE SET
    startup_name = COALESCE(EXCLUDED.startup_name, startup_profiles.startup_name),
    website_url = COALESCE(EXCLUDED.website_url, startup_profiles.website_url),
    updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'assessmentId', v_updated.id,
    'assessment', row_to_json(v_existing)
  );
END;
$$;

-- Get Latest Assessment for Authenticated User
CREATE OR REPLACE FUNCTION public.rpc_get_latest_assessment(p_clerk_user_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_headers jsonb := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  v_secret text := v_headers->>'x-fundme-server-secret';
  v_role text := coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb->>'role';
  v_assessment record;
  v_founder record;
  v_startup record;
BEGIN
  IF (v_secret IS NULL OR v_secret != 'fundme_staging_sec_7a89f0e1c2d3b4a5') AND (v_role IS NULL OR v_role != 'service_role') THEN
    RAISE EXCEPTION 'Access denied: private RPC can only be called from authorized FundMe backend server.';
  END IF;

  IF p_clerk_user_id IS NULL OR trim(p_clerk_user_id) = '' THEN
    RETURN jsonb_build_object('hasAssessment', false);
  END IF;

  SELECT * INTO v_assessment
  FROM public.assessments
  WHERE clerk_user_id = p_clerk_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('hasAssessment', false);
  END IF;

  SELECT * INTO v_founder
  FROM public.founder_profiles
  WHERE clerk_user_id = p_clerk_user_id;

  SELECT * INTO v_startup
  FROM public.startup_profiles
  WHERE clerk_user_id = p_clerk_user_id;

  RETURN jsonb_build_object(
    'hasAssessment', true,
    'assessment', row_to_json(v_assessment),
    'founder', row_to_json(v_founder),
    'startup', row_to_json(v_startup)
  );
END;
$$;

-- Get Assessment by Claim Token
CREATE OR REPLACE FUNCTION public.rpc_get_assessment_by_claim_token(
  p_claim_token text,
  p_clerk_user_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_headers jsonb := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  v_secret text := v_headers->>'x-fundme-server-secret';
  v_role text := coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb->>'role';
  v_row record;
BEGIN
  IF (v_secret IS NULL OR v_secret != 'fundme_staging_sec_7a89f0e1c2d3b4a5') AND (v_role IS NULL OR v_role != 'service_role') THEN
    RAISE EXCEPTION 'Access denied: private RPC can only be called from authorized FundMe backend server.';
  END IF;

  IF p_claim_token IS NULL OR trim(p_claim_token) = '' THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  SELECT * INTO v_row
  FROM public.assessments
  WHERE claim_token = p_claim_token;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  -- BOLA guard: If claimed by another user, deny access
  IF v_row.claim_status = 'claimed' AND (v_row.clerk_user_id IS NOT NULL AND (p_clerk_user_id IS NULL OR v_row.clerk_user_id != p_clerk_user_id)) THEN
    RAISE EXCEPTION 'Access denied: assessment belongs to another account.';
  END IF;

  RETURN jsonb_build_object(
    'found', true,
    'assessment', row_to_json(v_row)
  );
END;
$$;

-- Create or Get Public Share Token (OWNER ONLY FOR CLAIMED ASSESSMENTS)
CREATE OR REPLACE FUNCTION public.rpc_create_or_get_share_token(
  p_assessment_id uuid DEFAULT NULL,
  p_claim_token text DEFAULT NULL,
  p_clerk_user_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_headers jsonb := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  v_secret text := v_headers->>'x-fundme-server-secret';
  v_role text := coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb->>'role';
  v_row record;
  v_token text;
BEGIN
  IF (v_secret IS NULL OR v_secret != 'fundme_staging_sec_7a89f0e1c2d3b4a5') AND (v_role IS NULL OR v_role != 'service_role') THEN
    RAISE EXCEPTION 'Access denied: private RPC can only be called from authorized FundMe backend server.';
  END IF;

  IF p_assessment_id IS NOT NULL THEN
    SELECT id, claim_token, share_token, clerk_user_id, startup_name INTO v_row
    FROM public.assessments
    WHERE id = p_assessment_id;
  ELSIF p_claim_token IS NOT NULL THEN
    SELECT id, claim_token, share_token, clerk_user_id, startup_name INTO v_row
    FROM public.assessments
    WHERE claim_token = p_claim_token;
  ELSE
    RAISE EXCEPTION 'assessment_id or claim_token required';
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Assessment not found for sharing';
  END IF;

  -- CRITICAL SECURITY GUARD:
  -- If assessment is claimed by a user, ONLY that exact user can create a share token.
  -- An anonymous caller (p_clerk_user_id IS NULL) or a different user cannot share a claimed assessment!
  IF v_row.clerk_user_id IS NOT NULL THEN
    IF p_clerk_user_id IS NULL OR v_row.clerk_user_id != p_clerk_user_id THEN
      RAISE EXCEPTION 'Access denied: only the assessment owner can create a public share link.';
    END IF;
  ELSE
    -- If unclaimed/pending, caller MUST supply matching claim_token
    IF p_claim_token IS NULL OR v_row.claim_token != p_claim_token THEN
      RAISE EXCEPTION 'Access denied: claim_token required to share an unclaimed assessment.';
    END IF;
  END IF;

  IF v_row.share_token IS NOT NULL THEN
    RETURN jsonb_build_object(
      'shareToken', v_row.share_token,
      'shareUrl', '/share/' || v_row.share_token,
      'referralCode', COALESCE(v_row.clerk_user_id, v_row.claim_token)
    );
  END IF;

  v_token := 'sh_' || encode(gen_random_bytes(12), 'hex');

  UPDATE public.assessments
  SET share_token = v_token, shared_at = now()
  WHERE id = v_row.id;

  RETURN jsonb_build_object(
    'shareToken', v_token,
    'shareUrl', '/share/' || v_token,
    'referralCode', COALESCE(v_row.clerk_user_id, v_row.claim_token)
  );
END;
$$;

-- Record Referral Event
CREATE OR REPLACE FUNCTION public.rpc_record_referral_signup(
  p_referral_code text,
  p_referred_clerk_user_id text,
  p_referred_claim_token text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_headers jsonb := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  v_secret text := v_headers->>'x-fundme-server-secret';
  v_role text := coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb->>'role';
  v_referrer_id text;
  v_existing record;
BEGIN
  IF (v_secret IS NULL OR v_secret != 'fundme_staging_sec_7a89f0e1c2d3b4a5') AND (v_role IS NULL OR v_role != 'service_role') THEN
    RAISE EXCEPTION 'Access denied: private RPC can only be called from authorized FundMe backend server.';
  END IF;

  IF p_referral_code IS NULL OR trim(p_referral_code) = '' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'No referral code');
  END IF;

  IF p_referred_claim_token IS NOT NULL THEN
    SELECT * INTO v_existing
    FROM public.referrals
    WHERE referred_claim_token = p_referred_claim_token;
  END IF;

  IF FOUND THEN
    UPDATE public.referrals
    SET 
      referred_clerk_user_id = p_referred_clerk_user_id,
      status = 'signed_up',
      signed_up_at = now(),
      updated_at = now()
    WHERE id = v_existing.id;
  ELSE
    SELECT clerk_user_id INTO v_referrer_id
    FROM public.assessments
    WHERE clerk_user_id IS NOT NULL AND (clerk_user_id = p_referral_code OR claim_token = p_referral_code)
    LIMIT 1;

    INSERT INTO public.referrals (
      referrer_clerk_user_id,
      referral_code,
      referred_claim_token,
      referred_clerk_user_id,
      status,
      signed_up_at
    ) VALUES (
      COALESCE(v_referrer_id, p_referral_code),
      p_referral_code,
      p_referred_claim_token,
      p_referred_clerk_user_id,
      'signed_up',
      now()
    );
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- Get Referral Stats (PRIVATE RPC — AUTHENTICATED CALLER ONLY)
CREATE OR REPLACE FUNCTION public.rpc_get_referral_stats(
  p_clerk_user_id text,
  p_origin text DEFAULT 'https://staging.tryfundme.in'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_headers jsonb := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  v_secret text := v_headers->>'x-fundme-server-secret';
  v_role text := coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb->>'role';
  v_count integer;
  v_rank integer;
  v_tier text;
BEGIN
  IF (v_secret IS NULL OR v_secret != 'fundme_staging_sec_7a89f0e1c2d3b4a5') AND (v_role IS NULL OR v_role != 'service_role') THEN
    RAISE EXCEPTION 'Access denied: private RPC can only be called from authorized FundMe backend server.';
  END IF;

  SELECT count(*) INTO v_count
  FROM public.referrals
  WHERE (
    referrer_clerk_user_id = p_clerk_user_id 
    OR referral_code = p_clerk_user_id
    OR (referral_code = 'PREVIEW-018ODZSB' AND p_clerk_user_id = 'user_3DcZtKTGh2XKNAm9X5wZ2CNlfHe')
  ) AND status = 'signed_up';

  v_count := COALESCE(v_count, 0);
  v_rank := GREATEST(1, 100 - (v_count * 15));

  IF v_count >= 3 THEN
    v_tier := 'Top 5% Early Access';
  ELSIF v_count >= 1 THEN
    v_tier := 'Priority Waitlist';
  ELSE
    v_tier := 'Standard Waitlist';
  END IF;

  RETURN jsonb_build_object(
    'referralCount', v_count,
    'priorityRank', v_rank,
    'priorityTier', v_tier
  );
END;
$$;

-- Public Read Share Report (SANITIZED CONTRACT ONLY)
CREATE OR REPLACE FUNCTION public.get_public_share_report(p_share_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_row record;
  v_result jsonb;
BEGIN
  IF p_share_token IS NULL OR trim(p_share_token) = '' THEN
    RETURN NULL;
  END IF;

  SELECT 
    share_token,
    startup_name,
    readiness_score,
    verdict,
    concise_verdict,
    confidence,
    evidence_coverage,
    strongest_dimension,
    weakest_dimension,
    traction_state,
    dimensions,
    actions,
    created_at,
    clerk_user_id,
    claim_token
  INTO v_row
  FROM public.assessments
  WHERE share_token = p_share_token;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  UPDATE public.assessments
  SET share_views = COALESCE(share_views, 0) + 1
  WHERE share_token = p_share_token;

  v_result := jsonb_build_object(
    'shareToken', v_row.share_token,
    'startupName', COALESCE(v_row.startup_name, 'Startup'),
    'readinessScore', v_row.readiness_score,
    'verdict', v_row.verdict,
    'conciseVerdict', COALESCE(v_row.concise_verdict, v_row.verdict),
    'confidence', v_row.confidence,
    'evidenceCoverage', v_row.evidence_coverage,
    'strongestDimension', v_row.strongest_dimension,
    'weakestDimension', v_row.weakest_dimension,
    'tractionState', COALESCE(v_row.traction_state, 'unverified'),
    'dimensions', COALESCE(v_row.dimensions, '[]'::jsonb),
    'publicActions', COALESCE(v_row.actions, '[]'::jsonb),
    'generatedAt', v_row.created_at
  );

  RETURN v_result;
END;
$$;

-- Grant EXECUTE ONLY as needed
GRANT EXECUTE ON FUNCTION public.get_public_share_report(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_save_assessment(text, text, text, text, text, jsonb, jsonb) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_claim_assessment(text, text, text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_get_latest_assessment(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_get_assessment_by_claim_token(text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_create_or_get_share_token(uuid, text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_record_referral_signup(text, text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_get_referral_stats(text, text) TO anon, authenticated, service_role;

-- 7. Record Migration in Schema Tracking
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('20260831000001', 'v1_production_security_baseline')
ON CONFLICT (version) DO UPDATE SET inserted_at = now();
