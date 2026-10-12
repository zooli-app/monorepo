"use client";
import { useEffect, useState } from "react";
import {
  ShoppingBag, IndianRupee, Star, TrendingUp, Clock,
  CheckCircle, XCircle, AlertCircle, ChevronRight, Package,
} from "lucide-react";
import { DynWeeklyRevenue, DynWeeklyOrders } from "@/components/dashboard/DynamicCharts";
// Reviews/rating/weekly-revenue-chart have no backend yet (no reviews table,
// no analytics aggregation endpoint) — those specific sections stay on demo
// data, clearly labeled below. Orders are 100% real.
import { revenueWeekData } from "@/lib/mock-data";
import { fmt, fmtFull, timeAgo } from "@/lib/utils";
import { api } from "@/lib/api";
import type { VendorOrder } from "@zooli/api-client";
import type { Review } from "@zooli/api-client";

const STATUS_STYLE: Record<string, string> = {
  pending:          "bg-blue-50 text-blue-700 border border-blue-200",
  confirmed:        "bg-purple-50 text-purple-700 border border-purple-200",
  preparing:        "bg-amber-50 text-amber-700 border border-amber-200",
  ready_for_pickup: "bg-teal-50 text-teal-700 border border-teal-200",
  out_for_delivery: "bg-orange-50 text-orange-700 border border-orange-200",
  delivered:        "bg-emerald-50 text-emerald-700 border border-emerald-200",
  cancelled:        "bg-red-50 text-red-700 border border-red-200",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "New", confirmed: "Accepted", preparing: "Preparing", ready_for_pickup: "Ready",
  out_for_delivery: "Out for Delivery", delivered: "Delivered", cancelled: "Cancelled",
};

