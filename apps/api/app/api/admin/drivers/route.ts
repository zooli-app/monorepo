import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser, requireRole } from "@/lib/auth";

// GET /api/admin/drivers — drivers with online status. (Licence numbers are deliberately not returned.)
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "admin");
  if (denied) return denied;
  const { data, error } = await supabaseAdmin()
    .from("drivers")
    .select("id, vehicle_type, vehicle_number, is_online, rating_avg, rating_count, created_at, profiles(full_name, phone)")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ drivers: data });
}
