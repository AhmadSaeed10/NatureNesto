import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabasePublicEnv } from "@/lib/supabase/env";

// The cart lives in the database; the browser only holds an opaque token in an httpOnly
// cookie. All reads and writes go through the service role on the server.

export const CART_COOKIE = "nn_cart";
const CART_MAX_AGE = 60 * 60 * 24 * 60;
const token = z.uuid();

export const commerceEnabled = (): boolean =>
  Boolean(supabasePublicEnv() && process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function readCartToken(): Promise<string | null> {
  const value = (await cookies()).get(CART_COOKIE)?.value;
  return token.safeParse(value).success ? (value ?? null) : null;
}

/** The open cart for this browser, created on first use. Returns its id. */
export async function ensureCart(): Promise<string> {
  const supabase = createSupabaseAdminClient();
  const existing = await readCartToken();
  if (existing) {
    const { data } = await supabase
      .from("carts")
      .select("id")
      .eq("token", existing)
      .eq("status", "open")
      .maybeSingle();
    if (data) return data.id;
  }
  const { data, error } = await supabase.from("carts").insert({}).select("id, token").single();
  if (error) throw new Error(`Could not create a cart: ${error.message}`);
  (await cookies()).set(CART_COOKIE, data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CART_MAX_AGE,
  });
  return data.id;
}

export async function clearCartCookie(): Promise<void> {
  (await cookies()).delete(CART_COOKIE);
}

export async function cartCount(): Promise<number> {
  const current = await readCartToken();
  if (!current || !commerceEnabled()) return 0;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("carts")
    .select("cart_items (quantity)")
    .eq("token", current)
    .eq("status", "open")
    .maybeSingle();
  return (data?.cart_items ?? []).reduce((sum, item) => sum + item.quantity, 0);
}

export interface QuoteLine {
  variantId: string;
  productId: string;
  handle: string;
  title: string;
  variantTitle: string;
  sku: string | null;
  unitPrice: number;
  compareAtPrice: number | null;
  quantity: number;
  lineTotal: number;
  stock: number;
  trackInventory: boolean;
  allowBackorder: boolean;
  available: boolean;
  image: string | null;
}

export interface Quote {
  lines: QuoteLine[];
  unavailable: string[];
  subtotal: number;
  discount: {
    code: string | null;
    kind: string | null;
    amount: number;
    freeShipping: boolean;
    error: string | null;
  };
  shipping: number | null;
  shippingZone: string | null;
  tax: number;
  taxIncluded: boolean;
  total: number;
}

const lineSchema = z.object({
  variant_id: z.string(),
  product_id: z.string(),
  handle: z.string(),
  title: z.string(),
  variant_title: z.string(),
  sku: z.string().nullable(),
  unit_price: z.number(),
  compare_at_price: z.number().nullable(),
  quantity: z.number(),
  line_total: z.number(),
  stock: z.number(),
  track_inventory: z.boolean(),
  allow_backorder: z.boolean(),
  available: z.boolean(),
  image: z.string().nullable(),
});
const quoteSchema = z.object({
  lines: z.array(lineSchema),
  unavailable: z.array(z.string()),
  subtotal: z.number(),
  discount: z.object({
    code: z.string().nullable(),
    kind: z.string().nullable(),
    amount: z.number(),
    free_shipping: z.boolean(),
    error: z.string().nullable(),
  }),
  shipping: z.number().nullable(),
  shipping_zone: z.string().nullable(),
  tax: z.number(),
  tax_included: z.boolean(),
  total: z.number(),
});

/** Prices the current cart in the database (the same function place_order uses). */
export async function quoteCart(
  input: { discountCode?: string; city?: string; email?: string } = {},
): Promise<Quote | null> {
  const current = await readCartToken();
  if (!current || !commerceEnabled()) return null;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("quote_cart", {
    p: {
      cart_token: current,
      discount_code: input.discountCode ?? "",
      city: input.city ?? "",
      email: input.email ?? "",
    },
  });
  if (error || data === null) return null;
  const parsed = quoteSchema.safeParse(data);
  if (!parsed.success) {
    console.error("[cart] unexpected quote shape", parsed.error.message);
    return null;
  }
  const q = parsed.data;
  return {
    lines: q.lines.map((l) => ({
      variantId: l.variant_id,
      productId: l.product_id,
      handle: l.handle,
      title: l.title,
      variantTitle: l.variant_title,
      sku: l.sku,
      unitPrice: l.unit_price,
      compareAtPrice: l.compare_at_price,
      quantity: l.quantity,
      lineTotal: l.line_total,
      stock: l.stock,
      trackInventory: l.track_inventory,
      allowBackorder: l.allow_backorder,
      available: l.available,
      image: l.image,
    })),
    unavailable: q.unavailable,
    subtotal: q.subtotal,
    discount: { ...q.discount, freeShipping: q.discount.free_shipping },
    shipping: q.shipping,
    shippingZone: q.shipping_zone,
    tax: q.tax,
    taxIncluded: q.tax_included,
    total: q.total,
  };
}
