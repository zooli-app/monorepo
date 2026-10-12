"use client";
import { useState } from "react";
import { IndianRupee, TrendingUp, Download, ChevronDown, CheckCircle, Clock } from "lucide-react";
import { DynMonthlyRevenue, DynWeeklyRevenue } from "@/components/dashboard/DynamicCharts";
import { payoutHistory, orders, revenueWeekData, revenueMonthData } from "@/lib/mock-data";
import { fmt, fmtFull, fmtDate } from "@/lib/utils";

export default function EarningsPage() {
  const [period, setPeriod] = useState("week");

  const weekRev   = revenueWeekData.reduce((a, d) => a + d.revenue, 0);
  const weekOrders= revenueWeekData.reduce((a, d) => a + d.orders, 0);
  const monthRev  = revenueMonthData.reduce((a, d) => a + d.revenue, 0);
  const monthOrders = revenueMonthData.reduce((a, d) => a + d.orders, 0);
  const pendingPayout = 42800;
  const totalPaid = payoutHistory.reduce((a, p) => a + p.amount, 0);

  const deliveredOrders = orders.filter(o => o.status === "delivered");
  const totalCommission = deliveredOrders.reduce((a, o) => a + o.commission, 0);
  const totalNet        = deliveredOrders.reduce((a, o) => a + o.net, 0);

  return (
    <div className="space-y-5 max-w-[1200px]">

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label:"This Week",        value:fmt(weekRev),      sub:`${weekOrders} orders`,            grad:"from-purple-500 to-purple-700" },
          { label:"This Month",       value:fmt(monthRev),     sub:`${monthOrders} orders`,           grad:"from-blue-500 to-blue-700" },
          { label:"Pending Payout",   value:fmtFull(pendingPayout), sub:"Processing — due Mon",      grad:"from-amber-400 to-orange-500" },
          { label:"Total Paid Out",   value:fmt(totalPaid),    sub:"All time",                        grad:"from-emerald-500 to-emerald-700" },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
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

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <div className="text-sm font-bold text-gray-900">Revenue Overview</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-bold text-gray-900">{period === "week" ? fmt(weekRev) : fmt(monthRev)}</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <TrendingUp size={10}/> +12.4%
              </span>
            </div>
          </div>
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {["week","month"].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${period === p ? "bg-white text-purple-700 shadow-sm" : "text-gray-500"}`}>
                {p === "week" ? "This Week" : "This Month"}
              </button>
            ))}
          </div>
        </div>
        <div className="h-56">
          {period === "week" ? <DynWeeklyRevenue /> : <DynMonthlyRevenue />}
        </div>
      </div>

      {/* Commission breakdown + payout history */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Commission breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="text-sm font-bold text-gray-900 mb-4">Earnings Breakdown (Today)</div>
          <div className="space-y-3">
            {[
              { label:"Gross Revenue",    value:deliveredOrders.reduce((a,o)=>a+o.total,0), color:"text-gray-900",   bg:"bg-gray-50"    },
              { label:"Platform Fee (15%)",value:-totalCommission,                           color:"text-red-600",   bg:"bg-red-50"     },
              { label:"Your Net Earnings", value:totalNet,                                   color:"text-emerald-700",bg:"bg-emerald-50" },
            ].map(r => (
              <div key={r.label} className={`flex items-center justify-between ${r.bg} rounded-xl px-4 py-3`}>
                <span className="text-sm text-gray-700 font-medium">{r.label}</span>
                <span className={`text-sm font-bold ${r.color}`}>{r.value < 0 ? `-${fmtFull(-r.value)}` : fmtFull(r.value)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Payment Methods</div>
            <div className="space-y-2">
              {[
                { method:"UPI",    pct:58, amount:totalNet * 0.58 },
                { method:"Cash",   pct:25, amount:totalNet * 0.25 },
                { method:"Card",   pct:12, amount:totalNet * 0.12 },
                { method:"Wallet", pct:5,  amount:totalNet * 0.05 },
              ].map(m => (
                <div key={m.method}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 font-medium">{m.method}</span>
                    <span className="text-gray-500">{m.pct}% · {fmtFull(m.amount)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width:`${m.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payout history */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="text-sm font-bold text-gray-900">Payout History</div>
            <button className="flex items-center gap-1.5 text-xs text-purple-600 font-semibold hover:underline">
              <Download size={12}/> Export
            </button>
          </div>

          {/* Pending payout card */}
          <div className="mx-4 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-amber-600" />
                  <span className="text-xs font-bold text-amber-700">Pending Payout</span>
                </div>
                <div className="text-xl font-bold text-gray-900 mt-1">{fmtFull(pendingPayout)}</div>
                <div className="text-xs text-gray-500 mt-0.5">26 May – 1 Jun 2026 · 98 orders</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full">Processing</span>
                <div className="text-[10px] text-gray-400 mt-1.5">Expected: Mon 3 Jun</div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-50 mt-3">
            {payoutHistory.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={16} className="text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-900">{p.period}</div>
                  <div className="text-[11px] text-gray-400">{p.orders} orders · UTR: {p.utr}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-emerald-700">{fmtFull(p.amount)}</div>
                  <div className="text-[10px] text-gray-400">{p.paidOn}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
