import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser, requireRole } from "@/lib/auth";

// GET /api/admin/stores — every store, any category, any status (unlike the
// public /api/stores which only shows open ones — admin needs the full list
// to approve/suspend vendors).
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "admin");
  if (denied) return denied;

  const { data, error } = await supabaseAdmin()
    .from("stores")
    .select("id, owner_id, name, category, address, lat, lng, is_open, logo_url, created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ stores: data });
}
