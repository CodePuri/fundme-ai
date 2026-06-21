-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

create table if not exists public.onboarding_submissions (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  email text,
  name text,
  role text,
  company_name text,
  linkedin_url text,
  notes text,
  created_at timestamptz not null default now()
);

-- Disable row-level security (service role key bypasses it anyway,
-- but enabling RLS + a policy is safer for production)
alter table public.onboarding_submissions enable row level security;

-- Allow the service role full access (used by the API route)
create policy "service role full access"
  on public.onboarding_submissions
  as permissive
  for all
  to service_role
  using (true)
  with check (true);
