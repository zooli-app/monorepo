"use client";
import { useEffect, useState } from "react";
import { Percent } from "lucide-react";
import { SectionCard, PageHeader } from "@/components/shared/PageHeader";
import { api } from "@/lib/api";
import type { AdminStore } from "@zooli/api-client";

// Real now: commission_rate lives on `stores`, admin-editable via
// PATCH /api/admin/stores/:id (same field the Vendors page edits from a
// vendor's detail panel — this page is the platform-wide view of it).
export default function CommissionPage() {
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    api.admin.stores().then(({ stores }) => setStores(stores)).finally(() => setLoading(false));
  }, []);

  async function updateRate(storeId: string, rate: number) {
    setSavingId(storeId);
    try {
      await api.admin.updateStore(storeId, { commission_rate: rate });
      setStores((p) => p.map((s) => s.id === storeId ? { ...s, commission_rate: rate } : s));
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="Commission & Charges" description="Per-vendor platform commission — editable here or from a vendor's detail panel" />
      <SectionCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {["Store", "Category", "Commission"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id} className="border-t border-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{s.category === "restaurant" ? "🍽️ Food" : "🛒 Grocery"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Percent size={13} className="text-gray-400" />
                      <input
                        type="number"
                        defaultValue={s.commission_rate ?? 15}
                        onBlur={(e) => updateRate(s.id, Number(e.target.value))}
                        className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-purple-400"
                      />
                      <span className="text-sm text-gray-500">%</span>
                      {savingId === s.id && <span className="text-xs text-gray-400">Saving...</span>}
                    </div>
                  </td>
                </tr>
              ))}
              {stores.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-12 text-center text-sm text-gray-400">No stores yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
