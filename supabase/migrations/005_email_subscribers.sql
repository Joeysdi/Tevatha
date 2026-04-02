-- 005_email_subscribers.sql
create table if not exists email_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  created_at  timestamptz not null default now()
);

-- RLS: only service role can read; inserts are open (public API route validates)
alter table email_subscribers enable row level security;

create policy "service role full access"
  on email_subscribers
  using (auth.role() = 'service_role');
