"use client";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Bell, ChevronDown, Settings, LogOut, User, ToggleLeft, ToggleRight, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useStore } from "@/lib/auth/StoreProvider";
import { api } from "@/lib/api";
import type { VendorOrder } from "@zooli/api-client";

const TITLES: Record<string, { title: string; sub: string }> = {
  "/dashboard":     { title: "Dashboard",           sub: "Overview of your business today" },
  "/orders":        { title: "Orders",              sub: "Manage incoming and active orders" },
  "/menu":          { title: "Menu & Items",         sub: "Manage your menu and pricing" },
  "/earnings":      { title: "Earnings",            sub: "Revenue, payouts and financials" },
  "/reviews":       { title: "Reviews & Ratings",   sub: "Customer feedback and responses" },
  "/profile":       { title: "Business Profile",    sub: "Your business information" },
  "/notifications": { title: "Notifications",       sub: "Recent alerts and updates" },
  "/settings":      { title: "Settings",            sub: "Account and preferences" },
};

export function VendorTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const pg = TITLES[pathname] ?? { title: "Zooli Vendor", sub: "" };

  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const { profile, logout } = useAuth();
  const { store, email, setOpen } = useStore();
  const isOpen = store?.is_open ?? false;
  const ownerName = profile?.full_name || email.split("@")[0] || "Vendor";
  const ownerInitials = ownerName.split(/\s+/).filter(Boolean).map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() || "V";

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef   = useRef<HTMLDivElement>(null);

  const [recent, setRecent] = useState<VendorOrder[]>([]);
  useEffect(() => {
    const load = () => api.vendor.orders().then(r => setRecent(r.orders)).catch(() => {});
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);
  const unread = recent.filter(o => o.status === "pending");

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setShowNotif(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm flex-shrink-0 z-20">
      <div className="flex items-center gap-3 px-4 lg:px-5 h-[60px]">
        {/* Hamburger */}
        <button onClick={onMenuClick} className="lg:hidden text-gray-500 p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">
          <Menu size={20} />
        </button>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-[15px] font-bold text-gray-900 leading-tight truncate">{pg.title}</h1>
          <p className="text-[11px] text-gray-400 hidden sm:block leading-tight">{pg.sub}</p>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 w-44 hover:border-purple-300 transition-colors cursor-pointer flex-shrink-0">
          <Search size={13} className="text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-400">Search...</span>
        </div>

        {/* Store open/close toggle */}
        <button
          onClick={() => setOpen(!isOpen)}
          disabled={!store}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex-shrink-0 ${
            isOpen
              ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
          }`}
        >
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isOpen ? "bg-emerald-500 pulse-ring" : "bg-gray-400"}`} />
          {isOpen ? "Store Open" : "Store Closed"}
          {isOpen ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative flex-shrink-0">
          <button
            onClick={() => { setShowNotif(v => !v); setShowProfile(false); }}
            className="relative text-gray-500 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Bell size={18} />
            {unread.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unread.length}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                <span className="text-sm font-bold text-gray-900">Notifications</span>
              </div>
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {recent.slice(0, 6).map(o => (
                  <div key={o.id} className={`flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${o.status === "pending" ? "bg-blue-50/30" : ""}`}
                    onClick={() => { router.push("/orders"); setShowNotif(false); }}>
                    <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-sm flex-shrink-0">🛍️</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                        {o.status === "pending" ? "New order received" : `Order ${o.status.replace(/_/g, " ")}`}
                        {o.status === "pending" && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate">#{o.id.slice(0, 8)} · ₹{o.total}</div>
                    </div>
                  </div>
                ))}
                {recent.length === 0 && <div className="px-4 py-8 text-center text-xs text-gray-400">No notifications yet</div>}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-50 text-center">
                <button onClick={() => { router.push("/notifications"); setShowNotif(false); }}
                  className="text-xs text-purple-600 font-bold hover:underline">
                  View All Notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative flex-shrink-0">
          <button
            onClick={() => { setShowProfile(v => !v); setShowNotif(false); }}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-white text-xs font-bold">{ownerInitials}</span>
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-gray-800 leading-tight">{ownerName}</div>
              <div className="text-[10px] text-gray-400 leading-tight">{store?.name ?? ""}</div>
            </div>
            <ChevronDown size={13} className={`hidden lg:block text-gray-400 transition-transform duration-200 ${showProfile ? "rotate-180" : ""}`} />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-60 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
              {/* User header */}
              <div className="px-4 py-4 border-b border-gray-50 bg-gradient-to-br from-amber-50 to-orange-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-white font-bold">{ownerInitials}</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{ownerName}</div>
                    <div className="text-[11px] text-gray-400 break-all">{email}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">APPROVED</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="py-2">
                {[
                  { icon: User,     label: "My Profile",       href: "/profile" },
                  { icon: Bell,     label: "Notifications",    href: "/notifications" },
                  { icon: Settings, label: "Settings",         href: "/settings" },
                ].map(item => (
                  <button key={item.href}
                    onClick={() => { setShowProfile(false); router.push(item.href); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                    <item.icon size={14} className="text-gray-400" />
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-100 py-2">
                <button
                  onClick={async () => { await logout(); router.replace("/login"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold">
                  <LogOut size={14} className="text-red-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
