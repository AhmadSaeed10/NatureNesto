import { Suspense } from "react";
import { cartCount, commerceEnabled } from "@/lib/commerce/cart";
import { CartLink } from "./CartLink";

async function CartCount() {
  return <CartLink initialCount={await cartCount()} />;
}

/**
 * Header cart link. The count reads the cart cookie, so it streams in after the static
 * header; without a configured store there is no cart and nothing renders.
 */
export function CartIndicator() {
  if (!commerceEnabled()) return null;
  return (
    <Suspense fallback={<CartLink initialCount={0} />}>
      <CartCount />
    </Suspense>
  );
}
