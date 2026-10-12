import { NextRequest, NextResponse } from "next/server";
import { supabaseForUser } from "@/lib/supabase";
import { getAuthedUser } from "@/lib/auth";

// DELETE /api/cart/item?itemId=... — remove a line item from the caller's cart.
// RLS (cart_items_owner_all) ensures this only ever touches the caller's own rows.
export async function DELETE(req: NextRequest) {
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const itemId = req.nextUrl.searchParams.get("itemId");
  if (!itemId) return NextResponse.json({ error: "itemId is required" }, { status: 400 });

  const db = supabaseForUser(user.accessToken);
  const { error } = await db.from("cart_items").delete().eq("id", itemId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
