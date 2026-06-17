alter table public.sprint_tasks
  add constraint sprint_tasks_owner_week_title_key
  unique (owner_id, week_number, title);
