"use client";
import { useEffect, useState } from "react";
import { Bell, ShoppingBag, Star } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { api } from "@/lib/api";
import type { VendorOrder, Review } from "@zooli/api-client";

interface Item { id: string; type: "order" | "review"; title: string; body: string; time: string }

const META = {
  order:  { icon: ShoppingBag, bg: "bg-blue-100",  color: "text-blue-600",  label: "Order" },
  review: { icon: Star,        bg: "bg-amber-100", color: "text-amber-600", label: "Review" },
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "order" | "review">("all");

  useEffect(() => {
    Promise.all([api.vendor.orders(), api.vendor.reviews()])
      .then(([o, r]) => {
        const orderItems: Item[] = (o.orders as VendorOrder[]).slice(0, 30).map((x) => ({
          id: `o-${x.id}`, type: "order", time: x.created_at,
          title: x.status === "pending" ? "New order received" : `Order ${x.status.replace(/_/g, " ")}`,
          body: `Order #${x.id.slice(0, 8)} · ₹${x.total}${x.profiles?.full_name ? ` · ${x.profiles.full_name}` : ""}`,
        }));
        const reviewItems: Item[] = (r.reviews as Review[]).slice(0, 30).map((x) => ({
          id: `r-${x.id}`, type: "review", time: x.created_at,
          title: `New ${x.rating}★ review`, body: x.comment || "No comment left.",
        }));
        setItems([...orderItems, ...reviewItems].sort((a, b) => +new Date(b.time) - +new Date(a.time)));
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((i) => filter === "all" || i.type === filter);

  if (loading) {
    return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-4 max-w-[800px]">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
        <p className="text-sm text-gray-400">Recent order and review activity for your store</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {([["all", "All"], ["order", "Orders"], ["review", "Reviews"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)}
              className={`px-5 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${filter === k ? "border-purple-600 text-purple-700 bg-purple-50/50" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {l}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Bell size={40} className="text-gray-200 mb-3" />
            <div className="text-sm font-semibold text-gray-400">Nothing here yet</div>
            <div className="text-xs text-gray-300 mt-1">New orders and reviews will show up here</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((n) => {
              const meta = META[n.type]; const Icon = meta.icon;
              return (
                <div key={n.id} className="flex items-start gap-4 px-5 py-4">
                  <div className={`w-10 h-10 rounded-2xl ${meta.bg} flex items-center justify-center flex-shrink-0`}><Icon size={18} className={meta.color} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{n.title}</div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{timeAgo(n.time)}</span>
                    </div>
                    <span className={`inline-block mt-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>{meta.label}</span>
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
