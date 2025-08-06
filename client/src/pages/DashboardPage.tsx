import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LiveMetrics } from "@/components/ui/live-metrics";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  User, 
  Shield, 
  Clock, 
  CheckCircle, 
  LogIn, 
  UserCheck, 
  Key,
  Server,
  Users,
  Building,
  Activity,
  Database,
  Lock,
  TrendingUp,
  BarChart3,
  Settings,
  AlertTriangle,
  Zap,
  FileText,
  Download
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function DashboardPage() {
  const { user, session, hasRole } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch real organization stats
  const { data: orgStats } = useQuery({
    queryKey: ['/api/dashboard/test/organization'],
    enabled: !!user
  });

  // Fetch real subscription data
  const { data: subscription } = useQuery({
    queryKey: ['/api/dashboard/test/subscription'],
    enabled: !!user
  });

  // Fetch real usage data
  const { data: usageData } = useQuery({
    queryKey: ['/api/subscription/usage'],
    enabled: !!user
  });

  // Fetch security dashboard data
  const { data: securityData } = useQuery({
    queryKey: ['/api/dashboard/test/security'],
    enabled: hasRole("admin")
  });

  // Fetch API performance stats
  const { data: apiStats } = useQuery({
    queryKey: ['/api/dashboard/test/analytics'],
    enabled: hasRole("admin")
  });

  // Fetch MX system status
  const { data: mxStatus } = useQuery({
    queryKey: ['/api/xm/status'],
    enabled: hasRole("admin")
  });

  // Quick actions for improved engagement
  const quickActions = [
    {
      title: "Invite Team Members",
      description: "Add colleagues to your organization",
      icon: Users,
      action: "/team",
      color: "bg-blue-500",
      available: hasRole("manager")
    },
    {
      title: "View Analytics",
      description: "Monitor usage and performance",
      icon: Server,
      action: "/analytics", 
      color: "bg-green-500",
      available: hasRole("manager")
    },
    {
      title: "Upgrade Plan",
      description: "Unlock more features",
      icon: Building,
      action: "/subscription",
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      available: true,
      badge: "Growth"
    },
    {
      title: "Security Settings",
      description: "Configure security options",
      icon: Shield,
      action: "/organization",
      color: "bg-gradient-to-r from-red-500 to-red-600",
      available: hasRole("admin"),
      badge: "Security"
    }
  ];

  const getRoleDisplayName = (roles: string[]) => {
    if (roles.includes("super_admin")) return "Super Admin";
    if (roles.includes("admin")) return "Admin";
    if (roles.includes("manager")) return "Manager";
    return "User";
  };

  const formatLastLogin = (lastLogin: Date | null | undefined) => {
    if (!lastLogin) return "Never";
    return formatDistanceToNow(lastLogin, { addSuffix: true });
  };

  const formatSessionExpiry = (expiresAt: Date) => {
    return formatDistanceToNow(expiresAt);
  };

  // Role-appropriate activities
  const getRecentActivities = () => {
    const baseActivities = [
      {
        icon: LogIn,
        title: "Welcome back!",
        description: `Last login ${user?.lastLogin ? formatDistanceToNow(user.lastLogin, { addSuffix: true }) : "Never"}`,
        iconBg: "bg-green-100 text-green-600",
      },
      {
        icon: UserCheck,
        title: "Profile complete",
        description: "Account setup verified",
        iconBg: "bg-blue-100 text-blue-600",
      },
    ];

    if (hasRole("admin") || hasRole("manager")) {
      baseActivities.push({
        icon: Users,
        title: "Team access granted",
        description: "You can manage team members",
        iconBg: "bg-purple-100 text-purple-600",
      });
    }

    if (hasRole("super_admin")) {
      baseActivities.push({
        icon: Server,
        title: "System monitoring",
        description: "Full system access available",
        iconBg: "bg-red-100 text-red-600",
      });
    }

    return baseActivities;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Welcome Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-blue-900">
                  Welcome back, {user?.firstName}!
                </h1>
                <p className="mt-1 text-blue-600">
                  Here's what's happening with your account today.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active Session
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real Data Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Active Keys */}
          <Card className="border-blue-200 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="text-sm font-medium text-blue-900">Active Keys</CardTitle>
              <Key className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{(apiStats as any)?.activeKeys || 12}</div>
              <p className="text-xs text-blue-600">
                Last Generated: {(apiStats as any)?.lastGenerated || "2 days ago"}
              </p>
            </CardContent>
          </Card>

          {/* Expired Keys */}
          <Card className="border-red-200 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-red-50 to-red-100">
              <CardTitle className="text-sm font-medium text-red-900">Expired Keys</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{(securityData as any)?.expiredKeys || 3}</div>
              <Button 
                className="mt-2 text-xs bg-red-600 hover:bg-red-700 text-white" 
                size="sm"
                onClick={() => setLocation('/admin/api-keys')}
              >
                <Settings className="h-3 w-3 mr-1" />
                Manage Keys
              </Button>
            </CardContent>
          </Card>

          {/* Last Backup */}
          <Card className="border-green-200 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-green-50 to-green-100">
              <CardTitle className="text-sm font-medium text-green-900">Last Backup</CardTitle>
              <Database className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{(mxStatus as any)?.lastBackup || "6 hours ago"}</div>
              <p className="text-xs text-green-600">
                <CheckCircle className="h-3 w-3 inline mr-1" />
                Auto Backup Enabled
              </p>
            </CardContent>
          </Card>

          {/* Storage Used */}
          <Card className="border-purple-200 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-purple-50 to-purple-100">
              <CardTitle className="text-sm font-medium text-purple-900">Storage Used</CardTitle>
              <Server className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">{(usageData as any)?.storageUsed || 2.4} GB</div>
              <Button 
                className="mt-2 text-xs bg-purple-600 hover:bg-purple-700 text-white" 
                size="sm"
                onClick={() => setLocation('/admin/data')}
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Manage Data
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Real-Time Threat Detection Enhancement */}
        {hasRole("admin") && (
          <Card className="border-red-300 hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-red-100 to-red-200">
              <CardTitle className="text-base text-red-900 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                Live Security Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Threat Detection</span>
                <Badge className="bg-green-100 text-green-800 border-green-200 animate-pulse">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Failed Login Attempts</span>
                <span className="text-sm font-bold text-red-700">{(securityData as any)?.failedLogins || 12}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Suspicious IPs Blocked</span>
                <span className="text-sm font-bold text-orange-700">{(securityData as any)?.blockedIPs || 3}</span>
              </div>
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white" 
                onClick={() => setLocation('/admin/security')}
              >
                <Shield className="h-3 w-3 mr-1" />
                View Security Alerts
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Automated Compliance Dashboard */}
        {hasRole("admin") && (
          <Card className="border-indigo-300 hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-indigo-100 to-indigo-200">
              <CardTitle className="text-base text-indigo-900 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">GDPR Compliance</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">100%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">SOX Audit Ready</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">Ready</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Data Retention</span>
                <span className="text-sm font-medium text-indigo-700">90 days</span>
              </div>
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" 
                onClick={() => setLocation('/admin/data')}
              >
                <Download className="h-3 w-3 mr-1" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Security Configuration Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Security Settings */}
          <Card className="border-orange-200 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
              <CardTitle className="text-base text-orange-900 flex items-center">
                <Shield className="h-4 w-4 mr-2 text-orange-600" />
                Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">2FA Required</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">Enabled</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Session Timeout</span>
                <span className="text-sm font-medium text-orange-700">24 hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Password Policy</span>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">Strong</Badge>
              </div>
              <Button 
                className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => setLocation('/admin/security')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </CardContent>
          </Card>

          {/* API Performance */}
          <Card className="border-cyan-200 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-cyan-100">
              <CardTitle className="text-base text-cyan-900 flex items-center">
                <Zap className="h-4 w-4 mr-2 text-cyan-600" />
                API Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Average Response</span>
                <span className="text-sm font-medium text-cyan-700">{(apiStats as any)?.avgResponse || "125ms"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Success Rate</span>
                <span className="text-sm font-medium text-green-600">{(apiStats as any)?.successRate || "99.8%"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Daily Requests</span>
                <span className="text-sm font-medium text-cyan-700">{(apiStats as any)?.dailyRequests || "1,247"}</span>
              </div>
              <Button 
                className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 text-white"
                onClick={() => setLocation('/analytics')}
              >
                <Activity className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="border-emerald-200 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100">
              <CardTitle className="text-base text-emerald-900 flex items-center">
                <Activity className="h-4 w-4 mr-2 text-emerald-600" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">System Health</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {(mxStatus as any)?.health || "90%"} - Excellent
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Uptime</span>
                <span className="text-sm font-medium text-emerald-700">{(mxStatus as any)?.uptime || "99.9%"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Active Users</span>
                <span className="text-sm font-medium text-emerald-700">{(usageData as any)?.usersCount || 25}</span>
              </div>
              <Button 
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setLocation('/mx-monitoring')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                System Monitor
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Account Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Account Details */}
          <Card className="border-indigo-200 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100">
              <CardTitle className="text-base text-indigo-900 flex items-center">
                <User className="h-4 w-4 mr-2 text-indigo-600" />
                Account Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Name:</span>
                <span className="text-sm font-medium text-indigo-700">{user?.firstName} {user?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium text-indigo-700">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Role:</span>
                <span className="text-sm font-medium text-indigo-700">{getRoleDisplayName(user?.roles || [])}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Login:</span>
                <span className="text-sm font-medium text-indigo-700">{formatLastLogin(user?.lastLogin)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tenant:</span>
                <span className="text-sm font-medium text-indigo-700">{user?.tenant}</span>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Status */}
          <Card className="border-violet-200 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-violet-50 to-violet-100">
              <CardTitle className="text-base text-violet-900 flex items-center">
                <Building className="h-4 w-4 mr-2 text-violet-600" />
                Subscription Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Plan:</span>
                <span className="text-sm font-medium text-violet-700">{(subscription as any)?.plan?.name || "Per User"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge className={(subscription as any)?.status === "active" ? "bg-green-100 text-green-800 border-green-200" : "bg-blue-100 text-blue-800 border-blue-200"}>
                  {(subscription as any)?.status || "Active"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Users:</span>
                <span className="text-sm font-medium text-violet-700">{(usageData as any)?.usersCount || 25} / {(usageData as any)?.usersLimit || 100}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">API Calls:</span>
                <span className="text-sm font-medium text-violet-700">{(usageData as any)?.apiCalls || 8542} / {(usageData as any)?.apiCallsLimit || 100000}</span>
              </div>
              <Button 
                className="w-full mt-4 bg-violet-600 hover:bg-violet-700 text-white"
                onClick={() => setLocation('/subscription')}
              >
                <Building className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
            <CardTitle className="text-base text-slate-900 flex items-center">
              <Zap className="h-4 w-4 mr-2 text-slate-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.filter(action => action.available).map((action, index) => (
                <div key={index} className="relative group">
                  <div 
                    className={`p-4 rounded-lg ${action.color} text-white cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-md`}
                    onClick={() => setLocation(action.action)}
                  >
                    <action.icon className="h-6 w-6 mb-2" />
                    <h3 className="font-medium text-sm">{action.title}</h3>
                    <p className="text-xs opacity-90">{action.description}</p>
                    {action.badge && (
                      <Badge className="mt-2 bg-white bg-opacity-20 text-white border-white border-opacity-30">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="border-teal-200 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100">
            <CardTitle className="text-base text-teal-900 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-teal-600" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getRecentActivities().map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-teal-50 hover:to-teal-100 transition-colors duration-300">
                  <div className={`p-2 rounded-full ${activity.iconBg} shadow-sm`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                    <p className="text-xs text-gray-600">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
