import "server-only";
import type { Enums } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cleanSearch } from "./media";

export type StockFilter = "all" | "low" | "out";
export const INVENTORY_PAGE_SIZE = 50;

export interface InventoryRow {
  variantId: string;
  productId: string;
  productTitle: string;
  variantTitle: string;
  sku: string | null;
  stock: number;
  threshold: number;
  level: "ok" | "low" | "out";
}

export interface InventoryPage {
  rows: InventoryRow[];
  page: number;
  pageCount: number;
}

/**
 * Tracked variants of live products. Low stock compares each variant with its own
 * threshold, which PostgREST cannot filter on, so filtering happens after the fetch;
 * the catalogue is small enough for that.
 */
export async function listInventory({
  query,
  filter,
  page,
}: {
  query: string;
  filter: StockFilter;
  page: number;
}): Promise<InventoryPage> {
  const supabase = await createSupabaseServerClient();
  const request = supabase
    .from("product_variants")
    .select(
      "id, title, sku, stock, low_stock_threshold, products!inner (id, title, handle, deleted_at)",
    )
    .eq("track_inventory", true)
    .is("products.deleted_at", null)
    .order("stock")
    .limit(2000);

  const { data, error } = await request;
  if (error) throw new Error(`Could not load inventory: ${error.message}`);

  // Search covers product title, handle, variant title and SKU in one pass.
  const term = cleanSearch(query).toLowerCase();
  const rows = data
    .map((row): InventoryRow & { search: string } => {
      const level = row.stock <= 0 ? "out" : row.stock <= row.low_stock_threshold ? "low" : "ok";
      return {
        variantId: row.id,
        productId: row.products.id,
        productTitle: row.products.title,
        variantTitle: row.title,
        sku: row.sku,
        stock: row.stock,
        threshold: row.low_stock_threshold,
        level,
        search: [row.products.title, row.products.handle, row.title, row.sku]
          .join(" ")
          .toLowerCase(),
      };
    })
    .filter(
      (row) => filter === "all" || (filter === "out" ? row.level === "out" : row.level !== "ok"),
    )
    .filter((row) => !term || row.search.includes(term));

  const pageCount = Math.max(1, Math.ceil(rows.length / INVENTORY_PAGE_SIZE));
  const from = (page - 1) * INVENTORY_PAGE_SIZE;
  return {
    rows: rows.slice(from, from + INVENTORY_PAGE_SIZE).map(({ search: _search, ...row }) => row),
    page,
    pageCount,
  };
}

export interface StockSummary {
  active: number;
  drafts: number;
  low: number;
  out: number;
}

export async function stockSummary(): Promise<StockSummary> {
  const supabase = await createSupabaseServerClient();
  const [active, drafts, variants] = await Promise.all([
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .is("deleted_at", null),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft")
      .is("deleted_at", null),
    supabase
      .from("product_variants")
      .select("stock, low_stock_threshold, products!inner (status, deleted_at)")
      .eq("track_inventory", true)
      .eq("products.status", "active")
      .is("products.deleted_at", null),
  ]);
  const rows = variants.data ?? [];
  return {
    active: active.count ?? 0,
    drafts: drafts.count ?? 0,
    low: rows.filter((row) => row.stock > 0 && row.stock <= row.low_stock_threshold).length,
    out: rows.filter((row) => row.stock <= 0).length,
  };
}

export interface AdjustmentLine {
  id: string;
  label: string;
  delta: number;
  after: number;
  reason: Enums<"stock_reason">;
  note: string | null;
  at: string;
}

export async function recentAdjustments(limit = 20): Promise<AdjustmentLine[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("inventory_adjustments")
    .select(
      "id, delta, stock_after, reason, note, created_at, product_variants (title, products (title))",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((row) => ({
    id: row.id,
    label: [row.product_variants?.products?.title, row.product_variants?.title]
      .filter(Boolean)
      .join(" · "),
    delta: row.delta,
    after: row.stock_after,
    reason: row.reason,
    note: row.note,
    at: row.created_at,
  }));
}
