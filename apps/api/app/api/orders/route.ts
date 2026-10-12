import { NextRequest, NextResponse } from "next/server";
import { supabaseForUser, supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser } from "@/lib/auth";
import { z } from "zod";

// GET /api/orders — the caller's own order history (RLS also allows a vendor
// to see orders placed against their store).
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = supabaseForUser(user.accessToken);
  const { data, error } = await db
    .from("orders")
    .select("id, status, payment_status, subtotal, delivery_fee, total, created_at, store_id, order_items(name, unit_price, qty), stores(name, category)")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data });
}

const DELIVERY_FEE = 25; // flat fee for the groceries vertical; make dynamic later

const checkoutSchema = z.object({
  storeId: z.string().uuid(),
  addressId: z.string().uuid(),
});

// POST /api/orders — checkout: turns the caller's cart for `storeId` into an
// order, snapshotting product prices/names, then empties the cart.
// Uses the admin client for the multi-table transaction-like sequence so a
// half-finished checkout can't be blocked by a stale RLS edge case; every
// row touched still belongs to `user.id`, which we check explicitly below.
export async function POST(req: NextRequest) {
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = checkoutSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { storeId, addressId } = parsed.data;

  const admin = supabaseAdmin();

  const { data: cart, error: cartErr } = await admin
    .from("carts")
    .select("id, cart_items(qty, product_id, products(name, price, stock_qty))")
    .eq("store_id", storeId)
    .eq("user_id", user.id)
    .single();
  if (cartErr || !cart) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

  const items = (cart.cart_items as unknown as Array<{
    qty: number; product_id: string; products: { name: string; price: number; stock_qty: number };
  }>) ?? [];
  if (items.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

  for (const item of items) {
    if (item.qty > item.products.stock_qty) {
      return NextResponse.json(
        { error: `${item.products.name} only has ${item.products.stock_qty} left in stock` },
        { status: 409 }
      );
    }
  }

  const subtotal = items.reduce((sum, i) => sum + i.products.price * i.qty, 0);
  const total = subtotal + DELIVERY_FEE;

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      user_id: user.id,
      store_id: storeId,
      address_id: addressId,
      subtotal,
      delivery_fee: DELIVERY_FEE,
      total,
    })
    .select()
    .single();
  if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 });

  const orderItems = items.map((i) => ({
    order_id: order.id,
    product_id: i.product_id,
    name: i.products.name,
    unit_price: i.products.price,
    qty: i.qty,
  }));
  const { error: itemsErr } = await admin.from("order_items").insert(orderItems);
  if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 });

  for (const item of items) {
    await admin.rpc("decrement_stock", { p_product_id: item.product_id, p_qty: item.qty });
  }

  await admin.from("cart_items").delete().eq("cart_id", cart.id);

  return NextResponse.json({ order, items: orderItems }, { status: 201 });
}
