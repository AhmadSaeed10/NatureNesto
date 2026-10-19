-- Superseded by page_section_drafts: the public can read published section rows, so a
-- draft column on that table would expose unpublished copy. Never populated.
alter table public.page_sections drop column if exists draft;
