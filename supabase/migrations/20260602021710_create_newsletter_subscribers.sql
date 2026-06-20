create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  subscribed_at timestamptz not null default now(),
  email text not null,
  source text not null default 'website',
  page_url text not null default '',
  user_agent text not null default '',
  status text not null default 'active'
    check (status in ('active', 'unsubscribed')),
  unsubscribe_token text,
  unsubscribed_at timestamptz,
  notification_status text not null default 'pending'
    check (notification_status in ('pending', 'sent', 'failed', 'not_configured')),
  notification_provider text,
  notification_provider_message_id text,
  notification_error text,
  notified_at timestamptz,
  constraint newsletter_subscribers_email_unique unique (email)
);

create index if not exists newsletter_subscribers_created_at_idx
  on public.newsletter_subscribers(created_at desc);

create index if not exists newsletter_subscribers_status_idx
  on public.newsletter_subscribers(status, created_at desc);

create unique index if not exists newsletter_subscribers_unsubscribe_token_idx
  on public.newsletter_subscribers(unsubscribe_token)
  where unsubscribe_token is not null;

create table if not exists public.newsletter_email_deliveries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  subscriber_id uuid not null references public.newsletter_subscribers(id) on delete cascade,
  post_slug text not null,
  post_title text not null,
  post_url text not null,
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'failed')),
  provider text,
  provider_message_id text,
  error text,
  sent_at timestamptz,
  unique (subscriber_id, post_slug)
);

create index if not exists newsletter_email_deliveries_post_slug_idx
  on public.newsletter_email_deliveries(post_slug);

create index if not exists newsletter_email_deliveries_subscriber_status_idx
  on public.newsletter_email_deliveries(subscriber_id, status, created_at desc);

drop trigger if exists newsletter_subscribers_set_updated_at on public.newsletter_subscribers;
create trigger newsletter_subscribers_set_updated_at
  before update on public.newsletter_subscribers
  for each row
  execute function public.set_updated_at();

alter table public.newsletter_subscribers enable row level security;
alter table public.newsletter_email_deliveries enable row level security;

grant select, insert, update on table public.newsletter_subscribers to service_role;
grant select, insert, update on table public.newsletter_email_deliveries to service_role;

drop trigger if exists newsletter_email_deliveries_set_updated_at on public.newsletter_email_deliveries;
create trigger newsletter_email_deliveries_set_updated_at
  before update on public.newsletter_email_deliveries
  for each row
  execute function public.set_updated_at();
