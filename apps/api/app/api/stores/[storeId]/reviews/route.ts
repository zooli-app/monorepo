import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/stores/:storeId/reviews — public. Used by both the customer-facing
// store page and the vendor dashboard's "Latest Reviews" (a vendor already
// knows their own store id from GET /api/vendor/store).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const { data, error } = await supabaseAdmin()
    .from("reviews")
    .select("id, rating, comment, created_at, profiles(full_name)")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reviews: data });
}
