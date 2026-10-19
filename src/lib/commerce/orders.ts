import "server-only";
import { z } from "zod";
import { storedImageUrl } from "@/lib/media";
import type { Enums, Json } from "@/lib/supabase/database.types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface OrderView {
  number: number;
  status: Enums<"order_status">;
  paymentStatus: Enums<"payment_status">;
  paymentMethod: string;
  placedAt: string;
  fullName: string;
  email: string;
  phone: string;
  address: Record<string, string>;
  notes: string | null;
  subtotal: number;
  discountTotal: number;
  discountCode: string | null;
  shippingTotal: number;
  taxTotal: number;
  total: number;
  items: {
    title: string;
    variantTitle: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    image: string | null;
  }[];
  history: { status: string; note: string | null; at: string }[];
  fulfillments: {
    carrier: string | null;
    trackingNumber: string | null;
    trackingUrl: string | null;
    shippedAt: string | null;
  }[];
}

const ORDER_SELECT = `number, status, payment_status, payment_method, placed_at, full_name, email, phone,
  shipping_address, notes, subtotal, discount_total, discount_code, shipping_total, tax_total, total,
  order_items (title, variant_title, quantity, unit_price, line_total, image_url, created_at),
  order_status_history (status, note, created_at),
  fulfillments (carrier, tracking_number, tracking_url, shipped_at)`;

type OrderRow = {
  number: number;
  status: Enums<"order_status">;
  payment_status: Enums<"payment_status">;
  payment_method: string;
  placed_at: string;
  full_name: string;
  email: string;
  phone: string;
  shipping_address: Json;
  notes: string | null;
  subtotal: number;
  discount_total: number;
  discount_code: string | null;
  shipping_total: number;
  tax_total: number;
  total: number;
  order_items: {
    title: string;
    variant_title: string | null;
    quantity: number;
    unit_price: number;
    line_total: number;
    image_url: string | null;
    created_at: string;
  }[];
  order_status_history: { status: string; note: string | null; created_at: string }[];
  fulfillments: {
    carrier: string | null;
    tracking_number: string | null;
    tracking_url: string | null;
    shipped_at: string | null;
  }[];
};

function toView(row: OrderRow): OrderView {
  const address =
    row.shipping_address &&
    typeof row.shipping_address === "object" &&
    !Array.isArray(row.shipping_address)
      ? Object.fromEntries(
          Object.entries(row.shipping_address).filter(
            (e): e is [string, string] => typeof e[1] === "string",
          ),
        )
      : {};
  return {
    number: row.number,
    status: row.status,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    placedAt: row.placed_at,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    address,
    notes: row.notes,
    subtotal: row.subtotal,
    discountTotal: row.discount_total,
    discountCode: row.discount_code,
    shippingTotal: row.shipping_total,
    taxTotal: row.tax_total,
    total: row.total,
    items: [...row.order_items]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((item) => ({
        title: item.title,
        variantTitle: item.variant_title,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        lineTotal: item.line_total,
        image: storedImageUrl(item.image_url),
      })),
    history: [...row.order_status_history]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((h) => ({ status: h.status, note: h.note, at: h.created_at })),
    fulfillments: row.fulfillments.map((f) => ({
      carrier: f.carrier,
      trackingNumber: f.tracking_number,
      trackingUrl: f.tracking_url,
      shippedAt: f.shipped_at,
    })),
  };
}

/**
 * An order by number, for its page. A guest needs the secret token from their link;
 * a signed in customer can open their own orders without it (RLS checks ownership).
 */
export async function getOrder(number: number, token: string | null): Promise<OrderView | null> {
  if (token && z.uuid().safeParse(token).success) {
    const { data } = await createSupabaseAdminClient()
      .from("orders")
      .select(ORDER_SELECT)
      .eq("number", number)
      .eq("access_token", token)
      .maybeSingle();
    if (data) return toView(data as OrderRow);
  }
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("number", number)
    .maybeSingle();
  return data ? toView(data as OrderRow) : null;
}
