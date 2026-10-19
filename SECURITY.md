# Security

## Reporting

Email info@naturenesto.com. Please do not open public issues for vulnerabilities.

## Threat model

| Asset               | Threat                                                       | Control                                                                                                                                                                                                |
| ------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Admin access        | Account takeover, self sign up                               | No public sign up; staff only via `staff_invites`. Magic link or password. Login rate limited per IP and per email. Answers do not reveal whether an email has access                                  |
| Roles               | Privilege escalation                                         | `guard_profile_role` trigger: only owners change roles, admins cannot touch owners. Role helpers live in a non exposed `private` schema                                                                |
| Data                | Reading drafts, leads or staff data with the public anon key | RLS on every table. Anon reads only active products, published content and settings. Leads, invites, profiles and the audit log are staff only                                                         |
| Service role key    | Leak to the browser                                          | Server only (`server-only` guard), never `NEXT_PUBLIC_`. Used only in server actions and route handlers after validation                                                                               |
| Forms and endpoints | Abuse, injection                                             | zod validation on the server, Postgres backed rate limits (`hit_rate_limit`, fails closed), honeypot on public forms                                                                                   |
| Changes             | Silent edits                                                 | `audit_log` trigger on every admin table: actor, role, before and after                                                                                                                                |
| Carts               | Tampering with another visitor's cart                        | Cart id never leaves the server; an opaque token sits in an httpOnly, SameSite cookie. Carts are deny all to anon and authenticated; only server actions (service role) read or write them             |
| Checkout            | Price or stock manipulation, overselling                     | Totals computed in the database from current prices; `place_order` locks variants and refuses oversells in one transaction. Executable by the service role only. zod validation and rate limits per IP |
| Orders              | Reading someone else's order                                 | Guests open an order only with its random access token; signed in customers read only rows linked to their own customer record (RLS). Order pages are noindex                                          |
| Customer accounts   | Account takeover, enumeration                                | Email link sign in only, rate limited per IP and per email; the same answer whether or not the email exists. Accounts are created by the server, so public sign up stays off                           |
| Payments (Stage G)  | Card data exposure, forged callbacks                         | No card data stored. Webhooks verify signatures                                                                                                                                                        |
| Rich text (Stage D) | Stored XSS                                                   | Stored as JSON, sanitised on render                                                                                                                                                                    |

## What was tested (Stages A to E)

- 60 pgTAP assertions in `supabase/tests/rls.test.sql` covering anon, a signed in non staff user, editor, support and admin: draft visibility, staff only tables, writes per role, role escalation, owner protection, site settings writes, media usage counts, product saves with variants, stock adjustments and their log, duplicate, section drafts hidden from visitors, support and customers, scheduled and draft posts hidden, commerce (orders, customers, discount codes and carts hidden from anon, customers limited to their own orders and addresses, only enabled payment methods public, `place_order` and `quote_cart` closed to anon, editors cannot read orders), and audit attribution. Validated against the hosted schema inside a rolled back transaction and run in CI on every PR.
- Supabase security advisors: no findings.
- Media uploads go from the browser to Storage under the staff session; Storage policies allow writes for owner, admin and editor only. The server then validates the path, type, size and dimensions with zod before recording the asset, and removes the file if recording fails.
- Product saves run in one database transaction (`save_product`, security invoker) so RLS and audit triggers apply to every row. Stock changes only go through `adjust_stock`, which writes an append only log with the actor.
- CSV export neutralises spreadsheet formulas; import is limited to 5 MB and 2000 rows and validated with the same zod schema as the editor.
- Every admin server action re-checks the caller's role before touching data; RLS and the role trigger check again in the database.
- `/admin` redirects signed out visitors to `/admin/login` and `/account` to `/account/login`; admin, auth, cart, checkout, order and account routes are `noindex` and disallowed in robots.txt.
- Checkout was tested end to end against the hosted database in a rolled back transaction: totals with a discount and city based delivery, stock decrement with its log, oversell refused, disabled payment method refused.

## Known gaps

- Supabase advisor: leaked password protection is off. Turn it on in Authentication > Sign In / Providers (password security).
- `/preview` answers HTTP 200 with the not found page for visitors (streamed 404); it reveals nothing, is noindex and disallowed in robots.txt.

- Rate limit rows are not pruned yet; a cleanup job needs approval before it is scheduled.
