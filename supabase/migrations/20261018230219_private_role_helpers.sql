-- Role helpers move out of the API-exposed public schema so they can't be called as RPCs.
-- Policies reference functions by oid, so every existing policy follows the move. From
-- here on, new policies call private.is_staff() and private.has_role().
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

alter function public.my_staff_role() set schema private;
alter function public.is_staff() set schema private;
alter function public.has_role(public.staff_role[]) set schema private;

-- plpgsql bodies resolve names at run time, so the two callers are redefined.
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is not distinct from old.role then
    return new;
  end if;
  -- Server side maintenance (service role, migrations) is trusted.
  if (select auth.uid()) is null then
    return new;
  end if;
  if private.has_role(array['owner']::public.staff_role[]) then
    return new;
  end if;
  if private.has_role(array['admin']::public.staff_role[])
     and old.role is distinct from 'owner'
     and new.role is distinct from 'owner' then
    return new;
  end if;
  raise exception 'not allowed to change this role' using errcode = '42501';
end;
$$;

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
    private.my_staff_role(),
    lower(tg_op),
    tg_table_name,
    rec ->> 'id',
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return null;
end;
$$;

-- rate_limits is written only by hit_rate_limit() under the service role. An explicit
-- deny-all policy documents that intent.
create policy "rate_limits: no direct access" on public.rate_limits
  for all to anon, authenticated
  using (false)
  with check (false);
