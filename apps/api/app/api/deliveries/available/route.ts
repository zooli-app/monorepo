import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser, requireRole } from "@/lib/auth";
import { getDriverLocation, haversineKm } from "@/lib/geo";

const SEARCH_RADIUS_KM = 8;

// GET /api/deliveries/available — a driver's feed of unclaimed,
// ready-for-pickup orders near them, nearest first. Unlike rides (where the
// customer's request triggers a push to nearby drivers), delivery is
// pull-based: any online driver within range can see and claim from this
// list, then POST /api/orders/:orderId/claim to take it.
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "driver");
  if (denied) return denied;

  const admin = supabaseAdmin();
  const { data: driver } = await admin.from("drivers").select("vehicle_type").eq("id", user!.id).single();
  if (!driver) return NextResponse.json({ error: "Driver profile not found" }, { status: 404 });

  const location = await getDriverLocation(user!.id, driver.vehicle_type);
  if (!location) {
    return NextResponse.json({ error: "Go online first (POST /api/drivers/status) so we know where you are" }, { status: 400 });
  }

  const { data: candidates, error } = await admin
    .from("orders")
    .select("id, store_id, total, created_at, ready_at, stores!inner(name, address, lat, lng)")
    .eq("status", "ready_for_pickup")
    .is("driver_id", null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const nearby = (candidates ?? [])
    .map((order) => {
      const store = order.stores as unknown as { name: string; address: string; lat: number; lng: number };
      const distanceKm = haversineKm(location.lat, location.lng, store.lat, store.lng);
      return { ...order, stores: store, distanceKm: Math.round(distanceKm * 10) / 10 };
    })
    .filter((o) => o.distanceKm <= SEARCH_RADIUS_KM)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return NextResponse.json({ deliveries: nearby });
}
