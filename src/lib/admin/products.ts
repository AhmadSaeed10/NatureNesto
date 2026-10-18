import "server-only";
import { mediaUrl } from "@/lib/media";
import type { Enums, Json } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cleanSearch } from "./media";
import { type ProductInput, descriptionText } from "./product-schema";
import { type MediaPickerOption, type PickerOption, parseRules } from "./products-shared";

export {
  type CollectionRule,
  type MediaPickerOption,
  type PickerOption,
  parseRules,
} from "./products-shared";

export type ProductStatus = Enums<"product_status">;
export type StatusFilter = ProductStatus | "all" | "deleted";
export const PRODUCT_PAGE_SIZE = 50;

export interface ProductRow {
  id: string;
  title: string;
  handle: string;
  status: ProductStatus;
  productType: string | null;
  deleted: boolean;
  thumbnail: string | null;
  stock: number;
  variantCount: number;
  tracked: boolean;
}

export interface ProductList {
  rows: ProductRow[];
  total: number;
  page: number;
  pageCount: number;
}

interface ListOptions {
  query: string;
  status: StatusFilter;
  collectionId: string;
  page: number;
}

export async function listProducts({
  query,
  status,
  collectionId,
  page,
}: ListOptions): Promise<ProductList> {
  const supabase = await createSupabaseServerClient();
  const from = (page - 1) * PRODUCT_PAGE_SIZE;

  let request = supabase
    .from("products")
    .select(
      `id, title, handle, status, product_type, deleted_at,
       product_variants (stock, track_inventory),
       product_images (position, media_assets (external_url, storage_path))`,
      { count: "exact" },
    )
    .order("updated_at", { ascending: false })
    .range(from, from + PRODUCT_PAGE_SIZE - 1);

  request =
    status === "deleted" ? request.not("deleted_at", "is", null) : request.is("deleted_at", null);
  if (status !== "all" && status !== "deleted") request = request.eq("status", status);

  const term = cleanSearch(query);
  if (term) {
    // SKUs live on variants, so matching products are looked up first and added by id.
    const { data: skuMatches } = await supabase
      .from("product_variants")
      .select("product_id")
      .ilike("sku", `%${term}%`)
      .limit(100);
    const ids = [...new Set((skuMatches ?? []).map((row) => row.product_id))];
    const idFilter = ids.length ? `,id.in.(${ids.join(",")})` : "";
    request = request.or(`title.ilike."%${term}%",handle.ilike."%${term}%"${idFilter}`);
  }

  if (collectionId) {
    const { data: collection } = await supabase
      .from("collections")
      .select("id, kind, rules")
      .eq("id", collectionId)
      .maybeSingle();
    if (collection?.kind === "manual") {
      const { data: members } = await supabase
        .from("collection_products")
        .select("product_id")
        .eq("collection_id", collection.id);
      const ids = (members ?? []).map((row) => row.product_id);
      // An empty manual collection matches nothing.
      request = request.in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    } else if (collection) {
      for (const rule of parseRules(collection.rules)) {
        request =
          rule.field === "tag"
            ? request.contains("tags", [rule.value])
            : request.eq(rule.field, rule.value);
      }
    }
  }

  const { data, count, error } = await request;
  if (error) throw new Error(`Could not load products: ${error.message}`);

  const total = count ?? 0;
  return {
    rows: data.map((row) => {
      const image = [...row.product_images].sort((a, b) => a.position - b.position)[0];
      const tracked = row.product_variants.filter((variant) => variant.track_inventory);
      return {
        id: row.id,
        title: row.title,
        handle: row.handle,
        status: row.status,
        productType: row.product_type,
        deleted: row.deleted_at !== null,
        thumbnail: image?.media_assets ? mediaUrl(image.media_assets) || null : null,
        stock: tracked.reduce((sum, variant) => sum + variant.stock, 0),
        variantCount: row.product_variants.length,
        tracked: tracked.length > 0,
      };
    }),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PRODUCT_PAGE_SIZE)),
  };
}

