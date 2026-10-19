import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OrderSummary } from "@/components/shop/OrderSummary";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { commerce } from "@/content/commerce";
import { getOrder } from "@/lib/commerce/orders";
import { commerceEnabled } from "@/lib/commerce/cart";

export const metadata: Metadata = {
  title: commerce.order.thanks,
  robots: { index: false, follow: false },
};

// Orders are private and never prerendered; the placeholder satisfies the build check.
export function generateStaticParams() {
  return [{ number: "0" }];
}

async function Order({ params, searchParams }: PageProps<"/orders/[number]">) {
  const { number } = await params;
  const { t } = await searchParams;
  const parsed = Number(number);
  if (!commerceEnabled() || !Number.isInteger(parsed) || parsed < 1) notFound();
  const order = await getOrder(parsed, typeof t === "string" ? t : null);
  if (!order) notFound();
  return (
    <>
      <div className="flex flex-col gap-4">
        <Eyebrow>{commerce.order.number(order.number)}</Eyebrow>
        <h1 className="text-h1">{commerce.order.thanks}</h1>
        <p className="max-w-2xl text-lead text-ink-muted">{commerce.order.placed}</p>
        <p className="max-w-2xl text-small text-ink-muted">{commerce.order.keepLink}</p>
      </div>
      <OrderSummary order={order} />
    </>
  );
}

export default function OrderPage(props: PageProps<"/orders/[number]">) {
  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-16 md:px-8 md:py-24">
      <Suspense>
        <Order {...props} />
      </Suspense>
    </section>
  );
}
