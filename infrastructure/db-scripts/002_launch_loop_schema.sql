-- Launch Loop Schema: Public Shares, Referrals, Analytics Events

-- 1. Add share columns to assessments
ALTER TABLE public.assessments 
  ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS shared_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS share_views INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_assessments_share_token ON public.assessments(share_token);

-- 2. Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_clerk_user_id TEXT NOT NULL,
  referral_code TEXT NOT NULL,
  referred_claim_token TEXT,
  referred_clerk_user_id TEXT,
  status TEXT NOT NULL DEFAULT 'visited',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  signed_up_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_clerk ON public.referrals(referrer_clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_clerk ON public.referrals(referred_clerk_user_id);

-- 3. Create analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  session_id TEXT,
  clerk_user_id TEXT,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON public.analytics_events(created_at DESC);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
