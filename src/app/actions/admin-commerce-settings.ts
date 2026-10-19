"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ACCESS, staffWithRole } from "@/lib/auth/staff";
import { rupeesToPaisa } from "@/lib/money";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Writes run with the staff session, so RLS limits them to owners and admins as well.

export interface CommerceSettingsState {
  status: "idle" | "saved" | "invalid" | "forbidden" | "failed";
}

const PATH = "/admin/settings/commerce";
// Rupee amounts as typed (commas allowed), stored as paisa.
const paisa = z.string().transform((value, ctx) => {
  const amount = rupeesToPaisa(value);
  if (amount === null) ctx.addIssue({ code: "custom", message: "amount" });
  return amount ?? 0;
});
const optionalPaisa = z.union([z.literal("").transform(() => null), paisa]);
const cities = z
  .string()
  .max(4000)
  .transform((value) => [
    ...new Set(
      value
        .split(",")
        .map((city) => city.trim().toLowerCase())
        .filter(Boolean),
    ),
  ])
  .pipe(z.array(z.string().min(2).max(80)).max(200));

const zoneSchema = z.object({
  name: z.string().trim().min(1).max(80),
  cities,
  price: paisa,
  freeOver: optionalPaisa,
  active: z.boolean(),
});

const readZone = (formData: FormData) =>
  zoneSchema.safeParse({
    name: formData.get("name"),
    cities: String(formData.get("cities") ?? ""),
    price: String(formData.get("price") ?? ""),
    freeOver: String(formData.get("freeOver") ?? "").trim(),
    active: formData.get("active") === "on",
  });

async function manager() {
  return staffWithRole(ACCESS.storeSettings);
}

export async function saveShippingZone(
  _previous: CommerceSettingsState,
  formData: FormData,
): Promise<CommerceSettingsState> {
  if (!(await manager())) return { status: "forbidden" };
  const id = z.uuid().safeParse(formData.get("id"));
  const rateId = z.union([z.literal(""), z.uuid()]).safeParse(String(formData.get("rateId") ?? ""));
  const zone = readZone(formData);
  if (!id.success || !rateId.success || !zone.success) return { status: "invalid" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("shipping_zones")
    .update({ name: zone.data.name, cities: zone.data.cities })
    .eq("id", id.data);
  if (error) return { status: "failed" };

  const rate = { price: zone.data.price, free_over: zone.data.freeOver, active: zone.data.active };
  const { error: rateError } = rateId.data
    ? await supabase.from("shipping_rates").update(rate).eq("id", rateId.data)
    : await supabase
        .from("shipping_rates")
        .insert({ ...rate, zone_id: id.data, name: "Standard delivery" });
  if (rateError) return { status: "failed" };
  revalidatePath(PATH);
  return { status: "saved" };
}

export async function addShippingZone(
  _previous: CommerceSettingsState,
  formData: FormData,
): Promise<CommerceSettingsState> {
  if (!(await manager())) return { status: "forbidden" };
  const zone = readZone(formData);
  if (!zone.success) return { status: "invalid" };
  const supabase = await createSupabaseServerClient();
  const { count } = await supabase
    .from("shipping_zones")
    .select("id", { count: "exact", head: true });
  const { data, error } = await supabase
    .from("shipping_zones")
    .insert({ name: zone.data.name, cities: zone.data.cities, position: count ?? 0 })
    .select("id")
    .single();
  if (error || !data) return { status: "failed" };
  const { error: rateError } = await supabase.from("shipping_rates").insert({
    zone_id: data.id,
    name: "Standard delivery",
    price: zone.data.price,
    free_over: zone.data.freeOver,
    active: zone.data.active,
  });
  if (rateError) return { status: "failed" };
  revalidatePath(PATH);
  return { status: "saved" };
}

export async function removeShippingZone(id: string): Promise<void> {
  if (!(await manager()) || !z.uuid().safeParse(id).success) return;
  const supabase = await createSupabaseServerClient();
  // The default zone catches every unlisted city, so it is never removed.
  await supabase.from("shipping_zones").delete().eq("id", id).eq("is_default", false);
  revalidatePath(PATH);
}

const taxSchema = z.object({
  label: z.string().trim().min(1).max(40),
  rate: z.coerce.number().min(0).max(100),
  included: z.boolean(),
});

export async function saveTaxSettings(
  _previous: CommerceSettingsState,
  formData: FormData,
): Promise<CommerceSettingsState> {
  if (!(await manager())) return { status: "forbidden" };
  const parsed = taxSchema.safeParse({
    label: formData.get("label"),
    rate: formData.get("rate"),
    included: formData.get("included") === "on",
  });
  if (!parsed.success) return { status: "invalid" };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("tax_settings")
    .update({
      label: parsed.data.label,
      // Basis points keep the rate an integer: 17.5 percent is 1750.
      rate_bps: Math.round(parsed.data.rate * 100),
      prices_include_tax: parsed.data.included,
    })
    .eq("singleton", true);
  if (error) return { status: "failed" };
  revalidatePath(PATH);
  return { status: "saved" };
}

const methodSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1).max(80),
  instructions: z.string().trim().max(1000),
  enabled: z.boolean(),
});

export async function savePaymentMethod(
  _previous: CommerceSettingsState,
  formData: FormData,
): Promise<CommerceSettingsState> {
  if (!(await manager())) return { status: "forbidden" };
  const parsed = methodSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    instructions: String(formData.get("instructions") ?? ""),
    enabled: formData.get("enabled") === "on",
  });
  if (!parsed.success) return { status: "invalid" };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("payment_methods")
    .update({
      name: parsed.data.name,
      instructions: parsed.data.instructions || null,
      enabled: parsed.data.enabled,
    })
    .eq("id", parsed.data.id);
  if (error) return { status: "failed" };
  revalidatePath(PATH);
  return { status: "saved" };
}
