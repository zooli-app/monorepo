"use client";

import Link from "next/link";
import { ClipboardList, IndianRupee, ShoppingBag, Store, Users } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { PageHeader, SectionCard } from "@/components/shared/PageHeader";
import { EmptyState, ErrorBox, OrderPill, Spinner, td, th } from "@/components/shared/ui";
import { DynamicDonut, DynamicTrend } from "@/components/dashboard/DynamicCharts";
import { api } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { formatCurrencyFull, timeAgo } from "@/lib/utils";
import { ordersSeries, revenueSeries, rupee, statusDonut } from "@/lib/chartData";

export default function DashboardPage() {
  const { data, error, loading, reload } = useLoad(async () => {
    const [stats, analytics, orders, pending] = await Promise.all([
      api.admin.stats(), api.admin.analytics(30), api.admin.orders(), api.admin.applications({ status: "pending" }),
    ]);
    return { stats, analytics, orders: orders.orders, pending: pending.applications };
  });

  if (loading) return <Spinner />;
  if (error || !data) return <ErrorBox error={error ?? "No data"} onRetry={reload} />;
  const { stats, analytics, orders, pending } = data;
  const noActivity = analytics.totals.orders === 0;

  return (
    <div className="space-y-5">
      <PageHeader title="Dashboard" description="Live numbers from your platform" />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Total orders" value={stats.orders.toLocaleString("en-IN")} icon={ShoppingBag} iconBg="#EDE9FE" iconColor="#6D28D9" />
        <MetricCard label="Revenue (excl. cancelled)" value={formatCurrencyFull(stats.revenue)} icon={IndianRupee} iconBg="#D1FAE5" iconColor="#059669" />
        <MetricCard label="Registered users" value={stats.users.toLocaleString("en-IN")} icon={Users} iconBg="#DBEAFE" iconColor="#2563EB" />
        <MetricCard label="Stores / vendors" value={stats.stores.toLocaleString("en-IN")} icon={Store} iconBg="#FFEDD5" iconColor="#EA580C" />
        <Link href="/applications" className="block">
          <MetricCard label="Applications to review" value={String(pending.length)} sub={pending.length ? "Needs your attention" : "All caught up"} icon={ClipboardList} iconBg="#FEF3C7" iconColor="#D97706" />
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <SectionCard title="Revenue — last 30 days" className="lg:col-span-2">
          {noActivity ? <EmptyState title="No orders in the last 30 days" text="Charts fill in automatically as orders come in." />
            : <DynamicTrend data={revenueSeries(analytics)} format={rupee} />}
        </SectionCard>
        <SectionCard title="Orders by status (30 days)">
          {noActivity && Object.keys(analytics.orderStatus).length === 0
            ? <EmptyState title="No orders yet" />
            : <DynamicDonut data={statusDonut(analytics.orderStatus)} />}
        </SectionCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <SectionCard title="Orders per day — last 30 days" className="lg:col-span-2">
          {noActivity ? <EmptyState title="No orders yet" /> : <DynamicTrend data={ordersSeries(analytics)} kind="bar" color="#F59E0B" />}
        </SectionCard>
        <SectionCard title="Top vendors by revenue (30 days)">
          {analytics.topStores.length === 0 ? <EmptyState title="No vendor sales yet" /> : (
            <ul className="divide-y divide-gray-50">
              {analytics.topStores.map((s, i) => (
                <li key={s.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-50 text-purple-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="flex-1 min-w-0 truncate font-medium text-gray-800">{s.name}</span>
                  <span className="text-xs text-gray-400">{s.orders} orders</span>
                  <b className="text-gray-900">{rupee(s.revenue)}</b>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Recent orders" noPadding actions={<Link href="/orders" className="text-xs font-semibold text-purple-700 hover:underline">View all</Link>}>
        {orders.length === 0 ? <EmptyState title="No orders yet" text="Orders placed by customers will show up here." /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-50"><th className={th}>Order</th><th className={th}>Customer</th><th className={th}>Store</th><th className={th}>Amount</th><th className={th}>Status</th><th className={th}>Placed</th></tr></thead>
              <tbody>
                {orders.slice(0, 8).map((o) => (
                  <tr key={o.id} className="border-b border-gray-50">
                    <td className={`${td} font-mono text-xs`}>#{o.id.slice(0, 8).toUpperCase()}</td>
                    <td className={td}>{o.profiles?.full_name || o.profiles?.phone || "—"}</td>
                    <td className={td}>{o.stores?.name ?? "—"}</td>
                    <td className={`${td} font-semibold`}>{formatCurrencyFull(Number(o.total))}</td>
                    <td className={td}><OrderPill status={o.status} /></td>
                    <td className={`${td} text-gray-400`}>{timeAgo(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
