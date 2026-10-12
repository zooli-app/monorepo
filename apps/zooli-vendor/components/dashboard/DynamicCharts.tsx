"use client";
import dynamic from "next/dynamic";
const Spin = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
  </div>
);
export const DynWeeklyRevenue = dynamic(() => import("./VendorCharts").then(m => ({ default: m.WeeklyRevenueChart })), { ssr: false, loading: Spin });
export const DynWeeklyOrders  = dynamic(() => import("./VendorCharts").then(m => ({ default: m.WeeklyOrdersChart  })), { ssr: false, loading: Spin });
export const DynMonthlyRevenue= dynamic(() => import("./VendorCharts").then(m => ({ default: m.MonthlyRevenueChart})), { ssr: false, loading: Spin });
