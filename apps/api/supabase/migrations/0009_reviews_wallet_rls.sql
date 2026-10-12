alter table reviews             enable row level security;
alter table wallets             enable row level security;
alter table wallet_transactions enable row level security;

-- reviews: public read (they're the whole point of being shown to
-- customers); a customer may only insert one for an order that's theirs
-- (the app layer also checks it's delivered — RLS can't see order status
-- without a subquery, so that check lives in the review-creation route).
create policy "reviews_select_all" on reviews for select using (true);
create policy "reviews_insert_own_order" on reviews for insert
  with check (
    auth.uid() = user_id
    and exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid())
  );

-- wallets / transactions: strictly the owning user. Crediting happens via
-- the service-role client from within order/ride completion, never through
-- this RLS-scoped path — a user can look but never write their own balance.
create policy "wallets_select_own" on wallets for select using (auth.uid() = user_id);
create policy "wallet_tx_select_own" on wallet_transactions for select using (auth.uid() = user_id);
