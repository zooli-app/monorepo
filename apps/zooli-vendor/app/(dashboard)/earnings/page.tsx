"use client";
import { useEffect, useState } from "react";
import { IndianRupee, Clock } from "lucide-react";
import { DynMonthlyRevenue, DynWeeklyRevenue } from "@/components/dashboard/DynamicCharts";
import { fmt, fmtFull } from "@/lib/utils";
import { api } from "@/lib/api";
import type { VendorOrder } from "@zooli/api-client";

const sameDay = (iso: string, d: Date) => new Date(iso).toDateString() === d.toDateString();

export default function EarningsPage() {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [rate, setRate] = useState(15);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("week");

  useEffect(() => {
    Promise.all([api.vendor.orders(), api.vendor.getStore()])
      .then(([o, s]) => { setOrders(o.orders); if (s.store?.commission_rate != null) setRate(s.store.commission_rate); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>;
  }

  const live = orders.filter((o) => o.status !== "cancelled");
  const net = (o: VendorOrder) => o.total * (1 - rate / 100);

  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const day = live.filter((o) => sameDay(o.created_at, d));
    return { day: d.toLocaleDateString("en-IN", { weekday: "short" }), revenue: Math.round(day.reduce((a, o) => a + net(o), 0)), orders: day.length };
  });
  // Last 4 rolling 7-day buckets (oldest -> newest)
  const monthData = Array.from({ length: 4 }, (_, i) => {
    const end = new Date(); end.setHours(23, 59, 59, 999); end.setDate(end.getDate() - (3 - i) * 7);
    const start = new Date(end); start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0);
    const b = live.filter((o) => { const t = new Date(o.created_at); return t >= start && t <= end; });
    return { week: `Wk ${i + 1}`, revenue: Math.round(b.reduce((a, o) => a + net(o), 0)), orders: b.length };
  });
  const weekRev = weekData.reduce((a, d) => a + d.revenue, 0);
  const weekOrders = weekData.reduce((a, d) => a + d.orders, 0);
  const monthRev = monthData.reduce((a, d) => a + d.revenue, 0);
  const monthOrders = monthData.reduce((a, d) => a + d.orders, 0);

  const delivered = orders.filter((o) => o.status === "delivered");
  const gross = delivered.reduce((a, o) => a + o.total, 0);
  const commission = gross * (rate / 100);
  const totalNet = gross - commission;

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Last 7 Days", value: fmt(weekRev), sub: `${weekOrders} orders`, grad: "from-purple-500 to-purple-700" },
          { label: "Last 4 Weeks", value: fmt(monthRev), sub: `${monthOrders} orders`, grad: "from-blue-500 to-blue-700" },
          { label: "Delivered Orders", value: delivered.length.toString(), sub: "All time", grad: "from-amber-400 to-orange-500" },
          { label: "Net Earnings", value: fmt(totalNet), sub: "Delivered, after commission", grad: "from-emerald-500 to-emerald-700" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${c.grad} flex items-center justify-center shadow-sm flex-shrink-0`}>
              <IndianRupee size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{c.label}</div>
              <div className="text-xl font-bold text-gray-900 leading-tight">{c.value}</div>
              <div className="text-[11px] text-gray-400">{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <div className="text-sm font-bold text-gray-900">Revenue Overview <span className="text-xs font-normal text-gray-400">(after commission)</span></div>
            <span className="text-xl font-bold text-gray-900">{period === "week" ? fmt(weekRev) : fmt(monthRev)}</span>
          </div>
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {["week", "month"].map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${period === p ? "bg-white text-purple-700 shadow-sm" : "text-gray-500"}`}>
                {p === "week" ? "7 Days" : "4 Weeks"}
              </button>
            ))}
          </div>
        </div>
        <div className="h-56">
          {period === "week" ? <DynWeeklyRevenue data={weekData} /> : <DynMonthlyRevenue data={monthData} />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="text-sm font-bold text-gray-900 mb-4">Earnings Breakdown (Delivered Orders)</div>
          <div className="space-y-3">
            {[
              { label: "Gross Revenue", value: gross, color: "text-gray-900", bg: "bg-gray-50" },
              { label: `Platform Fee (${rate}%)`, value: -commission, color: "text-red-600", bg: "bg-red-50" },
              { label: "Your Net Earnings", value: totalNet, color: "text-emerald-700", bg: "bg-emerald-50" },
            ].map((r) => (
              <div key={r.label} className={`flex items-center justify-between ${r.bg} rounded-xl px-4 py-3`}>
                <span className="text-sm text-gray-700 font-medium">{r.label}</span>
                <span className={`text-sm font-bold ${r.color}`}>{r.value < 0 ? `-${fmtFull(-r.value)}` : fmtFull(r.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="text-sm font-bold text-gray-900 mb-4">Payout History</div>
          <div className="flex flex-col items-center justify-center text-center py-10">
            <Clock size={32} className="text-gray-200 mb-3" />
            <div className="text-sm font-semibold text-gray-500">No payouts recorded yet</div>
            <div className="text-xs text-gray-400 mt-1 max-w-xs">Payout records will appear here once Zooli processes a settlement to your bank account.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
