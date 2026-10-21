"use client";
import { useEffect, useState } from "react";
import { Store, MapPin, Phone, Shield, Edit3, Save, CheckCircle, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useStore } from "@/lib/auth/StoreProvider";
import { fmtDate } from "@/lib/utils";
import type { Store as StoreRow } from "@zooli/api-client";

type StoreFull = StoreRow & { created_at?: string };

export default function ProfilePage() {
  const { profile } = useAuth();
  const { refresh: refreshShared } = useStore();
  const [store, setStore] = useState<StoreFull | null>(null);
  const [email, setEmail] = useState("");
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", address: "", gstin: "", zone: "" });

  function fillForm(s: StoreFull | null) {
    setForm({ name: s?.name ?? "", address: s?.address ?? "", gstin: s?.gstin ?? "", zone: s?.zone ?? "" });
  }

  useEffect(() => {
    Promise.all([api.vendor.getStore(), api.vendor.orders(), supabase.auth.getUser()])
      .then(([storeRes, ordersRes, userRes]) => {
        setStore(storeRes.store as StoreFull | null);
        fillForm(storeRes.store as StoreFull | null);
        setOrderCount(ordersRes.orders.filter((o) => o.status !== "cancelled").length);
        setEmail(userRes.data.user?.email ?? "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load your profile."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true); setError("");
    try {
      const { store: updated } = await api.vendor.updateStore({
        name: form.name.trim(),
        address: form.address.trim() || undefined,
        gstin: form.gstin.trim() || undefined,
        zone: form.zone.trim() || undefined,
      });
      setStore((prev) => ({ ...(prev as StoreFull), ...updated }));
      refreshShared(); // keep sidebar/topbar in sync with the new name
      setSaved(true); setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed";
  const lbl = "block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5";

  if (loading) {
    return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>;
  }

  if (!store) {
    return (
      <div className="max-w-[900px] bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-2xl p-5 flex items-start gap-3">
        <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-bold">No store linked to this account yet</div>
          <div className="mt-1">{error || "Your login exists, but no store record was found. Please contact Zooli support."}</div>
        </div>
      </div>
    );
  }

  const initials = (store.name || "?").split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-5 max-w-[900px]">
      {saved && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-2xl px-4 py-3">
          <CheckCircle size={16} /> Profile updated successfully!
        </div>
      )}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3">{error}</div>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700" />
        <div className="px-6 pb-5">
          <div className="flex items-end justify-between -mt-10 mb-4 flex-wrap gap-3">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 border-4 border-white shadow-lg flex items-center justify-center">
              <span className="text-white text-2xl font-black">{initials}</span>
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button onClick={handleSave} disabled={saving || !form.name.trim()}
                    className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-sm">
                    <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button onClick={() => { fillForm(store); setEditing(false); setError(""); }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold px-4 py-2 rounded-xl transition-colors">Cancel</button>
                </>
              ) : (
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm">
                  <Edit3 size={14} /> Edit Profile
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-black text-gray-900">{store.name}</h2>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">✓ APPROVED</span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full capitalize">{store.category.replace(/_/g, " ")}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${store.is_open ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-gray-600 bg-gray-100 border-gray-200"}`}>{store.is_open ? "OPEN" : "CLOSED"}</span>
          </div>
          <div className="flex items-center gap-4 mt-1.5 flex-wrap text-sm text-gray-500">
            {(store.zone || store.address) && <span className="flex items-center gap-1"><MapPin size={13} />{store.zone || store.address}</span>}
            {store.created_at && <span>Member since {fmtDate(store.created_at)}</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4"><Store size={16} className="text-purple-600" /><h3 className="text-sm font-bold text-gray-900">Business Information</h3></div>
          <div className="space-y-3">
            <div><label className={lbl}>Business Name</label>
              <input className={inp} disabled={!editing} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
            <div><label className={lbl}>Owner / Manager Name</label>
              <input className={inp} disabled value={profile?.full_name ?? ""} /></div>
            <div><label className={lbl}>Full Address</label>
              <textarea className={inp} rows={2} disabled={!editing} value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} /></div>
            <div><label className={lbl}>Zone</label>
              <input className={inp} disabled={!editing} value={form.zone} onChange={(e) => setForm((p) => ({ ...p, zone: e.target.value }))} /></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4"><Phone size={16} className="text-purple-600" /><h3 className="text-sm font-bold text-gray-900">Contact Details</h3></div>
            <div className="space-y-3">
              <div><label className={lbl}>Phone</label><input className={inp} disabled value={profile?.phone ?? ""} /></div>
              <div><label className={lbl}>Login Email</label><input className={inp} disabled value={email} /></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4"><Shield size={16} className="text-purple-600" /><h3 className="text-sm font-bold text-gray-900">Legal</h3></div>
            <div><label className={lbl}>GSTIN</label>
              <input className={inp} disabled={!editing} value={form.gstin} onChange={(e) => setForm((p) => ({ ...p, gstin: e.target.value }))} placeholder="22AAAAA0000A1Z5" /></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Performance Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Orders", value: orderCount.toLocaleString("en-IN"), icon: "📦" },
            { label: "Platform Rating", value: `${store.rating_avg ?? 0} ⭐ (${store.rating_count ?? 0})`, icon: "⭐" },
            { label: "Commission Rate", value: `${store.commission_rate ?? 0}%`, icon: "📊" },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-xl p-3.5 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-lg font-bold text-gray-900">{s.value}</div>
              <div className="text-[10px] text-gray-400 font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
