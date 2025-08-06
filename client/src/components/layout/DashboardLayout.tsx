import React from "react";
import { TopNavigation } from "./TopNavigation";
import { SidebarNavigation } from "./SidebarNavigation";
import { DashboardTabs } from "./DashboardTabs";

interface DashboardLayoutProps {
  children: React.ReactNode;
  showTabs?: boolean;
}

export function DashboardLayout({ children, showTabs = false }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Navigation */}
      <SidebarNavigation />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNavigation />
        
        {/* Dashboard Tabs (if enabled) - removed by default to avoid duplication with sidebar */}
        {showTabs && <DashboardTabs />}
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}