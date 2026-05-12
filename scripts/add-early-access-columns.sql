-- Optional migration to add explicit columns for Fundme early-access intake payload
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- Note: All fields are also serialized securely into the 'notes' column as JSON metadata to support out-of-the-box storage without requiring active migrations.

alter table public.onboarding_submissions
  add column if not exists website_url text,
  add column if not exists x_url text,
  add column if not exists voice_transcript text,
  add column if not exists deck_file_name text,
  add column if not exists deck_file_size bigint,
  add column if not exists deck_file_type text,
  add column if not exists source_route text default '/onboarding',
  add column if not exists status text default 'early_access_waitlist';
