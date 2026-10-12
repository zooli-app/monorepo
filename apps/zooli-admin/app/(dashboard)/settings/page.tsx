"use client";

import { useState } from "react";
import {
  Settings, Globe, Bell, Shield, Zap, MapPin,
  Save, RefreshCw, Plus, Trash2, ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

type SettingTab = "platform" | "notifications" | "zones" | "commissions" | "security" | "integrations";

const TABS: { id: SettingTab; label: string; icon: React.ElementType }[] = [
  { id: "platform", label: "Platform", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "zones", label: "Zones", icon: MapPin },
  { id: "commissions", label: "Commissions", icon: Zap },
  { id: "security", label: "Security", icon: Shield },
  { id: "integrations", label: "Integrations", icon: Settings },
];

interface Toggle {
  label: string;
  description: string;
  value: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingTab>("platform");
  const [saved, setSaved] = useState(false);

  // Platform settings
  const [platformName, setPlatformName] = useState("Zooli");
  const [companyName, setCompanyName] = useState("Veera Smart Services India Pvt Ltd");
  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [supportEmail, setSupportEmail] = useState("support@zooli.in");
  const [supportPhone, setSupportPhone] = useState("+91 1800 123 4567");

  // Notification toggles
  const [notifications, setNotifications] = useState<Toggle[]>([
    { label: "SMS OTP for Login", description: "Send OTP via SMS for user authentication", value: true },
    { label: "WhatsApp Order Updates", description: "Send order status via WhatsApp Business API", value: true },
    { label: "Push Notifications (FCM)", description: "Firebase push notifications to mobile app", value: true },
    { label: "Email Reports (Weekly)", description: "Send weekly performance report to admin", value: false },
    { label: "Vendor Payout Alerts", description: "Notify vendors when payouts are processed", value: true },
    { label: "Low Stock Alerts", description: "Alert vendors when inventory is low", value: false },
  ]);

  // Ride settings
  const [surgeEnabled, setSurgeEnabled] = useState(true);
  const [surgeMultiplier, setSurgeMultiplier] = useState("1.5");
  const [maxWaitTime, setMaxWaitTime] = useState("8");

  // Zones
  const [zones, setZones] = useState([
    { id: "z1", name: "Dhone", state: "Andhra Pradesh", active: true, deliveryRadius: 15 },
    { id: "z2", name: "Kurnool", state: "Andhra Pradesh", active: true, deliveryRadius: 20 },
    { id: "z3", name: "Nandyal", state: "Andhra Pradesh", active: true, deliveryRadius: 12 },
    { id: "z4", name: "Hyderabad", state: "Telangana", active: true, deliveryRadius: 30 },
    { id: "z5", name: "Atmakur", state: "Andhra Pradesh", active: false, deliveryRadius: 10 },
  ]);

  // Commissions
  const [commissions, setCommissions] = useState([
    { service: "🍔 Food & Beverages", rate: 15 },
    { service: "🥦 Vegetables & Grocery", rate: 12 },
    { service: "🚗 Rides", rate: 18 },
    { service: "🔧 Home Services", rate: 20 },
    { service: "🚛 House Shifting", rate: 15 },
    { service: "📦 Parcel (Local)", rate: 15 },
    { service: "🎓 Tuition Point", rate: 15 },
    { service: "🏨 Hotel & Function Halls", rate: 12 },
    { service: "🏖️ Resorts & Tourist", rate: 10 },
  ]);

  function toggleNotification(idx: number) {
    setNotifications((prev) =>
      prev.map((n, i) => (i === idx ? { ...n, value: !n.value } : n))
    );
  }

  function toggleZone(id: string) {
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, active: !z.active } : z))
    );
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure platform behaviour, zones, commissions and integrations"
        actions={
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {saved ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        }
      />

      <div className="flex gap-5">
        {/* Sidebar Tabs */}
        <div className="w-48 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                    activeTab === tab.id
                      ? "bg-purple-50 text-purple-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={15} className={activeTab === tab.id ? "text-purple-600" : "text-gray-400"} />
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight size={12} className="ml-auto text-purple-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">

          {/* Platform Settings */}
          {activeTab === "platform" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Platform Configuration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Platform Name</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400" value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Company / Legal Name</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Default Currency</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Timezone</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Support Email</label>
                  <input type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Support Phone</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} />
                </div>
              </div>
              <hr className="my-5 border-gray-100" />
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Ride Settings</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Surge Pricing</label>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700">{surgeEnabled ? "Enabled" : "Disabled"}</span>
                    <button
                      onClick={() => setSurgeEnabled(!surgeEnabled)}
                      className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${surgeEnabled ? "bg-purple-600" : "bg-gray-200"}`}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${surgeEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Surge Multiplier (max)</label>
                  <input type="number" step="0.1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400" value={surgeMultiplier} onChange={(e) => setSurgeMultiplier(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Max Wait Time (min)</label>
                  <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400" value={maxWaitTime} onChange={(e) => setMaxWaitTime(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Notification Channels</h3>
              <div className="space-y-1">
                {notifications.map((n, i) => (
                  <div key={n.label} className={`flex items-center justify-between p-4 rounded-lg transition-colors ${n.value ? "bg-purple-50/50" : "hover:bg-gray-50"}`}>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{n.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{n.description}</div>
                    </div>
                    <button
                      onClick={() => toggleNotification(i)}
                      className={`relative inline-flex h-5 w-9 rounded-full transition-colors flex-shrink-0 ${n.value ? "bg-purple-600" : "bg-gray-200"}`}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${n.value ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Zones */}
          {activeTab === "zones" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Delivery Zones</h3>
                <button className="flex items-center gap-1.5 text-sm text-purple-700 font-medium hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors">
                  <Plus size={14} /> Add Zone
                </button>
              </div>
              <div className="space-y-3">
                {zones.map((zone) => (
                  <div key={zone.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <MapPin size={16} className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{zone.name}</div>
                      <div className="text-xs text-gray-400">{zone.state} · Radius: {zone.deliveryRadius} km</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center outline-none focus:border-purple-400"
                        value={zone.deliveryRadius}
                        type="number"
                        onChange={(e) => setZones((prev) => prev.map((z) => z.id === zone.id ? { ...z, deliveryRadius: Number(e.target.value) } : z))}
                      />
                      <button
                        onClick={() => toggleZone(zone.id)}
                        className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${zone.active ? "bg-purple-600" : "bg-gray-200"}`}
                      >
                        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${zone.active ? "translate-x-4" : "translate-x-0.5"}`} />
                      </button>
                      <button className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Commissions */}
          {activeTab === "commissions" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-1">Commission Rates by Service</h3>
              <p className="text-xs text-gray-400 mb-4">Set the percentage Zooli collects from each order per service category.</p>
              <div className="space-y-3">
                {commissions.map((c, i) => (
                  <div key={c.service} className="flex items-center gap-4 p-3.5 border border-gray-100 rounded-xl">
                    <span className="text-xl w-8">{c.service.split(" ")[0]}</span>
                    <span className="text-sm font-medium text-gray-900 flex-1">{c.service.slice(3)}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="5"
                        max="30"
                        value={c.rate}
                        onChange={(e) =>
                          setCommissions((prev) =>
                            prev.map((cm, idx) => idx === i ? { ...cm, rate: Number(e.target.value) } : cm)
                          )
                        }
                        className="w-24 accent-purple-600"
                      />
                      <div className="flex items-center gap-1 bg-purple-50 border border-purple-200 rounded-lg px-2 py-1 w-14 justify-center">
                        <input
                          type="number"
                          min="5"
                          max="30"
                          value={c.rate}
                          onChange={(e) =>
                            setCommissions((prev) =>
                              prev.map((cm, idx) => idx === i ? { ...cm, rate: Number(e.target.value) } : cm)
                            )
                          }
                          className="w-7 bg-transparent text-sm font-bold text-purple-700 outline-none text-center"
                        />
                        <span className="text-xs text-purple-600">%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div className="p-4 border border-gray-100 rounded-xl">
                  <div className="text-sm font-semibold text-gray-900 mb-1">Change Admin Password</div>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <input type="password" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400" placeholder="Current password" />
                    <input type="password" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400" placeholder="New password" />
                    <input type="password" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400" placeholder="Confirm new password" />
                    <button className="bg-purple-700 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-purple-800 transition-colors">Update Password</button>
                  </div>
                </div>
                {[
                  { label: "Two-Factor Authentication (2FA)", desc: "Require TOTP for admin login", enabled: false },
                  { label: "IP Whitelist", desc: "Only allow access from specific IP addresses", enabled: false },
                  { label: "Session Timeout (30 min)", desc: "Auto-logout inactive admin sessions", enabled: true },
                  { label: "Audit Logging", desc: "Log all admin actions to database", enabled: true },
                ].map((s, i) => (
                  <div key={s.label} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{s.label}</div>
                      <div className="text-xs text-gray-400">{s.desc}</div>
                    </div>
                    <button className={`relative inline-flex h-5 w-9 rounded-full ${s.enabled ? "bg-purple-600" : "bg-gray-200"}`}>
                      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform mt-0.5 ${s.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Integrations */}
          {activeTab === "integrations" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">API & Integrations</h3>
              <div className="space-y-3">
                {[
                  { name: "FastAPI Backend", url: "https://api.zooli.in", status: "connected", color: "emerald" },
                  { name: "Razorpay (Payments)", url: "rzp_live_xxxxxx", status: "connected", color: "emerald" },
                  { name: "Firebase (FCM)", url: "project-zooli-xxxxx", status: "connected", color: "emerald" },
                  { name: "Google Maps API", url: "AIzaSy-xxxxx", status: "connected", color: "emerald" },
                  { name: "MSG91 (SMS/WhatsApp)", url: "Not configured", status: "disconnected", color: "amber" },
                  { name: "AWS S3 (Media Storage)", url: "Not configured", status: "disconnected", color: "amber" },
                ].map((intg) => (
                  <div key={intg.name} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${intg.color === "emerald" ? "bg-emerald-500" : "bg-amber-400"}`} />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{intg.name}</div>
                      <div className="text-xs text-gray-400 font-mono">{intg.url}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${intg.status === "connected" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {intg.status === "connected" ? "Connected" : "Setup Required"}
                      </span>
                      <button className="text-xs text-purple-600 hover:underline">Configure</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
