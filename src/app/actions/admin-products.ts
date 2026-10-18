"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { type ProductInput, productSchema } from "@/lib/admin/product-schema";
import { ACCESS, staffWithRole } from "@/lib/auth/staff";
import type { Json } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SaveProductResult =
  | { ok: true; id: string }
  | {
      ok: false;
      error: "invalid" | "handleTaken" | "skuTaken" | "forbidden" | "failed";
      fields?: string[];
    };

/** Storefront catalogue cache (src/lib/catalog.ts). */
const PRODUCTS_TAG = "products";

function refresh() {
  revalidateTag(PRODUCTS_TAG, "max");
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
}

export async function saveProduct(input: ProductInput): Promise<SaveProductResult> {
  if (!(await staffWithRole(ACCESS.catalog))) return { ok: false, error: "forbidden" };
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((issue) => String(issue.path[0])))];
    return { ok: false, error: "invalid", fields };
  }
  const { description, ...product } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("save_product", {
    p: { ...product, description: { format: "plain", text: description } } as unknown as Json,
  });
  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: error.message.includes("sku") ? "skuTaken" : "handleTaken" };
    }
    if (error.code === "42501") return { ok: false, error: "forbidden" };
    console.error("[products] save failed", error.message);
    return { ok: false, error: "failed" };
  }
  refresh();
  revalidatePath(`/admin/products/${data}`);
  return { ok: true, id: data };
}

export type BulkAction = "active" | "draft" | "archived" | "delete" | "restore";

const bulkSchema = z.object({
  ids: z.array(z.uuid()).min(1).max(200),
  action: z.enum(["active", "draft", "archived", "delete", "restore"]),
});

export type BulkResult =
  { ok: true; count: number } | { ok: false; error: "invalid" | "forbidden" | "failed" };

export async function bulkUpdateProducts(ids: string[], action: BulkAction): Promise<BulkResult> {
  if (!(await staffWithRole(ACCESS.catalog))) return { ok: false, error: "forbidden" };
  const parsed = bulkSchema.safeParse({ ids, action });
  if (!parsed.success) return { ok: false, error: "invalid" };

  // Deleting is a soft delete: the row stays for order history and can be restored.
  const update =
    parsed.data.action === "delete"
      ? { deleted_at: new Date().toISOString() }
      : parsed.data.action === "restore"
        ? { deleted_at: null }
        : { status: parsed.data.action };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .update(update)
    .in("id", parsed.data.ids)
    .select("id");
  if (error) {
    console.error("[products] bulk update failed", error.message);
    return { ok: false, error: "failed" };
  }
  refresh();
  return { ok: true, count: data.length };
}

export async function duplicateProduct(id: string): Promise<SaveProductResult> {
  if (!(await staffWithRole(ACCESS.catalog))) return { ok: false, error: "forbidden" };
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("duplicate_product", { p_id: parsed.data });
  if (error) {
    console.error("[products] duplicate failed", error.message);
    return { ok: false, error: "failed" };
  }
  refresh();
  return { ok: true, id: data };
}
