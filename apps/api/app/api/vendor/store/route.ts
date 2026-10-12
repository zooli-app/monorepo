import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser, requireRole } from "@/lib/auth";
import { z } from "zod";

// GET /api/vendor/store — the caller's own store, or null if they haven't
// created one yet (drives the vendor app's "set up your store" onboarding).
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "vendor");
  if (denied) return denied;

  const { data, error } = await supabaseAdmin()
    .from("stores")
    .select("*")
    .eq("owner_id", user!.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ store: data });
}

const createSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["grocery", "restaurant"]).default("grocery"),
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  logo_url: z.string().url().optional(),
  gstin: z.string().max(20).optional(),
  zone: z.string().max(80).optional(),
  // commission_rate is deliberately NOT here — that's admin-controlled only,
  // via PATCH /api/admin/stores/:id, so a vendor can never discount their
  // own commission.
});

// POST /api/vendor/store — one-time store creation. Also stamps the store's
// id onto the vendor's own profile.store_id so future requests can tell
// which store they own without a join.
export async function POST(req: NextRequest) {
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "vendor");
  if (denied) return denied;

  const admin = supabaseAdmin();
  const { data: existing } = await admin.from("stores").select("id").eq("owner_id", user!.id).maybeSingle();
  if (existing) return NextResponse.json({ error: "You already have a store" }, { status: 409 });

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data: store, error } = await admin
    .from("stores")
    .insert({ ...parsed.data, owner_id: user!.id })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin.from("profiles").update({ store_id: store.id }).eq("id", user!.id);
  return NextResponse.json({ store }, { status: 201 });
}

const updateSchema = createSchema.partial().extend({ is_open: z.boolean().optional() });

// PATCH /api/vendor/store — update your own store (open/closed toggle, details).
export async function PATCH(req: NextRequest) {
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "vendor");
  if (denied) return denied;

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data: store, error } = await supabaseAdmin()
    .from("stores")
    .update(parsed.data)
    .eq("owner_id", user!.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ store });
}
