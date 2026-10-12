"use client";
import { useEffect, useState } from "react";
import {
  ShoppingBag, IndianRupee, Users, Store, UtensilsCrossed,
  ShoppingCart, Car, Package, Wrench, Truck,
  TrendingUp, Plus, MapPin, Bell, Tag, FileText,
  ChevronDown, Circle, Eye,
} from "lucide-react";
import { DynamicRevenueChart, DynamicOrdersChart, DynamicServiceChart } from "@/components/dashboard/DynamicCharts";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { timeAgo } from "@/lib/utils";
import { api } from "@/lib/api";
import type { AdminStats } from "@zooli/api-client";

// KPI cards below pull from /api/admin/stats — real counts. The service
// breakdown / live-overview sections further down stay on demo numbers:
// there's no per-vertical or live-presence aggregation endpoint yet.
function buildKpiCards(stats: AdminStats | null) {
  return [
    { label: "TOTAL ORDERS",    value: stats ? stats.orders.toLocaleString("en-IN") : "—",           trend: "18.6%", icon: ShoppingBag, gradient: "from-purple-500 to-purple-700", bg: "bg-purple-50" },
    { label: "TOTAL REVENUE",   value: stats ? `₹ ${stats.revenue.toLocaleString("en-IN")}` : "—",    trend: "22.8%", icon: IndianRupee,  gradient: "from-green-400 to-green-600",  bg: "bg-green-50" },
    { label: "TOTAL CUSTOMERS", value: stats ? stats.users.toLocaleString("en-IN") : "—",              trend: "14.3%", icon: Users,        gradient: "from-blue-400 to-blue-600",    bg: "bg-blue-50" },
    { label: "ACTIVE VENDORS",  value: stats ? stats.stores.toLocaleString("en-IN") : "—",             trend: "16.5%", icon: Store,        gradient: "from-orange-400 to-orange-600",bg: "bg-orange-50" },
  ];
}


// ─── Service stats ────────────────────────────────────────────────────
const SERVICE_STATS = [
  { label: "FOOD ORDERS",     value: "3,245", icon: UtensilsCrossed, color: "text-orange-500", bg: "bg-orange-50" },
  { label: "GROCERY ORDERS",  value: "1,285", icon: ShoppingCart,    color: "text-green-500",  bg: "bg-green-50" },
  { label: "RIDE BOOKINGS",   value: "1,845", icon: Car,             color: "text-blue-500",   bg: "bg-blue-50" },
  { label: "PARCEL ORDERS",   value: "745",   icon: Package,         color: "text-purple-500", bg: "bg-purple-50" },
  { label: "HOME SERVICES",   value: "685",   icon: Wrench,          color: "text-red-500",    bg: "bg-red-50" },
  { label: "HOUSE SHIFTING",  value: "532",   icon: Truck,           color: "text-cyan-500",   bg: "bg-cyan-50" },
];

// ─── Live Overview ────────────────────────────────────────────────────
const LIVE_ITEMS = [
  { label: "Live Deliveries", value: "745",   icon: Package,  color: "text-orange-500", bg: "bg-orange-50" },
  { label: "Online Riders",   value: "512",   icon: Car,      color: "text-blue-500",   bg: "bg-blue-50" },
  { label: "Online Drivers",  value: "685",   icon: Car,      color: "text-purple-500", bg: "bg-purple-50" },
  { label: "Active Vendors",  value: "5,642", icon: Store,    color: "text-green-500",  bg: "bg-green-50" },
  { label: "Service Areas",   value: "98",    icon: MapPin,   color: "text-red-500",    bg: "bg-red-50" },
];

// ─── Quick Actions ────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: "Add Vendor",        icon: Store,    href: "/vendors",  color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Add Rider",         icon: Car,      href: "/rides",    color: "text-blue-600",   bg: "bg-blue-50" },
  { label: "Add Zone",          icon: MapPin,   href: "/settings", color: "text-green-600",  bg: "bg-green-50" },
  { label: "Send Notification", icon: Bell,     href: "/offers",   color: "text-orange-600", bg: "bg-orange-50" },
  { label: "Create Offer",      icon: Tag,      href: "/offers",   color: "text-red-600",    bg: "bg-red-50" },
  { label: "View Reports",      icon: FileText, href: "/analytics",color: "text-cyan-600",   bg: "bg-cyan-50" },
];

