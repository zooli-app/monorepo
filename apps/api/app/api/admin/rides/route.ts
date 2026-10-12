import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser, requireRole } from "@/lib/auth";

// GET /api/admin/rides — latest 200 rides platform-wide, with customer + driver names.
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "admin");
  if (denied) return denied;
  const { data, error } = await supabaseAdmin()
    .from("rides")
    .select("*, customer:profiles!rides_customer_id_fkey(full_name, phone), drivers(vehicle_number, vehicle_type, profiles(full_name, phone))")
    .order("requested_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rides: data });
}
