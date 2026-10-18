create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_role public.staff_role,
  action text not null check (action in ('insert', 'update', 'delete')),
  table_name text not null,
  record_id text,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index audit_log_table_record_idx on public.audit_log (table_name, record_id);
create index audit_log_created_idx on public.audit_log (created_at desc);
alter table public.audit_log enable row level security;

create policy "audit_log: owners and admins read" on public.audit_log
  for select to authenticated
  using (public.has_role(array['owner', 'admin']::public.staff_role[]));

create or replace function public.audit_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  rec jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
begin
  insert into public.audit_log (actor_id, actor_role, action, table_name, record_id, before, after)
  values (
    (select auth.uid()),
    public.my_staff_role(),
    lower(tg_op),
    tg_table_name,
    rec ->> 'id',
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return null;
end;
$$;
revoke all on function public.audit_row() from public, anon, authenticated;

create trigger profiles_audit after insert or update or delete on public.profiles
  for each row execute function public.audit_row();
create trigger staff_invites_audit after insert or update or delete on public.staff_invites
  for each row execute function public.audit_row();
