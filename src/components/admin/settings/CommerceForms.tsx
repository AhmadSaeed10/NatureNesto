"use client";

import { useActionState, useId } from "react";
import {
  type CommerceSettingsState,
  addShippingZone,
  removeShippingZone,
  savePaymentMethod,
  saveShippingZone,
  saveTaxSettings,
} from "@/app/actions/admin-commerce-settings";
import { Checkbox, TEXT_BUTTON, TextArea, TextInput } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { admin } from "@/content/admin";
import { paisaToRupees } from "@/lib/money";

const copy = admin.settings.commerce;
const INITIAL: CommerceSettingsState = { status: "idle" };

const message = (state: CommerceSettingsState): string =>
  ({
    idle: "",
    saved: admin.form.saved,
    invalid: admin.form.invalid,
    forbidden: admin.form.forbidden,
    failed: admin.form.failed,
  })[state.status];

function Footer({
  state,
  pending,
  label = admin.form.save,
}: {
  state: CommerceSettingsState;
  pending: boolean;
  label?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button type="submit" disabled={pending}>
        {pending ? admin.form.saving : label}
      </Button>
      <p role="status" aria-live="polite" className="text-sm">
        {message(state)}
      </p>
    </div>
  );
}

export interface ZoneValue {
  id: string;
  name: string;
  cities: string[];
  isDefault: boolean;
  rate: { id: string; price: number; freeOver: number | null; active: boolean } | null;
}

function ZoneFields({ zone }: { zone?: ZoneValue }) {
  const uid = useId();
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <TextInput
          id={`${uid}-name`}
          name="name"
          label={copy.zones.name}
          required
          maxLength={80}
          defaultValue={zone?.name}
        />
        <TextInput
          id={`${uid}-price`}
          name="price"
          label={copy.zones.price}
          inputMode="decimal"
          required
          defaultValue={zone?.rate ? paisaToRupees(zone.rate.price) : ""}
        />
        <TextInput
          id={`${uid}-free`}
          name="freeOver"
          label={copy.zones.freeOver}
          hint={copy.zones.freeOverHint}
          inputMode="decimal"
          defaultValue={paisaToRupees(zone?.rate?.freeOver)}
        />
      </div>
      {zone?.isDefault ? (
        <p className="text-sm text-ink-muted">{copy.zones.defaultZone}</p>
      ) : (
        <TextArea
          id={`${uid}-cities`}
          name="cities"
          label={copy.zones.cities}
          hint={copy.zones.citiesHint}
          rows={2}
          defaultValue={zone?.cities
            .map((city) => city.replace(/\b\w/g, (c) => c.toUpperCase()))
            .join(", ")}
        />
      )}
      <Checkbox
        id={`${uid}-active`}
        name="active"
        label={copy.zones.active}
        defaultChecked={zone?.rate?.active ?? true}
      />
    </>
  );
}

export function ZoneForm({ zone }: { zone: ZoneValue }) {
  const [state, action, pending] = useActionState(saveShippingZone, INITIAL);
  return (
    <div className="flex flex-col gap-4 border-b border-line py-6 first:pt-0 last:border-b-0 last:pb-0">
      <form action={action} noValidate className="flex flex-col gap-4">
        <input type="hidden" name="id" value={zone.id} />
        <input type="hidden" name="rateId" value={zone.rate?.id ?? ""} />
        <ZoneFields zone={zone} />
        <Footer state={state} pending={pending} />
      </form>
      {zone.isDefault ? null : (
        <form
          action={removeShippingZone.bind(null, zone.id)}
          onSubmit={(event) => {
            if (!window.confirm(copy.zones.removeConfirm)) event.preventDefault();
          }}
        >
          <button type="submit" className={TEXT_BUTTON}>
            {copy.zones.remove}
          </button>
        </form>
      )}
    </div>
  );
}

export function AddZoneForm() {
  const [state, action, pending] = useActionState(addShippingZone, INITIAL);
  return (
    // Remounts after a save so the next zone starts empty.
    <form
      key={state.status === "saved" ? "saved" : "editing"}
      action={action}
      noValidate
      className="flex flex-col gap-4"
    >
      <ZoneFields />
      <Footer state={state} pending={pending} label={copy.zones.addSubmit} />
    </form>
  );
}

export function TaxForm({ tax }: { tax: { label: string; rateBps: number; included: boolean } }) {
  const [state, action, pending] = useActionState(saveTaxSettings, INITIAL);
  const uid = useId();
  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextInput
          id={`${uid}-label`}
          name="label"
          label={copy.tax.label}
          required
          maxLength={40}
          defaultValue={tax.label}
        />
        <TextInput
          id={`${uid}-rate`}
          name="rate"
          label={copy.tax.rate}
          inputMode="decimal"
          required
          defaultValue={String(tax.rateBps / 100)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Checkbox
          id={`${uid}-included`}
          name="included"
          label={copy.tax.included}
          defaultChecked={tax.included}
        />
        <p className="text-xs text-ink-muted">{copy.tax.includedHint}</p>
      </div>
      <Footer state={state} pending={pending} />
    </form>
  );
}

export interface MethodValue {
  id: string;
  code: string;
  name: string;
  instructions: string | null;
  enabled: boolean;
}

export function PaymentMethodForm({ method }: { method: MethodValue }) {
  const [state, action, pending] = useActionState(savePaymentMethod, INITIAL);
  const uid = useId();
  return (
    <form
      action={action}
      noValidate
      className="flex flex-col gap-4 border-b border-line py-6 first:pt-0 last:border-b-0 last:pb-0"
    >
      <input type="hidden" name="id" value={method.id} />
      <Checkbox
        id={`${uid}-enabled`}
        name="enabled"
        label={copy.payments.enabled}
        defaultChecked={method.enabled}
      />
      <TextInput
        id={`${uid}-name`}
        name="name"
        label={copy.payments.name}
        required
        maxLength={80}
        defaultValue={method.name}
      />
      <TextArea
        id={`${uid}-instructions`}
        name="instructions"
        label={copy.payments.instructions}
        rows={2}
        maxLength={1000}
        defaultValue={method.instructions ?? ""}
      />
      <Footer state={state} pending={pending} />
    </form>
  );
}
