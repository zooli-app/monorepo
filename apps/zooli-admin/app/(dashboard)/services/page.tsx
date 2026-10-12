"use client";

import { useState } from "react";
import { Grid3x3, TrendingUp, Store, ShoppingBag, Plus, Settings, ToggleLeft, ToggleRight } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { SectionCard, PageHeader } from "@/components/shared/PageHeader";
import { serviceCategories } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function ServicesPage() {
  const [categories, setCategories] = useState(serviceCategories);

  function toggleService(id: string) {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  }

  const activeCount = categories.filter((c) => c.isActive).length;
  const totalVendors = categories.reduce((a, c) => a + c.vendorCount, 0);
  const totalOrders = categories.reduce((a, c) => a + c.orderCount, 0);
  const totalRevenue = categories.reduce((a, c) => a + c.revenue, 0);

  return (
    <div>
      <PageHeader
        title="All Services"
        description="Manage service categories and their availability"
        actions={
          <button className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus size={15} />
            Add Category
          </button>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Categories" value={categories.length.toString()} sub={`${activeCount} active`} icon={Grid3x3} iconBg="#EDE9FE" iconColor="#6D28D9" />
        <MetricCard label="Total Vendors" value={totalVendors.toString()} sub="Across all services" icon={Store} iconBg="#D1FAE5" iconColor="#059669" />
        <MetricCard label="Total Orders (Month)" value={totalOrders.toLocaleString("en-IN")} trend={{ value: 14, label: "vs last month" }} icon={ShoppingBag} iconBg="#FEF3C7" iconColor="#D97706" />
        <MetricCard label="Total Revenue (Month)" value={formatCurrency(totalRevenue)} trend={{ value: 12, label: "vs last month" }} icon={TrendingUp} iconBg="#DBEAFE" iconColor="#2563EB" />
      </div>

      {/* Grid of service cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`bg-white rounded-xl border shadow-sm p-5 transition-all ${
              cat.isActive ? "border-gray-100" : "border-gray-200 opacity-70"
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl ${cat.isActive ? "bg-purple-50" : "bg-gray-100"}`}>
                  {cat.emoji}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{cat.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{cat.vendorCount} vendors · {cat.commission}% comm.</div>
                </div>
              </div>
              <button
                onClick={() => toggleService(cat.id)}
                className={`transition-colors ${cat.isActive ? "text-purple-600 hover:text-purple-800" : "text-gray-300 hover:text-gray-500"}`}
                title={cat.isActive ? "Disable service" : "Enable service"}
              >
                {cat.isActive ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-2.5">
                <div className="text-[10px] text-gray-400 mb-0.5">Orders / Month</div>
                <div className="text-base font-bold text-gray-900">{cat.orderCount.toLocaleString("en-IN")}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <div className="text-[10px] text-gray-400 mb-0.5">Revenue</div>
                <div className="text-base font-bold text-gray-900">{formatCurrency(cat.revenue)}</div>
              </div>
            </div>

            {/* Revenue bar */}
            <div className="mt-3">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${cat.isActive ? "bg-purple-500" : "bg-gray-300"}`}
                  style={{ width: `${Math.min((cat.revenue / totalRevenue) * 100 * 4, 100)}%` }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                {cat.isActive ? "● Active" : "○ Inactive"}
              </span>
              <button className="text-gray-400 hover:text-purple-600 transition-colors">
                <Settings size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Service Performance Table */}
      <SectionCard title="Service Performance Breakdown" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {["Service","Vendors","Orders","Revenue","Commission","Avg Order","Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-t border-gray-50 table-row-hover transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.emoji}</span>
                      <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{cat.vendorCount}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{cat.orderCount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(cat.revenue)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{cat.commission}%</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {cat.orderCount > 0 ? formatCurrency(Math.round(cat.revenue / cat.orderCount)) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${cat.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
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
