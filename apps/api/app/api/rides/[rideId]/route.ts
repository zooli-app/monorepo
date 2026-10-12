import { NextRequest, NextResponse } from "next/server";
import { supabaseForUser } from "@/lib/supabase";
import { getAuthedUser } from "@/lib/auth";
import { getDriverLocation } from "@/lib/geo";

// GET /api/rides/:rideId — poll a single ride's status, with the driver's
// live location merged in (from Redis) once one is assigned. This is the
// endpoint both the rider's "finding your driver" screen and the driver's
// live-trip screen should poll every few seconds.
export async function GET(req: NextRequest, { params }: { params: Promise<{ rideId: string }> }) {
  const { rideId } = await params;
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = supabaseForUser(user.accessToken);
  const { data: ride, error } = await db.from("rides").select("*").eq("id", rideId).single();
  if (error || !ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });

  let driverLocation = null;
  if (ride.driver_id && ["accepted", "arrived", "in_progress"].includes(ride.status)) {
    driverLocation = await getDriverLocation(ride.driver_id, ride.vehicle_type);
  }

  return NextResponse.json({ ride, driverLocation });
}