// ─── Recent Orders ────────────────────────────────────────────────────
const RECENT_ORDERS = [
  { id: "OR125689", customer: "Ramesh Kumar",  type: "Food Delivery",  amount: "₹ 350", status: "delivered", time: "10:30 AM" },
  { id: "OR125688", customer: "Swathi Reddy",  type: "Grocery",        amount: "₹ 950", status: "in_progress",time: "10:28 AM" },
  { id: "OR125687", customer: "Vikram Singh",  type: "Ride Booking",   amount: "₹ 260", status: "in_progress",time: "10:25 AM" },
  { id: "OR125686", customer: "Anil Kumar",    type: "Parcel Delivery",amount: "₹ 150", status: "delivered", time: "10:20 AM" },
  { id: "OR125685", customer: "Meena Devi",    type: "Home Service",   amount: "₹ 450", status: "pending",   time: "10:18 AM" },
];

// ─── Top Vendors ──────────────────────────────────────────────────────
const TOP_VENDORS = [
  { name: "Paradise Biryani",    cat: "Food",    orders: 745, rating: 4.7, revenue: "₹ 1,45,780" },
  { name: "More Super Market",   cat: "Grocery", orders: 632, rating: 4.6, revenue: "₹ 1,12,430" },
  { name: "Sri Sai Travels",     cat: "Ride",    orders: 532, rating: 4.5, revenue: "₹ 86,540" },
  { name: "Quick Parcel Hub",    cat: "Parcel",  orders: 412, rating: 4.4, revenue: "₹ 56,780" },
  { name: "VR Home Services",    cat: "Home",    orders: 385, rating: 4.6, revenue: "₹ 48,320" },
];

// ─── Notifications ────────────────────────────────────────────────────
const NOTIFS = [
  { emoji: "🏪", text: "New vendor registration", sub: "Paradise Biryani, Kukatpally", time: "2 min ago", bg: "bg-green-100" },
  { emoji: "🛍️", text: "New order received",       sub: "Order #OR125689",              time: "5 min ago", bg: "bg-blue-100" },
  { emoji: "💰", text: "Payout processed",         sub: "₹2,45,680 to 42 vendors",     time: "15 min ago",bg: "bg-purple-100" },
  { emoji: "⚠️", text: "New complaint received",   sub: "Order #OR125012",              time: "20 min ago",bg: "bg-red-100" },
  { emoji: "🔔", text: "System update",            sub: "App version 2.4.1 released",   time: "1 hr ago",  bg: "bg-amber-100" },
];

