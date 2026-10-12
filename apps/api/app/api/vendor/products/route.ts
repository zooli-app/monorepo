import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser, requireRole } from "@/lib/auth";

// GET /api/vendor/products — ALL of the caller's own products, including
// out-of-stock/unavailable ones (unlike the public products endpoint, which
// only shows what's currently purchasable) — this is what the vendor's
// menu/inventory management screen needs.
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "vendor");
  if (denied) return denied;

  const admin = supabaseAdmin();
  const { data: store } = await admin.from("stores").select("id").eq("owner_id", user!.id).maybeSingle();
  if (!store) return NextResponse.json({ products: [] });

  const { data, error } = await admin
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data });
}
