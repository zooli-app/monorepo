"use client";
import { useEffect, useState } from "react";
import { Check, X, Phone, MapPin, RefreshCw, ShoppingBag, Clock, ChevronDown, Printer, MessageSquare } from "lucide-react";
import { fmtFull, timeAgo } from "@/lib/utils";
import { api } from "@/lib/api";
import type { VendorOrder, OrderStatus } from "@zooli/api-client";

// UI tab/status vocabulary mapped onto the real backend's order_status enum
// (pending/confirmed/preparing/ready_for_pickup/out_for_delivery/delivered/cancelled).
const TABS = [
  { key: "new",       label: "New Orders", statuses: ["pending"],                                    color: "text-blue-600",    activeBg: "border-blue-500 bg-blue-50/50" },
  { key: "active",    label: "Active",     statuses: ["confirmed","preparing","ready_for_pickup","out_for_delivery"], color: "text-amber-600", activeBg: "border-amber-500 bg-amber-50/50" },
  { key: "completed", label: "Completed",  statuses: ["delivered"],                                   color: "text-emerald-600", activeBg: "border-emerald-500 bg-emerald-50/50" },
  { key: "cancelled", label: "Cancelled",  statuses: ["cancelled"],                                   color: "text-red-600",     activeBg: "border-red-400 bg-red-50/30" },
];

// "Accept" a pending order = confirm it. Delivery handoff (out_for_delivery)
// only ever happens via a driver's claim, not a vendor status push — see
// apps/api/app/api/orders/[orderId]/claim — so it's not in this map.
const NEXT: Partial<Record<string, OrderStatus>> = {
  confirmed: "preparing", preparing: "ready_for_pickup",
};
const NEXT_LABEL: Partial<Record<string, string>> = {
  confirmed: "Mark Preparing", preparing: "Mark Ready for Pickup",
};
const ST_STYLE: Record<string, string> = {
  pending: "bg-blue-50 text-blue-700 border border-blue-200",
  confirmed: "bg-purple-50 text-purple-700 border border-purple-200",
  preparing: "bg-amber-50 text-amber-700 border border-amber-200",
  ready_for_pickup: "bg-teal-50 text-teal-700 border border-teal-200",
  out_for_delivery: "bg-orange-50 text-orange-700 border border-orange-200",
  delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border border-red-200",
};
const ST_LABEL: Record<string, string> = {
  pending: "New", confirmed: "Accepted", preparing: "Preparing", ready_for_pickup: "Ready",
  out_for_delivery: "Out for Delivery", delivered: "Delivered", cancelled: "Cancelled",
};
const COMMISSION_RATE = 0.15;

