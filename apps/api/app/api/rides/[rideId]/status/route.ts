import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser } from "@/lib/auth";
import { creditCashback } from "@/lib/wallet";
import { z } from "zod";

// Which role may move a ride INTO which status, and from which statuses.
const TRANSITIONS: Record<string, { from: string[]; by: "driver" | "customer" | "either" }> = {
  arrived:     { from: ["accepted"],                                by: "driver" },
  in_progress: { from: ["arrived"],                                 by: "driver" },
  completed:   { from: ["in_progress"],                             by: "driver" },
  cancelled:   { from: ["requested", "searching", "accepted", "arrived"], by: "either" },
};

const schema = z.object({ status: z.enum(["arrived", "in_progress", "completed", "cancelled"]) });

// POST /api/rides/:rideId/status — move a ride through its lifecycle.
// Role + prior-status are checked in application code (see TRANSITIONS
// above) since RLS can only express "you're a party to this ride", not
// "...and only in this direction".
export async function POST(req: NextRequest, { params }: { params: Promise<{ rideId: string }> }) {
  const { rideId } = await params;
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { status } = parsed.data;
  const rule = TRANSITIONS[status];

  const admin = supabaseAdmin();
  const { data: ride, error: fetchErr } = await admin.from("rides").select("*").eq("id", rideId).single();
  if (fetchErr || !ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });

  const isDriver = ride.driver_id === user.id;
  const isCustomer = ride.customer_id === user.id;
  if (!isDriver && !isCustomer) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (rule.by === "driver" && !isDriver) return NextResponse.json({ error: "Only the driver can do that" }, { status: 403 });
  if (!rule.from.includes(ride.status)) {
    return NextResponse.json({ error: `Cannot move to ${status} from ${ride.status}` }, { status: 409 });
  }

  const timestampField =
    status === "in_progress" ? "started_at" :
    status === "completed" ? "completed_at" :
    status === "cancelled" ? "cancelled_at" : null;

  const update: Record<string, unknown> = { status };
  if (timestampField) update[timestampField] = new Date().toISOString();
  if (status === "cancelled") update.cancelled_by = user.id;
  if (status === "completed") update.fare_final = ride.fare_estimate; // no surge/detour adjustment yet

  const { data: updated, error: updateErr } = await admin
    .from("rides")
    .update(update)
    .eq("id", rideId)
    .select()
    .single();
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  if (status === "completed") {
    await creditCashback(ride.customer_id, ride.fare_estimate, `cashback:ride:${rideId}`);
  }

  // Driver stays "online" in the DB and simply resumes appearing in
  // matching on their next heartbeat (POST /api/drivers/status) — we don't
  // force them back into the Redis matching pool here since we don't have
  // a fresh location for them until they send one.

  return NextResponse.json({ ride: updated });
}
