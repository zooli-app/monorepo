"use client";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { revenueMonthData } from "@/lib/mock-data";

export interface WeekPoint { day: string; revenue: number; orders: number }

const n = (v: unknown): number => (typeof v === "number" ? v : 0);
const ts = { fontSize: 11, borderRadius: 10, border: "1px solid #e5e7eb", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" };

export function WeeklyRevenueChart({ data: revenueWeekData }: { data: WeekPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={revenueWeekData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${n(v) / 1000}K`} />
        <Tooltip contentStyle={ts} formatter={(v) => [`₹${n(v).toLocaleString("en-IN")}`, "Revenue"]} />
        <Area type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: "#7C3AED", strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function WeeklyOrdersChart({ data: revenueWeekData }: { data: WeekPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={revenueWeekData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={ts} formatter={(v) => [n(v), "Orders"]} />
        <Bar dataKey="orders" radius={[5, 5, 0, 0]}>
          {revenueWeekData.map((_, i) => (
            <Cell key={i} fill={i === 5 ? "#F59E0B" : "#C4B5FD"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MonthlyRevenueChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={revenueMonthData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${n(v) / 1000}K`} />
        <Tooltip contentStyle={ts} formatter={(v) => [`₹${n(v).toLocaleString("en-IN")}`, "Revenue"]} />
        <Bar dataKey="revenue" fill="#7C3AED" radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
