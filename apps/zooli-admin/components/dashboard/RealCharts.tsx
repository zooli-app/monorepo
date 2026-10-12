"use client";

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

export interface Point { label: string; value: number }
const tick = { fontSize: 11, fill: "#9ca3af" };

export function TrendChart({ data, kind = "area", color = "#6D28D9", format = (n: number) => String(n), height = 200 }: {
  data: Point[]; kind?: "area" | "bar"; color?: string; format?: (n: number) => string; height?: number;
}) {
  const common = { data, margin: { top: 4, right: 4, left: -10, bottom: 0 } };
  const axes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
      <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
      <YAxis tick={tick} axisLine={false} tickLine={false} allowDecimals={false} tickFormatter={(v) => format(Number(v))} />
      <Tooltip formatter={(v) => format(Number(v))} contentStyle={{ borderRadius: 10, border: "1px solid #eee", fontSize: 12 }} />
    </>
  );
  return (
    <ResponsiveContainer width="100%" height={height}>
      {kind === "bar" ? (
        <BarChart {...common}>{axes}<Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} /></BarChart>
      ) : (
        <AreaChart {...common}>{axes}<Area dataKey="value" stroke={color} fill={color} fillOpacity={0.12} strokeWidth={2} /></AreaChart>
      )}
    </ResponsiveContainer>
  );
}

export function Donut({ data, height = 200 }: { data: { name: string; value: number; color: string }[]; height?: number }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-[160px] shrink-0">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={48} outerRadius={72} paddingAngle={2}>
              {data.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #eee", fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1.5 text-xs min-w-0">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2 text-gray-600">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
            <span className="truncate">{d.name}</span><b className="ml-auto pl-2 text-gray-900">{d.value}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
