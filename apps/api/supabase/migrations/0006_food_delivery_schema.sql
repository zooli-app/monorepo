-- =========================================================================
-- Zooli — Food-delivery vertical schema (vertical #3 of 3)
--
-- Deliberately reuses most of the groceries vertical rather than
-- introducing parallel tables:
--   - `stores`   with category = 'restaurant'  (already generic)
--   - `products` as menu items                 (already generic)
--   - `categories` as menu sections             (already generic)
--   - `carts` / `cart_items` / `orders` / `order_items`  (already generic)
-- The only real gap for food is that an order needs a delivery driver and
-- a few more lifecycle stages than groceries needed, so this migration
-- extends `orders` rather than creating a second order table.
-- =========================================================================

alter type order_status add value if not exists 'ready_for_pickup' after 'preparing';

alter table orders
  add column driver_id      uuid references drivers(id) on delete set null,
  add column confirmed_at   timestamptz,
  add column preparing_at   timestamptz,
  add column ready_at       timestamptz,
  add column picked_up_at   timestamptz,
  add column delivered_at   timestamptz,
  add column cancelled_at   timestamptz,
  add column cancelled_by   uuid references profiles(id);

create index orders_driver_idx on orders(driver_id);

-- Seed a restaurant category set distinct from grocery categories (both
-- live in the same `categories` table — `parent_id` isn't used to
-- separate them since a store only ever shows its own products anyway).
insert into categories (name, slug, sort_order) values
  ('Starters', 'starters', 10),
  ('Main Course', 'main-course', 20),
  ('Breads & Rice', 'breads-rice', 30),
  ('Desserts', 'desserts', 40),
  ('Beverages', 'beverages', 50)
on conflict (slug) do nothing;
