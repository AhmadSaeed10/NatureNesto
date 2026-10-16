// Server only: reads the Supabase key from the environment. Import from server components.
import { cacheLife, cacheTag } from "next/cache";
import { sampleProducts } from "@/content/sample-products";
import type { CatalogSlug, Product, ProductBadge } from "@/content/types";

export type CatalogSource = "supabase" | "sample";

export interface CatalogResult {
  products: Product[];
  source: CatalogSource;
}

/** Shape of a row in the Supabase `products` table. See docs/SUPABASE.md. */
interface ProductRow {
  id: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  categories: string[];
  image_url: string;
  image_alt: string | null;
  size: string | null;
  badges: string[] | null;
  in_stock: boolean;
}

const BADGES: readonly ProductBadge[] = ["new", "pet-safe", "low-light", "easy-care", "bestseller"];
const COLUMNS =
  "id,name,price,compare_at_price,categories,image_url,image_alt,size,badges,in_stock";

const isRow = (value: unknown): value is ProductRow => {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.name === "string" &&
    typeof row.price === "number" &&
    Array.isArray(row.categories) &&
    typeof row.image_url === "string" &&
    typeof row.in_stock === "boolean"
  );
};

const toProduct = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name,
  price: row.price,
  compareAtPrice: row.compare_at_price ?? undefined,
  categories: row.categories as CatalogSlug[],
  image: { src: row.image_url, alt: row.image_alt ?? "" },
  size: row.size ?? undefined,
  badges: (row.badges ?? []).filter((b): b is ProductBadge =>
    (BADGES as readonly string[]).includes(b),
  ),
  inStock: row.in_stock,
});

async function fetchFromSupabase(slug: CatalogSlug): Promise<Product[] | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const query = new URLSearchParams({
    select: COLUMNS,
    categories: `cs.{${slug}}`,
    order: "name.asc",
  });
  try {
    const response = await fetch(`${url}/rest/v1/products?${query}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!response.ok) {
      console.warn(`[catalog] Supabase responded ${response.status} for "${slug}"`);
      return null;
    }
    const data: unknown = await response.json();
    return Array.isArray(data) ? data.filter(isRow).map(toProduct) : null;
  } catch (error) {
    console.warn(`[catalog] Supabase request failed for "${slug}"`, error);
    return null;
  }
}

/**
 * Products for one category. Uses Supabase when SUPABASE_URL and SUPABASE_ANON_KEY are set
 * and it returns rows; otherwise falls back to the sample catalogue so pages never render
 * empty during design review.
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
