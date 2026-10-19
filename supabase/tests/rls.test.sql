-- RLS tests, one or more per table group, for anon, a signed-in non-staff user (the future
-- customer), editor, support and admin. Run with `supabase test db` against a local stack.
begin;
create extension if not exists pgtap with schema extensions;

select plan(45);

-- Fixtures: one user per role. Inserting into auth.users fires handle_new_user(), which
-- creates the profile; roles are then set directly (auth.uid() is null here, so trusted).
insert into auth.users (id, email) values
  ('00000000-0000-4000-a000-000000000001', 'owner@test.local'),
  ('00000000-0000-4000-a000-000000000002', 'admin@test.local'),
  ('00000000-0000-4000-a000-000000000003', 'editor@test.local'),
  ('00000000-0000-4000-a000-000000000004', 'support@test.local'),
  ('00000000-0000-4000-a000-000000000005', 'customer@test.local');
update public.profiles set role = 'owner' where id = '00000000-0000-4000-a000-000000000001';
update public.profiles set role = 'admin' where id = '00000000-0000-4000-a000-000000000002';
update public.profiles set role = 'editor' where id = '00000000-0000-4000-a000-000000000003';
update public.profiles set role = 'support' where id = '00000000-0000-4000-a000-000000000004';

insert into public.products (id, handle, title, status) values
  ('10000000-0000-4000-a000-000000000001', 'test-active', 'Active product', 'active'),
  ('10000000-0000-4000-a000-000000000002', 'test-draft', 'Draft product', 'draft');
insert into public.product_variants (product_id, price) values
  ('10000000-0000-4000-a000-000000000001', 100000),
  ('10000000-0000-4000-a000-000000000002', 100000);
insert into public.pages (handle, title, status) values
  ('test-published', 'Published', 'published'),
  ('test-hidden', 'Hidden', 'draft');
insert into public.site_settings (store_name, email, address)
  select 'Test', 'test@test.local', 'Test' where not exists (select 1 from public.site_settings);
insert into public.consultation_requests (source, name) values ('contact', 'Test lead');
insert into public.blog_posts (handle, title, status, published_at) values
  ('test-live-post', 'Live', 'published', now() - interval '1 day'),
  ('test-scheduled-post', 'Scheduled', 'published', now() + interval '7 days'),
  ('test-draft-post', 'Draft', 'draft', null);
insert into public.media_assets (id, external_url, decorative) values
  ('20000000-0000-4000-a000-000000000001', '/test.webp', true);
insert into public.product_images (product_id, media_id) values
  ('10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000001');

