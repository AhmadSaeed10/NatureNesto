import { AdminCard } from "@/components/admin/AdminPage";
import {
  AddZoneForm,
  PaymentMethodForm,
  TaxForm,
  ZoneForm,
} from "@/components/admin/settings/CommerceForms";
import { admin } from "@/content/admin";
import { ACCESS, requireStaff } from "@/lib/auth/staff";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const copy = admin.settings.commerce;

export default async function CommerceSettingsPage() {
  await requireStaff(ACCESS.storeSettings);
  const supabase = await createSupabaseServerClient();
  const [{ data: zones }, { data: tax }, { data: methods }] = await Promise.all([
    supabase
      .from("shipping_zones")
      .select(
        "id, name, cities, is_default, position, shipping_rates (id, price, free_over, active, created_at)",
      )
      .order("position"),
    supabase.from("tax_settings").select("label, rate_bps, prices_include_tax").maybeSingle(),
    supabase
      .from("payment_methods")
      .select("id, code, name, instructions, enabled")
      .order("position"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-ink-muted">{copy.intro}</p>
      <AdminCard title={copy.zones.title} description={copy.zones.intro}>
        {(zones ?? []).map((zone) => {
          // The admin edits one rate per zone; extra rates only come from direct imports.
          const rate = [...zone.shipping_rates].sort((a, b) =>
            a.created_at.localeCompare(b.created_at),
          )[0];
          return (
            <ZoneForm
              key={`${zone.id}-${rate?.id ?? "none"}`}
              zone={{
                id: zone.id,
                name: zone.name,
                cities: zone.cities,
                isDefault: zone.is_default,
                rate: rate
                  ? {
                      id: rate.id,
                      price: rate.price,
                      freeOver: rate.free_over,
                      active: rate.active,
                    }
                  : null,
              }}
            />
          );
        })}
      </AdminCard>
      <AdminCard title={copy.zones.add}>
        <AddZoneForm />
      </AdminCard>
      {tax ? (
        <AdminCard title={copy.tax.title}>
          <TaxForm
            tax={{ label: tax.label, rateBps: tax.rate_bps, included: tax.prices_include_tax }}
          />
        </AdminCard>
      ) : null}
      <AdminCard title={copy.payments.title} description={copy.payments.intro}>
        {(methods ?? []).map((method) => (
          <PaymentMethodForm key={method.id} method={method} />
        ))}
      </AdminCard>
    </div>
  );
}
