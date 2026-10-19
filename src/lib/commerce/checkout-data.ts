import "server-only";
import type { CheckoutDefaults } from "@/components/shop/CheckoutForm";
import { supabasePublicEnv } from "@/lib/supabase/env";
import { createSupabasePublicClient, createSupabaseServerClient } from "@/lib/supabase/server";

export async function enabledPaymentMethods(): Promise<
  { code: string; name: string; instructions: string | null }[]
> {
  const supabase = createSupabasePublicClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("payment_methods")
    .select("code, name, instructions")
    .eq("enabled", true)
    .order("position");
  return data ?? [];
}

const EMPTY: CheckoutDefaults = {
  email: "",
  phone: "",
  fullName: "",
  line1: "",
  line2: "",
  area: "",
  city: "",
  province: "",
  postalCode: "",
};

/** Prefills checkout for a signed in customer from their account and default address. */
export async function checkoutDefaults(): Promise<CheckoutDefaults> {
  if (!supabasePublicEnv()) return EMPTY;
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) return EMPTY;
  const { data: customer } = await supabase
    .from("customers")
    .select(
      "email, full_name, phone, addresses (full_name, phone, line1, line2, area, city, province, postal_code, is_default)",
    )
    .eq("user_id", userId)
    .maybeSingle();
  const email = typeof claims?.claims.email === "string" ? claims.claims.email : "";
  if (!customer) return { ...EMPTY, email };
  const address = customer.addresses.find((a) => a.is_default) ?? customer.addresses[0];
  return {
    email: customer.email || email,
    phone: address?.phone ?? customer.phone ?? "",
    fullName: address?.full_name ?? customer.full_name ?? "",
    line1: address?.line1 ?? "",
    line2: address?.line2 ?? "",
    area: address?.area ?? "",
    city: address?.city ?? "",
    province: address?.province ?? "",
    postalCode: address?.postal_code ?? "",
  };
}
