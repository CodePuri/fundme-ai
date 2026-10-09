-- Record the first accepted transactional email for each saved assessment.
-- The application derives ownership from Clerk and writes through a server-only client.

ALTER TABLE public.assessments
  ADD COLUMN IF NOT EXISTS first_save_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS first_save_email_provider_id text;
