"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { ChartDataPoint } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const n = (v: unknown) => (typeof v === "number" ? v : 0);

interface RevenueChartProps { data: ChartDataPoint[] }

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6D28D9" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#6D28D9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₹${n(v) / 1000}K`}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
          formatter={(v) => [formatCurrency(n(v)), "Revenue"]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#6D28D9"
          strokeWidth={2}
          fill="url(#revenueGrad)"
          dot={{ fill: "#6D28D9", r: 3 }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
