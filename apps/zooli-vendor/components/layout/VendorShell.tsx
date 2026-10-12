"use client";
import { useState, useEffect } from "react";
import { VendorSidebar } from "./VendorSidebar";
import { VendorTopbar } from "./VendorTopbar";

export function VendorShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 1024) setSidebarOpen(false); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  return (
    <div className="flex h-screen bg-[#F5F6FA] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-[2px]"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative z-40 lg:z-auto h-full transition-all duration-300 flex-shrink-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${collapsed ? "lg:w-[68px]" : "lg:w-[240px]"}
        w-[240px]
      `}>
        <VendorSidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(c => !c)}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <VendorTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-5 fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
