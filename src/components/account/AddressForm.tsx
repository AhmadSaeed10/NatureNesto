"use client";

import { useActionState } from "react";
import { type AddressState, saveAddress } from "@/app/actions/account";
import { FloatingField } from "@/components/forms/FloatingField";
import { Button } from "@/components/ui/Button";
import { commerce } from "@/content/commerce";

const copy = commerce.account;
const fields = commerce.checkout;
const INITIAL: AddressState = { status: "idle" };

export function AddressForm() {
  const [state, action, pending] = useActionState(saveAddress, INITIAL);
  const error = (field: keyof typeof fields.errors) =>
    state.fields?.includes(field) ? fields.errors[field] : undefined;
  const message =
    state.status === "saved"
      ? copy.saved
      : state.status === "invalid"
        ? copy.errors.invalid
        : state.status === "failed"
          ? copy.errors.failed
          : "";

  return (
    // Remounting on save clears the fields for the next address.
    <form
      key={state.status === "saved" ? "saved" : "editing"}
      action={action}
      noValidate
      className="flex flex-col gap-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FloatingField
          name="fullName"
          label={fields.fullName}
          autoComplete="name"
          required
          error={error("fullName")}
        />
        <FloatingField
          name="phone"
          type="tel"
          label={fields.phone}
          autoComplete="tel"
          required
          error={error("phone")}
        />
      </div>
      <FloatingField
        name="line1"
        label={fields.line1}
        autoComplete="address-line1"
        required
        error={error("line1")}
      />
      <FloatingField name="line2" label={fields.line2} autoComplete="address-line2" />
      <div className="grid gap-4 md:grid-cols-2">
        <FloatingField name="area" label={fields.area} autoComplete="address-level3" />
        <FloatingField
          name="city"
          label={fields.city}
          autoComplete="address-level2"
          required
          error={error("city")}
        />
        <FloatingField name="province" label={fields.province} autoComplete="address-level1" />
        <FloatingField name="postalCode" label={fields.postalCode} autoComplete="postal-code" />
      </div>
      <p role="status" aria-live="polite" className="min-h-6 text-small font-medium">
        {message}
      </p>
      <Button type="submit" variant="secondary" disabled={pending} className="self-start">
        {copy.save}
      </Button>
    </form>
  );
}
