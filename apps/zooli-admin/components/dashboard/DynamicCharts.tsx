"use client";
import dynamic from "next/dynamic";

const Loading = () => <div className="w-full h-[200px] flex items-center justify-center"><div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>;

export const DynamicTrend = dynamic(() => import("./RealCharts").then((m) => ({ default: m.TrendChart })), { ssr: false, loading: Loading });
export const DynamicDonut = dynamic(() => import("./RealCharts").then((m) => ({ default: m.Donut })), { ssr: false, loading: Loading });