export interface EditorVariant {
  id: string | null;
  title: string;
  sku: string;
  price: number;
  compare_at_price: number | null;
  cost: number | null;
  weight_g: number | null;
  option_values: Record<string, string>;
  track_inventory: boolean;
  allow_backorder: boolean;
  low_stock_threshold: number;
  initial_stock: number;
  /** Current stock, shown read only for saved variants. */
  stock: number;
}

export interface EditorImage {
  media_id: string;
  alt: string;
  url: string;
  label: string;
}

export type EditorProduct = Omit<ProductInput, "variants" | "images"> & {
  variants: EditorVariant[];
  images: EditorImage[];
  /** Changes on every save; the editor remounts from fresh data when it does. */
  version: string;
};

const asStringRecord = (value: Json): Record<string, string> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? Object.fromEntries(
        Object.entries(value).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
      )
    : {};

export async function getProductForEditor(id: string): Promise<EditorProduct | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select(
      `id, title, handle, description, status, vendor, product_type, tags, seo_title, seo_description, updated_at,
       product_options (name, values, position),
       product_variants (id, title, sku, price, compare_at_price, cost, weight_g, option_values,
         track_inventory, allow_backorder, low_stock_threshold, stock, position),
       product_images (media_id, alt, position, media_assets (external_url, storage_path, title, alt)),
       collection_products (collection_id),
       product_categories (category_id)`,
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    handle: data.handle,
    description: descriptionText(data.description),
    status: data.status,
    vendor: data.vendor ?? "",
    product_type: data.product_type ?? "",
    tags: data.tags,
    seo_title: data.seo_title ?? "",
    seo_description: data.seo_description ?? "",
    options: [...data.product_options]
      .sort((a, b) => a.position - b.position)
      .map((option) => ({ name: option.name, values: option.values })),
    variants: [...data.product_variants]
      .sort((a, b) => a.position - b.position)
      .map((variant) => ({
        id: variant.id,
        title: variant.title,
        sku: variant.sku ?? "",
        price: variant.price,
        compare_at_price: variant.compare_at_price,
        cost: variant.cost,
        weight_g: variant.weight_g,
        option_values: asStringRecord(variant.option_values),
        track_inventory: variant.track_inventory,
        allow_backorder: variant.allow_backorder,
        low_stock_threshold: variant.low_stock_threshold,
        initial_stock: 0,
        stock: variant.stock,
      })),
    images: [...data.product_images]
      .sort((a, b) => a.position - b.position)
      .flatMap((image) =>
        image.media_assets
          ? [
              {
                media_id: image.media_id,
                alt: image.alt ?? "",
                url: mediaUrl(image.media_assets),
                label: image.media_assets.title || image.media_assets.alt || "",
              },
            ]
          : [],
      ),
    collection_ids: data.collection_products.map((row) => row.collection_id),
    category_ids: data.product_categories.map((row) => row.category_id),
    version: data.updated_at,
  };
}

/** Collections, categories and images the editor lets you pick from. */
export async function getEditorOptions(): Promise<{
  manualCollections: PickerOption[];
  categories: PickerOption[];
  media: MediaPickerOption[];
}> {
  const supabase = await createSupabaseServerClient();
  const [collections, categories, media] = await Promise.all([
    supabase.from("collections").select("id, title").eq("kind", "manual").order("title"),
    supabase.from("categories").select("id, name").order("position").order("name"),
    supabase
      .from("media_assets")
      .select("id, title, alt, external_url, storage_path")
      .order("created_at", { ascending: false })
      .limit(300),
  ]);
  return {
    manualCollections: (collections.data ?? []).map((row) => ({ id: row.id, label: row.title })),
    categories: (categories.data ?? []).map((row) => ({ id: row.id, label: row.name })),
    media: (media.data ?? []).map((row) => ({
      id: row.id,
      label: row.title || row.alt || row.external_url || row.storage_path || row.id,
      url: mediaUrl(row),
    })),
  };
}

export async function listCollectionOptions(): Promise<PickerOption[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("collections")
    .select("id, title")
    .order("position")
    .order("title");
  return (data ?? []).map((row) => ({ id: row.id, label: row.title }));
}
