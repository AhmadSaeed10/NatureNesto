-- Carts are read and written only by server actions with the service role. Explicit
-- deny-all policies document that intent (and keep the security advisor quiet).
create policy "carts: no direct access" on public.carts
  for all to anon, authenticated using (false) with check (false);
create policy "cart_items: no direct access" on public.cart_items
  for all to anon, authenticated using (false) with check (false);
