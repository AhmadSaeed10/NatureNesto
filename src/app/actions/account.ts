"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ACCOUNT_HOME, AUTH_CALLBACK } from "@/lib/auth/paths";
import { RATE_LIMITS, clientIp, withinRateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface LinkState {
  status: "idle" | "sent" | "email" | "rateLimited" | "notConfigured";
}

async function origin(): Promise<string> {
  const list = await headers();
  const host = list.get("x-forwarded-host") ?? list.get("host");
  const proto = list.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL ?? "");
}

/**
 * Emails a customer sign in link. Accounts are created here with the service role, so
 * public sign ups can stay disabled in Supabase Auth. Same answer whether or not the
 * email already has an account.
 */
export async function requestAccountLink(
  _previous: LinkState,
  formData: FormData,
): Promise<LinkState> {
  if (!supabasePublicEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    return { status: "notConfigured" };
  const email = z
    .email()
    .max(320)
    .transform((v) => v.trim().toLowerCase())
    .safeParse(formData.get("email"));
  if (!email.success) return { status: "email" };

  const [ipOk, emailOk] = await Promise.all([
    withinRateLimit(RATE_LIMITS.account, await clientIp()),
    withinRateLimit(RATE_LIMITS.account, email.data),
  ]);
  if (!ipOk || !emailOk) return { status: "rateLimited" };

  const admin = createSupabaseAdminClient();
  const { error: createError } = await admin.auth.admin.createUser({
    email: email.data,
    email_confirm: true,
  });
  if (createError && !/already/i.test(createError.message)) {
    console.error("[account] could not create user", createError.message);
    return { status: "sent" };
  }

  const callback = new URL(AUTH_CALLBACK, await origin());
  callback.searchParams.set("next", ACCOUNT_HOME);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: { shouldCreateUser: false, emailRedirectTo: callback.toString() },
  });
  if (error) console.error("[account] link failed", error.message);
  return { status: "sent" };
}

export async function signOutCustomer(): Promise<void> {
  if (supabasePublicEnv()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}

// Addresses: written with the customer's own session, so RLS limits them to their rows.

export interface AddressState {
  status: "idle" | "saved" | "invalid" | "failed";
  fields?: string[];
}

const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(200),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{7,20}$/),
  line1: z.string().trim().min(3).max(300),
  line2: z.string().trim().max(300),
  area: z.string().trim().max(200),
  city: z.string().trim().min(2).max(120),
  province: z.string().trim().max(120),
  postalCode: z.string().trim().max(20),
});

async function myCustomerId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims.sub) return null;
  const { data } = await supabase
    .from("customers")
    .select("id")
    .eq("user_id", claims.claims.sub)
    .maybeSingle();
  return data?.id ?? null;
}

export async function saveAddress(
  _previous: AddressState,
  formData: FormData,
): Promise<AddressState> {
  const parsed = addressSchema.safeParse(
    Object.fromEntries(
      Object.keys(addressSchema.shape).map((k) => [k, String(formData.get(k) ?? "")]),
    ),
  );
  if (!parsed.success)
    return {
      status: "invalid",
      fields: [...new Set(parsed.error.issues.map((i) => String(i.path[0])))],
    };
  const customerId = await myCustomerId();
  if (!customerId) return { status: "failed" };
  const v = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { count } = await supabase
    .from("addresses")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", customerId);
  const { error } = await supabase.from("addresses").insert({
    customer_id: customerId,
    full_name: v.fullName,
    phone: v.phone,
    line1: v.line1,
    line2: v.line2 || null,
    area: v.area || null,
    city: v.city,
    province: v.province || null,
    postal_code: v.postalCode || null,
    // The first address becomes the default.
    is_default: (count ?? 0) === 0,
  });
  if (error) return { status: "failed" };
  revalidatePath(ACCOUNT_HOME);
  return { status: "saved" };
}

export async function removeAddress(id: string): Promise<void> {
  if (!z.uuid().safeParse(id).success) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("addresses").delete().eq("id", id);
  revalidatePath(ACCOUNT_HOME);
}

export async function makeDefaultAddress(id: string): Promise<void> {
  if (!z.uuid().safeParse(id).success) return;
  const customerId = await myCustomerId();
  if (!customerId) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("addresses").update({ is_default: false }).eq("customer_id", customerId);
  await supabase.from("addresses").update({ is_default: true }).eq("id", id);
  revalidatePath(ACCOUNT_HOME);
}
