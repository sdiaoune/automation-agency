create table public.email_approvals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  prospect_id uuid references public.prospects(id) on delete set null,
  recipient_email text not null,
  subject text not null,
  body text not null,
  activity_type text not null default 'cold_email'
    check (activity_type in ('cold_email', 'follow_up_email')),
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'rejected', 'sending', 'sent', 'failed')),
  approved_at timestamptz,
  sent_at timestamptz,
  provider_message_id text not null default '',
  last_error text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index email_approvals_owner_status_idx
  on public.email_approvals(owner_id, status, created_at desc);
create index email_approvals_prospect_idx
  on public.email_approvals(prospect_id);

alter table public.email_approvals enable row level security;

grant select, insert, update, delete on public.email_approvals to authenticated;

create policy "Email approvals are selectable by owner"
  on public.email_approvals for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Email approvals are insertable by owner"
  on public.email_approvals for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Email approvals are updatable by owner"
  on public.email_approvals for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Email approvals are deletable by owner"
  on public.email_approvals for delete
  to authenticated
  using ((select auth.uid()) = owner_id);
