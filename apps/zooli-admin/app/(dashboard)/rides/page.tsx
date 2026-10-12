"use client";

import { useState } from "react";
import { Car, Clock, MapPin, Users, Search, Navigation } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { SectionCard, PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { rides } from "@/lib/mock-data";
import { formatCurrencyFull } from "@/lib/utils";
import type { RideStatus } from "@/lib/types";

const RIDE_TYPE_EMOJI: Record<string, string> = {
  car: "🚗",
  auto: "🛺",
  bike: "🏍",
};

export default function RidesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = rides.filter((r) => {
    const matchSearch =
      !search ||
      r.passenger.toLowerCase().includes(search.toLowerCase()) ||
      r.driver.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || r.rideType === typeFilter;
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const activeRides = rides.filter((r) => r.status === "on_trip").length;
  const completedRides = rides.filter((r) => r.status === "completed").length;
  const totalFare = rides.reduce((a, r) => a + r.fare, 0);
  const avgDist = (rides.reduce((a, r) => a + r.distance, 0) / rides.length).toFixed(1);

  // Driver stats
  const driverStats = [
    { name: "Suresh Driver", type: "🚗 Car", rides: 42, rating: 4.8, earnings: 5040, status: "on_trip" },
    { name: "Mohan Auto", type: "🛺 Auto", rides: 38, rating: 4.5, earnings: 2280, status: "on_trip" },
    { name: "Kiran Bike", type: "🏍 Bike", rides: 55, rating: 4.7, earnings: 2475, status: "completed" },
    { name: "Raju Auto", type: "🛺 Auto", rides: 29, rating: 4.3, earnings: 2320, status: "completed" },
  ];

  return (
    <div>
      <PageHeader
        title="Rides"
        description="Monitor live rides, drivers and trip management"
      />

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <MetricCard label="Active Rides Now" value={activeRides.toString()} sub="Currently in progress" icon={Car} iconBg="#EDE9FE" iconColor="#6D28D9" />
        <MetricCard label="Completed Today" value={completedRides.toString()} trend={{ value: 8, label: "vs yesterday" }} icon={Navigation} iconBg="#D1FAE5" iconColor="#059669" />
        <MetricCard label="Total Drivers" value="156" sub="Car: 48 · Auto: 64 · Bike: 44" icon={Users} iconBg="#FEF3C7" iconColor="#D97706" />
        <MetricCard label="Avg Wait Time" value="4.2 min" trend={{ value: -12, label: "improved" }} icon={Clock} iconBg="#DBEAFE" iconColor="#2563EB" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {/* Live Map placeholder */}
        <div className="col-span-2">
          <SectionCard title="Live Rides Map" actions={<span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" /> Live</span>}>
            <div className="relative rounded-lg overflow-hidden bg-gray-100 h-52 flex items-center justify-center">
              {/* Map placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200" />
              <div className="relative text-center">
                <MapPin size={32} className="text-purple-400 mx-auto mb-2" />
                <div className="text-sm text-gray-500 font-medium">Dhone & Kurnool Region</div>
                <div className="text-xs text-gray-400 mt-1">Integrate Google Maps / Mapbox SDK here</div>
                {/* Simulated pins */}
                <div className="flex gap-4 mt-3 justify-center">
                  {rides.filter((r) => r.status === "on_trip").map((r) => (
                    <div key={r.id} className="flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-full shadow-sm border border-gray-200">
                      <span>{RIDE_TYPE_EMOJI[r.rideType]}</span>
                      <span className="font-medium text-gray-700">#{r.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Driver Leaderboard */}
        <SectionCard title="Top Drivers Today">
          <div className="space-y-3">
            {driverStats.map((d, i) => (
              <div key={d.name} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-100 text-gray-600" : "bg-orange-50 text-orange-600"}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-900 truncate">{d.name}</div>
                  <div className="text-[10px] text-gray-400">{d.type} · ⭐ {d.rating}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-900">{d.rides} trips</div>
                  <div className="text-[10px] text-gray-400">{formatCurrencyFull(d.earnings)}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Ride Table */}
      <SectionCard noPadding>
        <div className="flex items-center gap-3 p-4 border-b border-gray-50">
          <div className="flex items-center gap-2 flex-1 max-w-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <Search size={14} className="text-gray-400" />
            <input
              className="bg-transparent text-sm outline-none flex-1 placeholder-gray-400"
              placeholder="Search rides..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="car">🚗 Car</option>
            <option value="auto">🛺 Auto</option>
            <option value="bike">🏍 Bike</option>
          </select>
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="on_trip">On Trip</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="assigned">Assigned</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {["Ride ID","Passenger","Driver","Type","From","To","Distance","Fare","Zone","Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((ride) => (
                <tr key={ride.id} className="border-t border-gray-50 table-row-hover cursor-pointer transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-purple-700">#{ride.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{ride.passenger}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{ride.driver}</div>
                    <div className="text-xs text-gray-400">{ride.driverPhone}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{RIDE_TYPE_EMOJI[ride.rideType]} {ride.rideType.charAt(0).toUpperCase() + ride.rideType.slice(1)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{ride.from}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{ride.to}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{ride.distance} km</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrencyFull(ride.fare)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{ride.zone}</td>
                  <td className="px-4 py-3">
                    <StatusBadge type="ride" status={ride.status as RideStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
