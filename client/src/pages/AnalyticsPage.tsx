import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Shield, 
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AnalyticsData {
  performance: {
    uptime: number;
    responseTime: string;
    errorRate: number;
    lastUpdated: string;
  };
  behavior: {
    totalSessions: number;
    uniqueUsers: number;
    averageSessionDuration: number;
    bounceRate: number;
  };
  timestamp: number;
}

interface MAUData {
  currentMAU: number;
  billingCycle: {
    startDate: string;
    endDate: string;
  };
  monthlyActiveUsers: {
    date: string;
    count: number;
  }[];
}

export function AnalyticsPage() {
  // Fetch real analytics data
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics/insights"],
    staleTime: 30 * 1000, // 30 seconds
  });

  // Fetch organization stats
  const { data: orgStats, isLoading: isLoadingOrg } = useQuery({
    queryKey: ["/api/organization/stats"],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch MAU data
  const { data: mauData, isLoading: isLoadingMAU } = useQuery<MAUData>({
    queryKey: ["/api/mau/current/1"], // Using tenant ID 1
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const analytics = {
    userActivity: {
      totalLogins: analyticsData?.behavior?.totalSessions || 0,
      uniqueUsers: analyticsData?.behavior?.uniqueUsers || (orgStats as any)?.activeUsers || 0,
      averageSessionDuration: `${Math.round((analyticsData?.behavior?.averageSessionDuration || 0) / 60)}m`,
      weeklyGrowth: 12.5
    },
    security: {
      successfulLogins: 100 - (analyticsData?.performance?.errorRate || 0) * 100,
      failedAttempts: Math.round((analyticsData?.behavior?.totalSessions || 0) * (analyticsData?.performance?.errorRate || 0.01)),
      suspiciousActivity: 2,
      twoFactorAdoption: 87.5
    },
    usage: {
      apiCalls: (orgStats as any)?.usage?.apiCallsToday || 0,
      dataTransfer: `${(((orgStats as any)?.usage?.storageUsedGB || 0) * 0.1).toFixed(1)} GB`,
      storageUsed: Math.round(((orgStats as any)?.usage?.storageUsedGB || 0) / ((orgStats as any)?.limits?.storageGB || 100) * 100),
      bandwidth: Math.min(89, Math.round(((orgStats as any)?.usage?.apiCallsToday || 0) / ((orgStats as any)?.limits?.apiCallsLimit || 50000) * 100))
    },
    performance: {
      uptime: analyticsData?.performance?.uptime || 99.9,
      responseTime: analyticsData?.performance?.responseTime || "120ms",
      errorRate: (analyticsData?.performance?.errorRate || 0.02) * 100,
      satisfaction: 4.8
    }
  };

  const recentEvents = [
    {
      id: 1,
      type: 'user',
      message: `Active users: ${(orgStats as any)?.activeUsers || 0}`,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      severity: 'info'
    },
    {
      id: 2,
      type: 'system',
      message: `System uptime: ${analytics.performance.uptime}%`,
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      severity: 'success'
    },
    {
      id: 3,
      type: 'security',
      message: `Security score: ${(orgStats as any)?.securityScore || 98}/100`,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      severity: ((orgStats as any)?.securityScore || 98) > 95 ? 'success' : 'warning'
    },
    {
      id: 4,
      type: 'billing',
      message: `Monthly active users: ${mauData?.currentMAU || 'Loading...'}`,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      severity: 'info'
    }
  ];

  const isLoading = isLoadingAnalytics || isLoadingOrg || isLoadingMAU;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return Shield;
      case 'security': return AlertCircle;
      case 'system': return Activity;
      case 'user': return Users;
      default: return CheckCircle;
    }
  };

  const getEventColor = (severity: string) => {
    switch (severity) {
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'success': return 'text-green-600 bg-green-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor usage, security, and performance metrics
            </p>
          </div>
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor usage, security, and performance metrics
          </p>
        </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Logins</p>
                      <p className="text-2xl font-bold">{analytics.userActivity.totalLogins.toLocaleString()}</p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-xs text-green-600">+{analytics.userActivity.weeklyGrowth}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Login Success Rate</p>
                      <p className="text-2xl font-bold">{analytics.security.successfulLogins}%</p>
                      <div className="flex items-center mt-1">
                        <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-xs text-green-600">Excellent</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">API Calls</p>
                      <p className="text-2xl font-bold">{analytics.usage.apiCalls.toLocaleString()}</p>
                      <div className="flex items-center mt-1">
                        <Activity className="h-3 w-3 text-purple-600 mr-1" />
                        <span className="text-xs text-purple-600">This month</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                      <p className="text-2xl font-bold">{analytics.performance.uptime}%</p>
                      <div className="flex items-center mt-1">
                        <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-xs text-green-600">30 days</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Security Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Security Overview</CardTitle>
                  <CardDescription>
                    Authentication and security metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Two-Factor Adoption</span>
                      <span>{analytics.security.twoFactorAdoption}%</span>
                    </div>
                    <Progress value={analytics.security.twoFactorAdoption} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{analytics.security.successfulLogins}%</p>
                      <p className="text-xs text-green-700">Success Rate</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{analytics.security.failedAttempts}</p>
                      <p className="text-xs text-red-700">Failed Attempts</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="text-sm font-medium">Suspicious Activity</span>
                    </div>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      {analytics.security.suspiciousActivity} events
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Resource Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Resource Usage</CardTitle>
                  <CardDescription>
                    System resource utilization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Storage Used</span>
                        <span>{analytics.usage.storageUsed}%</span>
                      </div>
                      <Progress value={analytics.usage.storageUsed} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Bandwidth</span>
                        <span>{analytics.usage.bandwidth}%</span>
                      </div>
                      <Progress value={analytics.usage.bandwidth} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{analytics.usage.dataTransfer}</p>
                      <p className="text-xs text-blue-700">Data Transfer</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{analytics.performance.responseTime}</p>
                      <p className="text-xs text-purple-700">Avg Response</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>
                  Latest system and user activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEvents.map((event) => {
                    const Icon = getEventIcon(event.type);
                    return (
                      <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg border border-border">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getEventColor(event.severity)}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{event.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {event.type}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

      </div>
    </DashboardLayout>
  );
}