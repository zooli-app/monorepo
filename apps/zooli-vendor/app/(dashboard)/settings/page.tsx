"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Shield, Smartphone, Globe, LogOut, ChevronRight, ToggleLeft, ToggleRight, Eye, EyeOff, CheckCircle, Building2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";

type Tab = "notifications" | "security" | "app" | "language" | "business";

const TABS = [
  { id: "notifications" as Tab, icon: Bell,       label: "Notifications"  },
  { id: "business"      as Tab, icon: Building2,  label: "Business Details" },
  { id: "security"      as Tab, icon: Shield,     label: "Security"       },
  { id: "app"           as Tab, icon: Smartphone, label: "App Settings"   },
  { id: "language"      as Tab, icon: Globe,      label: "Language"       },
];

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [tab, setTab] = useState<Tab>("notifications");
  const [saved, setSaved] = useState(false);

  // Business details — real fields (gstin/zone), persisted via PATCH /api/vendor/store.
  // commission_rate is shown read-only: it's admin-controlled, not vendor-editable.
  const [business, setBusiness] = useState({ gstin: "", zone: "" });
  const [commissionRate, setCommissionRate] = useState<number | null>(null);
  const [businessSaving, setBusinessSaving] = useState(false);

  useEffect(() => {
    api.vendor.getStore().then(({ store }) => {
      if (store) {
        setBusiness({ gstin: store.gstin ?? "", zone: store.zone ?? "" });
        setCommissionRate(store.commission_rate ?? null);
      }
    });
  }, []);

  async function saveBusiness() {
    setBusinessSaving(true);
    try {
      await api.vendor.updateStore(business);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setBusinessSaving(false);
    }
  }

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState({
    newOrder:      true,  orderStatus:   true,
    payoutCredit:  true,  newReview:     true,
    promotions:    false, systemUpdates: true,
    smsAlerts:     true,  emailReports:  false,
    whatsapp:      true,
  });

  // Security
  const [showPwd, setShowPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: "", next: "", confirm: "" });
  const [twoFA, setTwoFA] = useState(false);

  // App
  const [appPrefs, setAppPrefs] = useState({
    autoAccept:   false, autoPrepTime:  true,
    soundAlerts:  true,  darkMode:      false,
    compactView:  false,
  });
  const [autoRejectMins, setAutoRejectMins] = useState(5);

  const [pwdMsg, setPwdMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwdBusy, setPwdBusy] = useState(false);

  async function handlePwdUpdate() {
    setPwdMsg(null);
    if (pwdForm.next.length < 8) return setPwdMsg({ ok: false, text: "New password must be at least 8 characters." });
    setPwdBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const email = u.user?.email;
      if (!email) throw new Error("Session expired. Please sign in again.");
      const { error: reauth } = await supabase.auth.signInWithPassword({ email, password: pwdForm.current });
      if (reauth) throw new Error("Current password is incorrect.");
      const { error } = await supabase.auth.updateUser({ password: pwdForm.next, data: { must_change_password: false } });
      if (error) throw error;
      setPwdForm({ current: "", next: "", confirm: "" });
      setPwdMsg({ ok: true, text: "Password updated." });
    } catch (e) {
      setPwdMsg({ ok: false, text: e instanceof Error ? e.message : "Could not update password." });
    } finally {
      setPwdBusy(false);
    }
  }

  async function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const inp = "w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-purple-400 focus:bg-white transition-all";

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={value ? "text-purple-600 hover:text-purple-700" : "text-gray-300 hover:text-gray-400"}>
      {value ? <ToggleRight size={26}/> : <ToggleLeft size={26}/>}
    </button>
  );

  const Row = ({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: () => void }) => (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
      <div>
        <div className="text-sm font-semibold text-gray-800">{label}</div>
        {desc && <div className="text-xs text-gray-400 mt-0.5">{desc}</div>}
      </div>
      <Toggle value={value} onChange={onChange}/>
    </div>
  );

  return (
    <div className="space-y-4 max-w-[900px]">
      {saved && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-2xl px-4 py-3">
          <CheckCircle size={16}/> Settings saved successfully!
        </div>
      )}

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="lg:w-52 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all text-left ${
                  tab === t.id ? "bg-purple-50 text-purple-700 font-bold" : "text-gray-600 hover:bg-gray-50"
                }`}>
                <t.icon size={15} className={tab === t.id ? "text-purple-600" : "text-gray-400"}/>
                {t.label}
                {tab === t.id && <ChevronRight size={13} className="ml-auto text-purple-400"/>}
              </button>
            ))}

            <div className="border-t border-gray-100 mt-2 pt-2">
              <button onClick={() => logout().then(() => router.push("/login"))}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-all font-semibold">
                <LogOut size={15} className="text-red-500"/> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

          {/* Notifications */}
          {tab === "notifications" && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4">Notification Preferences</h3>

              <div className="mb-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order Alerts</div>
                <Row label="New Order Received"     desc="Get alerted instantly when a new order arrives"         value={notifPrefs.newOrder}     onChange={()=>setNotifPrefs(p=>({...p,newOrder:!p.newOrder}))}/>
                <Row label="Order Status Updates"   desc="When rider picks up or delivers your order"             value={notifPrefs.orderStatus}  onChange={()=>setNotifPrefs(p=>({...p,orderStatus:!p.orderStatus}))}/>
                <Row label="Payout Credited"        desc="When weekly payout is transferred to bank"             value={notifPrefs.payoutCredit} onChange={()=>setNotifPrefs(p=>({...p,payoutCredit:!p.payoutCredit}))}/>
                <Row label="New Customer Review"    desc="When a customer leaves a rating or review"             value={notifPrefs.newReview}    onChange={()=>setNotifPrefs(p=>({...p,newReview:!p.newReview}))}/>
              </div>

              <div className="mb-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Channels</div>
                <Row label="SMS Alerts"             desc="Receive alerts via SMS on your phone"                  value={notifPrefs.smsAlerts}    onChange={()=>setNotifPrefs(p=>({...p,smsAlerts:!p.smsAlerts}))}/>
                <Row label="WhatsApp Updates"       desc="Get order updates via WhatsApp"                        value={notifPrefs.whatsapp}     onChange={()=>setNotifPrefs(p=>({...p,whatsapp:!p.whatsapp}))}/>
                <Row label="Email Reports"          desc="Weekly summary report to your email"                   value={notifPrefs.emailReports} onChange={()=>setNotifPrefs(p=>({...p,emailReports:!p.emailReports}))}/>
                <Row label="Promotions & Offers"    desc="Special offers and Zooli boost notifications"          value={notifPrefs.promotions}   onChange={()=>setNotifPrefs(p=>({...p,promotions:!p.promotions}))}/>
                <Row label="System Updates"         desc="App updates and maintenance notices"                   value={notifPrefs.systemUpdates}onChange={()=>setNotifPrefs(p=>({...p,systemUpdates:!p.systemUpdates}))}/>
              </div>

              <button onClick={handleSave} className="bg-purple-700 hover:bg-purple-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                Save Preferences
              </button>
            </div>
          )}

          {/* Business Details */}
          {tab === "business" && (
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">GSTIN</label>
                <input className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-purple-400 focus:bg-white"
                  placeholder="22AAAAA0000A1Z5" value={business.gstin} onChange={(e) => setBusiness((b) => ({ ...b, gstin: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Service Zone</label>
                <input className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-purple-400 focus:bg-white"
                  placeholder="e.g. Kondapur, Hyderabad" value={business.zone} onChange={(e) => setBusiness((b) => ({ ...b, zone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Platform Commission</label>
                <div className="border border-gray-100 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm text-gray-500">
                  {commissionRate ?? "—"}% <span className="text-xs">(set by Zooli, not editable here)</span>
                </div>
              </div>
              <button onClick={saveBusiness} disabled={businessSaving} className="bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                {businessSaving ? "Saving..." : "Save Business Details"}
              </button>
            </div>
          )}

          {/* Security */}
          {tab === "security" && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4">Security Settings</h3>

              <div className="mb-5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Change Password</div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Current Password</label>
                    <div className="relative">
                      <input type={showPwd ? "text" : "password"} className={inp} placeholder="Enter current password"
                        value={pwdForm.current} onChange={e=>setPwdForm(p=>({...p,current:e.target.value}))}/>
                      <button type="button" onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Password</label>
                    <input type="password" className={inp} placeholder="Min 8 characters"
                      value={pwdForm.next} onChange={e=>setPwdForm(p=>({...p,next:e.target.value}))}/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm New Password</label>
                    <input type="password" className={inp} placeholder="Repeat new password"
                      value={pwdForm.confirm} onChange={e=>setPwdForm(p=>({...p,confirm:e.target.value}))}/>
                  </div>
                  <button onClick={handlePwdUpdate} disabled={pwdBusy || !pwdForm.current || !pwdForm.next || pwdForm.next !== pwdForm.confirm}
                    className="bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
                    {pwdBusy ? "Updating..." : "Update Password"}
                  </button>
                  {pwdMsg && <p className={pwdMsg.ok ? "text-xs text-emerald-600" : "text-xs text-red-600"}>{pwdMsg.text}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Advanced Security</div>
                <Row label="Two-Factor Authentication" desc="Require OTP on every login (recommended)" value={twoFA} onChange={() => setTwoFA(!twoFA)}/>
                <Row label="Active Session Alerts"    desc="Notify me when someone logs into my account" value={true} onChange={()=>{}}/>
                <Row label="Auto Logout (30 min)"    desc="Automatically sign out after inactivity"     value={true} onChange={()=>{}}/>
              </div>
            </div>
          )}

          {/* App settings */}
          {tab === "app" && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4">App Preferences</h3>

              <div className="mb-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order Management</div>
                <Row label="Auto-Accept Orders"      desc="Automatically accept new orders without manual confirmation"    value={appPrefs.autoAccept}  onChange={()=>setAppPrefs(p=>({...p,autoAccept:!p.autoAccept}))}/>
                <Row label="Auto-Set Prep Time"      desc="Automatically fill estimated prep time from menu settings"      value={appPrefs.autoPrepTime}onChange={()=>setAppPrefs(p=>({...p,autoPrepTime:!p.autoPrepTime}))}/>
                <Row label="Sound Alerts"            desc="Play sound when new order arrives"                              value={appPrefs.soundAlerts} onChange={()=>setAppPrefs(p=>({...p,soundAlerts:!p.soundAlerts}))}/>

                <div className="flex items-center justify-between py-3.5 border-b border-gray-50">
                  <div>
                    <div className="text-sm font-semibold text-gray-800">Auto-Reject After</div>
                    <div className="text-xs text-gray-400">Reject orders not accepted within this time</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={autoRejectMins} onChange={e => setAutoRejectMins(Number(e.target.value))}
                      className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-purple-400 bg-gray-50">
                      {[3,5,8,10,15].map(v => <option key={v} value={v}>{v} min</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Display</div>
                <Row label="Dark Mode"     desc="Use dark theme (coming soon)"   value={appPrefs.darkMode}    onChange={()=>setAppPrefs(p=>({...p,darkMode:!p.darkMode}))}/>
                <Row label="Compact View"  desc="Show more orders on screen"     value={appPrefs.compactView} onChange={()=>setAppPrefs(p=>({...p,compactView:!p.compactView}))}/>
              </div>

              <button onClick={handleSave} className="bg-purple-700 hover:bg-purple-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                Save Settings
              </button>
            </div>
          )}

          {/* Language */}
          {tab === "language" && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4">Language & Region</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Interface Language</label>
                  <select className={inp}>
                    <option value="en">🇬🇧 English</option>
                    <option value="te">🇮🇳 Telugu (తెలుగు)</option>
                    <option value="hi">🇮🇳 Hindi (हिंदी)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Currency</label>
                  <select className={inp}><option>₹ Indian Rupee (INR)</option></select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Time Zone</label>
                  <select className={inp}><option>Asia/Kolkata (IST +5:30)</option></select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Date Format</label>
                  <select className={inp}>
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
                <button onClick={handleSave} className="bg-purple-700 hover:bg-purple-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors mt-2">
                  Save Language Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
