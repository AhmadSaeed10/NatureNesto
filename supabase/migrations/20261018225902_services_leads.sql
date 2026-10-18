-- Services (the studio's second business line) and the leads its forms produce.

create type public.lead_status as enum ('new', 'contacted', 'quoted', 'won', 'lost');
create type public.lead_source as enum ('contact', 'consultation', 'quote', 'whatsapp', 'other');
create type public.quote_status as enum ('draft', 'sent', 'accepted', 'declined', 'expired');

create table public.services (
  id uuid primary key default gen_random_uuid(),
  handle text not null unique check (handle ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  summary text,
  body jsonb,
  icon text,
  featured boolean not null default false,
  cover_media_id uuid references public.media_assets (id) on delete set null,
  position integer not null default 0,
  status public.content_status not null default 'draft',
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index services_cover_idx on public.services (cover_media_id);

-- Leads are written by server actions with the service role after zod validation and a
-- rate limit, so there is no anon insert policy.
create table public.consultation_requests (
  id uuid primary key default gen_random_uuid(),
  source public.lead_source not null,
  service_id uuid references public.services (id) on delete set null,
  name text not null check (char_length(name) between 1 and 200),
  email text check (email is null or char_length(email) <= 320),
  phone text check (phone is null or char_length(phone) <= 40),
  city text check (city is null or char_length(city) <= 120),
  area text check (area is null or char_length(area) <= 200),
  space_type text check (space_type is null or char_length(space_type) <= 120),
  message text check (message is null or char_length(message) <= 5000),
  status public.lead_status not null default 'new',
  assigned_to uuid references public.profiles (id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index consultation_requests_status_idx on public.consultation_requests (status, created_at desc);
create index consultation_requests_service_idx on public.consultation_requests (service_id);
create index consultation_requests_assigned_idx on public.consultation_requests (assigned_to);

create table public.styling_quotes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.consultation_requests (id) on delete set null,
  reference text not null unique,
  line_items jsonb not null default '[]'::jsonb,
  total integer not null default 0 check (total >= 0),
  currency text not null default 'PKR',
  status public.quote_status not null default 'draft',
  valid_until date,
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index styling_quotes_request_idx on public.styling_quotes (request_id);
create index styling_quotes_created_by_idx on public.styling_quotes (created_by);

create table public.gift_bundles (
  id uuid primary key default gen_random_uuid(),
  handle text not null unique check (handle ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  description jsonb,
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price >= 0),
  items jsonb not null default '[]'::jsonb,
  cover_media_id uuid references public.media_assets (id) on delete set null,
  status public.product_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index gift_bundles_cover_idx on public.gift_bundles (cover_media_id);

do $$
declare
  t text;
begin
  foreach t in array array['services', 'consultation_requests', 'styling_quotes', 'gift_bundles'] loop
    execute format(
      'create trigger %1$I_updated_at before update on public.%1$I
         for each row execute function public.set_updated_at()', t);
    execute format(
      'create trigger %1$I_audit after insert or update or delete on public.%1$I
         for each row execute function public.audit_row()', t);
    execute format('alter table public.%I enable row level security', t);
  end loop;
end;
$$;

-- Catalogue-like tables: public reads published/active, editors write.
create policy "services: public reads published" on public.services
  for select to anon, authenticated
  using (status = 'published' or public.is_staff());
create policy "gift_bundles: public reads active" on public.gift_bundles
  for select to anon, authenticated
  using (status = 'active' or public.is_staff());

-- Leads and quotes: personal data, staff only. Support works the pipeline; editors do not see it.
create policy "consultation_requests: lead staff read" on public.consultation_requests
  for select to authenticated
  using (public.has_role(array['owner', 'admin', 'support']::public.staff_role[]));
create policy "styling_quotes: lead staff read" on public.styling_quotes
  for select to authenticated
  using (public.has_role(array['owner', 'admin', 'support']::public.staff_role[]));

do $$
declare
  t text;
  roles text;
begin
  foreach t in array array['services', 'gift_bundles', 'consultation_requests', 'styling_quotes'] loop
    roles := case
      when t in ('services', 'gift_bundles') then '''owner'', ''admin'', ''editor'''
      else '''owner'', ''admin'', ''support'''
    end;
    execute format(
      'create policy "%1$s: staff insert" on public.%1$I for insert to authenticated
         with check (public.has_role(array[%2$s]::public.staff_role[]))', t, roles);
    execute format(
      'create policy "%1$s: staff update" on public.%1$I for update to authenticated
         using (public.has_role(array[%2$s]::public.staff_role[]))
         with check (public.has_role(array[%2$s]::public.staff_role[]))', t, roles);
  end loop;
end;
$$;

-- Only owners and admins may remove leads or quotes; support can mark them lost instead.
create policy "services: staff remove" on public.services
  for delete to authenticated
  using (public.has_role(array['owner', 'admin', 'editor']::public.staff_role[]));
create policy "gift_bundles: staff remove" on public.gift_bundles
  for delete to authenticated
  using (public.has_role(array['owner', 'admin', 'editor']::public.staff_role[]));
create policy "consultation_requests: managers remove" on public.consultation_requests
  for delete to authenticated
  using (public.has_role(array['owner', 'admin']::public.staff_role[]));
create policy "styling_quotes: managers remove" on public.styling_quotes
  for delete to authenticated
  using (public.has_role(array['owner', 'admin']::public.staff_role[]));
