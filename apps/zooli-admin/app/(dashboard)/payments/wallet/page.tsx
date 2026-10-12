"use client";
import { useEffect, useState } from "react";
import { Wallet, TrendingUp, Users } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { SectionCard, PageHeader } from "@/components/shared/PageHeader";
import { formatCurrencyFull } from "@/lib/utils";
import { api } from "@/lib/api";
import type { AdminWallet } from "@zooli/api-client";

// Real now: wallets are credited automatically (2% cashback) when an order
// is delivered or a ride completes — see apps/api/lib/wallet.ts. This page
// used to be a "coming in next sprint" placeholder with no backing table.
export default function WalletPage() {
  const [wallets, setWallets] = useState<AdminWallet[]>([]);
  const [totals, setTotals] = useState({ totalBalance: 0, totalCashback: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.wallets().then(({ wallets, totalBalance, totalCashback }) => {
      setWallets(wallets);
      setTotals({ totalBalance, totalCashback });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="Wallet Management" description="User wallet balances, credited automatically via order/ride cashback" />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
        <MetricCard label="Total Wallet Balance" value={formatCurrencyFull(totals.totalBalance)} icon={Wallet} iconBg="#D1FAE5" iconColor="#059669" />
        <MetricCard label="Lifetime Cashback Issued" value={formatCurrencyFull(totals.totalCashback)} icon={TrendingUp} iconBg="#EDE9FE" iconColor="#6D28D9" />
        <MetricCard label="Wallets" value={wallets.length.toString()} icon={Users} iconBg="#DBEAFE" iconColor="#2563EB" />
      </div>

      <SectionCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {["User", "Phone", "Balance", "Lifetime Cashback", "Last Activity"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {wallets.map((w) => (
                <tr key={w.user_id} className="border-t border-gray-50 table-row-hover transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{w.profiles?.full_name ?? "Unnamed"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{w.profiles?.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-sm font-bold text-emerald-700">{formatCurrencyFull(w.balance)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatCurrencyFull(w.cashback_total)}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(w.updated_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {wallets.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">No wallets yet — cashback is credited automatically once orders/rides start completing.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
