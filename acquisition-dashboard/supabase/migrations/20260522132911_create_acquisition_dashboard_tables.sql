create extension if not exists pgcrypto;

create table public.prospects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  company_name text not null,
  market text not null default '',
  website text not null default '',
  decision_maker text not null default '',
  email text not null default '',
  phone text not null default '',
  source text not null default '',
  software_clues text not null default '',
  pain_signal text not null default '',
  notes text not null default '',
  next_follow_up_date date,
  stage text not null default 'prospecting'
    check (stage in (
      'prospecting',
      'contacted',
      'replied',
      'audit_booked',
      'call_held',
      'proposal_sent',
      'won',
      'lost'
    )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.outreach_activities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  prospect_id uuid references public.prospects(id) on delete set null,
  activity_type text not null
    check (activity_type in (
      'cold_email',
      'follow_up_email',
      'phone_call',
      'linkedin_touch',
      'loom_audit',
      'workflow_audit',
      'partner_conversation',
      'proposal',
      'other'
    )),
  occurred_on date not null default current_date,
  outcome text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table public.sprint_tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  week_number integer not null check (week_number between 1 and 4),
  title text not null,
  status text not null default 'todo' check (status in ('todo', 'doing', 'done')),
  due_date date,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index prospects_owner_stage_idx
  on public.prospects(owner_id, stage);
create index prospects_owner_follow_up_idx
  on public.prospects(owner_id, next_follow_up_date);
create index outreach_activities_owner_date_idx
  on public.outreach_activities(owner_id, occurred_on desc);
create index sprint_tasks_owner_week_idx
  on public.sprint_tasks(owner_id, week_number, status);

alter table public.prospects enable row level security;
alter table public.outreach_activities enable row level security;
alter table public.sprint_tasks enable row level security;

grant select, insert, update, delete on public.prospects to authenticated;
grant select, insert, update, delete on public.outreach_activities to authenticated;
grant select, insert, update, delete on public.sprint_tasks to authenticated;

create policy "Prospects are selectable by owner"
  on public.prospects for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Prospects are insertable by owner"
  on public.prospects for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Prospects are updatable by owner"
  on public.prospects for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Prospects are deletable by owner"
  on public.prospects for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Activities are selectable by owner"
  on public.outreach_activities for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Activities are insertable by owner"
  on public.outreach_activities for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Activities are updatable by owner"
  on public.outreach_activities for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Activities are deletable by owner"
  on public.outreach_activities for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Sprint tasks are selectable by owner"
  on public.sprint_tasks for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Sprint tasks are insertable by owner"
  on public.sprint_tasks for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Sprint tasks are updatable by owner"
  on public.sprint_tasks for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Sprint tasks are deletable by owner"
  on public.sprint_tasks for delete
  to authenticated
  using ((select auth.uid()) = owner_id);
