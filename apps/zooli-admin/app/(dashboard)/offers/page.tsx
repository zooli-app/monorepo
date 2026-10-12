"use client";

import { useState } from "react";
import {
  Tag, Plus, ToggleLeft, ToggleRight, Copy, Pencil, Trash2,
  CheckCircle, Clock, TrendingUp, Percent,
} from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { SectionCard, PageHeader } from "@/components/shared/PageHeader";
import { coupons } from "@/lib/mock-data";
import { formatDate, formatCurrencyFull, SERVICE_EMOJI } from "@/lib/utils";
import type { ServiceType } from "@/lib/types";

export default function OffersPage() {
  const [couponList, setCouponList] = useState(coupons);
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState("");

  function toggleCoupon(id: string) {
    setCouponList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  }

  function copyCode(code: string) {
    setCopied(code);
    setTimeout(() => setCopied(""), 2000);
  }

  const active = couponList.filter((c) => c.isActive).length;
  const totalRedemptions = couponList.reduce((a, c) => a + c.usedCount, 0);
  const totalUsageLimit = couponList.reduce((a, c) => a + c.usageLimit, 0);
  const fillRate = Math.round((totalRedemptions / totalUsageLimit) * 100);

  return (
    <div>
      <PageHeader
        title="Offers & Coupons"
        description="Create and manage promotional offers across all services"
        actions={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} />
            New Offer
          </button>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <MetricCard label="Active Offers" value={active.toString()} sub={`${couponList.length - active} paused`} icon={Tag} iconBg="#EDE9FE" iconColor="#6D28D9" />
        <MetricCard label="Total Redemptions" value={totalRedemptions.toLocaleString("en-IN")} trend={{ value: 22, label: "vs last month" }} icon={CheckCircle} iconBg="#D1FAE5" iconColor="#059669" />
        <MetricCard label="Usage Fill Rate" value={`${fillRate}%`} sub="Across all active coupons" icon={TrendingUp} iconBg="#FEF3C7" iconColor="#D97706" />
        <MetricCard label="Avg Discount" value="₹87" sub="Per redemption" icon={Percent} iconBg="#DBEAFE" iconColor="#2563EB" />
      </div>

      {/* Create Coupon Form */}
      {showForm && (
        <SectionCard title="Create New Offer" className="mb-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Offer Title</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400" placeholder="e.g. 50% OFF on Food" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Coupon Code</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400 uppercase" placeholder="e.g. FOOD50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Discount Type</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400">
                <option>Percentage (%)</option>
                <option>Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Discount Value</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400" type="number" placeholder="e.g. 50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Min Order Value (₹)</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400" type="number" placeholder="e.g. 200" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Max Discount (₹)</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400" type="number" placeholder="e.g. 150 (optional)" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Usage Limit</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400" type="number" placeholder="e.g. 1000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Expiry Date</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400" type="date" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Applicable Services</label>
              <div className="flex flex-wrap gap-2">
                {(["food","grocery","rides","home","shifting","parcel","tuition","hotel","resort"] as ServiceType[]).map((s) => (
                  <label key={s} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-purple-300 transition-colors">
                    <input type="checkbox" className="accent-purple-600" />
                    <span className="text-xs text-gray-700">{SERVICE_EMOJI[s]} {s.charAt(0).toUpperCase() + s.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="col-span-2 flex gap-3 pt-1">
              <button className="bg-purple-700 hover:bg-purple-800 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
                Create Offer
              </button>
              <button onClick={() => setShowForm(false)} className="border border-gray-200 text-gray-600 text-sm font-medium px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Coupon Cards */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {couponList.map((coupon) => {
          const usagePct = Math.round((coupon.usedCount / coupon.usageLimit) * 100);
          const isExpired = new Date(coupon.expiresAt) < new Date();

          return (
            <div
              key={coupon.id}
              className={`bg-white rounded-xl border shadow-sm p-5 transition-all ${
                coupon.isActive ? "border-gray-100" : "border-gray-200 opacity-70"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-2xl font-bold text-purple-700">{coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} OFF</div>
                  <div className="text-sm font-semibold text-gray-900 mt-0.5">{coupon.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{coupon.description}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${coupon.isActive && !isExpired ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-500"}`}>
                    {isExpired ? "Expired" : coupon.isActive ? "Live" : "Paused"}
                  </span>
                  <button onClick={() => toggleCoupon(coupon.id)} className={coupon.isActive ? "text-purple-600" : "text-gray-300"}>
                    {coupon.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                </div>
              </div>

              {/* Code */}
              <div className="flex items-center gap-2 bg-gray-50 border border-dashed border-gray-300 rounded-lg px-3 py-2 mb-3">
                <code className="text-sm font-bold text-gray-700 flex-1 tracking-wider">{coupon.code}</code>
                <button
                  onClick={() => copyCode(coupon.code)}
                  className="text-gray-400 hover:text-purple-600 transition-colors"
                >
                  {copied === coupon.code ? <CheckCircle size={15} className="text-emerald-500" /> : <Copy size={15} />}
                </button>
              </div>

              {/* Usage */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">{coupon.usedCount.toLocaleString("en-IN")} / {coupon.usageLimit.toLocaleString("en-IN")} used</span>
                  <span className="font-semibold text-gray-700">{usagePct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${usagePct > 80 ? "bg-amber-500" : "bg-purple-500"}`}
                    style={{ width: `${usagePct}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={11} />
                  Expires {formatDate(coupon.expiresAt)}
                </div>
                <div className="flex items-center gap-1">
                  {coupon.minOrderValue > 0 && (
                    <span className="text-[10px] text-gray-400 mr-1">Min {formatCurrencyFull(coupon.minOrderValue)}</span>
                  )}
                  <button className="text-gray-400 hover:text-purple-600 p-1 rounded transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Redemption History */}
      <SectionCard title="Recent Redemptions" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {["User","Coupon Code","Service","Original","Discount","Final","Date"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { user: "Ravi Kumar", code: "EAT40", service: "🍔 Food", original: 800, discount: 150, final: 650, date: "25 May" },
                { user: "Priya Sharma", code: "RIDE50", service: "🚗 Rides", original: 220, discount: 50, final: 170, date: "25 May" },
                { user: "Suresh Babu", code: "GROC100", service: "🥦 Grocery", original: 1240, discount: 100, final: 1140, date: "25 May" },
                { user: "Anil Reddy", code: "EAT40", service: "🍔 Food", original: 600, discount: 150, final: 450, date: "24 May" },
              ].map((r, i) => (
                <tr key={i} className="border-t border-gray-50 table-row-hover transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.user}</td>
                  <td className="px-4 py-3"><code className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-semibold">{r.code}</code></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.service}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 line-through">{formatCurrencyFull(r.original)}</td>
                  <td className="px-4 py-3 text-sm text-emerald-600 font-semibold">-{formatCurrencyFull(r.discount)}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{formatCurrencyFull(r.final)}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
