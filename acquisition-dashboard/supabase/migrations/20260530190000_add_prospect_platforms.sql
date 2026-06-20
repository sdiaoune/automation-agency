alter table public.prospects
  add column if not exists platforms text[] not null default '{}';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'prospects_platforms_allowed'
  ) then
    alter table public.prospects
      add constraint prospects_platforms_allowed
      check (
        platforms <@ array[
          'appfolio',
          'buildium',
          'leadsimple',
          'yardi',
          'rent_manager',
          'entrata',
          'knock',
          'hubspot',
          'salesforce'
        ]::text[]
      );
  end if;
end $$;

create index if not exists prospects_platforms_idx
  on public.prospects using gin(platforms);
