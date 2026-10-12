import { redis } from "./redis";

const ONLINE_DRIVERS_KEY = (vehicleType: string) => `drivers:online:${vehicleType}`;
const DRIVER_TTL_SECONDS = 30; // heartbeat must refresh at least this often

/** Great-circle distance in km between two points. */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Driver goes online / sends a location heartbeat. Backed by a Redis GEO set
 * (one per vehicle type) so "nearest driver" search is a single command
 * instead of scanning Postgres. Entries expire on their own via a
 * companion TTL key — a driver who stops heartbeating silently drops out
 * of matching within DRIVER_TTL_SECONDS.
 */
export async function setDriverOnline(driverId: string, vehicleType: string, lat: number, lng: number) {
  const r = redis();
  await r.geoadd(ONLINE_DRIVERS_KEY(vehicleType), { latitude: lat, longitude: lng, member: driverId });
  await r.set(`driver:heartbeat:${driverId}`, "1", { ex: DRIVER_TTL_SECONDS });
}

export async function setDriverOffline(driverId: string, vehicleType: string) {
  const r = redis();
  await r.zrem(ONLINE_DRIVERS_KEY(vehicleType), driverId);
  await r.del(`driver:heartbeat:${driverId}`);
}

/**
 * Pulls a driver out of the matching pool without touching their `is_online`
 * DB flag — used the instant they accept a ride, so they stop surfacing in
 * `findNearbyDrivers` for *other* riders while on a trip. They reappear on
 * their next heartbeat (POST /api/drivers/status) once free again.
 */
export async function pauseMatching(driverId: string, vehicleType: string) {
  await redis().zrem(ONLINE_DRIVERS_KEY(vehicleType), driverId);
}

/** Returns up to `limit` online driver IDs near a point, nearest first. */
export async function findNearbyDrivers(
  vehicleType: string,
  lat: number,
  lng: number,
  radiusKm = 5,
  limit = 5
): Promise<string[]> {
  const r = redis();
  const results = await r.geosearch(ONLINE_DRIVERS_KEY(vehicleType), {
    type: "FROMLONLAT",
    coordinate: { lon: lng, lat },
  }, {
    type: "byradius",
    radius: radiusKm,
    radiusType: "KM",
  }, "ASC", { count: { limit } });
  // filter out any driver whose heartbeat lapsed (GEO set entry can outlive it briefly)
  const alive: string[] = [];
  for (const id of results as unknown as string[]) {
    if (await r.exists(`driver:heartbeat:${id}`)) alive.push(id);
  }
  return alive;
}

export async function getDriverLocation(driverId: string, vehicleType: string) {
  const r = redis();
  const positions = await r.geopos(ONLINE_DRIVERS_KEY(vehicleType), driverId);
  const first = positions?.[0];
  return first ? { lat: first.lat, lng: first.lng } : null;
}

/** Fare estimate from the active rule for a vehicle type + trip distance. */
export function estimateFare(
  rule: { base_fare: number; per_km_rate: number; per_min_rate: number; min_fare: number },
  distanceKm: number,
  estMinutes: number
): number {
  const raw = rule.base_fare + rule.per_km_rate * distanceKm + rule.per_min_rate * estMinutes;
  return Math.max(rule.min_fare, Math.round(raw * 100) / 100);
}
