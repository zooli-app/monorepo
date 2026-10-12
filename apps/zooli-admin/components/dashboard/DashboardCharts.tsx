"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";

const n = (v: unknown): number => (typeof v === "number" ? v : 0);
const ts = { fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" };

// Revenue line chart
const revenueData = [
  { date: "01 May", revenue: 85000 }, { date: "05 May", revenue: 120000 },
  { date: "10 May", revenue: 98000 },  { date: "15 May", revenue: 165000 },
  { date: "20 May", revenue: 145360 },
];

export function RevenueAreaChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${n(v)/1000}K`} />
        <Tooltip contentStyle={ts} formatter={(v) => [`₹${n(v).toLocaleString("en-IN")}`, "Revenue"]} />
        <Area type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: "#7C3AED" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Orders donut chart
const ordersData = [
  { name: "Food Delivery", value: 3245, color: "#6366F1" },
  { name: "Grocery",       value: 1285, color: "#22C55E" },
  { name: "Ride Booking",  value: 1845, color: "#F59E0B" },
  { name: "Parcel Delivery",value: 745, color: "#EF4444" },
  { name: "Home Services", value: 685,  color: "#8B5CF6" },
  { name: "House Shifting", value: 532, color: "#06B6D4" },
];

export function OrdersDonutChart() {
  const total = ordersData.reduce((a, d) => a + d.value, 0);
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full" style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={ordersData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={2} startAngle={90} endAngle={-270}>
              {ordersData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip contentStyle={ts} formatter={(v) => [n(v).toLocaleString("en-IN"), ""]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-xl font-bold text-gray-900">{total.toLocaleString("en-IN")}</div>
          <div className="text-[10px] text-gray-400">Total</div>
        </div>
      </div>
      <div className="space-y-1.5 w-full mt-1">
        {ordersData.map((d) => {
          const pct = ((d.value / total) * 100).toFixed(1);
          return (
            <div key={d.name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-[11px] text-gray-500 flex-1 truncate">{d.name}</span>
              <span className="text-[11px] font-semibold text-gray-700 tabular-nums">{d.value.toLocaleString("en-IN")} ({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Revenue by service horizontal bars
const serviceRevData = [
  { name: "Food Delivery",  revenue: 465780, color: "#6366F1" },
  { name: "Grocery",        revenue: 285430, color: "#22C55E" },
  { name: "Ride Booking",   revenue: 295680, color: "#F59E0B" },
  { name: "Parcel Delivery",revenue: 98450,  color: "#EF4444" },
  { name: "Home Services",  revenue: 75320,  color: "#8B5CF6" },
  { name: "House Shifting", revenue: 45700,  color: "#06B6D4" },
];

export function RevenueByServiceChart() {
  const max = Math.max(...serviceRevData.map(d => d.revenue));
  return (
    <div className="space-y-3">
      {serviceRevData.map((d) => (
        <div key={d.name}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600 font-medium truncate max-w-[120px]">{d.name}</span>
            <span className="text-xs font-bold text-gray-900 tabular-nums">₹{(d.revenue/1000).toFixed(0)}K</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(d.revenue / max) * 100}%`, backgroundColor: d.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
