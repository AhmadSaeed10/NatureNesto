import Image from "next/image";
import { commerce } from "@/content/commerce";
import type { OrderView } from "@/lib/commerce/orders";
import { formatPaisa } from "@/lib/money";

const copy = commerce.order;
const DATE = new Intl.DateTimeFormat("en-PK", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Karachi",
});

export function OrderSummary({ order }: { order: OrderView }) {
  const address = [
    order.address.line1,
    order.address.line2,
    order.address.area,
    order.address.city,
    order.address.province,
    order.address.postal_code,
  ]
    .filter(Boolean)
    .join(", ");
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="flex flex-col gap-8">
        <dl className="grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="eyebrow text-ink-muted">{copy.status}</dt>
            <dd className="mt-2 font-serif text-h4">{copy.statuses[order.status]}</dd>
          </div>
          <div>
            <dt className="eyebrow text-ink-muted">{copy.payment}</dt>
            <dd className="mt-2">{copy.methods[order.paymentMethod] ?? order.paymentMethod}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="eyebrow text-ink-muted">{copy.deliverTo}</dt>
            <dd className="mt-2">
              {order.fullName}, {order.phone}
              <br />
              {address}
            </dd>
          </div>
        </dl>
        {order.fulfillments.some((f) => f.trackingNumber) ? (
          <div>
            <h2 className="eyebrow text-ink-muted">{copy.tracking}</h2>
            <ul className="mt-2 flex flex-col gap-1">
              {order.fulfillments.map((f, i) =>
                f.trackingNumber ? (
                  <li key={i}>
                    {f.carrier ? `${f.carrier}: ` : ""}
                    {f.trackingUrl ? (
                      <a
                        href={f.trackingUrl}
                        rel="noopener noreferrer"
                        className="text-primary-dark underline underline-offset-4"
                      >
                        {f.trackingNumber}
                      </a>
                    ) : (
                      f.trackingNumber
                    )}
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        ) : null}
        <ol className="flex flex-col gap-2 border-l border-line pl-5 text-small">
          {order.history.map((entry, i) => (
            <li key={i}>
              <span className="font-medium">
                {copy.statuses[entry.status as keyof typeof copy.statuses] ?? entry.status}
              </span>
              {" · "}
              <time dateTime={entry.at} className="text-ink-muted">
                {DATE.format(new Date(entry.at))}
              </time>
            </li>
          ))}
        </ol>
      </div>

      <aside className="flex h-fit flex-col gap-4 rounded-card border border-line bg-background p-6">
        <h2 className="font-serif text-h3">{copy.items}</h2>
        <ul className="flex flex-col gap-4">
          {order.items.map((item, i) => (
            <li
              key={i}
              className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 text-small"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-surface">
                {item.image ? (
                  <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
                ) : null}
              </div>
              <span>
                {item.title}
                {item.variantTitle ? ` · ${item.variantTitle}` : ""} × {item.quantity}
              </span>
              <span>{formatPaisa(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="flex flex-col gap-2 border-t border-line pt-4 text-small">
          <div className="flex justify-between">
            <dt>{commerce.checkout.subtotal}</dt>
            <dd>{formatPaisa(order.subtotal)}</dd>
          </div>
          {order.discountTotal > 0 ? (
            <div className="flex justify-between">
              <dt>{commerce.checkout.discountLine(order.discountCode ?? "")}</dt>
              <dd>- {formatPaisa(order.discountTotal)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt>{commerce.checkout.shipping}</dt>
            <dd>
              {order.shippingTotal === 0
                ? commerce.checkout.free
                : formatPaisa(order.shippingTotal)}
            </dd>
          </div>
          {order.taxTotal > 0 ? (
            <div className="flex justify-between">
              <dt>{commerce.checkout.tax}</dt>
              <dd>{formatPaisa(order.taxTotal)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-line pt-3 text-lead font-medium">
            <dt>{commerce.checkout.total}</dt>
            <dd>{formatPaisa(order.total)}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
