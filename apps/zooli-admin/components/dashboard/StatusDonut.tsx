"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { statusPieData } from "@/lib/mock-data";

const n = (v: unknown) => (typeof v === "number" ? v : 0);

export function StatusDonut() {
  return (
    <div>
      <ResponsiveContainer width="100%" height={140}>
        <PieChart>
          <Pie
            data={statusPieData}
            cx="50%" cy="50%"
            innerRadius={42} outerRadius={62}
            dataKey="value"
            paddingAngle={2}
          >
            {statusPieData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
            formatter={(v) => [`${n(v)}%`, ""]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-1.5 mt-2">
        {statusPieData.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-[11px] text-gray-500">{item.name}</span>
            <span className="text-[11px] font-semibold text-gray-700 ml-auto">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
