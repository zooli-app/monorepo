-- Atomic stock decrement so concurrent checkouts can't oversell.
create or replace function decrement_stock(p_product_id uuid, p_qty int)
returns void
language sql
security definer
as $$
  update products
  set stock_qty = stock_qty - p_qty
  where id = p_product_id;
$$;
