import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ rating: z.number().int().min(1).max(5), comment: z.string().max(1000).optional() });

// POST /api/orders/:orderId/review — the customer reviews a delivered order.
// One review per order (enforced by the `reviews.order_id` unique
// constraint); rejects anything not yet delivered/completed so ratings
// always reflect a trip that actually happened.
export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const admin = supabaseAdmin();
  const { data: order, error: orderErr } = await admin.from("orders").select("*").eq("id", orderId).single();
  if (orderErr || !order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (order.status !== "delivered") return NextResponse.json({ error: "You can only review a delivered order" }, { status: 409 });

  const { data: review, error: reviewErr } = await admin
    .from("reviews")
    .insert({ order_id: orderId, user_id: user.id, store_id: order.store_id, ...parsed.data })
    .select()
    .single();
  if (reviewErr) {
    if (reviewErr.code === "23505") return NextResponse.json({ error: "You've already reviewed this order" }, { status: 409 });
    return NextResponse.json({ error: reviewErr.message }, { status: 500 });
  }

  // Recompute the store's denormalized rating from scratch — simplest
  // correct approach; review volume per store is low enough that this
  // full aggregate is cheap compared to maintaining a running average.
  const { data: agg } = await admin.from("reviews").select("rating").eq("store_id", order.store_id);
  const ratings = (agg ?? []).map((r) => r.rating);
  const avg = ratings.length ? ratings.reduce((a, r) => a + r, 0) / ratings.length : 0;
  await admin.from("stores").update({ rating_avg: Math.round(avg * 10) / 10, rating_count: ratings.length }).eq("id", order.store_id);

  return NextResponse.json({ review }, { status: 201 });
}
