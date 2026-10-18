"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { SORT_ORDERS } from "@/lib/admin/collections-shared";
import { cleanSearch } from "@/lib/admin/media";
import { ACCESS, staffWithRole } from "@/lib/auth/staff";
import { HANDLE_PATTERN, toTag } from "@/lib/handle";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CollectionResult =
  | { ok: true; id: string }
  | {
      ok: false;
      error: "invalid" | "handleTaken" | "rules" | "forbidden" | "failed";
      fields?: string[];
    };

const ruleSchema = z.object({
  field: z.enum(["tag", "product_type", "vendor"]),
  value: z.string().trim().min(1).max(100),
});

const collectionSchema = z
  .object({
    id: z.uuid().nullable(),
    title: z.string().trim().min(1).max(120),
    handle: z.string().trim().max(100).regex(HANDLE_PATTERN),
    description: z.string().trim().max(2000),
    kind: z.enum(["manual", "automatic"]),
    rules: z.array(ruleSchema).max(10),
    sortOrder: z.enum(SORT_ORDERS),
    published: z.boolean(),
    imageId: z.union([z.literal(""), z.uuid()]),
    seoTitle: z.string().trim().max(70),
    seoDescription: z.string().trim().max(170),
    productIds: z.array(z.uuid()).max(1000),
  })
  // Tags are compared exactly, so tag rules use the same normalised form as product tags.
  .transform((value) => ({
    ...value,
    rules: value.rules.map((rule) =>
      rule.field === "tag" ? { ...rule, value: toTag(rule.value) } : rule,
    ),
  }));

export type CollectionInput = z.input<typeof collectionSchema>;

function refresh(id?: string) {
  revalidateTag("products", "max");
  revalidatePath("/admin/collections");
  if (id) revalidatePath(`/admin/collections/${id}`);
}

export async function saveCollection(input: CollectionInput): Promise<CollectionResult> {
  if (!(await staffWithRole(ACCESS.catalog))) return { ok: false, error: "forbidden" };
  const parsed = collectionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid",
      fields: [...new Set(parsed.error.issues.map((i) => String(i.path[0])))],
    };
  }
  const value = parsed.data;
  if (value.kind === "automatic" && value.rules.length === 0) return { ok: false, error: "rules" };

  const row = {
    title: value.title,
    handle: value.handle,
    description: value.description || null,
    kind: value.kind,
    rules: value.kind === "automatic" ? value.rules : [],
    sort_order: value.sortOrder,
    status: value.published ? ("published" as const) : ("draft" as const),
    image_id: value.imageId || null,
    seo_title: value.seoTitle || null,
    seo_description: value.seoDescription || null,
  };

  const supabase = await createSupabaseServerClient();
  const saved = value.id
    ? await supabase.from("collections").update(row).eq("id", value.id).select("id").single()
    : await supabase.from("collections").insert(row).select("id").single();
  if (saved.error) {
    if (saved.error.code === "23505") return { ok: false, error: "handleTaken" };
    console.error("[collections] save failed", saved.error.message);
    return { ok: false, error: "failed" };
  }
  const id = saved.data.id;

  if (value.kind === "manual") {
    // Membership is small and order matters, so it is rewritten: drop removed products,
    // then upsert the rest with their new positions.
    const remove = supabase.from("collection_products").delete().eq("collection_id", id);
    const { error: removeError } = value.productIds.length
      ? await remove.not("product_id", "in", `(${value.productIds.join(",")})`)
      : await remove;
    const { error: upsertError } = value.productIds.length
      ? await supabase.from("collection_products").upsert(
          value.productIds.map((productId, position) => ({
            collection_id: id,
            product_id: productId,
            position,
          })),
          { onConflict: "collection_id,product_id" },
        )
      : { error: null };
    if (removeError || upsertError) {
      console.error(
        "[collections] membership failed",
        removeError?.message ?? upsertError?.message,
      );
      return { ok: false, error: "failed" };
    }
  }

  refresh(id);
  return { ok: true, id };
}

export async function deleteCollection(id: string): Promise<{ ok: boolean }> {
  if (!(await staffWithRole(ACCESS.catalog))) return { ok: false };
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return { ok: false };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("collections").delete().eq("id", parsed.data);
  if (error) return { ok: false };
  refresh();
  return { ok: true };
}

export interface ProductHit {
  id: string;
  title: string;
  handle: string;
}

/** Product search for pickers (collections today, discounts later). */
export async function searchProducts(query: string): Promise<ProductHit[]> {
  if (!(await staffWithRole(ACCESS.catalog))) return [];
  const term = cleanSearch(query);
  if (!term) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("id, title, handle")
    .is("deleted_at", null)
    .or(`title.ilike."%${term}%",handle.ilike."%${term}%"`)
    .order("title")
    .limit(20);
  return data ?? [];
}

// Categories ------------------------------------------------------------------------------

export interface CategoryState {
  status: "idle" | "saved" | "invalid" | "handleTaken" | "cycle" | "forbidden" | "failed";
}

const categorySchema = z.object({
  id: z.union([z.literal(""), z.uuid()]),
  name: z.string().trim().min(1).max(80),
  handle: z.string().trim().max(100).regex(HANDLE_PATTERN),
  parentId: z.union([z.literal(""), z.uuid()]),
});

export async function saveCategory(
  _previous: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  if (!(await staffWithRole(ACCESS.catalog))) return { status: "forbidden" };
  const parsed = categorySchema.safeParse({
    id: formData.get("id") ?? "",
    name: formData.get("name"),
    handle: formData.get("handle"),
    parentId: formData.get("parentId") ?? "",
  });
  if (!parsed.success) return { status: "invalid" };
  const { id, name, handle, parentId } = parsed.data;

  const supabase = await createSupabaseServerClient();
  if (id && parentId) {
    // Walk up from the new parent; meeting this category means the move would loop.
    const { data: all } = await supabase.from("categories").select("id, parent_id");
    const parents = new Map((all ?? []).map((row) => [row.id, row.parent_id]));
    let cursor: string | null | undefined = parentId;
    for (let guard = 0; cursor && guard < 100; guard += 1) {
      if (cursor === id) return { status: "cycle" };
      cursor = parents.get(cursor);
    }
  }

  const row = { name, handle, parent_id: parentId || null };
  const { error } = id
    ? await supabase.from("categories").update(row).eq("id", id)
    : await supabase.from("categories").insert(row);
  if (error) return { status: error.code === "23505" ? "handleTaken" : "failed" };
  revalidatePath("/admin/collections/categories");
  return { status: "saved" };
}

export async function deleteCategory(id: string): Promise<{ ok: boolean }> {
  if (!(await staffWithRole(ACCESS.catalog))) return { ok: false };
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return { ok: false };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("categories").delete().eq("id", parsed.data);
  if (error) return { ok: false };
  revalidatePath("/admin/collections/categories");
  return { ok: true };
}
