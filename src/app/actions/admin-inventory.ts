"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { ACCESS, staffWithRole } from "@/lib/auth/staff";
import { Constants } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AdjustState {
  status: "idle" | "done" | "delta" | "forbidden" | "failed";
  stock?: number;
}

const schema = z.object({
  variantId: z.uuid(),
  delta: z.coerce
    .number()
    .int()
    .min(-1_000_000)
    .max(1_000_000)
    .refine((n) => n !== 0),
  // "initial" and "import" are set by the editor and CSV import, not by hand.
  reason: z
    .enum(Constants.public.Enums.stock_reason)
    .refine((r) => r !== "initial" && r !== "import"),
  note: z.string().trim().max(300),
});

export async function adjustStock(
  _previous: AdjustState,
  formData: FormData,
): Promise<AdjustState> {
  if (!(await staffWithRole(ACCESS.catalog))) return { status: "forbidden" };
  const parsed = schema.safeParse({
    variantId: formData.get("variantId"),
    delta: formData.get("delta"),
    reason: formData.get("reason"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return { status: "delta" };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("adjust_stock", {
    p_variant_id: parsed.data.variantId,
    p_delta: parsed.data.delta,
    p_reason: parsed.data.reason,
    p_note: parsed.data.note,
  });
  if (error) {
    console.error("[inventory] adjust failed", error.message);
    return { status: error.code === "42501" ? "forbidden" : "failed" };
  }
  // Stock decides "out of stock" on the storefront.
  revalidateTag("products", "max");
  revalidatePath("/admin/inventory");
  return { status: "done", stock: data };
}
