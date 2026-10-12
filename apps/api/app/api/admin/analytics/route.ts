import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser, requireRole } from "@/lib/auth";

const DAY = 86_400_000;
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

// GET /api/admin/analytics?days=30 — everything the dashboard / analytics / payments pages chart,
// aggregated from real orders, rides and profiles. "Revenue" = order totals excluding cancelled orders.
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "admin");
  if (denied) return denied;

  const days = Math.min(365, Math.max(1, Number(req.nextUrl.searchParams.get("days")) || 30));
  const since = new Date(Date.now() - days * DAY);
  since.setUTCHours(0, 0, 0, 0);
  const sinceIso = since.toISOString();
  const monthsBack = new Date(); monthsBack.setUTCMonth(monthsBack.getUTCMonth() - 5, 1); monthsBack.setUTCHours(0, 0, 0, 0);

  const db = supabaseAdmin();
  const [ordersQ, ridesQ, usersQ] = await Promise.all([
    db.from("orders").select("created_at,total,status,payment_status,store_id,stores(name)").gte("created_at", sinceIso).limit(20000),
    db.from("rides").select("requested_at,status,fare_final").gte("requested_at", sinceIso).limit(20000),
    db.from("profiles").select("created_at").gte("created_at", monthsBack.toISOString()).limit(20000),
  ]);
  const err = ordersQ.error || ridesQ.error || usersQ.error;
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });

  // one bucket per day, zero-filled so charts have no gaps
  const daily: Record<string, { date: string; orders: number; revenue: number; rides: number }> = {};
  for (let i = 0; i < days; i++) { const k = dayKey(new Date(since.getTime() + i * DAY)); daily[k] = { date: k, orders: 0, revenue: 0, rides: 0 }; }

  const statusCounts: Record<string, number> = {};
  const payments = { paid: 0, unpaid: 0, refunded: 0, failed: 0 };
  const stores: Record<string, { id: string; name: string; orders: number; revenue: number }> = {};
  let revenue = 0, validOrders = 0;

  for (const o of ordersQ.data ?? []) {
    const row = o as unknown as { created_at: string; total: number; status: string; payment_status: keyof typeof payments; store_id: string; stores: { name: string } | null };
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
    if (row.payment_status in payments) payments[row.payment_status] += Number(row.total);
    if (row.status === "cancelled") continue;
    const b = daily[dayKey(new Date(row.created_at))];
    if (b) { b.orders += 1; b.revenue += Number(row.total); }
    revenue += Number(row.total); validOrders += 1;
    const s = (stores[row.store_id] ??= { id: row.store_id, name: row.stores?.name ?? "Unknown", orders: 0, revenue: 0 });
    s.orders += 1; s.revenue += Number(row.total);
  }

  const rideStatus: Record<string, number> = {};
  let rideRevenue = 0;
  for (const r of ridesQ.data ?? []) {
    rideStatus[r.status] = (rideStatus[r.status] ?? 0) + 1;
    const b = daily[dayKey(new Date(r.requested_at))];
    if (b) b.rides += 1;
    if (r.status === "completed") rideRevenue += Number(r.fare_final ?? 0);
  }

  const growth: Record<string, number> = {};
  for (let i = 0; i < 6; i++) { const d = new Date(monthsBack); d.setUTCMonth(d.getUTCMonth() + i); growth[d.toISOString().slice(0, 7)] = 0; }
  for (const p of usersQ.data ?? []) { const k = String(p.created_at).slice(0, 7); if (k in growth) growth[k] += 1; }

  return NextResponse.json({
    days,
    totals: { orders: validOrders, revenue, avgOrderValue: validOrders ? revenue / validOrders : 0, newUsers: Object.values(growth).reduce((a, b) => a + b, 0) },
    daily: Object.values(daily),
    orderStatus: statusCounts,
    payments,
    rides: { total: Object.values(rideStatus).reduce((a, b) => a + b, 0), byStatus: rideStatus, revenue: rideRevenue },
    topStores: Object.values(stores).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    userGrowth: Object.entries(growth).map(([month, count]) => ({ month, count })),
  });
}
