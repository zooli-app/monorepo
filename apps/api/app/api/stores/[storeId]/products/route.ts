import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser, requireRole } from "@/lib/auth";
import { invalidate } from "@/lib/redis";
import { z } from "zod";

// GET /api/stores/:storeId/products — public product listing for a store.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const { data, error } = await supabaseAdmin()
    .from("products")
    .select("id, name, description, unit, price, mrp, stock_qty, image_url, is_available, category_id")
    .eq("store_id", storeId)
    .eq("is_available", true);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data });
}

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  unit: z.string().default("pc"),
  price: z.number().nonnegative(),
  mrp: z.number().nonnegative().optional(),
  stock_qty: z.number().int().nonnegative().default(0),
  image_url: z.string().url().optional(),
  category_id: z.string().uuid().optional(),
});

// POST /api/stores/:storeId/products — vendor adds a product to their own store.
export async function POST(req: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "vendor", "admin");
  if (denied) return denied;
  if (user!.role === "vendor" && user!.storeId !== storeId) {
    return NextResponse.json({ error: "Forbidden: not your store" }, { status: 403 });
  }

  const parsed = createProductSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin()
    .from("products")
    .insert({ ...parsed.data, store_id: storeId })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await invalidate(`stores:grocery`); // product changes don't affect this key, but store lists might
  return NextResponse.json({ product: data }, { status: 201 });
}
