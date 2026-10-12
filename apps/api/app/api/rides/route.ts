import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, supabaseForUser } from "@/lib/supabase";
import { getAuthedUser } from "@/lib/auth";
import { haversineKm, estimateFare, findNearbyDrivers } from "@/lib/geo";
import { z } from "zod";

const AVG_SPEED_KMPH = 25; // rough city-traffic estimate, for ETA/fare-by-time only

// GET /api/rides — the caller's rides (customer sees their trips, driver
// sees trips assigned to them — both allowed by the same RLS policy).
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = supabaseForUser(user.accessToken);
  const { data, error } = await db
    .from("rides")
    .select("*")
    .order("requested_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rides: data });
}

const requestRideSchema = z.object({
  vehicleType: z.enum(["bike", "auto", "sedan", "suv"]),
  pickup: z.object({ address: z.string().min(1), lat: z.number(), lng: z.number() }),
  drop: z.object({ address: z.string().min(1), lat: z.number(), lng: z.number() }),
});

// POST /api/rides — customer requests a ride. Computes a fare estimate,
// creates the ride as "searching", and looks up nearby online drivers
// (the client polls GET /api/rides/:id to see if one accepts — see
// app/api/rides/[rideId]/accept for the other half of that flow).
export async function POST(req: NextRequest) {
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = requestRideSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { vehicleType, pickup, drop } = parsed.data;

  const admin = supabaseAdmin();
  const { data: rule, error: ruleErr } = await admin
    .from("ride_fare_rules")
    .select("*")
    .eq("vehicle_type", vehicleType)
    .eq("is_active", true)
    .single();
  if (ruleErr || !rule) return NextResponse.json({ error: "No active pricing for that vehicle type" }, { status: 400 });

  const distanceKm = haversineKm(pickup.lat, pickup.lng, drop.lat, drop.lng);
  const estMinutes = (distanceKm / AVG_SPEED_KMPH) * 60;
  const fareEstimate = estimateFare(rule, distanceKm, estMinutes);

  const { data: ride, error: rideErr } = await admin
    .from("rides")
    .insert({
      customer_id: user.id,
      vehicle_type: vehicleType,
      status: "searching",
      pickup_address: pickup.address,
      pickup_lat: pickup.lat,
      pickup_lng: pickup.lng,
      drop_address: drop.address,
      drop_lat: drop.lat,
      drop_lng: drop.lng,
      distance_km: distanceKm,
      fare_estimate: fareEstimate,
    })
    .select()
    .single();
  if (rideErr) return NextResponse.json({ error: rideErr.message }, { status: 500 });

  const nearbyDriverIds = await findNearbyDrivers(vehicleType, pickup.lat, pickup.lng);

  return NextResponse.json({ ride, nearbyDrivers: nearbyDriverIds.length }, { status: 201 });
}
