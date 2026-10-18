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
  if public.has_role(array['owner']::public.staff_role[]) then
    return new;
  end if;
  if public.has_role(array['admin']::public.staff_role[])
     and old.role is distinct from 'owner'
     and new.role is distinct from 'owner' then
    return new;
  end if;
  raise exception 'not allowed to change this role' using errcode = '42501';
end;
$$;
revoke all on function public.guard_profile_role() from public, anon, authenticated;

create trigger profiles_guard_role before update on public.profiles
  for each row execute function public.guard_profile_role();

create policy "profiles: read own or staff manager reads all" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.has_role(array['owner', 'admin']::public.staff_role[]));

create policy "profiles: update own name, managers update others" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or public.has_role(array['owner', 'admin']::public.staff_role[]))
  with check (id = (select auth.uid()) or public.has_role(array['owner', 'admin']::public.staff_role[]));

create policy "staff_invites: managers read" on public.staff_invites
  for select to authenticated
  using (public.has_role(array['owner', 'admin']::public.staff_role[]));
create policy "staff_invites: managers write" on public.staff_invites
  for all to authenticated
  using (public.has_role(array['owner', 'admin']::public.staff_role[]))
  with check (
    public.has_role(array['owner']::public.staff_role[])
    or (public.has_role(array['admin']::public.staff_role[]) and role <> 'owner')
  );
