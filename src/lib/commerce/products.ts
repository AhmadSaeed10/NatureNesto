import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { descriptionText } from "@/lib/admin/product-schema";
import { richTextSource } from "@/lib/cms/rich-text";
import { mediaUrl } from "@/lib/media";
import type { Json } from "@/lib/supabase/database.types";
import { createSupabasePublicClient } from "@/lib/supabase/server";

export interface StoreVariant {
  id: string;
  title: string;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  optionValues: Record<string, string>;
  /** Whether it can be added to the cart now. */
  available: boolean;
  /** Units left when stock is tracked and low, for the "only n left" hint. */
  lowStock: number | null;
}

export interface StoreProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string | null;
  vendor: string | null;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  options: { name: string; values: string[] }[];
  variants: StoreVariant[];
  images: { src: string; alt: string }[];
}

const asRecord = (value: Json): Record<string, string> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? Object.fromEntries(
        Object.entries(value).filter((e): e is [string, string] => typeof e[1] === "string"),
      )
    : {};

/** An active product for its page. RLS hides drafts and deleted products from the anon key. */
export async function getProduct(handle: string): Promise<StoreProduct | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("products", `product:${handle}`);
  const supabase = createSupabasePublicClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("products")
    .select(
      `id, handle, title, description, product_type, vendor, tags, seo_title, seo_description,
       product_options (name, values, position),
       product_variants (id, title, sku, price, compare_at_price, option_values, stock, track_inventory,
         allow_backorder, low_stock_threshold, position),
       product_images (alt, position, media_assets (external_url, storage_path, alt, decorative))`,
    )
    .eq("handle", handle)
    .eq("status", "active")
    .is("deleted_at", null)
    .maybeSingle();
  if (!data) return null;

  return {
    id: data.id,
    handle: data.handle,
    title: data.title,
    // Descriptions are plain text today; rich text is read the same way when it arrives.
    description: richTextSource(data.description) || descriptionText(data.description),
    productType: data.product_type,
    vendor: data.vendor,
    tags: data.tags,
    seoTitle: data.seo_title,
    seoDescription: data.seo_description,
    options: [...data.product_options]
      .sort((a, b) => a.position - b.position)
      .map(({ name, values }) => ({ name, values })),
    variants: [...data.product_variants]
      .sort((a, b) => a.position - b.position)
      .map((v) => {
        const available = !v.track_inventory || v.allow_backorder || v.stock > 0;
        return {
          id: v.id,
          title: v.title,
          sku: v.sku,
          price: v.price,
          compareAtPrice: v.compare_at_price,
          optionValues: asRecord(v.option_values),
          available,
          lowStock:
            v.track_inventory &&
            !v.allow_backorder &&
            v.stock > 0 &&
            v.stock <= v.low_stock_threshold
              ? v.stock
              : null,
        };
      }),
    images: [...data.product_images]
      .sort((a, b) => a.position - b.position)
      .flatMap((image) =>
        image.media_assets
          ? [
              {
                src: mediaUrl(image.media_assets),
                alt: image.media_assets.decorative ? "" : (image.alt ?? image.media_assets.alt),
              },
            ]
          : [],
      ),
  };
}

/** Active product handles, for build time params. */
export async function listProductHandles(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const supabase = createSupabasePublicClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("products")
    .select("handle")
    .eq("status", "active")
    .is("deleted_at", null)
    .limit(500);
  return (data ?? []).map((row) => row.handle);
}
