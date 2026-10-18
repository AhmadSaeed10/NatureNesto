// Server only: reads products with the anon key, so RLS shows active products only.
import { cacheLife, cacheTag } from "next/cache";
import { catalogCategories } from "@/content/catalog";
import { sampleProducts } from "@/content/sample-products";
import type { CatalogSlug, Product, ProductBadge } from "@/content/types";
import { supabasePublicEnv } from "@/lib/supabase/env";
import { createSupabasePublicClient } from "@/lib/supabase/server";

export type CatalogSource = "supabase" | "sample";

export interface CatalogResult {
  products: Product[];
  source: CatalogSource;
}

const BADGES: readonly ProductBadge[] = ["new", "pet-safe", "low-light", "easy-care", "bestseller"];
const SLUGS: readonly string[] = catalogCategories.map((category) => category.slug);
// Badges are stored as "badge:<name>" tags so they never collide with collection tags.
const BADGE_PREFIX = "badge:";
const DEFAULT_VARIANT = "Default";
const PAISA_PER_RUPEE = 100;

const SELECT = `
  handle, title, tags,
  product_variants (title, price, compare_at_price, stock, track_inventory, allow_backorder, position),
  product_images (position, alt, media_assets (external_url, storage_path, alt, decorative))
`;

const isSlug = (tag: string): tag is CatalogSlug => SLUGS.includes(tag);
const isBadge = (value: string): value is ProductBadge =>
  (BADGES as readonly string[]).includes(value);
const byPosition = <T extends { position: number }>(a: T, b: T): number => a.position - b.position;

function mediaUrl(media: { external_url: string | null; storage_path: string | null }): string {
  if (media.external_url) return media.external_url;
  const env = supabasePublicEnv();
  return env && media.storage_path
    ? `${env.url}/storage/v1/object/public/media/${media.storage_path}`
    : "";
}

async function fetchFromSupabase(slug: CatalogSlug): Promise<Product[] | null> {
  const supabase = createSupabasePublicClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("status", "active")
    .is("deleted_at", null)
    .contains("tags", [slug])
    .order("title");
  if (error) {
    console.warn(`[catalog] Supabase query failed for "${slug}"`, error.message);
    return null;
  }

  return data.flatMap((row): Product[] => {
    const variant = [...row.product_variants].sort(byPosition)[0];
    const image = [...row.product_images].sort(byPosition)[0];
    if (!variant || !image?.media_assets) return [];
    const media = image.media_assets;
    const inStock = row.product_variants.some(
      (v) => !v.track_inventory || v.allow_backorder || v.stock > 0,
    );
    return [
      {
        id: row.handle,
        name: row.title,
        price: variant.price / PAISA_PER_RUPEE,
        compareAtPrice:
          variant.compare_at_price === null
            ? undefined
            : variant.compare_at_price / PAISA_PER_RUPEE,
        categories: row.tags.filter(isSlug),
        image: { src: mediaUrl(media), alt: media.decorative ? "" : (image.alt ?? media.alt) },
        size: variant.title === DEFAULT_VARIANT ? undefined : variant.title,
        badges: row.tags
          .filter((tag) => tag.startsWith(BADGE_PREFIX))
          .map((tag) => tag.slice(BADGE_PREFIX.length))
          .filter(isBadge),
        inStock,
      },
    ];
  });
}

/**
 * Products for one category. Uses Supabase when it is configured and returns active
 * products; otherwise falls back to the sample catalogue so pages never render empty.
 */
export async function getCatalog(slug: CatalogSlug): Promise<CatalogResult> {
  "use cache";
  cacheLife("hours");
  cacheTag("products", `products:${slug}`);

  const live = await fetchFromSupabase(slug);
  if (live && live.length > 0) return { products: live, source: "supabase" };

  return {
    products: sampleProducts.filter((product) => product.categories.includes(slug)),
    source: "sample",
  };
}
