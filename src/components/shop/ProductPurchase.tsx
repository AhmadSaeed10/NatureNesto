"use client";

import Link from "next/link";
import { useId, useMemo, useState, useTransition } from "react";
import { addToCart } from "@/app/actions/cart";
import { Button } from "@/components/ui/Button";
import { commerce } from "@/content/commerce";
import { shop } from "@/content/shop";
import type { StoreProduct } from "@/lib/commerce/products";
import { formatPaisa } from "@/lib/money";
import { cn } from "@/lib/utils";
import { CART_EVENT } from "./CartLink";

const copy = commerce.product;

interface ProductPurchaseProps {
  product: Pick<StoreProduct, "title" | "options" | "variants">;
  whatsappHref: string;
}

export function ProductPurchase({ product, whatsappHref }: ProductPurchaseProps) {
  const uid = useId();
  const first = product.variants.find((v) => v.available) ?? product.variants[0];
  const [selected, setSelected] = useState<Record<string, string>>(first?.optionValues ?? {});
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();

  const variant = useMemo(
    () =>
      product.options.length === 0
        ? product.variants[0]
        : product.variants.find((v) =>
            product.options.every((o) => v.optionValues[o.name] === selected[o.name]),
          ),
    [product, selected],
  );

  function add() {
    if (!variant) return;
    setMessage("");
    setAdded(false);
    startTransition(async () => {
      const result = await addToCart(variant.id, quantity);
      if (result.ok) {
        setAdded(true);
        setMessage(copy.added);
        window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: result.count }));
      } else {
        setMessage(result.error === "unavailable" ? copy.outOfStock : copy.failed);
      }
    });
  }

  const label =
    variant && variant.title !== "Default" ? `${product.title} (${variant.title})` : product.title;
  const enquiry = `${whatsappHref}?text=${encodeURIComponent(
    shop.whatsappMessage(label, variant ? formatPaisa(variant.price) : ""),
  )}`;

  return (
    <div className="flex flex-col gap-6">
      {variant ? (
        <p className="flex items-baseline gap-3 text-h4">
          <span className="font-medium">{formatPaisa(variant.price)}</span>
          {variant.compareAtPrice && variant.compareAtPrice > variant.price ? (
            <s className="text-lead text-ink-muted">{formatPaisa(variant.compareAtPrice)}</s>
          ) : null}
        </p>
      ) : (
        <p className="text-ink">{copy.unavailable}</p>
      )}

      {product.options.map((option) => (
        <fieldset key={option.name} className="flex flex-col gap-2">
          <legend className="mb-2 text-small font-medium">{copy.choose(option.name)}</legend>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const id = `${uid}-${option.name}-${value}`;
              const checked = selected[option.name] === value;
              return (
                <label
                  key={value}
                  htmlFor={id}
                  className={cn(
                    "inline-flex min-h-(--size-tap) cursor-pointer items-center rounded-pill border px-5 text-small transition-colors duration-(--duration-micro) has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-primary-dark",
                    checked
                      ? "border-ink bg-ink text-background"
                      : "border-line text-ink hover:border-ink",
                  )}
                >
                  <input
                    id={id}
                    type="radio"
                    name={`${uid}-${option.name}`}
                    value={value}
                    checked={checked}
                    onChange={() =>
                      setSelected((current) => ({ ...current, [option.name]: value }))
                    }
                    className="sr-only"
                  />
                  {value}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      {variant?.lowStock ? (
        <p className="text-small font-medium text-ink">{copy.lowStock(variant.lowStock)}</p>
      ) : null}

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-2">
          <label htmlFor={`${uid}-qty`} className="text-small font-medium">
            {copy.quantity}
          </label>
          <input
            id={`${uid}-qty`}
            type="number"
            inputMode="numeric"
            min={1}
            max={variant?.lowStock ?? 99}
            value={quantity}
            onChange={(event) =>
              setQuantity(Math.max(1, Math.min(99, Number(event.target.value) || 1)))
            }
            className="min-h-(--size-tap) w-24 rounded-pill border border-ink-muted bg-background px-4 text-center"
          />
        </div>
        {variant && variant.available ? (
          <Button type="button" onClick={add} disabled={pending} withArrow>
            {pending ? copy.adding : copy.addToCart}
          </Button>
        ) : (
          <p className="inline-flex min-h-(--size-tap) items-center font-medium text-ink-muted">
            {copy.outOfStock}
          </p>
        )}
      </div>

      <div
        role="status"
        aria-live="polite"
        className="flex min-h-6 flex-wrap items-center gap-3 text-small"
      >
        {message}
        {added ? (
          <Link href="/cart" className="text-primary-dark underline underline-offset-4">
            {copy.viewCart}
          </Link>
        ) : null}
      </div>

      <div>
        <Button href={enquiry} target="_blank" rel="noopener noreferrer" variant="link">
          {copy.enquire}
        </Button>
      </div>
    </div>
  );
}
