"use client";

import { Ban, CheckCircle2, Clock, Undo2 } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { PageHeader, SectionCard } from "@/components/shared/PageHeader";
import { EmptyState, ErrorBox, OrderPill, PayPill, Spinner, td, th } from "@/components/shared/ui";
import { api } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { formatCurrencyFull, timeAgo } from "@/lib/utils";
import { rupee } from "@/lib/chartData";

export default function PaymentsPage() {
  const { data, error, loading, reload } = useLoad(async () => {
    const [a, o, w] = await Promise.all([api.admin.analytics(30), api.admin.orders(), api.admin.wallets()]);
    return { a, orders: o.orders, wallets: w };
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Payments & Settlements" description="Order payments from the last 30 days" />
      {loading && <Spinner />}
      {error && <ErrorBox error={error} onRetry={reload} />}
      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Collected (paid)" value={rupee(data.a.payments.paid)} icon={CheckCircle2} iconBg="#D1FAE5" iconColor="#059669" />
            <MetricCard label="Awaiting payment" value={rupee(data.a.payments.unpaid)} icon={Clock} iconBg="#FEF3C7" iconColor="#D97706" />
            <MetricCard label="Refunded" value={rupee(data.a.payments.refunded)} icon={Undo2} iconBg="#DBEAFE" iconColor="#2563EB" />
            <MetricCard label="Failed" value={rupee(data.a.payments.failed)} icon={Ban} iconBg="#FEE2E2" iconColor="#DC2626" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Customer wallet balances" value={rupee(data.wallets.totalBalance)} />
            <MetricCard label="Cashback issued (all time)" value={rupee(data.wallets.totalCashback)} />
          </div>

          <SectionCard title="Recent order payments" noPadding>
            {data.orders.length === 0 ? <EmptyState title="No payments yet" text="Payments appear here as customers place orders." /> : (
              <div className="overflow-x-auto"><table className="w-full">
                <thead><tr className="border-b border-gray-50"><th className={th}>Order</th><th className={th}>Customer</th><th className={th}>Store</th><th className={th}>Amount</th><th className={th}>Payment</th><th className={th}>Order status</th><th className={th}>Date</th></tr></thead>
                <tbody>{data.orders.slice(0, 25).map((o) => (
                  <tr key={o.id} className="border-b border-gray-50">
                    <td className={`${td} font-mono text-xs`}>#{o.id.slice(0, 8).toUpperCase()}</td>
                    <td className={td}>{o.profiles?.full_name || o.profiles?.phone || "—"}</td>
                    <td className={td}>{o.stores?.name ?? "—"}</td>
                    <td className={`${td} font-semibold`}>{formatCurrencyFull(Number(o.total))}</td>
                    <td className={td}><PayPill status={o.payment_status} /></td>
                    <td className={td}><OrderPill status={o.status} /></td>
                    <td className={`${td} text-gray-400`}>{timeAgo(o.created_at)}</td>
                  </tr>))}</tbody></table></div>
            )}
          </SectionCard>
          <p className="text-[11px] text-gray-400">Vendor payout / settlement batches aren&apos;t tracked in the platform yet, so none are shown.</p>
        </>
      )}
    </div>
  );
}
