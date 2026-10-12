"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BarChart3, Store, Car, ShoppingBag, Users, Truck,
  CreditCard, Percent, ClipboardList, Wallet, ArrowLeftRight, Tag, Image, Bell,
  FileText, Settings, Monitor, HelpCircle, ChevronLeft, ChevronRight, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLeaf { href: string; icon: React.ElementType; label: string }
interface NavGroup { section: string; items: NavLeaf[] }
type NavEntry = NavLeaf | NavGroup;

const NAV: NavEntry[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/analytics",  icon: BarChart3,       label: "Analytics" },
  {
    section: "MANAGEMENT",
    items: [
      { href: "/vendors",  icon: Store,       label: "Vendor Management" },
      { href: "/applications", icon: ClipboardList, label: "Vendor Applications" },
      { href: "/rides",    icon: Car,         label: "Ride Management" },
      { href: "/orders",   icon: ShoppingBag, label: "Orders Management" },
      { href: "/users",    icon: Users,       label: "Customer Management" },
      { href: "/services", icon: Truck,       label: "Delivery Management" },
    ],
  },
  {
    section: "FINANCE",
    items: [
      { href: "/payments",                 icon: CreditCard,     label: "Payments & Settlements" },
      { href: "/payments/commission",      icon: Percent,        label: "Commission & Charges" },
      { href: "/payments/wallet",          icon: Wallet,         label: "Wallet Management" },
      { href: "/payments/transactions",    icon: ArrowLeftRight, label: "Transactions" },
    ],
  },
  {
    section: "MARKETING",
    items: [
      { href: "/offers",                   icon: Tag,   label: "Promotions & Coupons" },
      { href: "/offers/banners",           icon: Image, label: "Banners" },
      { href: "/offers/notifications",     icon: Bell,  label: "Push Notifications" },
    ],
  },
  {
    section: "REPORTS & SETTINGS",
    items: [
      { href: "/analytics",        icon: FileText, label: "Reports" },
      { href: "/settings",         icon: Settings, label: "Settings" },
      { href: "/settings/system",  icon: Monitor,  label: "System Management" },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse, onClose }: SidebarProps) {
  const pathname = usePathname();

  // ── EXACT match only — prevents multiple items highlighting ──────────
  const isActive = (href: string) => pathname === href;

  function renderLeaf(nav: NavLeaf) {
    return (
      <NavLink
        key={nav.href + nav.label}
        href={nav.href}
        icon={nav.icon}
        label={nav.label}
        active={isActive(nav.href)}
        collapsed={collapsed}
      />
    );
  }

  return (
    <aside className="h-full bg-white border-r border-gray-100 flex flex-col shadow-sm">
      {/* Logo */}
      <div className={cn(
        "flex items-center justify-between px-4 py-4 border-b border-gray-100",
        collapsed && "px-3 justify-center"
      )}>
        {!collapsed && (
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/zooli-logo.png" alt="Zooli" className="h-10 w-auto" />
            <div className="text-[9px] text-gray-400 tracking-[0.18em] font-medium mt-1">
              ADMIN CONSOLE
            </div>
          </div>
        )}
        {collapsed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/zooli-mark.png" alt="Zooli" className="h-8 w-8 object-contain" />
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 sidebar-scroll">
        {NAV.map((entry, idx) => {
          if ("section" in entry) {
            return (
              <div key={idx} className="mt-2">
                {!collapsed && (
                  <div className="px-3 py-1 text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                    {entry.section}
                  </div>
                )}
                {collapsed && (
                  <div className="border-t border-gray-100 my-2 mx-1" />
                )}
                <div className="space-y-0.5">
                  {entry.items.map(renderLeaf)}
                </div>
              </div>
            );
          }
          return renderLeaf(entry);
        })}
      </nav>

      {/* Help */}
      <div className={cn("border-t border-gray-100 p-3", collapsed && "flex justify-center")}>
        {!collapsed ? (
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-50 border border-purple-100">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <HelpCircle size={15} className="text-purple-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-800">Need Help?</div>
              <div className="text-[10px] text-gray-400">support@zooli.in</div>
            </div>
          </div>
        ) : (
          <button
            title="Need Help?"
            className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center hover:bg-purple-100 transition-colors"
          >
            <HelpCircle size={15} className="text-purple-600" />
          </button>
        )}
      </div>
    </aside>
  );
}

// ── Nav link ──────────────────────────────────────────────────────────
function NavLink({
  href, icon: Icon, label, active, collapsed,
}: NavLeaf & { active: boolean; collapsed: boolean }) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-2.5 px-3 py-[7px] rounded-xl text-[13px] font-medium transition-all group relative",
        active
          ? "bg-purple-50 text-purple-700"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800",
        collapsed && "justify-center px-0 w-10 mx-auto"
      )}
    >
      {/* Left accent bar */}
      {!collapsed && (
        <span className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all",
          active ? "h-5 bg-purple-600" : "h-0"
        )} />
      )}

      <Icon
        size={16}
        className={cn(
          "flex-shrink-0",
          active ? "text-purple-600" : "text-gray-400 group-hover:text-gray-600"
        )}
      />

      {!collapsed && <span className="truncate">{label}</span>}

      {/* Collapsed tooltip */}
      {collapsed && (
        <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 shadow-lg transition-opacity">
          {label}
        </span>
      )}
    </Link>
  );
}
