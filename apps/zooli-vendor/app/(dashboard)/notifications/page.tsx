"use client";
import { useState } from "react";
import { Bell, ShoppingBag, IndianRupee, Star, Megaphone, Monitor, CheckCheck, Trash2 } from "lucide-react";
import { notifications as initialNotifs } from "@/lib/mock-data";
import { timeAgo } from "@/lib/utils";

type Notif = typeof initialNotifs[0];

const TYPE_META: Record<string, { icon: React.ElementType; bg: string; color: string; label: string }> = {
  order:  { icon: ShoppingBag, bg: "bg-blue-100",   color: "text-blue-600",   label: "Order" },
  payout: { icon: IndianRupee, bg: "bg-green-100",  color: "text-green-600",  label: "Payout" },
  review: { icon: Star,        bg: "bg-amber-100",  color: "text-amber-600",  label: "Review" },
  promo:  { icon: Megaphone,   bg: "bg-purple-100", color: "text-purple-600", label: "Promotion" },
  system: { icon: Monitor,     bg: "bg-gray-100",   color: "text-gray-600",   label: "System" },
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>(initialNotifs);
  const [filter, setFilter] = useState("all");

  const unread = notifs.filter(n => !n.read).length;

  function markRead(id: string)  { setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n)); }
  function markAllRead()          { setNotifs(p => p.map(n => ({ ...n, read: true }))); }
  function deleteNotif(id: string){ setNotifs(p => p.filter(n => n.id !== id)); }

  const filtered = notifs.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter === "order")  return n.type === "order";
    if (filter === "payout") return n.type === "payout";
    if (filter === "review") return n.type === "review";
    return true;
  });

  return (
    <div className="space-y-4 max-w-[800px]">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-400">{unread} unread notification{unread !== 1 ? "s" : ""}</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm font-semibold px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <CheckCheck size={14}/> Mark All Read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {[
            { key:"all",    label:`All (${notifs.length})` },
            { key:"unread", label:`Unread (${unread})` },
            { key:"order",  label:"Orders" },
            { key:"payout", label:"Payouts" },
            { key:"review", label:"Reviews" },
          ].map(t => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className={`px-5 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                filter === t.key ? "border-purple-600 text-purple-700 bg-purple-50/50" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Bell size={40} className="text-gray-200 mb-3"/>
            <div className="text-sm font-semibold text-gray-400">All caught up!</div>
            <div className="text-xs text-gray-300 mt-1">No notifications here</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(n => {
              const meta = TYPE_META[n.type] ?? TYPE_META.system;
              const Icon = meta.icon;
              return (
                <div key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors cursor-pointer ${!n.read ? "bg-blue-50/20" : ""}`}>
                  <div className={`w-10 h-10 rounded-2xl ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={meta.color}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{n.title}</span>
                          {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"/>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">{timeAgo(n.time)}</span>
                        <button onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
                          className="p-1 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 size={12}/>
                        </button>
                      </div>
                    </div>
                    <span className={`inline-block mt-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                      {meta.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
