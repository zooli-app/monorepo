import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser } from "@/lib/auth";
import { creditCashback } from "@/lib/wallet";
import { z } from "zod";

// Same pattern as rides/[rideId]/status: RLS only proves you're a party to
// the order, application code decides which direction that party may push
// it. "out_for_delivery" is deliberately excluded here — a driver can only
// reach it by winning the atomic claim in orders/[orderId]/claim, never by
// posting a status directly (that's what stops a vendor or driver from
// hand-waving a delivery into existence without one actually being assigned).
const TRANSITIONS: Record<string, { from: string[]; by: "vendor" | "driver" | "either" }> = {
  confirmed:        { from: ["pending"],            by: "vendor" },
  preparing:        { from: ["confirmed"],          by: "vendor" },
  ready_for_pickup: { from: ["preparing"],          by: "vendor" },
  delivered:        { from: ["out_for_delivery"],   by: "driver" },
  cancelled:        { from: ["pending", "confirmed", "preparing"], by: "either" },
};

const schema = z.object({
  status: z.enum(["confirmed", "preparing", "ready_for_pickup", "delivered", "cancelled"]),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { status } = parsed.data;
  const rule = TRANSITIONS[status];

  const admin = supabaseAdmin();
  const { data: order, error: fetchErr } = await admin
    .from("orders")
    .select("*, stores!inner(owner_id)")
    .eq("id", orderId)
    .single();
  if (fetchErr || !order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const isVendor = (order.stores as unknown as { owner_id: string }).owner_id === user.id;
  const isDriver = order.driver_id === user.id;
  const isCustomer = order.user_id === user.id;
  if (!isVendor && !isDriver && !isCustomer) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (rule.by === "vendor" && !isVendor) return NextResponse.json({ error: "Only the vendor can do that" }, { status: 403 });
  if (rule.by === "driver" && !isDriver) return NextResponse.json({ error: "Only the assigned driver can do that" }, { status: 403 });
  if (rule.by === "either" && !isVendor && !isCustomer) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!rule.from.includes(order.status)) {
    return NextResponse.json({ error: `Cannot move to ${status} from ${order.status}` }, { status: 409 });
  }

  const timestampField: Record<string, string> = {
    confirmed: "confirmed_at",
    preparing: "preparing_at",
    ready_for_pickup: "ready_at",
    delivered: "delivered_at",
    cancelled: "cancelled_at",
  };

  const update: Record<string, unknown> = { status, [timestampField[status]]: new Date().toISOString() };
  if (status === "cancelled") update.cancelled_by = user.id;

  const { data: updated, error: updateErr } = await admin
    .from("orders")
    .update(update)
    .eq("id", orderId)
    .select()
    .single();
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  if (status === "delivered") {
    await creditCashback(order.user_id, order.total, `cashback:order:${orderId}`);
  }

  return NextResponse.json({ order: updated });
}
