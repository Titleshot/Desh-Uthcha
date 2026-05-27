-- Run this in Supabase → SQL Editor (new project: https://supabase.com/dashboard).
-- Then create Storage bucket "submission-uploads" (see below) or use the second block.

-- 1) Table for form submissions (public insert only; no public read)
create table if not exists public.agenda_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  cabinet_point int not null,
  message text not null,
  official_url text,
  submitter_name text,
  submitter_email text,
  attachment_path text,
  attachment_name text,
  department text,
  submission_type text,
  email_affiliation text,
  source_type text,
  publication_date text,
  verifiable_source_ack boolean
);

alter table public.agenda_submissions enable row level security;

drop policy if exists "anon insert agenda_submissions" on public.agenda_submissions;
create policy "anon insert agenda_submissions"
  on public.agenda_submissions
  for insert
  to anon
  with check (true);

-- No SELECT policy for anon → visitors cannot read others’ rows. You read rows in Dashboard → Table Editor.

-- 2) Storage bucket for optional file uploads (private; you open files in Dashboard → Storage)
insert into storage.buckets (id, name, public)
values ('submission-uploads', 'submission-uploads', false)
on conflict (id) do nothing;

drop policy if exists "anon insert submission-uploads" on storage.objects;
create policy "anon insert submission-uploads"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'submission-uploads');

-- Optional: allow anon to read only their own uploads is not trivial without auth;
-- keep bucket private and download files from the dashboard as maintainer.

-- 3) If you already created the table earlier, add new form columns:
alter table public.agenda_submissions add column if not exists department text;
alter table public.agenda_submissions add column if not exists submission_type text;
alter table public.agenda_submissions add column if not exists email_affiliation text;
alter table public.agenda_submissions add column if not exists source_type text;
alter table public.agenda_submissions add column if not exists publication_date text;
alter table public.agenda_submissions add column if not exists verifiable_source_ack boolean;

-- 4) Email on each new row (optional): Resend + Edge Function
--    a) supabase functions deploy notify-submission
--    b) Set secrets: RESEND_API_KEY, NOTIFY_TO_EMAIL, optional NOTIFY_FROM_EMAIL, optional WEBHOOK_SECRET
--    c) Database → Webhooks → New → table agenda_submissions, Insert only
--       URL: https://<PROJECT_REF>.supabase.co/functions/v1/notify-submission
--       Header (if WEBHOOK_SECRET set): x-webhook-secret = <same>
--    See supabase/functions/notify-submission/index.ts.
