alter table if exists public.newsletter_subscribers
  add column if not exists unsubscribe_token text,
  add column if not exists unsubscribed_at timestamptz;

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

alter table public.newsletter_email_deliveries enable row level security;

grant select, insert, update on table public.newsletter_email_deliveries to service_role;

drop trigger if exists newsletter_email_deliveries_set_updated_at on public.newsletter_email_deliveries;
create trigger newsletter_email_deliveries_set_updated_at
  before update on public.newsletter_email_deliveries
  for each row
  execute function public.set_updated_at();
