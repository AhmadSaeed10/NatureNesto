create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role public.staff_role,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_role_idx on public.profiles (role) where role is not null;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
alter table public.profiles enable row level security;

create table public.staff_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role public.staff_role not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index staff_invites_email_key on public.staff_invites (lower(email));
create trigger staff_invites_updated_at before update on public.staff_invites
  for each row execute function public.set_updated_at();
alter table public.staff_invites enable row level security;

create or replace function public.my_staff_role()
returns public.staff_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = (select auth.uid()) and role is not null
  );
$$;

create or replace function public.has_role(roles public.staff_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select role = any (roles) from public.profiles where id = (select auth.uid())),
    false
  );
$$;

revoke all on function public.my_staff_role() from public;
revoke all on function public.is_staff() from public;
revoke all on function public.has_role(public.staff_role[]) from public;
grant execute on function public.my_staff_role() to anon, authenticated, service_role;
grant execute on function public.is_staff() to anon, authenticated, service_role;
grant execute on function public.has_role(public.staff_role[]) to anon, authenticated, service_role;
