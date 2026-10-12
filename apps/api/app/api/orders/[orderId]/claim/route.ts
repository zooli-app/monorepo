import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser, requireRole } from "@/lib/auth";
import { pauseMatching } from "@/lib/geo";

// POST /api/orders/:orderId/claim — a driver claims a "ready_for_pickup"
// order for delivery. Same atomic-UPDATE pattern as rides/[rideId]/accept:
// the WHERE clause (status = 'ready_for_pickup' AND driver_id IS NULL) is
// what prevents two drivers claiming the same delivery.
export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "driver");
  if (denied) return denied;

  const admin = supabaseAdmin();
  const { data: order, error } = await admin
    .from("orders")
    .update({
      driver_id: user!.id,
      status: "out_for_delivery",
      picked_up_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("status", "ready_for_pickup")
    .is("driver_id", null)
    .select()
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order already claimed or not ready yet" }, { status: 409 });
  }

  const { data: driver } = await admin.from("drivers").select("vehicle_type").eq("id", user!.id).single();
  if (driver) await pauseMatching(user!.id, driver.vehicle_type);

  return NextResponse.json({ order });
}
