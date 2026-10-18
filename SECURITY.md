# Security

## Reporting

Email info@naturenesto.com. Please do not open public issues for vulnerabilities.

## Threat model

| Asset               | Threat                                                       | Control                                                                                                                                                               |
| ------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin access        | Account takeover, self sign up                               | No public sign up; staff only via `staff_invites`. Magic link or password. Login rate limited per IP and per email. Answers do not reveal whether an email has access |
| Roles               | Privilege escalation                                         | `guard_profile_role` trigger: only owners change roles, admins cannot touch owners. Role helpers live in a non exposed `private` schema                               |
| Data                | Reading drafts, leads or staff data with the public anon key | RLS on every table. Anon reads only active products, published content and settings. Leads, invites, profiles and the audit log are staff only                        |
| Service role key    | Leak to the browser                                          | Server only (`server-only` guard), never `NEXT_PUBLIC_`. Used only in server actions and route handlers after validation                                              |
| Forms and endpoints | Abuse, injection                                             | zod validation on the server, Postgres backed rate limits (`hit_rate_limit`, fails closed), honeypot on public forms                                                  |
| Changes             | Silent edits                                                 | `audit_log` trigger on every admin table: actor, role, before and after                                                                                               |
| Payments (Stage G)  | Card data exposure, forged callbacks                         | No card data stored. Webhooks verify signatures                                                                                                                       |
| Rich text (Stage D) | Stored XSS                                                   | Stored as JSON, sanitised on render                                                                                                                                   |

## What was tested (Stages A to C)

- 39 pgTAP assertions in `supabase/tests/rls.test.sql` covering anon, a signed in non staff user, editor, support and admin: draft visibility, staff only tables, writes per role, role escalation, owner protection, site settings writes, media usage counts, product saves with variants, stock adjustments and their log, duplicate, and audit attribution. Validated against the hosted schema inside a rolled back transaction and run in CI on every PR.
- Supabase security advisors: no findings.
- Media uploads go from the browser to Storage under the staff session; Storage policies allow writes for owner, admin and editor only. The server then validates the path, type, size and dimensions with zod before recording the asset, and removes the file if recording fails.
- Product saves run in one database transaction (`save_product`, security invoker) so RLS and audit triggers apply to every row. Stock changes only go through `adjust_stock`, which writes an append only log with the actor.
- CSV export neutralises spreadsheet formulas; import is limited to 5 MB and 2000 rows and validated with the same zod schema as the editor.
- Every admin server action re-checks the caller's role before touching data; RLS and the role trigger check again in the database.
- `/admin` redirects signed out visitors to `/admin/login`; the admin and auth routes are `noindex` and disallowed in robots.txt.

## Known gaps

- Customer accounts and checkout arrive in Stage E with their own policies and tests.
- Rate limit rows are not pruned yet; a cleanup job needs approval before it is scheduled.
