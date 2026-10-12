import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser, requireRole } from "@/lib/auth";

// GET /api/vendor/reviews — the caller's own store's reviews (their
// dashboard's "Latest Reviews" section reads this instead of the public
// /api/stores/:id/reviews so it doesn't need to know its own store id).
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "vendor");
  if (denied) return denied;

  const admin = supabaseAdmin();
  const { data: store } = await admin.from("stores").select("id").eq("owner_id", user!.id).maybeSingle();
  if (!store) return NextResponse.json({ reviews: [] });

  const { data, error } = await admin
    .from("reviews")
    .select("id, rating, comment, created_at, profiles(full_name)")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reviews: data });
}
