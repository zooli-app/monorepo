import { NextRequest, NextResponse } from "next/server";
import { getAuthedUser, requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { setDriverOnline, setDriverOffline } from "@/lib/geo";
import { z } from "zod";

const schema = z.object({
  online: z.boolean(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

// POST /api/drivers/status — go online (with a location heartbeat) or offline.
// The app/mobile client should call this every ~15-20s while online to keep
// the driver visible in ride matching (entries expire after 30s of silence).
export async function POST(req: NextRequest) {
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "driver");
  if (denied) return denied;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { online, lat, lng } = parsed.data;

  const admin = supabaseAdmin();
  const { data: driver, error } = await admin
    .from("drivers")
    .select("vehicle_type")
    .eq("id", user!.id)
    .single();
  if (error || !driver) return NextResponse.json({ error: "Driver profile not found" }, { status: 404 });

  if (online) {
    if (lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "lat/lng required to go online" }, { status: 400 });
    }
    await setDriverOnline(user!.id, driver.vehicle_type, lat, lng);
  } else {
    await setDriverOffline(user!.id, driver.vehicle_type);
  }

  await admin.from("drivers").update({ is_online: online }).eq("id", user!.id);
  return NextResponse.json({ ok: true, online });
}
