"use client";

import { useEffect, useState } from "react";
import {
  Search, Plus, Eye, Star, MoreVertical, X,
  Store, CheckCircle, Clock, Phone, Mail,
  MapPin, Percent, ChevronDown, Trash2, PenLine,
  ShieldCheck, ShieldX, AlertCircle,
} from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { SectionCard, PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate, SERVICE_EMOJI, ZONES } from "@/lib/utils";
import { api } from "@/lib/api";
import type { ServiceType, Vendor, VendorStatus } from "@/lib/types";

const SERVICES: ServiceType[] = [
  "food","grocery","rides","home","shifting","parcel","tuition","hotel","resort",
];

const SERVICE_LABELS: Record<ServiceType, string> = {
  food: "Food & Beverages", grocery: "Vegetables & Grocery", rides: "Rides",
  home: "Home Services", shifting: "House Shifting", parcel: "Parcel (Local)",
  tuition: "Tuition Point", hotel: "Hotel & Function Halls", resort: "Resorts & Tourist",
};

// ─── Empty form state ─────────────────────────────────────────────────
const EMPTY_FORM = {
  name: "", email: "", phone: "", service: "food" as ServiceType,
  zone: "Dhone", commissionRate: 15, ownerName: "", gstin: "", address: "",
};

export default function VendorsPage() {
  const [vendorList, setVendorList] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.stores().then(({ stores }) => {
      // Real `stores` rows mapped onto this page's existing Vendor shape.
      // zone/rating/commissionRate/gstin are all real now (stores gained
      // these columns) — email/phone/ownerName/documents still aren't (no
      // vendor contact fields on `stores`, no document-upload/verification
      // flow), so those stay placeholders. `status` (active/suspended) is
      // the store's `is_open` flag, toggled for real via the action below.
      setVendorList(stores.map((s): Vendor => ({
        id: s.id,
        name: s.name,
        email: "—",
        phone: "—",
        service: (s.category === "restaurant" ? "food" : "grocery") as ServiceType,
        zone: s.zone ?? s.address ?? "—",
        totalOrders: 0,
        revenue: 0,
        rating: s.rating_avg ?? 0,
        status: s.is_open ? "active" : "suspended",
        verificationStatus: "verified",
        joinedAt: s.created_at,
        documents: [],
        commissionRate: s.commission_rate ?? 15,
        gstin: s.gstin ?? "",
      })));
    }).finally(() => setLoading(false));
  }, []);

  async function updateVendorBusinessFields(id: string, fields: { commission_rate?: number; gstin?: string; zone?: string }) {
    setVendorList((p) => p.map((v) => v.id === id ? {
      ...v,
      commissionRate: fields.commission_rate ?? v.commissionRate,
      gstin: fields.gstin ?? v.gstin,
      zone: fields.zone ?? v.zone,
    } : v));
    await api.admin.updateStore(id, fields);
  }

  async function toggleStoreOpen(id: string, nextOpen: boolean) {
    setVendorList((p) => p.map((v) => v.id === id ? { ...v, status: nextOpen ? "active" : "suspended" } : v));
    try { await api.admin.setStoreOpen(id, nextOpen); } catch { /* revert on next reload */ }
  }

  // Filters
  const [search, setSearch]           = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [statusFilter, setStatusFilter]   = useState("");

  // Add vendor panel
  const [showAdd, setShowAdd]   = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  // View vendor panel
  const [viewVendor, setViewVendor] = useState<Vendor | null>(null);
  const [commissionDraft, setCommissionDraft] = useState<number | null>(null);
  const [savingCommission, setSavingCommission] = useState(false);

  async function saveCommission() {
    if (!viewVendor || commissionDraft === null) return;
    setSavingCommission(true);
    try {
      await updateVendorBusinessFields(viewVendor.id, { commission_rate: commissionDraft });
      setViewVendor((v) => v ? { ...v, commissionRate: commissionDraft } : v);
    } finally {
      setSavingCommission(false);
    }
  }

  useEffect(() => {
    setCommissionDraft(viewVendor?.commissionRate ?? null);
  }, [viewVendor?.id]);

  // Actions dropdown
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // ─── Filtering ────────────────────────────────────────────────────
  const filtered = vendorList.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      v.name.toLowerCase().includes(q) ||
      v.email.toLowerCase().includes(q) ||
      v.zone.toLowerCase().includes(q) ||
      v.phone.includes(q);
    const matchService = !serviceFilter || v.service === serviceFilter;
    const matchStatus  = !statusFilter  || v.status  === statusFilter;
    return matchSearch && matchService && matchStatus;
  });

  const active    = vendorList.filter((v) => v.status === "active").length;
  const pending   = vendorList.filter((v) => v.verificationStatus === "pending").length;
  const avgRating = (vendorList.reduce((a, v) => a + v.rating, 0) / vendorList.length).toFixed(1);

  // ─── Form helpers ─────────────────────────────────────────────────
  function setField(key: keyof typeof EMPTY_FORM, value: string | number) {
    setForm((p) => ({ ...p, [key]: value }));
    setFormErrors((p) => { const n = { ...p }; delete n[key]; return n; });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim())    e.name  = "Business name is required";
    if (!form.email.trim())   e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim())   e.phone = "Phone is required";
    if (!form.ownerName.trim()) e.ownerName = "Owner name is required";
    return e;
  }

  async function handleAddVendor() {
    const errors = validate();
    if (Object.keys(errors).length) { setFormErrors(errors); return; }
    setSaving(true);
    // NOTE: there's no admin-side "create vendor" endpoint — vendors
    // self-onboard by creating their own store from inside the vendor app
    // (POST /api/vendor/store). This form stays local-only until that
    // endpoint exists; it won't persist across a reload.
    await new Promise((r) => setTimeout(r, 900));
    const newVendor: Vendor = {
      id: `v${Date.now()}`,
      name: form.name,
      email: form.email,
      phone: form.phone,
      service: form.service,
      zone: form.zone,
      totalOrders: 0,
      revenue: 0,
      rating: 0,
      status: "inactive",
      verificationStatus: "pending",
      joinedAt: new Date().toISOString(),
      documents: [],
      commissionRate: form.commissionRate,
    };
    setVendorList((p) => [newVendor, ...p]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setShowAdd(false);
      setForm(EMPTY_FORM);
    }, 1200);
  }

  function handleCloseAdd() {
    setShowAdd(false);
    setForm(EMPTY_FORM);
    setFormErrors({});
  }

  // ─── Vendor actions ───────────────────────────────────────────────
  function changeStatus(id: string, status: VendorStatus) {
    toggleStoreOpen(id, status === "active");
    setOpenMenu(null);
  }

  function approveVendor(id: string) {
    setVendorList((p) => p.map((v) =>
      v.id === id ? { ...v, verificationStatus: "verified", status: "active" } : v
    ));
    setOpenMenu(null);
  }

  function deleteVendor(id: string) {
    if (!confirm("Remove this vendor from the platform?")) return;
    setVendorList((p) => p.filter((v) => v.id !== id));
    setOpenMenu(null);
  }

  // ─── Shared input class ───────────────────────────────────────────
  const inp = (err?: string) =>
    `w-full border ${err ? "border-red-400" : "border-gray-200"} rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400 transition-colors`;

  return (
    <div onClick={() => setOpenMenu(null)}>
      <PageHeader
        title="Vendors"
        description="Manage all vendor partners across services"
        actions={
          <button
            onClick={(e) => { e.stopPropagation(); setShowAdd(true); }}
            className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus size={15} />
            Add Vendor
          </button>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <MetricCard label="Total Vendors"     value={vendorList.length.toString()} sub="Across all services" icon={Store}        iconBg="#EDE9FE" iconColor="#6D28D9" />
        <MetricCard label="Active Now"        value={active.toString()}            sub={`${Math.round((active/vendorList.length)*100)}% of total`} icon={CheckCircle} iconBg="#D1FAE5" iconColor="#059669" />
        <MetricCard label="Pending Approval"  value={pending.toString()}           sub="Needs review"       icon={Clock}        iconBg="#FEF3C7" iconColor="#D97706" />
        <MetricCard label="Avg Rating"        value={`${avgRating} ⭐`}             sub="Based on all vendors" icon={Star}       iconBg="#FEF3C7" iconColor="#D97706" />
      </div>

      {/* Table */}
      <SectionCard noPadding>
        <div className="flex items-center gap-3 p-4 border-b border-gray-50 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              className="bg-transparent text-sm outline-none flex-1 placeholder-gray-400"
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-600 outline-none" value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
            <option value="">All Services</option>
            {SERVICES.map((s) => (
              <option key={s} value={s}>{SERVICE_EMOJI[s]} {SERVICE_LABELS[s]}</option>
            ))}
          </select>
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-600 outline-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <span className="ml-auto text-xs text-gray-400">{filtered.length} vendor{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {["Vendor","Service","Zone","Orders","Revenue","Commission","Rating","Status","Verified","Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-sm text-gray-400">
                    No vendors match your filters.
                  </td>
                </tr>
              ) : filtered.map((vendor) => (
                <tr key={vendor.id} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700 flex-shrink-0">
                        {vendor.name.split(" ").map((n) => n[0]).slice(0,2).join("")}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{vendor.name}</div>
                        <div className="text-xs text-gray-400">{vendor.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {SERVICE_EMOJI[vendor.service as ServiceType]}&nbsp;
                    {SERVICE_LABELS[vendor.service as ServiceType]}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{vendor.zone}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{vendor.totalOrders.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">{formatCurrency(vendor.revenue)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{vendor.commissionRate}%</td>
                  <td className="px-4 py-3">
                    {vendor.rating > 0 ? (
                      <div className="flex items-center gap-1">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold text-gray-900">{vendor.rating}</span>
                      </div>
                    ) : <span className="text-xs text-gray-400">New</span>}
                  </td>
                  <td className="px-4 py-3"><StatusBadge type="vendor" status={vendor.status} /></td>
                  <td className="px-4 py-3"><StatusBadge type="verification" status={vendor.verificationStatus} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {/* View */}
                      <button
                        onClick={() => setViewVendor(vendor)}
                        className="text-gray-400 hover:text-purple-600 p-1.5 rounded-lg hover:bg-purple-50 transition-colors"
                        title="View details"
                      >
                        <Eye size={14} />
                      </button>
                      {/* More actions */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === vendor.id ? null : vendor.id)}
                          className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          title="More actions"
                        >
                          <MoreVertical size={14} />
                        </button>
                        {openMenu === vendor.id && (
                          <div className="absolute right-0 top-8 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                            {vendor.verificationStatus === "pending" && (
                              <button onClick={() => approveVendor(vendor.id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50 transition-colors">
                                <ShieldCheck size={13} /> Approve Vendor
                              </button>
                            )}
                            {vendor.status === "active" ? (
                              <button onClick={() => changeStatus(vendor.id, "suspended")} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-amber-700 hover:bg-amber-50 transition-colors">
                                <AlertCircle size={13} /> Suspend
                              </button>
                            ) : (
                              <button onClick={() => changeStatus(vendor.id, "active")} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50 transition-colors">
                                <CheckCircle size={13} /> Activate
                              </button>
                            )}
                            <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                              <PenLine size={13} /> Edit Details
                            </button>
                            <div className="border-t border-gray-100 my-1" />
                            <button onClick={() => deleteVendor(vendor.id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors">
                              <Trash2 size={13} /> Remove Vendor
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
          <span className="text-xs text-gray-400">Showing {filtered.length} of {vendorList.length} vendors</span>
          <div className="flex items-center gap-1">
            {[1,2,3].map((p) => (
              <button key={p} className={`w-7 h-7 text-xs rounded-lg transition-colors ${p === 1 ? "bg-purple-700 text-white" : "text-gray-500 hover:bg-gray-100"}`}>{p}</button>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ─── ADD VENDOR SLIDE-OVER ──────────────────────────────────── */}
      {showAdd && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/30 z-30 backdrop-blur-[2px]" onClick={handleCloseAdd} />
          {/* Panel */}
          <div className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-white shadow-2xl z-40 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Add New Vendor</h2>
                <p className="text-xs text-gray-400 mt-0.5">Fill in the details to onboard a new partner</p>
              </div>
              <button onClick={handleCloseAdd} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

              {/* Business Info */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Business Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Business Name *</label>
                    <input className={inp(formErrors.name)} placeholder="e.g. Hotel Paradise" value={form.name} onChange={(e) => setField("name", e.target.value)} />
                    {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Owner / Manager Name *</label>
                    <input className={inp(formErrors.ownerName)} placeholder="e.g. Ravi Kumar" value={form.ownerName} onChange={(e) => setField("ownerName", e.target.value)} />
                    {formErrors.ownerName && <p className="text-xs text-red-500 mt-1">{formErrors.ownerName}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Service Category *</label>
                      <select className={inp()} value={form.service} onChange={(e) => setField("service", e.target.value as ServiceType)}>
                        {SERVICES.map((s) => (
                          <option key={s} value={s}>{SERVICE_EMOJI[s]} {SERVICE_LABELS[s]}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Zone *</label>
                      <select className={inp()} value={form.zone} onChange={(e) => setField("zone", e.target.value)}>
                        {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Address</label>
                    <input className={inp()} placeholder="Street, Area, City" value={form.address} onChange={(e) => setField("address", e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Contact */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      <span className="flex items-center gap-1.5"><Mail size={11} /> Email Address *</span>
                    </label>
                    <input type="email" className={inp(formErrors.email)} placeholder="owner@business.in" value={form.email} onChange={(e) => setField("email", e.target.value)} />
                    {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      <span className="flex items-center gap-1.5"><Phone size={11} /> Phone Number *</span>
                    </label>
                    <input type="tel" className={inp(formErrors.phone)} placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
                    {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Financial */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Financial Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      <span className="flex items-center gap-1.5"><Percent size={11} /> Commission Rate (%)</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range" min={5} max={30} step={1}
                        className="flex-1 accent-purple-600"
                        value={form.commissionRate}
                        onChange={(e) => setField("commissionRate", Number(e.target.value))}
                      />
                      <div className="w-14 border border-purple-200 bg-purple-50 rounded-lg px-2 py-1.5 text-sm font-bold text-purple-700 text-center">
                        {form.commissionRate}%
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Default is 15%. Adjustable per vendor.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">GSTIN (optional)</label>
                    <input className={inp()} placeholder="22AAAAA0000A1Z5" value={form.gstin} onChange={(e) => setField("gstin", e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Info box */}
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-3.5">
                <p className="text-xs text-purple-700 leading-relaxed">
                  <strong>After adding:</strong> The vendor will receive a welcome email with login credentials. Verification documents can be collected from the vendor detail page. The account starts as <em>Inactive</em> until manually activated.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-6 py-4 flex items-center gap-3 bg-gray-50">
              <button
                onClick={handleAddVendor}
                disabled={saving || saved}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
              >
                {saving ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : saved ? (
                  <><CheckCircle size={15} /> Vendor Added!</>
                ) : (
                  <><Plus size={15} /> Add Vendor</>
                )}
              </button>
              <button onClick={handleCloseAdd} className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-white transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* ─── VIEW VENDOR SLIDE-OVER ─────────────────────────────────── */}
      {viewVendor && (
        <>
          <div className="fixed inset-0 bg-black/30 z-30 backdrop-blur-[2px]" onClick={() => setViewVendor(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-[440px] bg-white shadow-2xl z-40 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Vendor Details</h2>
              <button onClick={() => setViewVendor(null)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Avatar + name */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center text-lg font-bold text-purple-700 flex-shrink-0">
                  {viewVendor.name.split(" ").map((n) => n[0]).slice(0,2).join("")}
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{viewVendor.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge type="vendor" status={viewVendor.status} />
                    <StatusBadge type="verification" status={viewVendor.verificationStatus} />
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Total Orders", value: viewVendor.totalOrders.toLocaleString("en-IN") },
                  { label: "Revenue",      value: formatCurrency(viewVendor.revenue) },
                  { label: "Rating",       value: viewVendor.rating > 0 ? `${viewVendor.rating} ⭐` : "New" },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-gray-900">{s.value}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Details */}
              <div className="space-y-3">
                {[
                  { icon: Store,   label: "Service",    value: `${SERVICE_EMOJI[viewVendor.service as ServiceType]} ${SERVICE_LABELS[viewVendor.service as ServiceType]}` },
                  { icon: MapPin,  label: "Zone",       value: viewVendor.zone },
                  { icon: Mail,    label: "Email",      value: viewVendor.email },
                  { icon: Phone,   label: "Phone",      value: viewVendor.phone },
                  { icon: Clock,   label: "Joined",     value: formatDate(viewVendor.joinedAt) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 py-2.5 border-b border-gray-50">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Icon size={13} className="text-gray-500" />
                    </div>
                    <span className="text-xs text-gray-400 w-20 flex-shrink-0">{label}</span>
                    <span className="text-sm text-gray-900 font-medium">{value}</span>
                  </div>
                ))}

                {/* Commission — the one editable field here; admin-controlled, saved for real */}
                <div className="flex items-center gap-3 py-2.5 border-b border-gray-50">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Percent size={13} className="text-gray-500" />
                  </div>
                  <span className="text-xs text-gray-400 w-20 flex-shrink-0">Commission</span>
                  <input
                    type="number"
                    className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-purple-400"
                    value={commissionDraft ?? 0}
                    onChange={(e) => setCommissionDraft(Number(e.target.value))}
                  />
                  <span className="text-sm text-gray-500">%</span>
                  {commissionDraft !== viewVendor.commissionRate && (
                    <button onClick={saveCommission} disabled={savingCommission}
                      className="ml-auto text-xs font-bold text-purple-600 hover:underline disabled:opacity-50">
                      {savingCommission ? "Saving..." : "Save"}
                    </button>
                  )}
                </div>
              </div>

              {/* Quick actions */}
              <div className="mt-5">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick Actions</h4>
                <div className="flex flex-col gap-2">
                  {viewVendor.verificationStatus === "pending" && (
                    <button
                      onClick={() => { approveVendor(viewVendor.id); setViewVendor(null); }}
                      className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl hover:bg-emerald-100 transition-colors font-medium"
                    >
                      <ShieldCheck size={15} /> Approve & Activate Vendor
                    </button>
                  )}
                  {viewVendor.status === "active" ? (
                    <button
                      onClick={() => { changeStatus(viewVendor.id, "suspended"); setViewVendor(null); }}
                      className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl hover:bg-amber-100 transition-colors font-medium"
                    >
                      <AlertCircle size={15} /> Suspend Vendor
                    </button>
                  ) : (
                    <button
                      onClick={() => { changeStatus(viewVendor.id, "active"); setViewVendor(null); }}
                      className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl hover:bg-emerald-100 transition-colors font-medium"
                    >
                      <CheckCircle size={15} /> Activate Vendor
                    </button>
                  )}
                  <button
                    onClick={() => { deleteVendor(viewVendor.id); setViewVendor(null); }}
                    className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl hover:bg-red-100 transition-colors font-medium"
                  >
                    <Trash2 size={15} /> Remove from Platform
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
