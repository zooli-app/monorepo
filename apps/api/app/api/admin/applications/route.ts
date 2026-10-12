import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser, requireRole } from "@/lib/auth";

// GET /api/admin/applications?status=&service=&q=  — summary rows (no answer blob).
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "admin");
  if (denied) return denied;

  const sp = req.nextUrl.searchParams;
  let q = supabaseAdmin()
    .from("vendor_applications")
    .select("id, reference, service, status, applicant_name, business_name, mobile, email, city, district, created_at, reviewed_at")
    .order("created_at", { ascending: false })
    .limit(500);

  const status = sp.get("status");
  const service = sp.get("service");
  const term = (sp.get("q") || "").replace(/[%,()]/g, " ").trim().slice(0, 60);
  if (status) q = q.eq("status", status);
  if (service) q = q.eq("service", service);
  if (term) q = q.or(`applicant_name.ilike.%${term}%,business_name.ilike.%${term}%,mobile.ilike.%${term}%,reference.ilike.%${term}%`);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ applications: data });
}
