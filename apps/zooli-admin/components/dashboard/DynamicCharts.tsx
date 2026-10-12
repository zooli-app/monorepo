"use client";
import dynamic from "next/dynamic";

const Loading = () => <div className="w-full h-full flex items-center justify-center"><div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>;

export const DynamicRevenueChart = dynamic(() => import("./DashboardCharts").then(m => ({ default: m.RevenueAreaChart })), { ssr: false, loading: Loading });
export const DynamicOrdersChart  = dynamic(() => import("./DashboardCharts").then(m => ({ default: m.OrdersDonutChart  })), { ssr: false, loading: Loading });
export const DynamicServiceChart = dynamic(() => import("./DashboardCharts").then(m => ({ default: m.RevenueByServiceChart })), { ssr: false, loading: Loading });
export const DynamicAnalyticsCharts = dynamic(() => import("./AnalyticsCharts"), { ssr: false, loading: Loading });
