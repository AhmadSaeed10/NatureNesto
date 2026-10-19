import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AccountView {
  email: string;
  orders: { number: number; total: number; status: string; placedAt: string }[];
  addresses: {
    id: string;
    fullName: string;
    phone: string;
    line1: string;
    line2: string | null;
    area: string | null;
    city: string;
    isDefault: boolean;
  }[];
}

/**
 * The signed in customer's account. On first visit their customer record (from guest
 * checkouts with the same, now verified, email) is linked to the login so past orders show.
 */
export async function getAccount(): Promise<AccountView | null> {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  const email = typeof claims?.claims.email === "string" ? claims.claims.email.toLowerCase() : null;
  if (!userId || !email) return null;

  let { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!customer) {
    const admin = createSupabaseAdminClient();
    const { data: guest } = await admin
      .from("customers")
      .select("id")
      .ilike("email", email.replace(/[\\%_]/g, "\\$&"))
      .is("user_id", null)
      .is("deleted_at", null)
      .maybeSingle();
    const linked = guest
      ? await admin
          .from("customers")
          .update({ user_id: userId })
          .eq("id", guest.id)
          .select("id")
          .single()
      : await admin.from("customers").insert({ user_id: userId, email }).select("id").single();
    customer = linked.data;
  }
  if (!customer) return { email, orders: [], addresses: [] };

  const [orders, addresses] = await Promise.all([
    supabase
      .from("orders")
      .select("number, total, status, placed_at")
      .order("placed_at", { ascending: false })
      .limit(50),
    supabase
      .from("addresses")
      .select("id, full_name, phone, line1, line2, area, city, is_default")
      .order("is_default", { ascending: false })
      .order("created_at"),
  ]);
  return {
    email,
    orders: (orders.data ?? []).map((o) => ({
      number: o.number,
      total: o.total,
      status: o.status,
      placedAt: o.placed_at,
    })),
    addresses: (addresses.data ?? []).map((a) => ({
      id: a.id,
      fullName: a.full_name,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2,
      area: a.area,
      city: a.city,
      isDefault: a.is_default,
    })),
  };
}