export default function OrdersPage() {
  const [orderList, setOrderList] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("new");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function load() {
    setError("");
    try {
      const { orders } = await api.vendor.orders();
      setOrderList(orders);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const currentStatuses = TABS.find(t => t.key === activeTab)?.statuses ?? [];
  const filtered = orderList.filter(o => currentStatuses.includes(o.status));

  async function updateStatus(id: string, status: OrderStatus) {
    setOrderList(p => p.map(o => o.id === id ? { ...o, status } : o));
    try { await api.orders.updateStatus(id, status); } catch { load(); }
  }
  function toggleExpand(id: string) { setExpandedId(prev => prev === id ? null : id); }

  if (loading) {
    return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-4 max-w-[1400px]">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">{error}</div>}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-400">
            {orderList.filter(o => o.status === "pending").length} new · {orderList.filter(o => ["confirmed","preparing","ready_for_pickup","out_for_delivery"].includes(o.status)).length} active
          </p>
        </div>
        <button onClick={load} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto flex-shrink-0">
          {TABS.map(tab => {
            const cnt = orderList.filter(o => tab.statuses.includes(o.status)).length;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                  isActive ? `${tab.activeBg} ${tab.color} border-current` : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}>
                {tab.label}
                {cnt > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-current/10 text-current" : "bg-gray-200 text-gray-600"}`}>
                    {cnt}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <ShoppingBag size={44} className="text-gray-200 mb-3" />
            <div className="text-sm font-semibold text-gray-400">No {TABS.find(t => t.key === activeTab)?.label.toLowerCase()} right now</div>
            <div className="text-xs text-gray-300 mt-1">New orders will appear here automatically</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(order => {
              const expanded = expandedId === order.id;
              const elapsedMin = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000);
              const commission = Math.round(order.total * COMMISSION_RATE * 100) / 100;
              const net = Math.round((order.total - commission) * 100) / 100;
              const shortId = order.id.slice(0, 8);

              return (
                <div key={order.id} className={`transition-colors ${order.status === "pending" ? "bg-blue-50/20" : ""}`}>
                  <div className="p-4 cursor-pointer hover:bg-gray-50/50" onClick={() => toggleExpand(order.id)}>
                    <div className="flex items-start gap-4 flex-wrap">
                      <div className="flex-shrink-0">
                        <div className="text-sm font-bold text-purple-600">#{shortId}</div>
                        <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${ST_STYLE[order.status]}`}>
                          {ST_LABEL[order.status]}
                        </span>
                      </div>

                      <div className="flex-1 min-w-[160px]">
                        <div className="text-sm font-bold text-gray-900">{order.profiles?.full_name ?? "Customer"}</div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          {order.profiles?.phone && <span className="flex items-center gap-1 text-xs text-gray-500"><Phone size={11} /> {order.profiles.phone}</span>}
                          {order.addresses && <span className="flex items-center gap-1 text-xs text-gray-500"><MapPin size={11} /> {order.addresses.line1}, {order.addresses.city}</span>}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold text-gray-900">{fmtFull(order.total)}</div>
                        <div className="flex items-center gap-1 justify-end text-xs text-gray-400 mt-0.5">
                          <Clock size={11} />
                          {elapsedMin < 60 ? `${elapsedMin}m ago` : timeAgo(order.created_at)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        {order.status === "pending" && (
                          <>
                            <button onClick={() => updateStatus(order.id, "confirmed")}
                              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors shadow-sm">
                              <Check size={13} /> Accept
                            </button>
                            <button onClick={() => updateStatus(order.id, "cancelled")}
                              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold px-3 py-2 rounded-xl transition-colors">
                              <X size={13} /> Reject
                            </button>
                          </>
                        )}
                        {NEXT[order.status] && (
                          <button onClick={() => updateStatus(order.id, NEXT[order.status]!)}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap">
                            {NEXT_LABEL[order.status]}
                          </button>
                        )}
                        {order.status === "ready_for_pickup" && (
                          <span className="text-xs font-bold text-teal-600">Waiting for a driver to pick up...</span>
                        )}
                        {order.status === "out_for_delivery" && (
                          <span className="text-xs font-bold text-orange-600">Driver assigned — en route</span>
                        )}
                        {order.status === "delivered" && (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><Check size={12} /> Delivered</span>
                        )}
                        <ChevronDown size={16} className={`text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
                      </div>
                    </div>
                  </div>

                  {expanded && (
                    <div className="px-4 pb-4 bg-gray-50/50 border-t border-gray-100">
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Order Items</div>
                          <div className="space-y-1.5">
                            {(order.order_items ?? []).map((item, i) => (
                              <div key={i} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-3 py-2">
                                <div>
                                  <span className="text-xs font-bold text-gray-800">{item.qty}×</span>
                                  <span className="text-xs text-gray-700 ml-1.5">{item.name}</span>
                                </div>
                                <span className="text-xs font-semibold text-gray-900">{fmtFull(item.unit_price * item.qty)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Order Summary</div>
                          <div className="bg-white border border-gray-100 rounded-xl p-3 space-y-2">
                            <div className="flex justify-between text-xs"><span className="text-gray-500">Subtotal</span><span className="font-medium">{fmtFull(order.total)}</span></div>
                            <div className="flex justify-between text-xs"><span className="text-gray-500">Platform Commission (15%)</span><span className="text-red-600 font-medium">-{fmtFull(commission)}</span></div>
                            <div className="border-t border-gray-100 pt-2 flex justify-between text-sm font-bold"><span>Your Earning</span><span className="text-emerald-600">{fmtFull(net)}</span></div>
                          </div>
                          <button className="mt-2 w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 text-xs font-semibold py-2 rounded-xl hover:bg-gray-50 transition-colors">
                            <Printer size={13} /> Print Order
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
