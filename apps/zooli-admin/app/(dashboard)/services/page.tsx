"use client";

import { Bike, PackageCheck, Truck } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { PageHeader, SectionCard } from "@/components/shared/PageHeader";
import { EmptyState, ErrorBox, OrderPill, Pill, Spinner, td, th } from "@/components/shared/ui";
import { api } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { formatCurrencyFull, timeAgo } from "@/lib/utils";

const IN_FLIGHT = ["ready_for_pickup", "out_for_delivery"];

export default function DeliveryPage() {
  const { data, error, loading, reload } = useLoad(async () => {
    const [o, d] = await Promise.all([api.admin.orders(), api.admin.drivers()]);
    return { orders: o.orders, drivers: d.drivers };
  });

  const orders = data?.orders ?? [];
  const active = orders.filter((o) => IN_FLIGHT.includes(o.status));
  const driverName = (id: string | null) => data?.drivers.find((d) => d.id === id)?.profiles?.full_name ?? (id ? "Driver" : "Not assigned");

  return (
    <div className="space-y-5">
      <PageHeader title="Delivery Management" description="Orders on their way and your delivery partners" />
      {loading && <Spinner />}
      {error && <ErrorBox error={error} onRetry={reload} />}
      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Waiting for pickup" value={String(orders.filter((o) => o.status === "ready_for_pickup").length)} icon={PackageCheck} iconBg="#EDE9FE" iconColor="#6D28D9" />
            <MetricCard label="Out for delivery" value={String(orders.filter((o) => o.status === "out_for_delivery").length)} icon={Truck} iconBg="#CFFAFE" iconColor="#0891B2" />
            <MetricCard label="Delivered" value={String(orders.filter((o) => o.status === "delivered").length)} sub="in the latest 200 orders" icon={PackageCheck} iconBg="#D1FAE5" iconColor="#059669" />
            <MetricCard label="Drivers online" value={`${data.drivers.filter((d) => d.is_online).length} / ${data.drivers.length}`} icon={Bike} iconBg="#DBEAFE" iconColor="#2563EB" />
          </div>

          <SectionCard title="Deliveries in progress" noPadding>
            {active.length === 0 ? <EmptyState title="Nothing out for delivery right now" /> : (
              <div className="overflow-x-auto"><table className="w-full">
                <thead><tr className="border-b border-gray-50"><th className={th}>Order</th><th className={th}>Store</th><th className={th}>Customer</th><th className={th}>Driver</th><th className={th}>Amount</th><th className={th}>Status</th><th className={th}>Placed</th></tr></thead>
                <tbody>{active.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50">
                    <td className={`${td} font-mono text-xs`}>#{o.id.slice(0, 8).toUpperCase()}</td>
                    <td className={td}>{o.stores?.name ?? "—"}</td>
                    <td className={td}>{o.profiles?.full_name || o.profiles?.phone || "—"}</td>
                    <td className={td}>{driverName(o.driver_id)}</td>
                    <td className={`${td} font-semibold`}>{formatCurrencyFull(Number(o.total))}</td>
                    <td className={td}><OrderPill status={o.status} /></td>
                    <td className={`${td} text-gray-400`}>{timeAgo(o.created_at)}</td>
                  </tr>))}</tbody></table></div>
            )}
          </SectionCard>

          <SectionCard title="Delivery partners" noPadding>
            {data.drivers.length === 0 ? <EmptyState title="No drivers registered yet" text="Approved ride / parcel applicants appear here." /> : (
              <div className="overflow-x-auto"><table className="w-full">
                <thead><tr className="border-b border-gray-50"><th className={th}>Name</th><th className={th}>Phone</th><th className={th}>Vehicle</th><th className={th}>Rating</th><th className={th}>Status</th></tr></thead>
                <tbody>{data.drivers.map((d) => (
                  <tr key={d.id} className="border-b border-gray-50">
                    <td className={`${td} font-medium`}>{d.profiles?.full_name ?? "—"}</td>
                    <td className={td}>{d.profiles?.phone ?? "—"}</td>
                    <td className={td}>{d.vehicle_type} · {d.vehicle_number}</td>
                    <td className={td}>{d.rating_count ? `${d.rating_avg} (${d.rating_count})` : "No ratings"}</td>
                    <td className={td}><Pill tone={d.is_online ? "green" : "gray"}>{d.is_online ? "Online" : "Offline"}</Pill></td>
                  </tr>))}</tbody></table></div>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