const STATUS_MAP: Record<string, string> = {
  "delivered":   "Delivered",
  "in_progress": "On Trip",
  "pending":     "Scheduled",
};
const STATUS_STYLE: Record<string, string> = {
  "delivered":   "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "in_progress": "bg-amber-50  text-amber-700  border border-amber-200",
  "pending":     "bg-blue-50   text-blue-700   border border-blue-200",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  useEffect(() => { api.admin.stats().then(setStats).catch(() => {}); }, []);
  const KPI_CARDS = buildKpiCards(stats);

  return (
    <div className="space-y-4 animate-fade-in">

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="text-[10px] font-bold text-gray-400 tracking-widest mb-1">{card.label}</div>
                <div className="text-2xl font-bold text-gray-900 leading-tight">{card.value}</div>
                <div className="flex items-center gap-1 mt-1.5">
                  <TrendingUp size={12} className="text-emerald-500" />
                  <span className="text-[11px] font-semibold text-emerald-600">↑ {card.trend}</span>
                  <span className="text-[11px] text-gray-400">vs yesterday</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-sm flex-shrink-0`}>
                <Icon size={22} className="text-white" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Service Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {SERVICE_STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={16} className={s.color} />
              </div>
              <div>
                <div className="text-base font-bold text-gray-900 leading-tight">{s.value}</div>
                <div className="text-[9px] font-bold text-gray-400 tracking-wider leading-tight">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Middle Row: Charts + Live + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Revenue Overview */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="text-sm font-bold text-gray-900">Revenue Overview</div>
              <div className="text-xs text-gray-400 mt-0.5">Total Revenue</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xl font-bold text-gray-900">₹ 12,45,360</span>
                <span className="flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  <TrendingUp size={10} /> 22.8%
                </span>
              </div>
            </div>
            <button className="flex items-center gap-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 hover:border-purple-300 transition-colors">
              This Month <ChevronDown size={12} />
            </button>
          </div>
          <div className="h-44 mt-2">
            <DynamicRevenueChart />
          </div>
        </div>

        {/* Orders Summary */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-gray-900">Orders Summary</div>
          </div>
          <DynamicOrdersChart />
        </div>

        {/* Live Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-gray-900">Live Overview</div>
            <button className="text-[10px] font-semibold text-white bg-purple-600 hover:bg-purple-700 px-2.5 py-1 rounded-lg transition-colors">View Map</button>
          </div>
          <div className="space-y-2.5">
            {LIVE_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={13} className={item.color} />
                  </div>
                  <span className="text-xs text-gray-600 flex-1 leading-tight">{item.label}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-gray-900 tabular-nums">{item.value}</span>
                    <Circle size={6} className="text-emerald-500 fill-emerald-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions + Notifications */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="text-sm font-bold text-gray-900 mb-3">Quick Actions</div>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map((a) => {
                const Icon = a.icon;
                return (
                  <a key={a.label} href={a.href} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group cursor-pointer">
                    <div className={`w-9 h-9 rounded-xl ${a.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon size={16} className={a.color} />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight">{a.label}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-gray-900">Recent Notifications</div>
              <button className="text-[10px] text-purple-600 font-semibold hover:underline">View All</button>
            </div>
            <div className="space-y-2.5 overflow-hidden">
              {NOTIFS.slice(0, 4).map((n, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className={`w-7 h-7 rounded-lg ${n.bg} flex items-center justify-center text-sm flex-shrink-0`}>{n.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-gray-800 leading-tight truncate">{n.text}</div>
                    <div className="text-[10px] text-gray-400 truncate">{n.sub}</div>
                  </div>
                  <div className="text-[9px] text-gray-400 flex-shrink-0 mt-0.5 whitespace-nowrap">{n.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Recent Orders */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <div className="text-sm font-bold text-gray-900">Recent Orders</div>
            <a href="/orders" className="text-xs text-purple-600 font-semibold hover:underline">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {["Order ID","Customer","Service Type","Amount","Status","Time"].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_ORDERS.map((o) => (
                  <tr key={o.id} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors cursor-pointer">
                    <td className="px-3 py-2.5">
                      <span className="text-xs font-bold text-purple-600">#{o.id}</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-800 font-medium whitespace-nowrap">{o.customer}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{o.type}</td>
                    <td className="px-3 py-2.5 text-xs font-bold text-gray-900 whitespace-nowrap">{o.amount}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLE[o.status]}`}>
                        {STATUS_MAP[o.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-400 whitespace-nowrap">{o.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performing Vendors */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <div className="text-sm font-bold text-gray-900">Top Performing Vendors</div>
            <a href="/vendors" className="text-xs text-purple-600 font-semibold hover:underline">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {["Vendor","Category","Orders","Rating","Revenue"].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOP_VENDORS.map((v) => (
                  <tr key={v.name} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors cursor-pointer">
                    <td className="px-3 py-2.5">
                      <div className="text-xs font-semibold text-gray-800 whitespace-nowrap">{v.name}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">{v.cat}</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs font-bold text-gray-900">{v.orders}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-0.5">
                        <span className="text-amber-400 text-xs">★</span>
                        <span className="text-xs font-semibold text-gray-800">{v.rating}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-xs font-bold text-gray-900 whitespace-nowrap">{v.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue by Service */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-bold text-gray-900">Revenue by Service</div>
            <button className="flex items-center gap-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-600">
              This Month <ChevronDown size={11} />
            </button>
          </div>
          <DynamicServiceChart />
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-2">
        <p className="text-[11px] text-gray-400">
          © 2025 ZOOLI Super Admin Panel. All rights reserved. &nbsp; Made with ❤️ for{" "}
          <span className="font-bold text-gray-600">ZOOLI</span>
        </p>
      </div>

    </div>
  );
}
