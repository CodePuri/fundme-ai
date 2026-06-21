-- Migration: 001_identity_workspaces.sql
-- Description: Creates the initial schema for internal identity and workspaces.

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Basic RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own record" ON public.users
  FOR SELECT USING (clerk_id = auth.uid()::text);

CREATE POLICY "Users can view their workspaces" ON public.workspaces
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text)
  );

-- We'll rely on server-side actions (with service key or elevated privilege) 
-- to initially map the Clerk user to this internal table upon first sign in.
