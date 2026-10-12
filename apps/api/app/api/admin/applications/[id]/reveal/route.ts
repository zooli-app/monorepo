import { NextRequest, NextResponse } from "next/server";
import { SENSITIVE_FIELDS } from "@zooli/vendor-forms";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser, requireRole } from "@/lib/auth";
import { decrypt, isEncrypted } from "@/lib/crypto";
import { isRateLimited } from "@/lib/ratelimit";

// POST /api/admin/applications/:id/reveal { field } → { value }. Every call is audit-logged.
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "admin");
  if (denied) return denied;
  const { id } = await ctx.params;

  const { field } = await req.json().catch(() => ({ field: "" }));
  if (!(SENSITIVE_FIELDS as readonly string[]).includes(field)) return NextResponse.json({ error: "Invalid field" }, { status: 400 });
  if (await isRateLimited(`reveal:${user!.id}`, 30, 60)) return NextResponse.json({ error: "Slow down." }, { status: 429 });

  const db = supabaseAdmin();
  const { data } = await db.from("vendor_applications").select("data").eq("id", id).single();
  const blob = (data?.data as Record<string, unknown> | undefined)?.[field];
  if (!isEncrypted(blob)) return NextResponse.json({ error: "This value isn't stored in full." }, { status: 404 });

  let value: string;
  try { value = decrypt(blob); } catch { return NextResponse.json({ error: "Could not decrypt (wrong DATA_ENCRYPTION_KEY?)" }, { status: 500 }); }
  await db.from("application_audit_log").insert({ application_id: id, admin_id: user!.id, action: `reveal:${field}` });
  return NextResponse.json({ value });
}
