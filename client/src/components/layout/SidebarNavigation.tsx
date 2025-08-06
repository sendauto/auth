import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { 
  Home, 
  User, 
  Users, 
  BarChart3, 
  Shield, 
  Key, 
  Database, 
  Server, 
  Building, 
  UserCheck,
  CreditCard,
  Activity,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredRoles?: string[];
}

const navigationItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Home,
  },
  {
    href: "/profile",
    label: "My Profile",
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
];

const managementItems: NavItem[] = [
  {
    href: "/team",
    label: "Team Members",
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
];

const adminItems: NavItem[] = [
  {
    href: "/admin/security",
    label: "Security Settings",
    icon: Shield,
    requiredRoles: ["admin", "super_admin"],
  },
  {
    href: "/admin/api-keys",
    label: "API Keys",
    icon: Key,
    requiredRoles: ["admin", "super_admin"],
  },
  {
    href: "/admin/data",
    label: "Data Management",
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

const systemItems: NavItem[] = [
  {
    href: "/system/health",
    label: "System Health",
    icon: Server,
    requiredRoles: ["super_admin"],
  },
  {
    href: "/system/tenants",
    label: "Tenant Management",
    icon: Building,
    requiredRoles: ["super_admin"],
  },
  {
    href: "/system/permissions",
    label: "Global Permissions",
    icon: UserCheck,
    requiredRoles: ["super_admin"],
  },
];

export function SidebarNavigation() {
  const [location] = useLocation();
  const { user, hasAnyRole } = useAuth();

  const isActiveRoute = (href: string) => {
    return location === href || (href !== "/dashboard" && location.startsWith(href));
  };

  const canAccessItem = (item: NavItem) => {
    if (!item.requiredRoles || item.requiredRoles.length === 0) return true;
    return hasAnyRole(item.requiredRoles);
  };

  const renderNavItem = (item: NavItem) => {
    if (!canAccessItem(item)) return null;

    return (
      <Link key={item.href} href={item.href}>
        <span
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
            isActiveRoute(item.href)
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <item.icon className="h-4 w-4 mr-3" />
          {item.label}
        </span>
      </Link>
    );
  };

  const renderSection = (title: string, items: NavItem[]) => {
    const visibleItems = items.filter(canAccessItem);
    if (visibleItems.length === 0) return null;

    return (
      <div className="border-t border-border pt-4 mt-4">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {title}
        </p>
        <div className="space-y-1">
          {visibleItems.map(renderNavItem)}
        </div>
      </div>
    );
  };

  return (
    <aside className="w-64 bg-background border-r border-border min-h-screen">
      <nav className="p-4 space-y-1">
        {/* Main Navigation */}
        {navigationItems.map(renderNavItem)}

        {/* Management Section */}
        {renderSection("Management", managementItems)}

        {/* Administration Section */}
        {renderSection("Administration", adminItems)}

        {/* System Section */}
        {renderSection("System", systemItems)}
      </nav>
    </aside>
  );
}
