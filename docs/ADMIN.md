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

There is no public sign up. A staff member is added by inserting an invite:

```sql
insert into public.staff_invites (email, role) values ('name@example.com', 'editor');
```

An owner or admin can do this today in the Supabase SQL editor (Stage H adds it to Admin Settings). The person then opens `/admin/login`, enters the email and leaves the password empty. The server checks the invite, creates the account and emails a sign in link. The role is applied on first sign in. To remove access, set `profiles.role` to null.

Passwords are optional. Staff can set one later from Admin Settings (Stage B).

## Supabase Auth settings (dashboard, one time)

- Authentication > URL Configuration: Site URL `https://naturenesto.com`. Redirect URLs: `https://naturenesto.com/auth/callback`, `https://*-<vercel-team>.vercel.app/auth/callback` (Vercel previews; use your team slug) and `http://localhost:3000/auth/callback`.
- Authentication > Sign In / Providers: turn off "Allow new users to sign up". Staff accounts are created by the server, so this does not block invites.
- Authentication > Emails: the default sender is rate limited and for testing only. Add custom SMTP before launch (decided in Stage G).

## Environment variables

See `.env.example`. In Vercel (Production and Preview): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`. In GitHub Actions secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF`. The database password never goes to Vercel.

Without the Supabase variables the storefront still works on the sample catalogue and `/admin/login` shows that sign in is not available.

## Migrations

All schema lives in `supabase/migrations`, committed to git. No dashboard schema edits.

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
