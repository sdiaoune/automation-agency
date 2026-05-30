create extension if not exists pgcrypto;

create table if not exists public.daily_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  progress_date date not null,
  accounts_contacted integer not null default 0 check (accounts_contacted >= 0),
  cold_emails integer not null default 0 check (cold_emails >= 0),
  followup_emails integer not null default 0 check (followup_emails >= 0),
  phone_calls integer not null default 0 check (phone_calls >= 0),
  linkedin_touches integer not null default 0 check (linkedin_touches >= 0),
  loom_audits integer not null default 0 check (loom_audits >= 0),
  partner_conversations integer not null default 0 check (partner_conversations >= 0),
  positive_replies integer not null default 0 check (positive_replies >= 0),
  calls_booked integer not null default 0 check (calls_booked >= 0),
  calls_held integer not null default 0 check (calls_held >= 0),
  proposals_sent integer not null default 0 check (proposals_sent >= 0),
  deals_closed integer not null default 0 check (deals_closed >= 0),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, progress_date)
);

create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  company text not null,
  market text not null,
  contact_name text not null default '',
  email text not null default '',
  phone text not null default '',
  website text not null default '',
  software_clues text not null default '',
  pain_signal text not null default '',
  stage text not null default 'research' check (stage in ('research', 'contacted', 'replied', 'audit_booked', 'proposal', 'won', 'nurture')),
  next_follow_up date,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_checkoffs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  task_slug text not null,
  checked_at timestamptz not null default now(),
  unique (user_id, task_slug)
);

create or replace function public.set_outbound_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists daily_progress_updated_at on public.daily_progress;
create trigger daily_progress_updated_at before update on public.daily_progress
for each row execute function public.set_outbound_updated_at();

drop trigger if exists prospects_updated_at on public.prospects;
create trigger prospects_updated_at before update on public.prospects
for each row execute function public.set_outbound_updated_at();

alter table public.daily_progress enable row level security;
alter table public.prospects enable row level security;
alter table public.task_checkoffs enable row level security;

grant select, insert, update, delete on public.daily_progress to authenticated;
grant select, insert, update, delete on public.prospects to authenticated;
grant select, insert, update, delete on public.task_checkoffs to authenticated;

create policy "daily progress is owned by the user"
on public.daily_progress
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "prospects are owned by the user"
on public.prospects
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "task checkoffs are owned by the user"
on public.task_checkoffs
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
