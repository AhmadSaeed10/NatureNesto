# Product catalogue

Superseded by [ADMIN.md](./ADMIN.md). Products now live in the Shopify style `products`, `product_variants` and `product_images` tables.

`getCatalog()` in `src/lib/catalog.ts` reads active products tagged with the category slug (for example `indoor-plants`). Badges are tags prefixed `badge:` (for example `badge:pet-safe`). When Supabase is not configured, the query fails, or a category has no active products, the page shows the sample catalogue with a "Showing sample products" note. Results are cached for an hour under the tags `products` and `products:<slug>`; admin saves will revalidate them from Stage C.