create function pg_temp.act_as(user_id uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', user_id, 'role', 'authenticated')::text, true);
  select set_config('role', 'authenticated', true);
$$;

-- Anon -----------------------------------------------------------------------------------
set local role anon;
select is((select count(*)::int from public.products where handle like 'test-%'), 1, 'anon sees only active products');
select is((select count(*)::int from public.product_variants v join public.products p on p.id = v.product_id where p.handle like 'test-%'), 1, 'anon sees variants of active products only');
select is((select count(*)::int from public.pages where handle like 'test-%'), 1, 'anon sees only published pages');
select ok((select count(*) from public.site_settings) >= 1, 'anon reads site settings');
select is((select count(*)::int from public.profiles), 0, 'anon cannot read profiles');
select is((select count(*)::int from public.staff_invites), 0, 'anon cannot read staff invites');
select is((select count(*)::int from public.consultation_requests), 0, 'anon cannot read leads');
select is((select count(*)::int from public.audit_log), 0, 'anon cannot read the audit log');
select throws_ok($$ insert into public.products (handle, title) values ('anon-write', 'x') $$, '42501', null, 'anon cannot write products');
select throws_ok($$ insert into public.consultation_requests (source, name) values ('contact', 'x') $$, '42501', null, 'anon cannot insert leads directly');
select throws_ok($$ select * from public.media_usage(array['20000000-0000-4000-a000-000000000001']::uuid[]) $$, '42501', null, 'anon cannot call media_usage');
reset role;

-- Signed-in, not staff (customer) --------------------------------------------------------
select pg_temp.act_as('00000000-0000-4000-a000-000000000005');
select is((select count(*)::int from public.products where handle like 'test-%'), 1, 'customer sees only active products');
select is((select count(*)::int from public.profiles), 1, 'customer reads only their own profile');
select throws_ok($$ update public.profiles set role = 'owner' where id = '00000000-0000-4000-a000-000000000005' $$, '42501', null, 'customer cannot grant themselves a role');
reset role;

-- Editor ---------------------------------------------------------------------------------
select pg_temp.act_as('00000000-0000-4000-a000-000000000003');
select is((select count(*)::int from public.products where handle like 'test-%'), 2, 'editor sees drafts');
select lives_ok($$ insert into public.products (handle, title) values ('editor-write', 'x') $$, 'editor can create products');
select is((select count(*)::int from public.consultation_requests), 0, 'editor cannot read leads');
select throws_ok($$ insert into public.redirects (source, destination) values ('/editor', '/x') $$, '42501', null, 'editor cannot change redirects');
select is((select count(*)::int from public.staff_invites), 0, 'editor cannot read staff invites');
select is(
  (select uses::int from public.media_usage(array['20000000-0000-4000-a000-000000000001']::uuid[])),
  1,
  'media_usage counts product images for staff'
);
select lives_ok(
  $$ select public.save_product('{"title":"Saved","handle":"test-saved","description":{"format":"plain","text":""},"status":"draft","tags":["indoor-plants"],"options":[{"name":"Size","values":["S","M"]}],"variants":[{"title":"S","sku":"T-S","price":1000,"option_values":{"Size":"S"},"initial_stock":5},{"title":"M","sku":"T-M","price":2000,"option_values":{"Size":"M"},"initial_stock":0}],"images":[]}'::jsonb) $$,
  'editor saves a product with variants'
);
select is((select stock from public.product_variants where sku = 'T-S'), 5, 'starting stock is applied');
select is(
  (select count(*)::int from public.inventory_adjustments a join public.product_variants v on v.id = a.variant_id where v.sku = 'T-S' and a.reason = 'initial'),
  1,
  'starting stock is logged'
);
select is(public.adjust_stock((select id from public.product_variants where sku = 'T-S'), -2, 'sold'), 3, 'editor adjusts stock');
select lives_ok(
  format(
    $$ select public.save_product(%L::jsonb) $$,
    jsonb_build_object(
      'id', (select id from public.products where handle = 'test-saved'),
      'title', 'Saved', 'handle', 'test-saved', 'status', 'draft', 'options', '[]'::jsonb, 'images', '[]'::jsonb,
      'variants', jsonb_build_array(jsonb_build_object(
        'id', (select id from public.product_variants where sku = 'T-S'), 'title', 'Default', 'sku', 'T-S', 'price', 1000
      ))
    )
  ),
  'editor updates a product'
);
select is(
  (select count(*)::int from public.product_variants v join public.products p on p.id = v.product_id where p.handle = 'test-saved'),
  1,
  'removed variants are deleted'
);
-- A statement cannot see rows its own volatile function call inserts, so duplicate first.
select lives_ok(
  $$ select public.duplicate_product((select id from public.products where handle = 'test-saved')) $$,
  'editor duplicates a product'
);
select is(
  (select status::text from public.products where handle = 'test-saved-copy'),
  'draft',
  'duplicate is a draft with a free handle'
);
select lives_ok(
  $$ insert into public.page_section_drafts (section_id, data)
     select s.id, '{"headline":"Unpublished"}'::jsonb from public.page_sections s
     join public.pages p on p.id = s.page_id where p.handle = 'test-published' or p.handle = 'home' limit 1 $$,
  'editor saves a homepage section draft'
);
update public.site_settings set store_name = 'Editor edit' where singleton;
reset role;
select isnt((select store_name from public.site_settings limit 1), 'Editor edit', 'editor cannot change site settings');

-- Support --------------------------------------------------------------------------------
select pg_temp.act_as('00000000-0000-4000-a000-000000000004');
select ok((select count(*) from public.consultation_requests) >= 1, 'support reads leads');
select throws_ok($$ insert into public.products (handle, title) values ('support-write', 'x') $$, '42501', null, 'support cannot create products');
select throws_ok(
  $$ select public.adjust_stock((select id from public.product_variants where sku = 'T-S'), 1, 'received') $$,
  '42501', null, 'support cannot adjust stock'
);
select throws_ok(
  $$ select public.save_product('{"title":"x","handle":"support-save","status":"draft","variants":[]}'::jsonb) $$,
  '42501', null, 'support cannot save products'
);
reset role;

-- Admin ----------------------------------------------------------------------------------
select pg_temp.act_as('00000000-0000-4000-a000-000000000002');
select lives_ok($$ insert into public.staff_invites (email, role) values ('new-editor@test.local', 'editor') $$, 'admin can invite an editor');
select throws_ok($$ insert into public.staff_invites (email, role) values ('new-owner@test.local', 'owner') $$, '42501', null, 'admin cannot invite an owner');
select throws_ok($$ update public.profiles set role = 'admin' where id = '00000000-0000-4000-a000-000000000001' $$, '42501', null, 'admin cannot demote the owner');
select lives_ok($$ update public.site_settings set legal = 'Admin edit' where singleton $$, 'admin can update site settings');
reset role;
select is((select legal from public.site_settings limit 1), 'Admin edit', 'admin settings change is saved');

-- Drafts and scheduling stay private -----------------------------------------------------
-- reset role keeps the previous user's JWT claims, so clear them to test a true visitor.
select set_config('request.jwt.claims', '', true);
select set_config('role', 'anon', true);
select is((select count(*)::int from public.page_section_drafts), 0, 'anon cannot read section drafts');
select is(
  (select count(*)::int from public.blog_posts where handle like 'test-%-post'),
  1,
  'anon sees only live posts, not drafts or scheduled ones'
);
select throws_ok($$ insert into public.redirects (source, destination) values ('/anon', '/x') $$, '42501', null, 'anon cannot add redirects');
reset role;
select pg_temp.act_as('00000000-0000-4000-a000-000000000004');
select is((select count(*)::int from public.page_section_drafts), 0, 'support cannot read section drafts');
reset role;
select pg_temp.act_as('00000000-0000-4000-a000-000000000005');
select is((select count(*)::int from public.page_section_drafts), 0, 'customers cannot read section drafts');
reset role;

-- Audit ----------------------------------------------------------------------------------
select ok(
  exists (select 1 from public.audit_log where table_name = 'products' and actor_id = '00000000-0000-4000-a000-000000000003' and action = 'insert'),
  'editor writes are audited with the actor'
);

select * from finish();
rollback;
