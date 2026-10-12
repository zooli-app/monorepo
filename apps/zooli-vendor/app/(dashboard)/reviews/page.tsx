"use client";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { api } from "@/lib/api";
import type { Review } from "@zooli/api-client";

// Sentiment classification and vendor replies from the original mock design
// don't exist in the backend (no NLP pipeline, no reviews.reply column) —
// this shows every real field instead: rating, comment, reviewer, and date.
export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<number | "all">("all");

  useEffect(() => {
    api.vendor.reviews().then(({ reviews }) => setReviews(reviews)).finally(() => setLoading(false));
  }, []);

  const avg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : "0.0";
  const dist = [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length }));
  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.rating === filter);

  if (loading) {
    return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5 max-w-[1100px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center justify-center">
          <div className="text-6xl font-black text-gray-900">{avg}</div>
          <div className="flex gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className={`text-2xl ${i <= Math.round(Number(avg)) ? "text-amber-400" : "text-gray-200"}`}>★</span>
            ))}
          </div>
          <div className="text-xs text-gray-400 mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""} total</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="text-sm font-bold text-gray-900 mb-3">Rating Breakdown</div>
          <div className="space-y-2">
            {dist.map((d) => (
              <button key={d.star} onClick={() => setFilter(d.star)} className="flex items-center gap-2 w-full text-left">
                <span className="text-xs text-gray-500 w-3">{d.star}</span>
                <Star size={11} className="text-amber-400 fill-current" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${reviews.length ? (d.count / reviews.length) * 100 : 0}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-4 text-right">{d.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          <button onClick={() => setFilter("all")} className={`px-5 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${filter === "all" ? "border-purple-600 text-purple-700 bg-purple-50/50" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            All ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button key={star} onClick={() => setFilter(star)} className={`px-5 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${filter === star ? "border-purple-600 text-purple-700 bg-purple-50/50" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {star}★ ({reviews.filter((r) => r.rating === star).length})
            </button>
          ))}
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.map((r) => (
            <div key={r.id} className="p-5 hover:bg-gray-50/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {(r.profiles?.full_name ?? "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-sm font-bold text-gray-900">{r.profiles?.full_name ?? "Customer"}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span key={i} className={`text-base ${i <= r.rating ? "text-amber-400" : "text-gray-200"}`}>★</span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">{timeAgo(r.created_at)}</span>
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-gray-700 mt-2 leading-relaxed">{r.comment}</p>}
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3">⭐</div>
              <div className="text-sm font-semibold text-gray-400">No reviews {filter !== "all" ? "at this rating" : "yet"}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
