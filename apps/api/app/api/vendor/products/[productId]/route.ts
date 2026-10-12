import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser, requireRole } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  unit: z.string().optional(),
  price: z.number().nonnegative().optional(),
  mrp: z.number().nonnegative().optional(),
  stock_qty: z.number().int().nonnegative().optional(),
  image_url: z.string().url().optional(),
  is_available: z.boolean().optional(),
  category_id: z.string().uuid().optional(),
});

async function assertOwnsProduct(userId: string, productId: string) {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("products")
    .select("id, stores!inner(owner_id)")
    .eq("id", productId)
    .single();
  if (!data) return false;
  return (data.stores as unknown as { owner_id: string }).owner_id === userId;
}

// PATCH /api/vendor/products/:productId — edit price/stock/availability/etc.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "vendor");
  if (denied) return denied;
  if (!(await assertOwnsProduct(user!.id, productId))) {
    return NextResponse.json({ error: "Forbidden: not your product" }, { status: 403 });
  }

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data, error } = await supabaseAdmin()
    .from("products")
    .update(parsed.data)
    .eq("id", productId)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}

// DELETE /api/vendor/products/:productId
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "vendor");
  if (denied) return denied;
  if (!(await assertOwnsProduct(user!.id, productId))) {
    return NextResponse.json({ error: "Forbidden: not your product" }, { status: 403 });
  }

  const { error } = await supabaseAdmin().from("products").delete().eq("id", productId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
