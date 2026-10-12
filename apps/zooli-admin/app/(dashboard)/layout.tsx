"use client";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useRequireRole } from "@/lib/auth/AuthProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useRequireRole("admin");

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}
