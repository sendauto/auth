import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { 
  Home, 
  User, 
  CreditCard, 
  Settings, 
  Users, 
  Building, 
  BarChart3, 
  Shield, 
  Database,
  Activity
} from "lucide-react";

interface DashboardTab {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredRoles?: string[];
}

const dashboardTabs: DashboardTab[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: Home,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
  },
  {
    href: "/subscription",
    label: "Subscription",
    icon: CreditCard,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
  {
    href: "/team",
    label: "Team",
    icon: Users,
    requiredRoles: ["manager", "admin", "super_admin"],
  },
  {
    href: "/organization",
    label: "Organization",
    icon: Building,
    requiredRoles: ["manager", "admin", "super_admin"],
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: BarChart3,
    requiredRoles: ["manager", "admin", "super_admin"],
  },
  {
    href: "/admin/security",
    label: "Security",
    icon: Shield,
    requiredRoles: ["admin", "super_admin"],
  },
  {
    href: "/admin/data",
    label: "Data",
    icon: Database,
    requiredRoles: ["admin", "super_admin"],
  },
  {
    href: "/mx-monitoring",
    label: "MX Intelligence",
    icon: Activity,
    requiredRoles: ["admin", "super_admin"],
  },
];

export function DashboardTabs() {
  const [location] = useLocation();
  const { user } = useAuth();

  const hasRole = (roles: string[]) => {
    if (!user?.roles) return false;
    return roles.some(role => user.roles.includes(role));
  };

  const canAccessTab = (tab: DashboardTab) => {
    if (!tab.requiredRoles) return true;
    return hasRole(tab.requiredRoles);
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location === "/dashboard";
    }
    return location.startsWith(href);
  };

  const visibleTabs = dashboardTabs.filter(canAccessTab);

  return (
    <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-12 items-center px-4 overflow-x-auto">
        <nav className="flex space-x-1">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.href);
            
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  active
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}