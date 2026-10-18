-- Public "media" bucket. Files are served by public URL, so no broad select policy is
-- needed (and none is added, which keeps the bucket from being listable by anyone).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 10485760,
  array['image/avif', 'image/webp', 'image/png', 'image/jpeg', 'image/svg+xml', 'image/gif', 'video/mp4', 'application/pdf']
)
on conflict (id) do nothing;

create policy "media: staff list" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and public.is_staff());
create policy "media: editors upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.has_role(array['owner', 'admin', 'editor']::public.staff_role[]));
create policy "media: editors update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.has_role(array['owner', 'admin', 'editor']::public.staff_role[]))
  with check (bucket_id = 'media' and public.has_role(array['owner', 'admin', 'editor']::public.staff_role[]));
create policy "media: editors remove" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.has_role(array['owner', 'admin', 'editor']::public.staff_role[]));
