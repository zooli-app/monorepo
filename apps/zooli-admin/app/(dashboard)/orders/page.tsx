"use client";

import { useEffect, useState } from "react";
import { Search, Eye, RefreshCw, ShoppingBag, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { SectionCard, PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrencyFull, timeAgo } from "@/lib/utils";
import { api } from "@/lib/api";
import type { AdminOrder } from "@zooli/api-client";

// Zone and payment-method breakdowns don't exist in the schema yet
// (no zones table, no payment integration) — this table shows every real
// column the backend actually has: customer, store/service, amount,
// status, and time, across both verticals that share the `orders` table.
const ALL_STATUSES = [
  { label: "All Status", value: "" },
  { label: "Delivered", value: "delivered" },
  { label: "Out for Delivery", value: "out_for_delivery" },
  { label: "Preparing", value: "preparing" },
  { label: "Pending", value: "pending" },
  { label: "Cancelled", value: "cancelled" },
];
const COMMISSION_RATE = 0.15;

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  async function load() {
    setLoading(true);
    try {
      const { orders } = await api.admin.orders();
      setOrders(orders);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const filtered = orders.filter((o) => {
    const matchSearch = !search ||
      (o.profiles?.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.stores?.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const completed = orders.filter((o) => o.status === "delivered").length;
  const cancelled = orders.filter((o) => o.status === "cancelled").length;
  const avgValue = orders.length ? orders.reduce((a, o) => a + o.total, 0) / orders.length : 0;

  if (loading) {
    return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Every order across groceries and food delivery"
        actions={
          <button onClick={load} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <MetricCard label="Total Orders" value={orders.length.toString()} icon={ShoppingBag} iconBg="#EDE9FE" iconColor="#6D28D9" />
        <MetricCard label="Delivered" value={completed.toString()} sub={orders.length ? `${Math.round((completed / orders.length) * 100)}% completion rate` : undefined} icon={CheckCircle} iconBg="#D1FAE5" iconColor="#059669" />
        <MetricCard label="Cancelled" value={cancelled.toString()} sub={orders.length ? `${Math.round((cancelled / orders.length) * 100)}% cancellation rate` : undefined} icon={XCircle} iconBg="#FEE2E2" iconColor="#DC2626" />
        <MetricCard label="Avg Order Value" value={`₹${Math.round(avgValue)}`} icon={TrendingUp} iconBg="#FEF3C7" iconColor="#D97706" />
      </div>

      <SectionCard className="mb-5" noPadding>
        <div className="flex items-center gap-3 p-4 border-b border-gray-50">
          <div className="flex items-center gap-2 flex-1 max-w-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <Search size={14} className="text-gray-400" />
            <input className="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder-gray-400"
              placeholder="Search by order ID, customer, store..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-600 outline-none focus:border-purple-400"
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {ALL_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <span className="ml-auto text-xs text-gray-400">{filtered.length} results</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {["Order ID","Customer","Store","Service","Amount","Commission","Status","Time"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const commission = Math.round(order.total * COMMISSION_RATE * 100) / 100;
                return (
                <tr key={order.id} className="border-t border-gray-50 table-row-hover cursor-pointer transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-purple-700">#{order.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{order.profiles?.full_name ?? "Customer"}</div>
                    <div className="text-xs text-gray-400">{order.profiles?.phone ?? ""}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{order.stores?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap capitalize">
                    {order.stores?.category === "restaurant" ? "🍽️ Food" : "🛒 Grocery"}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">{formatCurrencyFull(order.total)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatCurrencyFull(commission)}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{order.status.replace(/_/g, " ")}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{timeAgo(order.created_at)}</td>
                  <td className="px-4 py-3">
                    <button className="text-gray-400 hover:text-purple-600 transition-colors"><Eye size={15} /></button>
                  </td>
                </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">No orders found matching your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
