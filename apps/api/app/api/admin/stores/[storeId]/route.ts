import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser, requireRole } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  is_open: z.boolean().optional(),
  commission_rate: z.number().min(0).max(100).optional(),
  gstin: z.string().max(20).optional(),
  zone: z.string().max(80).optional(),
}).refine((v) => Object.keys(v).length > 0, { message: "Provide at least one field to update" });

// PATCH /api/admin/stores/:storeId — approve/suspend (is_open) and manage
// business fields (commission_rate, gstin, zone) for any vendor's store.
// The vendor's own PATCH /api/vendor/store can touch their own row's
// gstin/zone too, but never commission_rate — that's admin-only, set here.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "admin");
  if (denied) return denied;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data, error } = await supabaseAdmin()
    .from("stores")
    .update(parsed.data)
    .eq("id", storeId)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ store: data });
}
