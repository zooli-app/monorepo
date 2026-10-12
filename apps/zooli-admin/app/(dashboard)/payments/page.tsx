"use client";

import { useState } from "react";
import {
  CreditCard, TrendingUp, ArrowDownLeft, RefreshCw,
  Search, Download, Eye,
} from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { SectionCard, PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { transactions } from "@/lib/mock-data";
import { formatCurrencyFull, timeAgo } from "@/lib/utils";
import type { PaymentStatus } from "@/lib/types";

const PAYOUT_QUEUE = [
  { vendor: "Hotel Paradise", amount: 408000, orders: 1284, due: "28 May", status: "ready" },
  { vendor: "FreshMart Store", amount: 545600, orders: 892, due: "28 May", status: "ready" },
  { vendor: "Ravi Auto Services", amount: 114800, orders: 643, due: "31 May", status: "pending" },
  { vendor: "FixIt Pro", amount: 78400, orders: 312, due: "31 May", status: "pending" },
];

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

  const filtered = transactions.filter((t) => {
    const matchSearch =
      !search ||
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.orderId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || t.status === statusFilter;
    const matchMethod = !methodFilter || t.paymentMethod === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  });

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Track all transactions, commissions and vendor payouts"
        actions={
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={14} />
            Export Report
          </button>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <MetricCard label="Gross Revenue (Month)" value="₹45.2L" trend={{ value: 12, label: "vs last month" }} icon={TrendingUp} iconBg="#EDE9FE" iconColor="#6D28D9" />
        <MetricCard label="Platform Commission" value="₹6.8L" sub="15% avg commission" icon={CreditCard} iconBg="#D1FAE5" iconColor="#059669" />
        <MetricCard label="Vendor Payouts" value="₹38.4L" sub="Due this week: ₹11.4L" icon={ArrowDownLeft} iconBg="#FEF3C7" iconColor="#D97706" />
        <MetricCard label="Refunds Processed" value="₹1.2L" sub="42 refund orders" icon={RefreshCw} iconBg="#FEE2E2" iconColor="#DC2626" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {/* Payment method breakdown */}
        <SectionCard title="Payment Methods">
          <div className="space-y-3 mt-1">
            {[
              { method: "UPI", pct: 58, color: "#6D28D9", amount: "₹26.2L" },
              { method: "Cash on Delivery", pct: 22, color: "#F59E0B", amount: "₹9.9L" },
              { method: "Card", pct: 15, color: "#10B981", amount: "₹6.8L" },
              { method: "Wallet", pct: 5, color: "#3B82F6", amount: "₹2.3L" },
            ].map((pm) => (
              <div key={pm.method}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">{pm.method}</span>
                  <span className="text-gray-400">{pm.pct}% · {pm.amount}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pm.pct}%`, backgroundColor: pm.color }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Commission by service */}
        <SectionCard title="Commission by Service">
          <div className="space-y-2.5 mt-1">
            {[
              { service: "🍔 Food", comm: 283500, pct: 100 },
              { service: "🥦 Grocery", comm: 268800, pct: 95 },
              { service: "🚗 Rides", comm: 150480, pct: 53 },
              { service: "🏨 Hotel", comm: 499800, pct: 100 },
              { service: "🔧 Home", comm: 120000, pct: 42 },
            ].map((s) => (
              <div key={s.service} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-28 flex-shrink-0">{s.service}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-purple-500" style={{ width: `${s.pct}%` }} />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-14 text-right">{formatCurrencyFull(s.comm)}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Payout Queue */}
        <SectionCard title="Vendor Payout Queue" actions={<span className="text-xs text-amber-600 font-medium">{PAYOUT_QUEUE.filter(p => p.status === "ready").length} ready</span>}>
          <div className="space-y-2 mt-1">
            {PAYOUT_QUEUE.map((p) => (
              <div key={p.vendor} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-900 truncate">{p.vendor}</div>
                  <div className="text-[10px] text-gray-400">{p.orders} orders · Due {p.due}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-900">{formatCurrencyFull(p.amount)}</div>
                  <button className={`text-[10px] font-medium px-2 py-0.5 rounded-full mt-0.5 ${p.status === "ready" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {p.status === "ready" ? "Pay Now" : "Pending"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Transactions Table */}
      <SectionCard noPadding>
        <div className="flex items-center gap-3 p-4 border-b border-gray-50">
          <h3 className="font-semibold text-gray-900 text-sm">Transactions</h3>
          <div className="flex items-center gap-2 ml-4 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex-1 max-w-xs">
            <Search size={14} className="text-gray-400" />
            <input
              className="bg-transparent text-sm outline-none flex-1 placeholder-gray-400"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none ml-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="processing">Processing</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed</option>
          </select>
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none" value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
            <option value="">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
            <option value="Wallet">Wallet</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {["TXN ID","Order","Customer","Method","Amount","Commission","Net to Vendor","Status","Time",""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((txn) => (
                <tr key={txn.id} className="border-t border-gray-50 table-row-hover cursor-pointer transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{txn.id}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-purple-700">#{txn.orderId}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{txn.customerName}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs uppercase font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{txn.paymentMethod}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{formatCurrencyFull(txn.amount)}</td>
                  <td className="px-4 py-3 text-sm text-purple-600 font-semibold">{txn.commission > 0 ? formatCurrencyFull(txn.commission) : "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{txn.commission > 0 ? formatCurrencyFull(txn.amount - txn.commission) : "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge type="payment" status={txn.status as PaymentStatus} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{timeAgo(txn.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button className="text-gray-400 hover:text-purple-600 transition-colors">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
