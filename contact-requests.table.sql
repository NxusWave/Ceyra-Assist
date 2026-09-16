-- Enterprise contact requests (pricing "Contact us" + "Talk to our team" CTAs).
-- Run this once in the Supabase SQL Editor for your project.
create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  website text,
  message text not null,
  source text default 'enterprise-pricing',
  created_at timestamptz not null default now()
);

-- Anonymous visitors may submit; nobody can read rows through the public API.
alter table public.contact_requests enable row level security;

drop policy if exists "allow anonymous contact submissions" on public.contact_requests;
create policy "allow anonymous contact submissions"
  on public.contact_requests
  for insert
  to anon, authenticated
  with check (true);
