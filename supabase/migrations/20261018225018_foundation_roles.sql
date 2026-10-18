create extension if not exists pg_trgm with schema extensions;
create type public.staff_role as enum ('owner', 'admin', 'editor', 'support');
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.set_updated_at() from public, anon, authenticated;
