import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser, requireRole } from "@/lib/auth";

// GET /api/vendor/orders — the caller's own store's orders, WITH customer
// contact + delivery address joined in. This deliberately uses the
// service-role client: RLS on `profiles`/`addresses` only lets a user read
// their OWN row, so the generic RLS-scoped /api/orders can't join a
// customer's name/phone/address into a vendor's view even though the
// vendor legitimately needs it to fulfil the order. Scope is enforced here
// in application code instead — hard-filtered to `store.owner_id = caller`.
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "vendor");
  if (denied) return denied;

  const admin = supabaseAdmin();
  const { data: store } = await admin.from("stores").select("id").eq("owner_id", user!.id).maybeSingle();
  if (!store) return NextResponse.json({ orders: [] });

  const { data, error } = await admin
    .from("orders")
    .select(
      "*, order_items(name, unit_price, qty), profiles!orders_user_id_fkey(full_name, phone), addresses(line1, line2, city, pincode)"
    )
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data });
}
