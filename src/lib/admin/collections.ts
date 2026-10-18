import "server-only";
import { mediaUrl } from "@/lib/media";
import type { Enums } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  type CategoryNode,
  type CollectionKind,
  type CollectionMember,
  type EditorCollection,
  SORT_ORDERS,
  type SortOrder,
} from "./collections-shared";
import { type CollectionRule, parseRules } from "./products-shared";

export {
  SORT_ORDERS,
  type CollectionKind,
  type CollectionMember,
  type EditorCollection,
  type SortOrder,
};

export interface CollectionSummary {
  id: string;
  title: string;
  handle: string;
  kind: CollectionKind;
  status: Enums<"content_status">;
  productCount: number;
}

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

/** Live (not deleted) products matching automatic rules; all rules must match. */
export async function countRuleMatches(
  supabase: ServerClient,
  rules: CollectionRule[],
): Promise<number> {
  if (rules.length === 0) return 0;
  let request = supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .is("deleted_at", null);
  for (const rule of rules) {
    request =
      rule.field === "tag"
        ? request.contains("tags", [rule.value])
        : request.eq(rule.field, rule.value);
  }
  const { count } = await request;
  return count ?? 0;
}

export async function listCollections(): Promise<CollectionSummary[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("collections")
    .select("id, title, handle, kind, status, rules, collection_products (count)")
    .order("position")
    .order("title");
  return Promise.all(
    (data ?? []).map(async (row) => {
      const kind: CollectionKind = row.kind === "automatic" ? "automatic" : "manual";
      const manualCount = row.collection_products[0]?.count ?? 0;
      return {
        id: row.id,
        title: row.title,
        handle: row.handle,
        kind,
        status: row.status,
        productCount:
          kind === "automatic"
            ? await countRuleMatches(supabase, parseRules(row.rules))
            : manualCount,
      };
    }),
  );
}

const isSort = (value: string): value is SortOrder =>
  (SORT_ORDERS as readonly string[]).includes(value);

export async function getCollectionForEditor(id: string): Promise<EditorCollection | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("collections")
    .select(
      `id, title, handle, description, kind, rules, sort_order, status, image_id, seo_title, seo_description, updated_at,
       collection_products (position, products (id, title, handle,
         product_images (position, media_assets (external_url, storage_path))))`,
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;

  const kind: CollectionKind = data.kind === "automatic" ? "automatic" : "manual";
  const rules = parseRules(data.rules);
  return {
    id: data.id,
    title: data.title,
    handle: data.handle,
    description: data.description ?? "",
    kind,
    rules,
    sortOrder: isSort(data.sort_order) ? data.sort_order : "manual",
    published: data.status === "published",
    imageId: data.image_id ?? "",
    seoTitle: data.seo_title ?? "",
    seoDescription: data.seo_description ?? "",
    members: [...data.collection_products]
      .sort((a, b) => a.position - b.position)
      .flatMap((row) => {
        const product = row.products;
        if (!product) return [];
        const image = [...product.product_images].sort((a, b) => a.position - b.position)[0];
        return [
          {
            id: product.id,
            title: product.title,
            handle: product.handle,
            thumbnail: image?.media_assets ? mediaUrl(image.media_assets) || null : null,
          },
        ];
      }),
    matchCount: kind === "automatic" ? await countRuleMatches(supabase, rules) : 0,
    version: data.updated_at,
  };
}

/** Categories flattened in tree order, with their depth for indentation. */
export async function listCategoryTree(): Promise<CategoryNode[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, handle, parent_id, position")
    .order("position")
    .order("name");
  const rows = data ?? [];
  const byParent = new Map<string | null, typeof rows>();
  for (const row of rows) {
    // An orphan (parent missing) is shown at the top level.
    const parent = row.parent_id && rows.some((r) => r.id === row.parent_id) ? row.parent_id : null;
    byParent.set(parent, [...(byParent.get(parent) ?? []), row]);
  }
  const out: CategoryNode[] = [];
  const visit = (parent: string | null, depth: number, seen: Set<string>) => {
    for (const row of byParent.get(parent) ?? []) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      out.push({ id: row.id, name: row.name, handle: row.handle, parentId: row.parent_id, depth });
      visit(row.id, depth + 1, seen);
    }
  };
  visit(null, 0, new Set());
  return out;
}
