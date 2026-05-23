create extension if not exists pgcrypto;

create table if not exists public.audit_bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  phone text not null default '',
  company text not null,
  company_website text not null default '',
  portfolio_size text not null default '',
  workflow_problem text not null,
  preferred_time text not null default '',
  message text not null default '',
  source text not null default 'website',
  page_url text not null default '',
  user_agent text not null default '',
  status text not null default 'new'
    check (status in ('new', 'contacted', 'scheduled', 'completed', 'closed')),
  notification_status text not null default 'pending'
    check (notification_status in ('pending', 'sent', 'failed', 'not_configured')),
  notification_provider text,
  notification_provider_message_id text,
  notification_error text,
  notified_at timestamptz
);

create index if not exists audit_bookings_created_at_idx
  on public.audit_bookings(created_at desc);

create index if not exists audit_bookings_status_idx
  on public.audit_bookings(status, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists audit_bookings_set_updated_at on public.audit_bookings;
create trigger audit_bookings_set_updated_at
  before update on public.audit_bookings
  for each row
  execute function public.set_updated_at();

alter table public.audit_bookings enable row level security;
