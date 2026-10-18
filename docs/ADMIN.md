# Admin and backend

The database (Supabase, project `uqxzuzejnyacrshssdpz`, region Mumbai) is the source of truth for products, content, media, leads and, from Stage E, orders and customers. The admin lives at `/admin`. This file grows with each Phase 9 stage.

## Roles

| Role | Can do |
| --- | --- |
| Owner | Everything, including staff and roles. Only an owner can create or change another owner |
| Admin | Everything except touching owners |
| Editor | Catalogue, collections, media and content (pages, blog, workshops, FAQ, navigation). No leads, settings or staff |
| Support | Leads and quotes now; orders and customers from Stage F. Read only on the catalogue |

Roles are enforced three times: `proxy.ts` (signed in), the admin layout (`requireStaff()`), and row level security on every table (the final guard). Every insert, update and delete on admin tables is written to `audit_log` by a trigger, with the actor and before and after values.

## Adding staff

There is no public sign up. Owners and admins invite people in **Settings > Staff** (email and role). The person then opens `/admin/login`, enters the email and leaves the password empty. The server checks the invite, creates the account and emails a sign in link. The role is applied on first sign in.

- **Change role** or **Remove access** from the same list. Removing access also clears the invite, so signing in again does not bring the role back. There must always be at least one owner.
- Admins cannot invite, change or remove owners.
- Passwords are optional: anyone can set one in **Settings > Your account**.

## Admin areas built so far

| Area | Who | What |
| --- | --- | --- |
| Media (`/admin/media`) | Owner, admin, editor | Upload images straight to the `media` bucket (photos over 2560 px are resized in the browser), search, rename, edit alt text, copy link, delete. Alt text is required unless an image is marked decorative. An image in use (product, collection, cover, logo) cannot be deleted; the card shows where it is used |
| Settings > Store | Owner, admin | Store details, contact numbers, announcement bar, social links, SEO defaults, logo. Saved to `site_settings`; the storefront reads them from Stage D |
| Settings > Staff | Owner, admin | Invite, change role, remove access, cancel invites |
| Settings > Your account | Everyone | Set a password |

| Products (`/admin/products`) | Owner, admin, editor | Search (title, handle, SKU; also from the sidebar), filter by status and collection, bulk status changes, soft delete and restore, inline status. Editor with options (up to three) and generated variants, prices in PKR, images from the media library (drag, or move buttons), tags, manual collections, categories and SEO. Duplicate creates a draft copy. CSV export and import |
| Collections (`/admin/collections`) | Owner, admin, editor | Manual collections (pick and order products) and automatic ones (tag, type or vendor conditions, all must match). Categories tab for a nested category tree |
| Inventory (`/admin/inventory`) | Owner, admin, editor | Stock per tracked variant, filters for low and out of stock, adjustments with a reason and note, recent changes log |

Shipping zones, taxes and payment methods join Settings with checkout in Stage E. Redirects join with the CMS in Stage D.

## How to add a product

1. Upload its photos in **Media** (with alt text).
2. **Products > Add product**: title (the handle fills in), description, images, and options if it comes in sizes or colours, then **Update variants from options**.
3. Set each variant's price and starting stock. Add tags that match the storefront categories (`indoor-plants`, `pet-friendly`, `easy-care`, `orchids`, `large-plants`, `low-light`, `plant-care`, `outdoor-plants`, `pots-and-planters`) and badges as `badge:new`, `badge:pet-safe`, `badge:low-light`, `badge:easy-care` or `badge:bestseller`.
4. Set status to **Active** and save. The category pages switch from the sample catalogue to live products as soon as a category has an active product.

Stock never changes silently: the editor sets starting stock once, and every later change goes through **Inventory** (or a CSV import) and is logged in `inventory_adjustments`.

## CSV format

One row per variant, grouped by `Handle`. Product fields are read from the first row of each handle. Existing products are matched by handle and variants by SKU (or variant title when there is no SKU); a different `Stock` value is logged as an import adjustment. Prices are rupees. Images, collections and categories are not part of the file and are kept as they are. Cells starting with `=`, `+`, `-` or `@` are prefixed with `'` on export so spreadsheets do not run them as formulas.

## Supabase Auth settings (dashboard, one time)

- Authentication > URL Configuration: Site URL `https://naturenesto.com`. Redirect URLs: `https://naturenesto.com/auth/callback`, `https://*-<vercel-team>.vercel.app/auth/callback` (Vercel previews; use your team slug) and `http://localhost:3000/auth/callback`.
- Authentication > Sign In / Providers: turn off "Allow new users to sign up". Staff accounts are created by the server, so this does not block invites.
- Authentication > Emails: the default sender is rate limited and for testing only. Add custom SMTP before launch (decided in Stage G).

## Environment variables

See `.env.example`. In Vercel (Production and Preview): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`. In GitHub Actions secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF`. The database password never goes to Vercel.

Without the Supabase variables the storefront still works on the sample catalogue and `/admin/login` shows that sign in is not available.

## Migrations

All schema lives in `supabase/migrations`, committed to git. No dashboard schema edits.

The Supabase connector used during development cannot run migrations that contain `delete` or `drop` statements (it asks for a confirmation that cannot be answered from an agent session). Those migrations reach the hosted project only through the Migrate workflow, so the GitHub secrets below are required.

1. Write a new file `supabase/migrations/<timestamp>_<name>.sql`.
2. Open a PR. CI starts a throwaway local database, applies every migration and the seed, and runs the pgTAP tests in `supabase/tests`.
3. On merge to main, the Migrate workflow runs `supabase db push` against the hosted project. Migrations already applied are skipped.

Rules: every table gets RLS, `updated_at` and audit triggers (copy the loops in the catalog migration). Policies call the helpers in the `private` schema: `private.is_staff()`, `private.has_role(array[...]::public.staff_role[])`. Money is stored in paisa (PKR x 100).

Regenerate types after a schema change: `npx supabase gen types typescript --project-id uqxzuzejnyacrshssdpz > src/lib/supabase/database.types.ts`.

## Seed

`npm run seed:generate` writes `supabase/seed.sql` from `src/content` (settings, navigation, homepage sections, services, the nine category collections, redirects and the sample products as drafts). CI fails if the file is out of date. The seed is idempotent and was applied to the hosted project once. It never contains staff emails.

The sample products are drafts, so the storefront keeps showing the sample catalogue until real products are set to active.

## Restoring a backup

Free plan projects get daily backups for 7 days (Database > Backups). Point in time recovery needs Pro. The optional nightly JSON snapshot to a `content-backup` branch is off until approved.
