import { NextResponse } from "next/server";
import { PRODUCT_CSV_COLUMNS } from "@/lib/admin/product-csv";
import { descriptionText } from "@/lib/admin/product-schema";
import { ACCESS, staffWithRole } from "@/lib/auth/staff";
import { toCsv } from "@/lib/csv";
import { paisaToRupees } from "@/lib/money";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Whole catalogue (not deleted) as CSV, one row per variant. */
export async function GET() {
  if (!(await staffWithRole(ACCESS.catalog))) {
    return new NextResponse(null, { status: 403 });
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `handle, title, status, vendor, product_type, tags, description, seo_title, seo_description,
       product_options (name, position),
       product_variants (title, sku, price, compare_at_price, cost, weight_g, stock,
         track_inventory, allow_backorder, option_values, position)`,
    )
    .is("deleted_at", null)
    .order("handle");
  if (error) return new NextResponse(null, { status: 500 });

  const rows = data.flatMap((product) => {
    const options = [...product.product_options].sort((a, b) => a.position - b.position);
    return [...product.product_variants]
      .sort((a, b) => a.position - b.position)
      .map((variant, index) => {
        const values =
          variant.option_values &&
          typeof variant.option_values === "object" &&
          !Array.isArray(variant.option_values)
            ? variant.option_values
            : {};
        const optionCells = [0, 1, 2].flatMap((i) => {
          const option = options[i];
          const value = option ? values[option.name] : undefined;
          return [option?.name ?? "", typeof value === "string" ? value : ""];
        });
        // Product fields only on the first row of each product, as in a Shopify export.
        const first = index === 0;
        return [
          product.handle,
          first ? product.title : "",
          first ? product.status : "",
          first ? product.vendor : "",
          first ? product.product_type : "",
          first ? product.tags.join(", ") : "",
          first ? descriptionText(product.description) : "",
          first ? product.seo_title : "",
          first ? product.seo_description : "",
          ...optionCells,
          variant.title,
          variant.sku,
          paisaToRupees(variant.price),
          paisaToRupees(variant.compare_at_price),
          paisaToRupees(variant.cost),
          variant.weight_g,
          variant.stock,
          variant.track_inventory,
          variant.allow_backorder,
        ];
      });
  });

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(toCsv([[...PRODUCT_CSV_COLUMNS], ...rows]), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="naturenesto-products-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
