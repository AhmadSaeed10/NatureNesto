-- Unpublished homepage edits live in their own table so the public, which can read
-- published section rows, can never read a draft. Staff only, both ways.
create table public.page_section_drafts (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null unique references public.page_sections (id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.page_section_drafts enable row level security;
create trigger page_section_drafts_updated_at before update on public.page_section_drafts
  for each row execute function public.set_updated_at();
create trigger page_section_drafts_audit after insert or update or delete on public.page_section_drafts
  for each row execute function public.audit_row();

create policy "page_section_drafts: content staff read" on public.page_section_drafts
  for select to authenticated
  using (private.has_role(array['owner', 'admin', 'editor']::public.staff_role[]));
create policy "page_section_drafts: content staff insert" on public.page_section_drafts
  for insert to authenticated
  with check (private.has_role(array['owner', 'admin', 'editor']::public.staff_role[]));
create policy "page_section_drafts: content staff update" on public.page_section_drafts
  for update to authenticated
  using (private.has_role(array['owner', 'admin', 'editor']::public.staff_role[]))
  with check (private.has_role(array['owner', 'admin', 'editor']::public.staff_role[]));
create policy "page_section_drafts: content staff remove" on public.page_section_drafts
  for delete to authenticated
  using (private.has_role(array['owner', 'admin', 'editor']::public.staff_role[]));
