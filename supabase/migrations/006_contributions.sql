-- supabase/migrations/006_contributions.sql
create table if not exists public.contributions (
  id         uuid primary key default gen_random_uuid(),
  track      text not null check (track in ('dev', 'listing')),
  name       text not null,
  email      text not null,
  -- dev fields
  github     text,
  skills     text[],
  -- listing fields
  item       text,
  brand      text,
  url        text,
  category   text,
  -- shared
  note       text,
  reviewed   boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contributions enable row level security;

-- Only service role can read (admin review)
create policy "service_role_all" on public.contributions
  for all using (auth.role() = 'service_role');
