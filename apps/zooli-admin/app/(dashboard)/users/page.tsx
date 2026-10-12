"use client";

import { useEffect, useState } from "react";
import { Search, Eye, MoreVertical, Users, UserCheck, ShieldCheck, Car } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { SectionCard, PageHeader } from "@/components/shared/PageHeader";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api";
import type { AdminUser } from "@zooli/api-client";

// Wallet balance / total spent / zone / last-active don't exist in the
// backend yet (no wallet or per-user analytics tables) — this page shows
// only what's real: role, phone, and join date, from every `profiles` row.
const ROLE_STYLE: Record<string, string> = {
  customer: "bg-blue-50 text-blue-700 border border-blue-200",
  vendor: "bg-purple-50 text-purple-700 border border-purple-200",
  driver: "bg-amber-50 text-amber-700 border border-amber-200",
  admin: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    api.admin.users().then(({ users }) => setUsers(users)).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch = !search || (u.full_name ?? "").toLowerCase().includes(search.toLowerCase()) || (u.phone ?? "").includes(search);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const customerCount = users.filter((u) => u.role === "customer").length;
  const vendorCount = users.filter((u) => u.role === "vendor").length;
  const driverCount = users.filter((u) => u.role === "driver").length;

  if (loading) {
    return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="Users" description="Every account on the platform, across all roles" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <MetricCard label="Total Accounts" value={users.length.toString()} icon={Users} iconBg="#EDE9FE" iconColor="#6D28D9" />
        <MetricCard label="Customers" value={customerCount.toString()} icon={UserCheck} iconBg="#DBEAFE" iconColor="#2563EB" />
        <MetricCard label="Vendors" value={vendorCount.toString()} icon={ShieldCheck} iconBg="#F3E8FF" iconColor="#7C3AED" />
        <MetricCard label="Drivers" value={driverCount.toString()} icon={Car} iconBg="#FEF3C7" iconColor="#D97706" />
      </div>

      <SectionCard noPadding>
        <div className="flex items-center gap-3 p-4 border-b border-gray-50">
          <div className="flex items-center gap-2 flex-1 max-w-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <Search size={14} className="text-gray-400" />
            <input className="bg-transparent text-sm outline-none flex-1 placeholder-gray-400"
              placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-600 outline-none"
            value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>
          <span className="ml-auto text-xs text-gray-400">{filtered.length} users</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {["User", "Phone", "Role", "Joined", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-t border-gray-50 table-row-hover cursor-pointer transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700 flex-shrink-0">
                        {(user.full_name ?? "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{user.full_name ?? "Unnamed"}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${ROLE_STYLE[user.role] ?? "bg-gray-50 text-gray-600 border border-gray-200"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="text-gray-400 hover:text-purple-600 p-1 rounded transition-colors"><Eye size={14} /></button>
                      <button className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"><MoreVertical size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-gray-400">No users match your filters.</div>
        )}
      </SectionCard>
    </div>
  );
}
