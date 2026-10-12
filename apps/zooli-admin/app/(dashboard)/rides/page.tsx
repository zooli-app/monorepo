"use client";

import { useMemo, useState } from "react";
import { Car, CheckCircle2, Radio, XCircle } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { PageHeader, SectionCard } from "@/components/shared/PageHeader";
import { EmptyState, ErrorBox, RidePill, Spinner, td, th } from "@/components/shared/ui";
import { api } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { formatCurrencyFull, timeAgo } from "@/lib/utils";

const ACTIVE = ["requested", "accepted", "arrived", "in_progress"];

export default function RidesPage() {
  const { data, error, loading, reload } = useLoad(async () => {
    const [r, d] = await Promise.all([api.admin.rides(), api.admin.drivers()]);
    return { rides: r.rides, drivers: d.drivers };
  });
  const [filter, setFilter] = useState("");

  const rides = data?.rides ?? [];
  const stats = useMemo(() => ({
    active: rides.filter((r) => ACTIVE.includes(r.status)).length,
    completed: rides.filter((r) => r.status === "completed").length,
    cancelled: rides.filter((r) => r.status === "cancelled").length,
    online: (data?.drivers ?? []).filter((d) => d.is_online).length,
  }), [rides, data]);
  const shown = filter ? rides.filter((r) => r.status === filter) : rides;

  return (
    <div className="space-y-5">
      <PageHeader title="Ride Management" description="Latest 200 rides and your drivers" />
      {loading && <Spinner />}
      {error && <ErrorBox error={error} onRetry={reload} />}
      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Active rides" value={String(stats.active)} icon={Car} iconBg="#DBEAFE" iconColor="#2563EB" />
            <MetricCard label="Completed" value={String(stats.completed)} icon={CheckCircle2} iconBg="#D1FAE5" iconColor="#059669" />
            <MetricCard label="Cancelled" value={String(stats.cancelled)} icon={XCircle} iconBg="#FEE2E2" iconColor="#DC2626" />
            <MetricCard label="Drivers online" value={`${stats.online} / ${data.drivers.length}`} icon={Radio} iconBg="#EDE9FE" iconColor="#6D28D9" />
          </div>

          <SectionCard title="Rides" noPadding actions={
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-8 rounded-lg border border-gray-200 px-2 text-xs">
              <option value="">All statuses</option>
              {["requested", "accepted", "arrived", "in_progress", "completed", "cancelled"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>}>
            {shown.length === 0 ? <EmptyState title="No rides yet" text="Rides requested through the customer app will appear here." /> : (
              <div className="overflow-x-auto"><table className="w-full">
                <thead><tr className="border-b border-gray-50"><th className={th}>Customer</th><th className={th}>Driver</th><th className={th}>Trip</th><th className={th}>Fare</th><th className={th}>Status</th><th className={th}>Requested</th></tr></thead>
                <tbody>{shown.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50">
                    <td className={td}>{r.customer?.full_name || r.customer?.phone || "—"}</td>
                    <td className={td}>{r.drivers?.profiles?.full_name || "Unassigned"}{r.drivers && <span className="block text-[11px] text-gray-400">{r.drivers.vehicle_number}</span>}</td>
                    <td className={`${td} max-w-[260px]`}><span className="block truncate">{r.pickup_address}</span><span className="block truncate text-gray-400 text-xs">→ {r.drop_address}</span></td>
                    <td className={`${td} font-semibold`}>{formatCurrencyFull(Number(r.fare_final ?? r.fare_estimate))}</td>
                    <td className={td}><RidePill status={r.status} /></td>
                    <td className={`${td} text-gray-400`}>{timeAgo(r.requested_at)}</td>
                  </tr>))}</tbody></table></div>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
