-- =========================================================================
-- Row-Level Security — every table a customer/vendor touches directly.
-- Admin and cross-user operations go through the server-role client
-- (supabaseAdmin() in lib/supabase.ts), which bypasses RLS entirely.
-- =========================================================================

alter table profiles     enable row level security;
alter table stores       enable row level security;
alter table categories   enable row level security;
alter table products     enable row level security;
alter table addresses    enable row level security;
alter table carts        enable row level security;
alter table cart_items   enable row level security;
alter table orders       enable row level security;
alter table order_items  enable row level security;

-- profiles: users read/update only their own row
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- stores: everyone can browse; only the owning vendor can modify
create policy "stores_select_all" on stores for select using (true);
create policy "stores_modify_owner" on stores for all
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- categories: public read-only (admin manages via service role)
create policy "categories_select_all" on categories for select using (true);

-- products: public read of available items; vendor manages their own store's products
create policy "products_select_all" on products for select using (true);
create policy "products_modify_owner" on products for all
  using (exists (select 1 from stores s where s.id = store_id and s.owner_id = auth.uid()))
  with check (exists (select 1 from stores s where s.id = store_id and s.owner_id = auth.uid()));

-- addresses: strictly the owning customer
create policy "addresses_owner_all" on addresses for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- carts / cart_items: strictly the owning customer
create policy "carts_owner_all" on carts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cart_items_owner_all" on cart_items for all
  using (exists (select 1 from carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from carts c where c.id = cart_id and c.user_id = auth.uid()));

-- orders: the customer who placed it, or the vendor who owns the store
create policy "orders_select_customer_or_vendor" on orders for select
  using (
    auth.uid() = user_id
    or exists (select 1 from stores s where s.id = store_id and s.owner_id = auth.uid())
  );
create policy "orders_insert_customer" on orders for insert
  with check (auth.uid() = user_id);
create policy "orders_update_vendor" on orders for update
  using (exists (select 1 from stores s where s.id = store_id and s.owner_id = auth.uid()));

-- order_items follow their parent order's visibility
create policy "order_items_select" on order_items for select
  using (exists (
    select 1 from orders o
    left join stores s on s.id = o.store_id
    where o.id = order_id and (o.user_id = auth.uid() or s.owner_id = auth.uid())
  ));
