"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Menu, Calendar, Search, Bell, Maximize2, ChevronDown,
  Shield, Settings, LogOut, User, KeyRound,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { authStorage } from "@/lib/storage";

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  "/dashboard":              { title: "Super Admin Dashboard",    sub: "Welcome back, Super Admin!" },
  "/analytics":              { title: "Analytics & Reports",      sub: "Platform performance insights" },
  "/orders":                 { title: "Orders Management",        sub: "Manage all service orders" },
  "/vendors":                { title: "Vendor Management",        sub: "Manage all vendor partners" },
  "/users":                  { title: "Customer Management",      sub: "Manage customer accounts" },
  "/services":               { title: "Delivery Management",      sub: "Manage service categories" },
  "/rides":                  { title: "Ride Management",          sub: "Live ride tracking & drivers" },
  "/offers":                 { title: "Promotions & Coupons",     sub: "Create and manage offers" },
  "/offers/banners":         { title: "Banners",                  sub: "Manage promotional banners" },
  "/offers/notifications":   { title: "Push Notifications",       sub: "Send targeted notifications" },
  "/payments":               { title: "Payments & Settlements",   sub: "Transactions and payouts" },
  "/payments/commission":    { title: "Commission & Charges",     sub: "Configure commission rates" },
  "/payments/wallet":        { title: "Wallet Management",        sub: "User wallet and balances" },
  "/payments/transactions":  { title: "Transactions",             sub: "Full transaction history" },
  "/settings":               { title: "Settings",                 sub: "Platform configuration" },
  "/settings/system":        { title: "System Management",        sub: "System health & monitoring" },
};

const NOTIFS = [
  { emoji: "🏪", text: "New vendor registration", sub: "Paradise Biryani, Kukatpally", time: "2 min ago",  bg: "bg-green-100" },
  { emoji: "🛍️", text: "New order received",       sub: "Order #OR125689",              time: "5 min ago",  bg: "bg-blue-100" },
  { emoji: "💰", text: "Payout processed",         sub: "₹2,45,680 to 42 vendors",     time: "15 min ago", bg: "bg-purple-100" },
  { emoji: "⚠️", text: "New complaint received",   sub: "Order #OR125012",              time: "20 min ago", bg: "bg-red-100" },
  { emoji: "🔔", text: "System update",            sub: "App version 2.4.1 released",   time: "1 hr ago",   bg: "bg-amber-100" },
];

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const page      = PAGE_TITLES[pathname] ?? { title: "Zooli Admin", sub: "Super Admin Panel" };

  const [showNotif,   setShowNotif]   = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleLogout() {
    authStorage.clearToken();
    router.push("/login");
  }

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm flex-shrink-0 z-20">
      <div className="flex items-center gap-3 px-4 lg:px-5 h-[60px]">

        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <Menu size={20} />
        </button>

        {/* Page title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-gray-900 truncate leading-tight">{page.title}</h1>
            <Shield size={14} className="text-blue-500 flex-shrink-0" fill="currentColor" />
          </div>
          <p className="text-[11px] text-gray-400 hidden sm:block leading-tight">{page.sub}</p>
        </div>

        {/* Date picker */}
        <div className="hidden md:flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:border-purple-300 transition-colors cursor-pointer flex-shrink-0">
          <Calendar size={13} className="text-purple-500" />
          <span>{today}</span>
          <ChevronDown size={12} className="text-gray-400" />
        </div>

        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-36 lg:w-52 flex-shrink-0 hover:border-purple-300 transition-colors cursor-pointer">
          <Search size={13} className="text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-400">Search anything...</span>
          <kbd className="ml-auto text-[10px] bg-white border border-gray-200 rounded px-1 text-gray-400 hidden lg:block">Ctrl /</kbd>
        </div>

        {/* Notification bell */}
        <div ref={notifRef} className="relative flex-shrink-0">
          <button
            onClick={() => { setShowNotif(v => !v); setShowProfile(false); }}
            className="relative text-gray-500 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              12
            </span>
          </button>

          {showNotif && (
            <div className="absolute right-0 top-11 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                <span className="text-sm font-semibold text-gray-900">Notifications</span>
                <button className="text-xs text-purple-600 font-semibold hover:underline">Mark all read</button>
              </div>
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {NOTIFS.map((n, i) => (
                  <div key={i} className="flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className={`w-8 h-8 rounded-lg ${n.bg} flex items-center justify-center text-sm flex-shrink-0`}>
                      {n.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-800">{n.text}</div>
                      <div className="text-[11px] text-gray-400 truncate">{n.sub}</div>
                    </div>
                    <div className="text-[10px] text-gray-400 flex-shrink-0 whitespace-nowrap">{n.time}</div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-50 text-center">
                <button className="text-xs text-purple-600 font-semibold hover:underline">View All Notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen */}
        <button className="hidden md:flex text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors flex-shrink-0">
          <Maximize2 size={16} />
        </button>

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative flex-shrink-0">
          <button
            onClick={() => { setShowProfile(v => !v); setShowNotif(false); }}
            className="flex items-center gap-2 cursor-pointer p-1.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white text-xs font-bold">SA</span>
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-gray-800 leading-tight">Super Admin</div>
              <div className="text-[10px] text-gray-400 leading-tight">Super Admin</div>
            </div>
            <ChevronDown
              size={13}
              className={`hidden lg:block text-gray-400 transition-transform duration-200 ${showProfile ? "rotate-180" : ""}`}
            />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
              {/* User info */}
              <div className="px-4 py-3 border-b border-gray-50 bg-gradient-to-r from-purple-50 to-purple-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-white text-sm font-bold">SA</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Super Admin</div>
                    <div className="text-[11px] text-gray-400">admin@zooli.in</div>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                <button
                  onClick={() => { setShowProfile(false); router.push("/settings"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <User size={15} className="text-gray-400" />
                  My Profile
                </button>
                <button
                  onClick={() => { setShowProfile(false); router.push("/settings"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <Settings size={15} className="text-gray-400" />
                  Account Settings
                </button>
                <button
                  onClick={() => { setShowProfile(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <KeyRound size={15} className="text-gray-400" />
                  Change Password
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-100 py-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                >
                  <LogOut size={15} className="text-red-500" />
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
