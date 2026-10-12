"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, IndianRupee,
  Star, UserCircle, Bell, Settings, ChevronLeft, ChevronRight, X, HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { notifications } from "@/lib/mock-data";

const NAV = [
  { href: "/dashboard",     icon: LayoutDashboard, label: "Dashboard" },
  { href: "/orders",        icon: ShoppingBag,     label: "Orders",          badgeKey: "orders" },
  { href: "/menu",          icon: UtensilsCrossed, label: "Menu & Items" },
  { href: "/earnings",      icon: IndianRupee,     label: "Earnings" },
  { href: "/reviews",       icon: Star,            label: "Reviews & Ratings" },
  { href: "/profile",       icon: UserCircle,      label: "Business Profile" },
  { href: "/notifications", icon: Bell,            label: "Notifications",    badgeKey: "notifs" },
  { href: "/settings",      icon: Settings,        label: "Settings" },
];

interface Props { collapsed: boolean; onToggleCollapse: () => void; onClose: () => void; }

export function VendorSidebar({ collapsed, onToggleCollapse, onClose }: Props) {
  const pathname = usePathname();
  const unreadNotifs = notifications.filter(n => !n.read).length;
  const newOrders = 2; // mock

  const getBadge = (key?: string) => {
    if (key === "orders") return newOrders > 0 ? newOrders.toString() : null;
    if (key === "notifs") return unreadNotifs > 0 ? unreadNotifs.toString() : null;
    return null;
  };

  return (
    <aside className="h-full bg-white border-r border-gray-100 shadow-sm flex flex-col">
      {/* Logo */}
      <div className={cn("flex items-center justify-between px-4 py-4 border-b border-gray-100 flex-shrink-0", collapsed && "px-3 justify-center")}>
        {!collapsed && (
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/zooli-logo.png" alt="Zooli" className="h-10 w-auto" />
            <div className="text-[9px] text-gray-400 tracking-[0.2em] font-semibold mt-1">VENDOR PORTAL</div>
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {collapsed && <img src="/zooli-mark.png" alt="Zooli" className="h-8 w-8 object-contain" />}
        <div className="flex gap-1">
          <button onClick={onToggleCollapse} className="hidden lg:flex text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition-colors" title={collapsed ? "Expand" : "Collapse"}>
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
          <button onClick={onClose} className="lg:hidden text-gray-400 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"><X size={15} /></button>
        </div>
      </div>

      {/* Vendor info chip */}
      {!collapsed && (
        <div className="mx-3 mt-3 mb-1 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
              HP
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-gray-900 truncate">Hotel Paradise</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-semibold text-amber-600">⭐ 4.7</span>
                <span className="text-gray-300">·</span>
                <span className="text-[10px] text-gray-400">Food & Beverages</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">OPEN</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 sidebar-scroll">
        {NAV.map(({ href, icon: Icon, label, badgeKey }) => {
          const active = pathname === href;
          const badge = getBadge(badgeKey);
          return (
            <Link key={href} href={href} title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-2.5 px-3 py-[8px] rounded-xl text-[13px] font-medium transition-all group relative",
                active ? "bg-purple-50 text-purple-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800",
                collapsed && "justify-center px-0 w-10 mx-auto"
              )}>
              {/* Active bar */}
              {!collapsed && (
                <span className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-200",
                  active ? "h-6 bg-purple-600" : "h-0")} />
              )}
              <Icon size={17} className={cn("flex-shrink-0 transition-colors",
                active ? "text-purple-600" : "text-gray-400 group-hover:text-gray-600")} />
              {!collapsed && <span className="flex-1 truncate">{label}</span>}
              {!collapsed && badge && (
                <span className="bg-red-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full">{badge}</span>
              )}
              {collapsed && badge && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">{badge}</span>
              )}
              {/* Tooltip */}
              {collapsed && (
                <span className="pointer-events-none absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 shadow-lg transition-opacity">
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Help */}
      <div className={cn("border-t border-gray-100 p-3 flex-shrink-0", collapsed && "flex justify-center")}>
        {!collapsed ? (
          <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-100 rounded-2xl">
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <HelpCircle size={15} className="text-purple-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-800">Need Help?</div>
              <div className="text-[10px] text-purple-600 font-medium">support@zooli.in</div>
            </div>
          </div>
        ) : (
          <button title="Help" className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center hover:bg-purple-100 transition-colors">
            <HelpCircle size={15} className="text-purple-600" />
          </button>
        )}
      </div>
    </aside>
  );
}
