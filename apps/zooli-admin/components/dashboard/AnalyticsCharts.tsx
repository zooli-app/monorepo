"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";
import { SectionCard } from "@/components/shared/PageHeader";
import { monthlyRevenueData, userGrowthData, ordersChartData } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

// Recharts v3: ValueType is number|string|Array|undefined — always cast safely
const n = (v: unknown): number => (typeof v === "number" ? v : 0);

const ts = { fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" };
const PIE_COLORS = ["#6D28D9","#F59E0B","#10B981","#3B82F6","#8B5CF6","#EF4444"];

const hourlyData = [
  { hour:"6am",orders:18},{ hour:"8am",orders:64},{ hour:"10am",orders:92},
  { hour:"12pm",orders:186},{ hour:"2pm",orders:124},{ hour:"4pm",orders:98},
  { hour:"6pm",orders:212},{ hour:"8pm",orders:244},{ hour:"10pm",orders:142},
  { hour:"12am",orders:38},
];

const retentionData = [
  {week:"W1",retention:100},{week:"W2",retention:72},{week:"W3",retention:61},
  {week:"W4",retention:54},{week:"W5",retention:48},{week:"W6",retention:44},
  {week:"W7",retention:41},{week:"W8",retention:38},
];

const zoneData = [
  { zone:"Dhone",  revenue:1820000, orders:4842 },
  { zone:"Kurnool",revenue:1240000, orders:3298 },
  { zone:"Hyderabad",revenue:980000,orders:2612 },
  { zone:"Nandyal",revenue:680000, orders:1847 },
  { zone:"Atmakur",revenue:240000, orders:620  },
];

export default function AnalyticsCharts() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <SectionCard title="Monthly Revenue (₹)" actions={<span className="text-xs text-gray-400">Jan–May 2026</span>}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyRevenueData} margin={{ top:4,right:4,left:-20,bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize:11,fill:"#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11,fill:"#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v)=>`₹${n(v)/100000}L`} />
              <Tooltip contentStyle={ts} formatter={(v)=>[formatCurrency(n(v)),"Revenue"]} />
              <Bar dataKey="value" fill="#6D28D9" radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="User Growth" actions={<span className="text-xs text-gray-400">Cumulative</span>}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={userGrowthData} margin={{ top:4,right:4,left:-20,bottom:0 }}>
              <defs>
                <linearGradient id="ugGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize:11,fill:"#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11,fill:"#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v)=>`${n(v)/1000}K`} />
              <Tooltip contentStyle={ts} formatter={(v)=>[n(v).toLocaleString("en-IN"),"Users"]} />
              <Area type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} fill="url(#ugGrad)" dot={{ fill:"#F59E0B",r:3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <SectionCard title="Hourly Order Distribution" actions={<span className="text-xs text-gray-400">Today</span>}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hourlyData} margin={{ top:4,right:4,left:-20,bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize:10,fill:"#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10,fill:"#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={ts} formatter={(v)=>[n(v),"Orders"]} />
              <Bar dataKey="orders" fill="#8B5CF6" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Service Mix by Orders">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={ordersChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                  {ordersChartData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={ts} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {ordersChartData.map((item,i)=>(
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-xs text-gray-600 flex-1">{item.label}</span>
                  <span className="text-xs font-semibold text-gray-900">{item.value.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SectionCard title="Revenue by Zone">
          <div className="space-y-3 mt-1">
            {zoneData.map((z,i)=>(
              <div key={z.zone}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-700 font-medium">{z.zone}</span>
                  <span className="text-gray-500">{z.orders.toLocaleString("en-IN")} orders · <span className="font-semibold text-gray-900">{formatCurrency(z.revenue)}</span></span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width:`${(z.revenue/zoneData[0].revenue)*100}%`, backgroundColor: PIE_COLORS[i] ?? "#6D28D9" }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="User Retention Curve" actions={<span className="text-xs text-gray-400">Cohort: May 2026</span>}>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={retentionData} margin={{ top:4,right:4,left:-20,bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize:11,fill:"#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11,fill:"#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v)=>`${n(v)}%`} domain={[0,100]} />
              <Tooltip contentStyle={ts} formatter={(v)=>[`${n(v)}%`,"Retention"]} />
              <Line type="monotone" dataKey="retention" stroke="#10B981" strokeWidth={2} dot={{ fill:"#10B981",r:3 }} activeDot={{ r:5 }} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>
    </>
  );
}
