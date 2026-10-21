"use client";
import { VendorShell } from "@/components/layout/VendorShell";
import { useRequireRole } from "@/lib/auth/AuthProvider";
import { StoreProvider } from "@/lib/auth/StoreProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, mustChangePassword } = useRequireRole("vendor");

  if (loading || !profile || mustChangePassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <StoreProvider>
      <VendorShell>{children}</VendorShell>
    </StoreProvider>
  );
}
