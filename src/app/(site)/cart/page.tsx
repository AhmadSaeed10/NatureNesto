import type { Metadata } from "next";
import { Suspense } from "react";
import { CartLines } from "@/components/shop/CartLines";
import { Button } from "@/components/ui/Button";
import { commerce } from "@/content/commerce";
import { quoteCart } from "@/lib/commerce/cart";
import { storedImageUrl } from "@/lib/media";
import { formatPaisa } from "@/lib/money";

export const metadata: Metadata = { title: commerce.cart.title, robots: { index: false } };

const copy = commerce.cart;

async function Cart() {
  const quote = await quoteCart();
  if (!quote || quote.lines.length === 0) {
    return (
      <div className="flex flex-col items-start gap-6">
        <p className="text-lead text-ink-muted">{copy.empty}</p>
        <Button href="/indoor-plants" withArrow>
          {copy.browse}
        </Button>
      </div>
    );
  }
  const images = Object.fromEntries(
    quote.lines.map((line) => [line.variantId, storedImageUrl(line.image)]),
  );
  const blocked = quote.unavailable.length > 0;
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <CartLines lines={quote.lines} images={images} />
      <aside className="flex h-fit flex-col gap-4 rounded-card border border-line bg-background p-6">
        <p className="flex justify-between text-lead">
          <span>{copy.subtotal}</span>
          <span className="font-medium">{formatPaisa(quote.subtotal)}</span>
        </p>
        <p className="text-small text-ink-muted">{copy.shippingNote}</p>
        {blocked ? (
          <p className="text-small font-medium text-ink">{commerce.checkout.errors.unavailable}</p>
        ) : (
          <Button href="/checkout" withArrow className="w-full">
            {copy.checkout}
          </Button>
        )}
      </aside>
    </div>
  );
}

export default function CartPage() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-16 md:px-8 md:py-24">
      <h1 className="text-h1">{copy.title}</h1>
      <Suspense>
        <Cart />
      </Suspense>
    </section>
  );
}
