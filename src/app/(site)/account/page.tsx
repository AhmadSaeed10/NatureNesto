import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { makeDefaultAddress, removeAddress, signOutCustomer } from "@/app/actions/account";
import { AddressForm } from "@/components/account/AddressForm";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { commerce } from "@/content/commerce";
import { ACCOUNT_LOGIN } from "@/lib/auth/paths";
import { getAccount } from "@/lib/commerce/account";
import { commerceEnabled } from "@/lib/commerce/cart";
import { formatPaisa } from "@/lib/money";

const copy = commerce.account;
const DATE = new Intl.DateTimeFormat("en-PK", { dateStyle: "medium", timeZone: "Asia/Karachi" });
const TEXT_BUTTON =
  "inline-flex min-h-(--size-tap) items-center text-small underline underline-offset-4 hover:text-primary-dark";

export const metadata: Metadata = { title: copy.title, robots: { index: false, follow: false } };

async function Account() {
  // Per visitor: never prerender, even when commerce is off at build time.
  await connection();
  const account = commerceEnabled() ? await getAccount() : null;
  if (!account) redirect(ACCOUNT_LOGIN);

  return (
    <>
      <div className="flex flex-col gap-4">
        <Eyebrow>{copy.signedInAs(account.email)}</Eyebrow>
        <h1 className="text-h1">{copy.title}</h1>
        <form action={signOutCustomer}>
          <button type="submit" className={TEXT_BUTTON}>
            {copy.signOut}
          </button>
        </form>
      </div>

      <section aria-labelledby="account-orders" className="flex flex-col gap-4">
        <h2 id="account-orders" className="font-serif text-h3">
          {copy.orders}
        </h2>
        {account.orders.length === 0 ? (
          <p className="text-ink-muted">{copy.noOrders}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line rounded-card border border-line bg-background">
            {account.orders.map((order) => (
              <li key={order.number}>
                <Link
                  href={`/orders/${order.number}`}
                  aria-label={copy.viewOrder(order.number)}
                  className="grid grid-cols-2 gap-2 p-4 hover:bg-surface md:grid-cols-4 md:items-center"
                >
                  <span className="font-medium">{commerce.order.number(order.number)}</span>
                  <span className="text-small text-ink-muted">
                    {copy.placedOn}{" "}
                    <time dateTime={order.placedAt}>{DATE.format(new Date(order.placedAt))}</time>
                  </span>
                  <span className="text-small">
                    {commerce.order.statuses[
                      order.status as keyof typeof commerce.order.statuses
                    ] ?? order.status}
                  </span>
                  <span className="text-right">{formatPaisa(order.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="account-addresses" className="flex flex-col gap-6">
        <h2 id="account-addresses" className="font-serif text-h3">
          {copy.addresses}
        </h2>
        {account.addresses.length === 0 ? (
          <p className="text-ink-muted">{copy.noAddresses}</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {account.addresses.map((address) => (
              <li
                key={address.id}
                className="flex flex-col gap-3 rounded-card border border-line bg-background p-5"
              >
                <address className="flex flex-col not-italic">
                  <span className="font-medium">
                    {address.fullName}
                    {address.isDefault ? (
                      <span className="ml-2 text-small text-ink-muted">({copy.default})</span>
                    ) : null}
                  </span>
                  <span>{address.line1}</span>
                  {address.line2 ? <span>{address.line2}</span> : null}
                  <span>{[address.area, address.city].filter(Boolean).join(", ")}</span>
                  <span className="text-small text-ink-muted">{address.phone}</span>
                </address>
                <div className="flex flex-wrap gap-4">
                  {address.isDefault ? null : (
                    <form action={makeDefaultAddress.bind(null, address.id)}>
                      <button type="submit" className={TEXT_BUTTON}>
                        {copy.makeDefault}
                      </button>
                    </form>
                  )}
                  <form action={removeAddress.bind(null, address.id)}>
                    <button type="submit" className={TEXT_BUTTON}>
                      {copy.remove}
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 md:p-6">
          <h3 className="font-serif text-h4">{copy.addAddress}</h3>
          <AddressForm />
        </div>
      </section>
    </>
  );
}

export default function AccountPage() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-16 md:px-8 md:py-24">
      <Suspense>
        <Account />
      </Suspense>
    </section>
  );
}
