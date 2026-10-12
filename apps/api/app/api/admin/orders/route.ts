import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser, requireRole } from "@/lib/auth";

// GET /api/admin/orders — every order platform-wide, for the admin orders
// overview (a normal vendor/customer only ever sees their own via /api/orders).
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "admin");
  if (denied) return denied;

  const { data, error } = await supabaseAdmin()
    .from("orders")
    .select("*, stores(name, category), order_items(name, unit_price, qty), profiles!orders_user_id_fkey(full_name, phone)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data });
}
