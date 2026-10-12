"use client";

import { useState } from "react";
import { Car, IndianRupee, ShoppingBag, TrendingUp, UserPlus } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { PageHeader, SectionCard } from "@/components/shared/PageHeader";
import { EmptyState, ErrorBox, Spinner, td, th } from "@/components/shared/ui";
import { DynamicDonut, DynamicTrend } from "@/components/dashboard/DynamicCharts";
import { api } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { monthLabel, ordersSeries, revenueSeries, ridesSeries, rupee, statusDonut } from "@/lib/chartData";

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const { data: a, error, loading, reload } = useLoad(() => api.admin.analytics(days), [days]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Analytics" description="Computed from your real orders, rides and users"
        actions={
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm">
            <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option>
          </select>
        }
      />
      {loading && <Spinner />}
      {error && <ErrorBox error={error} onRetry={reload} />}
      {a && !loading && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard label="Orders" value={a.totals.orders.toLocaleString("en-IN")} sub="excl. cancelled" icon={ShoppingBag} iconBg="#EDE9FE" iconColor="#6D28D9" />
            <MetricCard label="Revenue" value={rupee(a.totals.revenue)} icon={IndianRupee} iconBg="#D1FAE5" iconColor="#059669" />
            <MetricCard label="Avg order value" value={rupee(a.totals.avgOrderValue)} icon={TrendingUp} iconBg="#FEF3C7" iconColor="#D97706" />
            <MetricCard label="Rides" value={a.rides.total.toLocaleString("en-IN")} sub={`${rupee(a.rides.revenue)} fares completed`} icon={Car} iconBg="#DBEAFE" iconColor="#2563EB" />
            <MetricCard label="New users (6 mo)" value={a.totals.newUsers.toLocaleString("en-IN")} icon={UserPlus} iconBg="#FFEDD5" iconColor="#EA580C" />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <SectionCard title="Revenue per day">{a.totals.orders ? <DynamicTrend data={revenueSeries(a)} format={rupee} /> : <EmptyState title="No orders in this period" />}</SectionCard>
            <SectionCard title="Orders per day">{a.totals.orders ? <DynamicTrend data={ordersSeries(a)} kind="bar" color="#F59E0B" /> : <EmptyState title="No orders in this period" />}</SectionCard>
            <SectionCard title="Rides per day">{a.rides.total ? <DynamicTrend data={ridesSeries(a)} kind="bar" color="#2563EB" /> : <EmptyState title="No rides in this period" />}</SectionCard>
            <SectionCard title="New users per month">
              <DynamicTrend data={a.userGrowth.map((u) => ({ label: monthLabel(u.month), value: u.count }))} kind="bar" color="#10B981" />
            </SectionCard>
            <SectionCard title="Orders by status">{Object.keys(a.orderStatus).length ? <DynamicDonut data={statusDonut(a.orderStatus)} /> : <EmptyState title="No orders in this period" />}</SectionCard>
            <SectionCard title="Rides by status">{a.rides.total ? <DynamicDonut data={statusDonut(a.rides.byStatus)} /> : <EmptyState title="No rides in this period" />}</SectionCard>
          </div>

          <SectionCard title="Top vendors" noPadding>
            {a.topStores.length === 0 ? <EmptyState title="No vendor sales in this period" /> : (
              <table className="w-full"><thead><tr className="border-b border-gray-50"><th className={th}>#</th><th className={th}>Vendor</th><th className={th}>Orders</th><th className={th}>Revenue</th></tr></thead>
                <tbody>{a.topStores.map((s, i) => (<tr key={s.id} className="border-b border-gray-50"><td className={td}>{i + 1}</td><td className={`${td} font-medium`}>{s.name}</td><td className={td}>{s.orders}</td><td className={`${td} font-semibold`}>{rupee(s.revenue)}</td></tr>))}</tbody></table>
            )}
          </SectionCard>
          <p className="text-[11px] text-gray-400">Metrics such as NPS, app-store rating, delivery time and retention aren&apos;t shown because the platform doesn&apos;t record that data yet.</p>
        </>
      )}
    </div>
  );
}
