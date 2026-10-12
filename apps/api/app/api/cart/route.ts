import { NextRequest, NextResponse } from "next/server";
import { supabaseForUser, supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser } from "@/lib/auth";
import { z } from "zod";

// GET /api/cart?storeId=... — the caller's cart for that store, with line items.
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = req.nextUrl.searchParams.get("storeId");
  if (!storeId) return NextResponse.json({ error: "storeId is required" }, { status: 400 });

  const db = supabaseForUser(user.accessToken);
  const { data: cart, error } = await db
    .from("carts")
    .select("id, cart_items(id, qty, product_id, products(name, price, unit, image_url))")
    .eq("store_id", storeId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ cart: cart ?? null });
}

const addItemSchema = z.object({
  storeId: z.string().uuid(),
  productId: z.string().uuid(),
  qty: z.number().int().positive(),
});

// POST /api/cart — add/update a line item (upsert qty).
export async function POST(req: NextRequest) {
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = addItemSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { storeId, productId, qty } = parsed.data;

  // Enforce "one open cart per store" — admin client used only to find-or-create
  // the cart row itself; RLS still governs the user's own cart_items below.
  const admin = supabaseAdmin();
  const { data: cart, error: cartErr } = await admin
    .from("carts")
    .upsert({ user_id: user.id, store_id: storeId }, { onConflict: "user_id,store_id" })
    .select("id")
    .single();
  if (cartErr) return NextResponse.json({ error: cartErr.message }, { status: 500 });

  const db = supabaseForUser(user.accessToken);
  const { data: item, error: itemErr } = await db
    .from("cart_items")
    .upsert({ cart_id: cart.id, product_id: productId, qty }, { onConflict: "cart_id,product_id" })
    .select()
    .single();
  if (itemErr) return NextResponse.json({ error: itemErr.message }, { status: 500 });

  return NextResponse.json({ item }, { status: 201 });
}
