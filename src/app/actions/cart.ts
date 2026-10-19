"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { RATE_LIMITS, clientIp, withinRateLimit } from "@/lib/rate-limit";
import { commerceEnabled, ensureCart, readCartToken } from "@/lib/commerce/cart";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type CartResult =
  | { ok: true; count: number }
  | { ok: false; error: "invalid" | "unavailable" | "rateLimited" | "failed" };

const MAX_QUANTITY = 99;
const variantSchema = z.uuid();
const quantitySchema = z.number().int().min(0).max(MAX_QUANTITY);

type Admin = ReturnType<typeof createSupabaseAdminClient>;

/** Units the cart may hold for a variant: unlimited (99) unless stock is tracked. */
async function sellable(supabase: Admin, variantId: string): Promise<number | null> {
  const { data } = await supabase
    .from("product_variants")
    .select("stock, track_inventory, allow_backorder, products!inner (status, deleted_at)")
    .eq("id", variantId)
    .maybeSingle();
  if (!data || data.products.status !== "active" || data.products.deleted_at) return null;
  return data.track_inventory && !data.allow_backorder
    ? Math.min(MAX_QUANTITY, data.stock)
    : MAX_QUANTITY;
}

async function count(supabase: Admin, cartId: string): Promise<number> {
  const { data } = await supabase.from("cart_items").select("quantity").eq("cart_id", cartId);
  return (data ?? []).reduce((sum, item) => sum + item.quantity, 0);
}

async function guard(): Promise<CartResult | null> {
  if (!commerceEnabled()) return { ok: false, error: "failed" };
  if (!(await withinRateLimit(RATE_LIMITS.cart, await clientIp())))
    return { ok: false, error: "rateLimited" };
  return null;
}

export async function addToCart(variantId: string, quantity: number): Promise<CartResult> {
  const blocked = await guard();
  if (blocked) return blocked;
  const variant = variantSchema.safeParse(variantId);
  const qty = quantitySchema.safeParse(quantity);
  if (!variant.success || !qty.success || qty.data === 0) return { ok: false, error: "invalid" };

  const supabase = createSupabaseAdminClient();
  const limit = await sellable(supabase, variant.data);
  if (limit === null || limit === 0) return { ok: false, error: "unavailable" };

  const cartId = await ensureCart();
  const { data: existing } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("cart_id", cartId)
    .eq("variant_id", variant.data)
    .maybeSingle();
  const next = Math.min(limit, (existing?.quantity ?? 0) + qty.data);
  const { error } = await supabase
    .from("cart_items")
    .upsert(
      { cart_id: cartId, variant_id: variant.data, quantity: next },
      { onConflict: "cart_id,variant_id" },
    );
  if (error) return { ok: false, error: "failed" };
  revalidatePath("/cart");
  return { ok: true, count: await count(supabase, cartId) };
}

/** Sets a line's quantity; 0 removes it. */
export async function setCartQuantity(variantId: string, quantity: number): Promise<CartResult> {
  const blocked = await guard();
  if (blocked) return blocked;
  const variant = variantSchema.safeParse(variantId);
  const qty = quantitySchema.safeParse(quantity);
  const token = await readCartToken();
  if (!variant.success || !qty.success || !token) return { ok: false, error: "invalid" };

  const supabase = createSupabaseAdminClient();
  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("token", token)
    .eq("status", "open")
    .maybeSingle();
  if (!cart) return { ok: false, error: "invalid" };

  if (qty.data === 0) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cart.id)
      .eq("variant_id", variant.data);
    if (error) return { ok: false, error: "failed" };
  } else {
    const limit = (await sellable(supabase, variant.data)) ?? 0;
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: Math.max(1, Math.min(limit || qty.data, qty.data)) })
      .eq("cart_id", cart.id)
      .eq("variant_id", variant.data);
    if (error) return { ok: false, error: "failed" };
  }
  revalidatePath("/cart");
  revalidatePath("/checkout");
  return { ok: true, count: await count(supabase, cart.id) };
}
