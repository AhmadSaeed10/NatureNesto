create table public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (key, window_start)
);
create index rate_limits_window_idx on public.rate_limits (window_start);
alter table public.rate_limits enable row level security;
-- No policies: not readable or writable by anon or authenticated users.

create or replace function public.hit_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  win timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  total integer;
begin
  insert into public.rate_limits (key, window_start, hits)
  values (p_key, win, 1)
  on conflict (key, window_start)
    do update set hits = public.rate_limits.hits + 1, updated_at = now()
  returning hits into total;
  return total <= p_limit;
end;
$$;
revoke all on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;
