create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  invited public.staff_role;
begin
  select role into invited from public.staff_invites
    where lower(email) = lower(new.email) and accepted_at is null;

  insert into public.profiles (id, email, role) values (new.id, new.email, invited);

  if invited is not null then
    update public.staff_invites set accepted_at = now() where lower(email) = lower(new.email);
  end if;
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
