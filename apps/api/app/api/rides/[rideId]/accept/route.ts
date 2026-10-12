import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser, requireRole } from "@/lib/auth";
import { pauseMatching } from "@/lib/geo";

// POST /api/rides/:rideId/accept — a driver claims a "searching" ride.
// The UPDATE's WHERE clause (status = 'searching' AND driver_id IS NULL) is
// what makes this atomic: if two drivers race, only the first UPDATE
// matches any rows — the loser gets back an empty `data` array and a
// clean 409, never a corrupted double-assignment.
export async function POST(req: NextRequest, { params }: { params: Promise<{ rideId: string }> }) {
  const { rideId } = await params;
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "driver");
  if (denied) return denied;

  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("rides")
    .update({ driver_id: user!.id, status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", rideId)
    .eq("status", "searching")
    .is("driver_id", null)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Ride already accepted or no longer available" }, { status: 409 });
  }

  // Take the driver out of matching for other riders while they're on this trip.
  const { data: driver } = await admin.from("drivers").select("vehicle_type").eq("id", user!.id).single();
  if (driver) await pauseMatching(user!.id, driver.vehicle_type);

  return NextResponse.json({ ride: data });
}
