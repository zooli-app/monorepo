"use client";
import { useState } from "react";
import { Store, MapPin, Phone, Mail, Clock, Shield, Edit3, Save, Camera, CheckCircle, AlertTriangle } from "lucide-react";
import { vendor } from "@/lib/mock-data";
import { fmtDate } from "@/lib/utils";

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [form, setForm] = useState({
    name: vendor.name, ownerName: vendor.ownerName,
    phone: vendor.phone, alternatePhone: vendor.alternatePhone ?? "",
    email: vendor.email, address: vendor.address,
    gstin: vendor.gstin, fssaiLicense: vendor.fssaiLicense ?? "",
    openTime: vendor.openTime ?? "08:00", closeTime: vendor.closeTime ?? "22:00",
    prepTime: vendor.preparationTime ?? 25, minOrder: vendor.minOrderValue ?? 150,
    deliveryRadius: vendor.deliveryRadius ?? 5,
  });

  const inp = "w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed";

  async function handleSave() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false); setSaved(true); setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5 max-w-[900px]">

      {/* Saved toast */}
      {saved && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-2xl px-4 py-3">
          <CheckCircle size={16}/> Profile updated successfully!
        </div>
      )}

      {/* Profile header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700" />
        <div className="px-6 pb-5">
          <div className="flex items-end justify-between -mt-10 mb-4 flex-wrap gap-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-white text-2xl font-black">HP</span>
              </div>
              {editing && (
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-purple-600 rounded-xl flex items-center justify-center shadow-md hover:bg-purple-700 transition-colors">
                  <Camera size={13} className="text-white"/>
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-sm">
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Save size={14}/>}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm">
                  <Edit3 size={14}/> Edit Profile
                </button>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-gray-900">{form.name}</h2>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">✓ VERIFIED</span>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full">{vendor.category}</span>
            </div>
            <div className="flex items-center gap-4 mt-1.5 flex-wrap text-sm text-gray-500">
              <span className="flex items-center gap-1"><MapPin size={13}/>{vendor.zone}</span>
              <span className="flex items-center gap-1"><Star size={13} className="text-amber-400 fill-amber-400"/>{vendor.rating} ({vendor.totalReviews} reviews)</span>
              <span className="text-gray-300">·</span>
              <span>Member since {fmtDate(vendor.joinedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Business info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Store size={16} className="text-purple-600"/>
            <h3 className="text-sm font-bold text-gray-900">Business Information</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Business Name</label>
              <input className={inp} disabled={!editing} value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))}/>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Owner / Manager Name</label>
              <input className={inp} disabled={!editing} value={form.ownerName} onChange={e => setForm(p=>({...p,ownerName:e.target.value}))}/>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Full Address</label>
              <textarea className={inp} rows={2} disabled={!editing} value={form.address} onChange={e => setForm(p=>({...p,address:e.target.value}))}/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Opening Time</label>
                <input type="time" className={inp} disabled={!editing} value={form.openTime} onChange={e=>setForm(p=>({...p,openTime:e.target.value}))}/>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Closing Time</label>
                <input type="time" className={inp} disabled={!editing} value={form.closeTime} onChange={e=>setForm(p=>({...p,closeTime:e.target.value}))}/>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Prep Time (min)</label>
                <input type="number" className={inp} disabled={!editing} value={form.prepTime} onChange={e=>setForm(p=>({...p,prepTime:Number(e.target.value)}))}/>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Min Order (₹)</label>
                <input type="number" className={inp} disabled={!editing} value={form.minOrder} onChange={e=>setForm(p=>({...p,minOrder:Number(e.target.value)}))}/>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Radius (km)</label>
                <input type="number" className={inp} disabled={!editing} value={form.deliveryRadius} onChange={e=>setForm(p=>({...p,deliveryRadius:Number(e.target.value)}))}/>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Contact */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4"><Phone size={16} className="text-purple-600"/><h3 className="text-sm font-bold text-gray-900">Contact Details</h3></div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Primary Phone</label>
                <input className={inp} disabled={!editing} value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}/>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Alternate Phone</label>
                <input className={inp} disabled={!editing} value={form.alternatePhone} onChange={e=>setForm(p=>({...p,alternatePhone:e.target.value}))}/>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input type="email" className={inp} disabled={!editing} value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/>
              </div>
            </div>
          </div>

          {/* Legal & Bank */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4"><Shield size={16} className="text-purple-600"/><h3 className="text-sm font-bold text-gray-900">Legal & Banking</h3></div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">GSTIN</label>
                <input className={inp} disabled={!editing} value={form.gstin} onChange={e=>setForm(p=>({...p,gstin:e.target.value}))} placeholder="22AAAAA0000A1Z5"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">FSSAI License</label>
                <input className={inp} disabled={!editing} value={form.fssaiLicense} onChange={e=>setForm(p=>({...p,fssaiLicense:e.target.value}))} placeholder="FSSAI number"/>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-3">
                <div>
                  <div className="text-xs font-bold text-gray-700">{vendor.bankName}</div>
                  <div className="text-[11px] text-gray-400">A/C: {vendor.accountNumber} · IFSC: {vendor.ifsc}</div>
                </div>
                <button className="ml-auto text-xs text-purple-600 font-semibold hover:underline flex-shrink-0">Change</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Performance Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label:"Total Orders",    value:vendor.totalOrders.toLocaleString("en-IN"), icon:"📦" },
            { label:"Total Revenue",   value:`₹${(vendor.revenue/100000).toFixed(1)}L`,  icon:"💰" },
            { label:"Platform Rating", value:`${vendor.rating} ⭐`,                       icon:"⭐" },
            { label:"Commission Rate", value:`${vendor.commissionRate}%`,                 icon:"📊" },
          ].map(s => (
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

function Star({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  );
}
