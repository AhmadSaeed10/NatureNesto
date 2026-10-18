"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  CSV_MAX_BYTES,
  CSV_MAX_ROWS,
  PRODUCT_CSV_COLUMNS,
  type ProductCsvColumn,
} from "@/lib/admin/product-csv";
import { type ProductInput, productSchema } from "@/lib/admin/product-schema";
import { ACCESS, staffWithRole } from "@/lib/auth/staff";
import { parseCsv } from "@/lib/csv";
import { toHandle } from "@/lib/handle";
import { rupeesToPaisa } from "@/lib/money";
import type { Json } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ImportState {
  status: "idle" | "done" | "file" | "header" | "forbidden";
  created?: number;
  updated?: number;
  /** Line numbers (1 based, header is line 1) that could not be read. */
  badLines?: number[];
  /** Handles that failed to save. */
  failed?: string[];
}

type Row = Record<ProductCsvColumn, string> & { line: number };

const isStatus = (value: string): value is ProductInput["status"] =>
  value === "active" || value === "draft" || value === "archived";
const yes = (value: string): boolean => /^(true|yes|1)$/i.test(value.trim());
const intOrNull = (value: string): number | null =>
  value.trim() === "" ? null : Number.parseInt(value, 10);

export async function importProducts(
  _previous: ImportState,
  formData: FormData,
): Promise<ImportState> {
  if (!(await staffWithRole(ACCESS.catalog))) return { status: "forbidden" };
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > CSV_MAX_BYTES)
    return { status: "file" };

  const [header, ...body] = parseCsv(await file.text());
  if (!header || !PRODUCT_CSV_COLUMNS.every((column) => header.includes(column)))
    return { status: "header" };
  if (body.length > CSV_MAX_ROWS) return { status: "file" };

  const index = Object.fromEntries(
    PRODUCT_CSV_COLUMNS.map((column) => [column, header.indexOf(column)]),
  );
  const rows: Row[] = body.map((cells, i) => {
    const row = { line: i + 2 } as Row;
    for (const column of PRODUCT_CSV_COLUMNS)
      row[column] = (cells[index[column] ?? -1] ?? "").trim();
    return row;
  });

  const groups = new Map<string, Row[]>();
  const badLines: number[] = [];
  for (const row of rows) {
    const handle = toHandle(row.Handle);
    if (!handle) {
      badLines.push(row.line);
      continue;
    }
    groups.set(handle, [...(groups.get(handle) ?? []), row]);
  }

  const supabase = await createSupabaseServerClient();
  let created = 0;
  let updated = 0;
  const failed: string[] = [];

  for (const [handle, group] of groups) {
    const head = group[0];
    if (!head) continue;
    const { data: existing } = await supabase
      .from("products")
      .select(
        `id, product_variants (id, sku, title, stock),
         product_images (media_id, alt, position)`,
      )
      .eq("handle", handle)
      .maybeSingle();

    const optionNames = [head["Option1 Name"], head["Option2 Name"], head["Option3 Name"]].filter(
      Boolean,
    );
    const optionValues = (row: Row): string[] => [
      row["Option1 Value"],
      row["Option2 Value"],
      row["Option3 Value"],
    ];

    const stockChanges: { variantId: string; delta: number }[] = [];
    const variants: ProductInput["variants"] = [];
    let groupValid = true;
    for (const row of group) {
      const price = rupeesToPaisa(row.Price);
      if (price === null) {
        badLines.push(row.line);
        groupValid = false;
        continue;
      }
      const values = optionValues(row);
      const option_values = Object.fromEntries(
        optionNames.map((name, i) => [name, values[i] ?? ""]),
      );
      const title = row["Variant Title"] || values.filter(Boolean).join(" / ") || "Default";
      const match = existing?.product_variants.find((v) =>
        row.SKU ? v.sku === row.SKU : v.title === title,
      );
      const stock = intOrNull(row.Stock) ?? 0;
      if (match && stock !== match.stock)
        stockChanges.push({ variantId: match.id, delta: stock - match.stock });
      variants.push({
        id: match?.id ?? null,
        title,
        sku: row.SKU,
        price,
        compare_at_price: row["Compare At Price"] ? rupeesToPaisa(row["Compare At Price"]) : null,
        cost: row.Cost ? rupeesToPaisa(row.Cost) : null,
        weight_g: intOrNull(row["Weight (g)"]),
        option_values,
        track_inventory: row["Track Inventory"] === "" ? true : yes(row["Track Inventory"]),
        allow_backorder: yes(row["Allow Backorder"]),
        low_stock_threshold: 3,
        initial_stock: match ? 0 : Math.max(0, stock),
      });
    }
    if (!groupValid) {
      failed.push(handle);
      continue;
    }

    const options = optionNames.map((name, i) => ({
      name,
      values: [...new Set(group.map((row) => optionValues(row)[i] ?? "").filter(Boolean))],
    }));
    const parsed = productSchema.safeParse({
      id: existing?.id ?? null,
      title: head.Title || handle,
      handle,
      description: head.Description,
      status: isStatus(head.Status) ? head.Status : "draft",
      vendor: head.Vendor,
      product_type: head.Type,
      tags: head.Tags.split(","),
      seo_title: head["SEO Title"],
      seo_description: head["SEO Description"],
      options,
      variants,
      // Images are not in the CSV, so existing ones are kept as they are.
      images: [...(existing?.product_images ?? [])]
        .sort((a, b) => a.position - b.position)
        .map((image) => ({ media_id: image.media_id, alt: image.alt ?? "" })),
      collection_ids: [],
      category_ids: [],
    } satisfies ProductInput);
    if (!parsed.success) {
      failed.push(handle);
      continue;
    }

    // Collections and categories are left untouched on import.
    const { collection_ids: _c, category_ids: _k, description, ...payload } = parsed.data;
    const { error } = await supabase.rpc("save_product", {
      p: { ...payload, description: { format: "plain", text: description } } as unknown as Json,
    });
    if (error) {
      failed.push(handle);
      continue;
    }
    for (const change of stockChanges) {
      await supabase.rpc("adjust_stock", {
        p_variant_id: change.variantId,
        p_delta: change.delta,
        p_reason: "import",
      });
    }
    if (existing) updated += 1;
    else created += 1;
  }

  revalidateTag("products", "max");
  revalidatePath("/admin/products");
  return { status: "done", created, updated, badLines, failed };
}
