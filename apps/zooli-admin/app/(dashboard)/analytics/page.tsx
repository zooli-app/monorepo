import { TrendingUp, Users, Star, Clock, Download } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { DynamicAnalyticsCharts } from "@/components/dashboard/DynamicCharts";

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Platform performance insights and growth metrics"
        actions={
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={14} />
            Export Report
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <MetricCard
          label="NPS Score"
          value="72"
          trend={{ value: 8, label: "from last month" }}
          icon={Star}
          iconBg="#FEF3C7"
          iconColor="#D97706"
        />
        <MetricCard
          label="App Rating"
          value="4.6 ⭐"
          sub="12,480 reviews total"
          icon={Star}
          iconBg="#EDE9FE"
          iconColor="#6D28D9"
        />
        <MetricCard
          label="Avg Delivery Time"
          value="28 min"
          trend={{ value: -11, label: "improved" }}
          icon={Clock}
          iconBg="#D1FAE5"
          iconColor="#059669"
        />
        <MetricCard
          label="User Retention (30d)"
          value="67%"
          trend={{ value: 5, label: "vs last month" }}
          icon={Users}
          iconBg="#DBEAFE"
          iconColor="#2563EB"
        />
      </div>

      {/* All charts — rendered client-side only (no SSR) */}
      <DynamicAnalyticsCharts />
    </div>
  );
}
