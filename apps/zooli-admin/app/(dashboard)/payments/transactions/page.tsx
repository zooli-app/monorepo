"use client";

import { PageHeader, SectionCard } from "@/components/shared/PageHeader";
import { EmptyState, ErrorBox, Pill, Spinner, td, th } from "@/components/shared/ui";
import { api } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { formatCurrencyFull, timeAgo } from "@/lib/utils";

const reasonLabel = (r: string) =>
  r.startsWith("cashback:order") ? "Order cashback" : r.startsWith("cashback:ride") ? "Ride cashback" : r === "admin_adjustment" ? "Admin adjustment" : r;

export default function TransactionsPage() {
  const { data, error, loading, reload } = useLoad(() => api.admin.transactions());
  return (
    <div className="space-y-5">
      <PageHeader title="Transactions" description="Wallet credits and debits (latest 200)" />
      {loading && <Spinner />}
      {error && <ErrorBox error={error} onRetry={reload} />}
      {data && (
        <SectionCard noPadding>
          {data.transactions.length === 0 ? <EmptyState title="No wallet transactions yet" text="Cashback and adjustments will be listed here." /> : (
            <div className="overflow-x-auto"><table className="w-full">
              <thead><tr className="border-b border-gray-50"><th className={th}>User</th><th className={th}>Type</th><th className={th}>Amount</th><th className={th}>When</th></tr></thead>
              <tbody>{data.transactions.map((t) => (
                <tr key={t.id} className="border-b border-gray-50">
                  <td className={td}>{t.profiles?.full_name || t.profiles?.phone || "—"}</td>
                  <td className={td}>{reasonLabel(t.reason)}</td>
                  <td className={td}><Pill tone={Number(t.amount) >= 0 ? "green" : "red"}>{Number(t.amount) >= 0 ? "+" : ""}{formatCurrencyFull(Number(t.amount))}</Pill></td>
                  <td className={`${td} text-gray-400`}>{timeAgo(t.created_at)}</td>
                </tr>))}</tbody></table></div>
          )}
        </SectionCard>
      )}
    </div>
  );
}
