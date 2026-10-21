"use client";
import dynamic from "next/dynamic";
import type { WeekPoint, MonthPoint } from "./VendorCharts";
const Spin = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
  </div>
);
const _DynWeeklyRevenue = dynamic<{ data: WeekPoint[] }>(() => import("./VendorCharts").then(m => ({ default: m.WeeklyRevenueChart })), { ssr: false, loading: Spin });
const _DynWeeklyOrders = dynamic<{ data: WeekPoint[] }>(() => import("./VendorCharts").then(m => ({ default: m.WeeklyOrdersChart  })), { ssr: false, loading: Spin });
const _DynMonthlyRevenue = dynamic<{ data: MonthPoint[] }>(() => import("./VendorCharts").then(m => ({ default: m.MonthlyRevenueChart})), { ssr: false, loading: Spin });

export const DynWeeklyRevenue = _DynWeeklyRevenue;
export const DynWeeklyOrders = _DynWeeklyOrders;
export const DynMonthlyRevenue = _DynMonthlyRevenue;
