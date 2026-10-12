-- Orders now have a third interested party (the delivery driver), so the
-- select/update policies from 0002 need to widen to include them.

drop policy if exists "orders_select_customer_or_vendor" on orders;
create policy "orders_select_party" on orders for select
  using (
    auth.uid() = user_id
    or auth.uid() = driver_id
    or exists (select 1 from stores s where s.id = store_id and s.owner_id = auth.uid())
  );

drop policy if exists "orders_update_vendor" on orders;
create policy "orders_update_party" on orders for update
  using (
    auth.uid() = driver_id
    or exists (select 1 from stores s where s.id = store_id and s.owner_id = auth.uid())
  );
