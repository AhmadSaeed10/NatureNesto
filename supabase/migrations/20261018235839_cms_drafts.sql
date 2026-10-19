-- Homepage sections are edited as a draft and published explicitly, so the live homepage
-- never shows half finished copy. draft is null when there are no unpublished changes.
alter table public.page_sections add column draft jsonb;

-- Lookups the storefront makes on every uncached request.
create index if not exists blog_posts_tags_idx on public.blog_posts using gin (tags);
create index if not exists faq_items_position_idx on public.faq_items (status, position);