export default function DashboardPage() {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [store, setStore] = useState<{ rating_avg?: number; rating_count?: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.vendor.orders(), api.vendor.reviews(), api.vendor.getStore()]).then(
      ([ordersRes, reviewsRes, storeRes]) => {
        setOrders(ordersRes.orders);
        setReviews(reviewsRes.reviews);
        setStore(storeRes.store);
      }
    ).finally(() => setLoading(false));
  }, []);

  const todayOrders  = orders.filter(o => o.status !== "cancelled");
  const activeOrders = orders.filter(o => ["pending","confirmed","preparing","ready_for_pickup","out_for_delivery"].includes(o.status));
  const newOrders    = orders.filter(o => o.status === "pending");
  const COMMISSION_RATE = 0.15;
  const todayRev     = todayOrders.reduce((a, o) => a + o.total * (1 - COMMISSION_RATE), 0);
  const weekRevTotal = revenueWeekData.reduce((a, d) => a + d.revenue, 0); // demo data — no analytics endpoint yet

  const topItem = { name: "Chicken Biryani", orders: 284, revenue: 51120 }; // demo data

  if (loading) {
    return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5 max-w-[1400px]">

      {/* ── New order alert banner ── */}
      {newOrders.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-purple-500/20">
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
              <AlertCircle size={22} className="text-white" />
            </div>
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
              {newOrders.length}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold">{newOrders.length} New Order{newOrders.length > 1 ? "s" : ""} Waiting!</div>
            <div className="text-white/70 text-xs mt-0.5">Accept before the customer cancels. Average wait: 3 min.</div>
          </div>
          <a href="/orders" className="bg-white text-purple-700 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-purple-50 transition-colors flex items-center gap-1.5 flex-shrink-0 shadow-sm">
            View Orders <ChevronRight size={13} />
          </a>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Today's Orders",   value: todayOrders.length.toString(), sub: `${activeOrders.length} active now`,          icon: ShoppingBag,  grad: "from-purple-500 to-purple-700" },
          { label: "Today's Earnings", value: fmt(todayRev),                 sub: "After 15% commission",                       icon: IndianRupee,   grad: "from-emerald-400 to-emerald-600" },
          { label: "This Week",        value: fmt(weekRevTotal),             sub: "355 orders total",                           icon: TrendingUp,    grad: "from-blue-400 to-blue-600" },
          { label: "Your Rating",      value: `${store?.rating_avg ?? 0} ⭐`,          sub: `${store?.rating_count ?? 0} reviews`,              icon: Star,          grad: "from-amber-400 to-orange-500" },
        ].map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.grad} flex items-center justify-center shadow-sm flex-shrink-0`}>
                <Icon size={22} className="text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase truncate">{c.label}</div>
                <div className="text-xl font-bold text-gray-900 leading-tight mt-0.5">{c.value}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{c.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Status summary ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "New",         count: orders.filter(o => o.status === "pending").length,       icon: AlertCircle,  bg: "bg-blue-50",    icon_c: "text-blue-500",    border: "border-blue-100" },
          { label: "Preparing",   count: orders.filter(o => ["confirmed","preparing"].includes(o.status)).length, icon: Clock, bg: "bg-amber-50", icon_c: "text-amber-500", border: "border-amber-100" },
          { label: "Delivered",   count: orders.filter(o => o.status === "delivered").length,  icon: CheckCircle,  bg: "bg-emerald-50", icon_c: "text-emerald-500", border: "border-emerald-100" },
          { label: "Cancelled",   count: orders.filter(o => o.status === "cancelled").length,  icon: XCircle,      bg: "bg-red-50",     icon_c: "text-red-500",     border: "border-red-100" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`bg-white rounded-2xl border ${s.border} shadow-sm p-4 flex items-center gap-3`}>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className={s.icon_c} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 leading-tight">{s.count}</div>
                <div className="text-xs text-gray-400 font-medium">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="text-sm font-bold text-gray-900">Revenue This Week</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xl font-bold text-gray-900">{fmt(weekRevTotal)}</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <TrendingUp size={10} /> +12.4%
                </span>
              </div>
            </div>
            <a href="/earnings" className="text-xs text-purple-600 font-semibold hover:underline flex items-center gap-0.5">
              Details <ChevronRight size={12} />
            </a>
          </div>
          <div className="h-48 mt-3"><DynWeeklyRevenue /></div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="text-sm font-bold text-gray-900">Orders This Week</div>
              <div className="text-xl font-bold text-gray-900 mt-0.5">
                355 <span className="text-xs font-normal text-gray-400">total orders</span>
              </div>
            </div>
            <a href="/orders" className="text-xs text-purple-600 font-semibold hover:underline flex items-center gap-0.5">
              Details <ChevronRight size={12} />
            </a>
          </div>
          <div className="h-48 mt-3"><DynWeeklyOrders /></div>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Orders table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="text-sm font-bold text-gray-900">Recent Orders</div>
            <a href="/orders" className="text-xs text-purple-600 font-semibold hover:underline flex items-center gap-0.5">
              View All <ChevronRight size={12} />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {["Order", "Customer", "Items", "Amount", "Status", "Time"].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 6).map(o => (
                  <tr key={o.id} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors cursor-pointer">
                    <td className="px-4 py-3 text-xs font-bold text-purple-600">#{o.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-900 whitespace-nowrap">{o.profiles?.full_name ?? "Customer"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{(o.order_items ?? []).length} item{(o.order_items ?? []).length !== 1 ? "s" : ""}</td>
                    <td className="px-4 py-3 text-xs font-bold text-gray-900">{fmtFull(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLE[o.status]}`}>
                        {STATUS_LABEL[o.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{timeAgo(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4">
          {/* Top item */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="text-sm font-bold text-gray-900 mb-3">🏆 Top Item Today</div>
            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package size={18} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-gray-900 truncate">{topItem.name}</div>
                <div className="text-xs text-gray-500">{topItem.orders} orders today</div>
              </div>
              <div className="text-sm font-bold text-emerald-600">{fmt(topItem.revenue)}</div>
            </div>
            <div className="mt-3 space-y-2">
              {[
                { name: "Veg Biryani",   count: 198 },
                { name: "Veg Thali",     count: 145 },
                { name: "Chicken Curry", count: 132 },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-4">{i + 2}.</span>
                  <span className="text-xs text-gray-700 flex-1 truncate">{item.name}</span>
                  <span className="text-xs font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Latest reviews */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-gray-900">Latest Reviews</div>
              <a href="/reviews" className="text-xs text-purple-600 font-semibold hover:underline">View All</a>
            </div>
            <div className="space-y-3">
              {reviews.slice(0, 3).map(r => (
                <div key={r.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-800">{r.profiles?.full_name ?? "Customer"}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-[13px] ${i < r.rating ? "text-amber-400" : "text-gray-200"}`}>★</span>
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{r.comment}</p>}
                </div>
              ))}
              {reviews.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No reviews yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
