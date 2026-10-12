import type { AdminAnalytics } from "@zooli/api-client";

export const shortDate = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
export const monthLabel = (ym: string) => new Date(ym + "-01T00:00:00").toLocaleDateString("en-IN", { month: "short", year: "2-digit" });

export const revenueSeries = (a: AdminAnalytics) => a.daily.map((d) => ({ label: shortDate(d.date), value: Math.round(d.revenue) }));
export const ordersSeries = (a: AdminAnalytics) => a.daily.map((d) => ({ label: shortDate(d.date), value: d.orders }));
export const ridesSeries = (a: AdminAnalytics) => a.daily.map((d) => ({ label: shortDate(d.date), value: d.rides }));
export const rupee = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const STATUS_COLOR: Record<string, string> = {
  pending: "#F59E0B", confirmed: "#3B82F6", preparing: "#8B5CF6", ready_for_pickup: "#A78BFA",
  out_for_delivery: "#06B6D4", delivered: "#10B981", cancelled: "#EF4444",
  requested: "#F59E0B", accepted: "#3B82F6", arrived: "#8B5CF6", in_progress: "#06B6D4", completed: "#10B981",
};
export const statusDonut = (counts: Record<string, number>) =>
  Object.entries(counts).filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()), value: v, color: STATUS_COLOR[k] ?? "#9CA3AF" }));
