import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: { value: number; label: string };
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  className?: string;
}

export function MetricCard({
  label, value, sub, trend, icon: Icon, iconColor, iconBg, className,
}: MetricCardProps) {
  const isPositive = trend && trend.value >= 0;

  return (
    <div className={cn("bg-white rounded-xl border border-gray-100 p-4 shadow-sm", className)}>
      {Icon && (
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
          style={{ backgroundColor: iconBg ?? "#EDE9FE" }}
        >
          <Icon size={18} style={{ color: iconColor ?? "#6D28D9" }} />
        </div>
      )}
      <div className="text-xs text-gray-400 font-medium mb-1">{label}</div>
      <div className="text-2xl font-semibold text-gray-900 leading-none">{value}</div>
      {trend && (
        <div className={cn("flex items-center gap-1 mt-1.5 text-xs font-medium", isPositive ? "text-emerald-600" : "text-red-500")}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>
            {isPositive ? "+" : ""}{trend.value}% {trend.label}
          </span>
        </div>
      )}
      {sub && !trend && (
        <div className="text-xs text-gray-400 mt-1">{sub}</div>
      )}
    </div>
  );
}
