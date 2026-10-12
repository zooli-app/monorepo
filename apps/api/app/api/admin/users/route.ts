import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser, requireRole } from "@/lib/auth";

// GET /api/admin/users — every profile (customers, vendors, drivers, admins).
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "admin");
  if (denied) return denied;

  const { data, error } = await supabaseAdmin()
    .from("profiles")
    .select("id, role, full_name, phone, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data });
}
