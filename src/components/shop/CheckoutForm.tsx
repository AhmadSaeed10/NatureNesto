"use client";

import Image from "next/image";
import { useActionState, useId, useState, useTransition } from "react";
import { type CheckoutState, placeOrder, quoteCheckout } from "@/app/actions/checkout";
import { FloatingField } from "@/components/forms/FloatingField";
import { Button } from "@/components/ui/Button";
import { commerce } from "@/content/commerce";
import type { Quote } from "@/lib/commerce/cart";
import { storedImageUrl } from "@/lib/media";
import { formatPaisa } from "@/lib/money";
import { cn } from "@/lib/utils";

const copy = commerce.checkout;
const INITIAL: CheckoutState = { status: "idle" };

export interface CheckoutDefaults {
  email: string;
  phone: string;
  fullName: string;
  line1: string;
  line2: string;
  area: string;
  city: string;
  province: string;
  postalCode: string;
}

interface CheckoutFormProps {
  initialQuote: Quote;
  methods: { code: string; name: string; instructions: string | null }[];
  defaults: CheckoutDefaults;
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex justify-between gap-4",
        strong && "border-t border-line pt-3 text-lead font-medium",
      )}
    >
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function CheckoutForm({ initialQuote, methods, defaults }: CheckoutFormProps) {
  const uid = useId();
  const [state, action, placing] = useActionState(placeOrder, INITIAL);
  const [quote, setQuote] = useState(initialQuote);
  const [email, setEmail] = useState(defaults.email);
  const [city, setCity] = useState(defaults.city);
  const [codeInput, setCodeInput] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const [pricing, startPricing] = useTransition();

  const values = state.values ?? {};
  const value = (field: keyof CheckoutDefaults) => values[field] ?? defaults[field];
  const fieldError = (field: string, message: string) =>
    state.fields?.includes(field) ? message : undefined;

  function reprice(next: { code?: string; city?: string }) {
    const discountCode = next.code ?? appliedCode;
    const nextCity = next.city ?? city;
    startPricing(async () => {
      const fresh = await quoteCheckout({ discountCode, city: nextCity, email });
      if (fresh) setQuote(fresh);
    });
  }

  const discountError = quote.discount.error
    ? copy.errors[`discount_${quote.discount.error}` as keyof typeof copy.errors]
    : null;
  const message =
    state.status === "invalid"
      ? copy.errors.invalid
      : state.status === "error" && state.error
        ? (copy.errors[state.error as keyof typeof copy.errors] ?? copy.errors.failed)
        : "";

  return (
    <form
      action={action}
      noValidate
      className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
    >
      <div className="flex flex-col gap-10">
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-4 font-serif text-h3">{copy.contact}</legend>
          <FloatingField
            name="email"
            type="email"
            label={copy.email}
            autoComplete="email"
            required
            defaultValue={value("email")}
            onChange={(event) => setEmail(event.target.value)}
            error={fieldError("email", copy.errors.email)}
          />
          <FloatingField
            name="phone"
            type="tel"
            label={copy.phone}
            hint={copy.phoneHint}
            autoComplete="tel"
            required
            defaultValue={value("phone")}
            error={fieldError("phone", copy.errors.phone)}
          />
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-4 font-serif text-h3">{copy.delivery}</legend>
          <FloatingField
            name="fullName"
            label={copy.fullName}
            autoComplete="name"
            required
            defaultValue={value("fullName")}
            error={fieldError("fullName", copy.errors.fullName)}
          />
          <FloatingField
            name="line1"
            label={copy.line1}
            autoComplete="address-line1"
            required
            defaultValue={value("line1")}
            error={fieldError("line1", copy.errors.line1)}
          />
          <FloatingField
            name="line2"
            label={copy.line2}
            autoComplete="address-line2"
            defaultValue={value("line2")}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <FloatingField
              name="area"
              label={copy.area}
              autoComplete="address-level3"
              defaultValue={value("area")}
            />
            <FloatingField
              name="city"
              label={copy.city}
              autoComplete="address-level2"
              required
              defaultValue={value("city")}
              onChange={(event) => setCity(event.target.value)}
              onBlur={(event) => reprice({ city: event.target.value })}
              error={fieldError("city", copy.errors.city)}
            />
            <FloatingField
              name="province"
              label={copy.province}
              autoComplete="address-level1"
              defaultValue={value("province")}
            />
            <FloatingField
              name="postalCode"
              label={copy.postalCode}
              autoComplete="postal-code"
              defaultValue={value("postalCode")}
            />
          </div>
          <FloatingField
            name="notes"
            control="textarea"
            label={copy.notes}
            defaultValue={values.notes ?? ""}
          />
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-4 font-serif text-h3">{copy.payment}</legend>
          {methods.map((method) => (
            <label
              key={method.code}
              htmlFor={`${uid}-${method.code}`}
              className="flex cursor-pointer items-start gap-3 rounded-card border border-line bg-background p-4 has-checked:border-ink"
            >
              <input
                id={`${uid}-${method.code}`}
                type="radio"
                name="paymentMethod"
                value={method.code}
                defaultChecked={(values.paymentMethod ?? methods[0]?.code) === method.code}
                className="mt-1 size-5 accent-primary-dark"
              />
              <span className="flex flex-col">
                <span className="font-medium">{method.name}</span>
                {method.instructions ? (
                  <span className="text-small text-ink-muted">{method.instructions}</span>
                ) : null}
              </span>
            </label>
          ))}
        </fieldset>
      </div>

      <aside className="flex h-fit flex-col gap-6 rounded-card border border-line bg-background p-6 lg:sticky lg:top-28">
        <h2 className="font-serif text-h3">{copy.summary}</h2>
        <ul className="flex flex-col gap-4">
          {quote.lines.map((line) => {
            const image = storedImageUrl(line.image);
            return (
              <li
                key={line.variantId}
                className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 text-small"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-surface">
                  {image ? (
                    <Image src={image} alt="" fill sizes="56px" className="object-cover" />
                  ) : null}
                </div>
                <span>
                  {line.title}
                  {line.variantTitle !== "Default" ? ` · ${line.variantTitle}` : ""} ×{" "}
                  {line.quantity}
                </span>
                <span>{formatPaisa(line.lineTotal)}</span>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col gap-2">
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <FloatingField
                name="discountInput"
                label={copy.discount}
                onChange={(event) => setCodeInput(event.target.value)}
              />
            </div>
            <button
              type="button"
              disabled={pricing || !codeInput.trim()}
              onClick={() => {
                setAppliedCode(codeInput.trim());
                reprice({ code: codeInput.trim() });
              }}
              className="inline-flex min-h-(--size-tap) items-center rounded-pill border border-ink px-5 text-small disabled:opacity-50"
            >
              {copy.apply}
            </button>
          </div>
          {appliedCode && discountError ? (
            <p role="alert" className="text-small font-medium">
              {discountError}
            </p>
          ) : null}
          <input type="hidden" name="discountCode" value={quote.discount.code ?? ""} />
        </div>

        <dl className="flex flex-col gap-2 text-small" aria-busy={pricing}>
          <SummaryRow label={copy.subtotal} value={formatPaisa(quote.subtotal)} />
          {quote.discount.amount > 0 && quote.discount.code ? (
            <SummaryRow
              label={copy.discountLine(quote.discount.code)}
              value={`- ${formatPaisa(quote.discount.amount)}`}
            />
          ) : null}
          <SummaryRow
            label={quote.shippingZone ? `${copy.shipping} (${quote.shippingZone})` : copy.shipping}
            value={
              quote.shipping === null
                ? copy.shippingPending
                : quote.shipping === 0
                  ? copy.free
                  : formatPaisa(quote.shipping)
            }
          />
          {quote.tax > 0 ? <SummaryRow label={copy.tax} value={formatPaisa(quote.tax)} /> : null}
          <SummaryRow label={copy.total} value={formatPaisa(quote.total)} strong />
          {quote.taxIncluded ? <p className="text-ink-muted">{copy.taxIncluded}</p> : null}
        </dl>

        <p role="status" aria-live="polite" className="min-h-6 text-small font-medium">
          {message}
        </p>
        <Button
          type="submit"
          disabled={placing || quote.lines.length === 0}
          withArrow
          className="w-full"
        >
          {placing ? copy.placing : copy.place}
        </Button>
      </aside>
    </form>
  );
}
