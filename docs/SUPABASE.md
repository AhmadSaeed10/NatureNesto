# Product catalogue: connecting Supabase

Category pages (`/pots-and-planters`, `/indoor-plants`, `/outdoor-plants` and `/plants/*`) read products through `getCatalog()` in `src/lib/catalog.ts`.

## How the data source is chosen

| Situation | What the page shows |
| --- | --- |
| `SUPABASE_URL` or `SUPABASE_ANON_KEY` not set | Sample catalogue from `src/content/sample-products.ts`, with a "Showing sample products" note |
| Supabase set, request fails (network, 401, bad table) | Sample catalogue, with the note. A warning is logged on the server |
| Supabase set, category has no rows | Sample catalogue for that category, with the note |
| Supabase set, category has rows | Live products only, no note |

Results are cached for an hour per category (`cacheLife("hours")`, tags `products` and `products:<slug>`). Pages are prerendered at build time and refreshed in the background after that.

No Supabase SDK is used. The site calls the Supabase REST endpoint directly, so there is no extra dependency.

## 1. Create the table

Run in the Supabase SQL editor:

```sql
create table public.products (
  id text primary key,
  name text not null,
  price integer not null check (price >= 0),          -- PKR, whole rupees
  compare_at_price integer check (compare_at_price >= 0),
  categories text[] not null,                          -- see slugs below
  image_url text not null,                             -- absolute URL or /images/... path
  image_alt text,                                      -- leave empty when decorative
  size text,
  badges text[] default '{}',                          -- new, pet-safe, low-light, easy-care, bestseller
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Products are publicly readable"
  on public.products for select
  to anon
  using (true);
```

Category slugs: `pots-and-planters`, `indoor-plants`, `outdoor-plants`, `pet-friendly`, `easy-care`, `orchids`, `large-plants`, `low-light`, `plant-care`. A product can sit in several categories, for example `{indoor-plants,pet-friendly}`.

Unknown badges are ignored. Rows missing a required field are skipped.

## 2. Add the environment variables

In Vercel, go to Project, Settings, Environment Variables and add, for Production and Preview:

- `SUPABASE_URL`: the project URL, for example `https://abcd1234.supabase.co`
- `SUPABASE_ANON_KEY`: the anon public key (read only through the policy above)

Redeploy. Categories with rows switch to live data and the others keep showing samples.

## 3. Images

`image_url` can be a Supabase Storage public URL. Add the storage host to `images.remotePatterns` in `next.config.ts` so `next/image` can optimise it. Local paths under `/images/` work without changes.
