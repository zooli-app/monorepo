import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser, requireRole } from "@/lib/auth";

// GET /api/admin/stats — headline numbers for the admin dashboard home.
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "admin");
  if (denied) return denied;

  const admin = supabaseAdmin();
  const [{ count: stores }, { count: orders }, { count: users }, { data: totals }] = await Promise.all([
    admin.from("stores").select("*", { count: "exact", head: true }),
    admin.from("orders").select("*", { count: "exact", head: true }),
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("orders").select("total"),
  ]);

  const revenue = (totals ?? []).reduce((sum, o) => sum + Number(o.total), 0);

  return NextResponse.json({ stores: stores ?? 0, orders: orders ?? 0, users: users ?? 0, revenue });
}
