import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Activity, Shield, Bell, Server, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopNavigation } from "@/components/layout/TopNavigation";
import { SidebarNavigation } from "@/components/layout/SidebarNavigation";

interface SystemHealth {
  overallHealth: {
    score: number;
    status: string;
    timestamp: string;
  };
  components: {
    api: {
      healthy: boolean;
      responseTime: number;
      errorRate: number;
      requestCount: number;
    };
    security: {
      healthy: boolean;
      criticalEvents: number;
      blockedIPs: number;
      riskLevel: string;
    };
    notifications: {
      healthy: boolean;
      connectedClients: number;
      unreadNotifications: number;
    };
  };
}

interface APIStats {
  current: {
    requestsLast5Min: number;
    avgResponseTime5Min: number;
    errorRate5Min: number;
  };
  hourly: {
    requestsLastHour: number;
    avgResponseTimeHour: number;
    errorRateHour: number;
  };
  endpoints: Array<{
    endpoint: string;
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
  }>;
}

interface SecurityDashboard {
  overview: {
    totalEvents24h: number;
    criticalEvents24h: number;
    eventsLastHour: number;
    blockedIPs: number;
    highRiskIPs: number;
  };
  recentEvents: Array<{
    type: string;
    severity: string;
    description: string;
    timestamp: string;
    ip: string;
  }>;
  topThreats: Array<{
    ip: string;
    riskScore: number;
    failedAttempts: number;
    blocked: boolean;
  }>;
}

interface NotificationStats {
  connectedClients: number;
  activeClients: number;
  totalNotifications: number;
  recentNotifications: number;
  criticalNotifications: number;
  unreadNotifications: number;
}

interface APIResponse<T> {
  success: boolean;
  data: T;
  timestamp?: string;
}

export default function MXMonitoringPage() {
  const { data: systemHealthResponse } = useQuery<APIResponse<SystemHealth>>({
    queryKey: ['/api/monitoring/system-health'],
    refetchInterval: 30000,
  });

  const { data: apiStatsResponse } = useQuery<APIResponse<APIStats>>({
    queryKey: ['/api/monitoring/api-stats'],
    refetchInterval: 15000,
  });

  const { data: securityDashboardResponse } = useQuery<APIResponse<SecurityDashboard>>({
    queryKey: ['/api/monitoring/security-dashboard'],
    refetchInterval: 30000,
  });

  const { data: notificationStatsResponse } = useQuery<APIResponse<NotificationStats>>({
    queryKey: ['/api/monitoring/notifications/stats'],
    refetchInterval: 20000,
  });

  // Extract data from API responses with safe fallbacks
  const systemHealth = systemHealthResponse?.data;
  const apiStats = apiStatsResponse?.data;
  const securityDashboard = securityDashboardResponse?.data;
  const notificationStats = notificationStatsResponse?.data;

  const getHealthStatusColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 50) return "text-orange-600";
    return "text-red-600";
  };

  const getHealthStatusBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    if (score >= 50) return <Badge className="bg-orange-100 text-orange-800">Fair</Badge>;
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      
      <div className="flex">
        <SidebarNavigation />
        
        <main className="flex-1 p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">MX Intelligence Monitoring</h1>
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-600">Real-time updates</span>
              </div>
            </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`text-2xl font-bold ${getHealthStatusColor(systemHealth?.overallHealth?.score || 0)}`}>
                {systemHealth?.overallHealth?.score || 0}%
              </div>
              {getHealthStatusBadge(systemHealth?.overallHealth?.score || 0)}
            </div>
            <Progress 
              value={systemHealth?.overallHealth?.score || 0} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(apiStats?.current?.avgResponseTime5Min || 0)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              {apiStats?.current?.requestsLast5Min || 0} requests (5min)
            </p>
            <div className="mt-2">
              <Badge variant={apiStats?.current?.errorRate5Min && apiStats.current.errorRate5Min > 0.05 ? "destructive" : "secondary"}>
                {((apiStats?.current?.errorRate5Min || 0) * 100).toFixed(2)}% error rate
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityDashboard?.overview?.criticalEvents24h || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Critical events (24h)
            </p>
            <div className="mt-2">
              <Badge variant={securityDashboard?.overview?.blockedIPs ? "destructive" : "secondary"}>
                {securityDashboard?.overview?.blockedIPs || 0} blocked IPs
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Real-time Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notificationStats?.connectedClients || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {notificationStats?.activeClients || 0} active connections
            </p>
            <div className="mt-2">
              <Badge variant={notificationStats?.unreadNotifications ? "default" : "secondary"}>
                {notificationStats?.unreadNotifications || 0} unread alerts
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Monitoring Tabs */}
      <Tabs defaultValue="api" className="space-y-4">
        <TabsList>
          <TabsTrigger value="api">API Performance</TabsTrigger>
          <TabsTrigger value="security">Security Monitor</TabsTrigger>
          <TabsTrigger value="notifications">Real-time Alerts</TabsTrigger>
          <TabsTrigger value="system">System Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Real-time API performance data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Average Response Time (5min)</span>
                  <span className="font-bold">{Math.round(apiStats?.current?.avgResponseTime5Min || 0)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Requests (Last 5min)</span>
                  <span className="font-bold">{apiStats?.current?.requestsLast5Min || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Error Rate (5min)</span>
                  <span className="font-bold text-red-600">{((apiStats?.current?.errorRate5Min || 0) * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Requests (Last Hour)</span>
                  <span className="font-bold">{apiStats?.hourly?.requestsLastHour || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hourly Avg Response</span>
                  <span className="font-bold">{Math.round(apiStats?.hourly?.avgResponseTimeHour || 0)}ms</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Endpoints</CardTitle>
                <CardDescription>Most frequently accessed endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {apiStats?.endpoints && apiStats.endpoints.length > 0 ? (
                    apiStats.endpoints.slice(0, 5).map((endpoint, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium text-sm">{endpoint?.endpoint || 'Unknown'}</div>
                          <div className="text-xs text-gray-600">
                            {endpoint?.totalRequests || 0} requests
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">{Math.round(endpoint?.averageResponseTime || 0)}ms</div>
                          <div className="text-xs text-gray-600">
                            {((endpoint?.errorRate || 0) * 100).toFixed(1)}% errors
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No endpoint data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Overview</CardTitle>
                <CardDescription>24-hour security summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Events (24h)</span>
                  <span className="font-bold">{securityDashboard?.overview?.totalEvents24h || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Critical Events (24h)</span>
                  <span className="font-bold text-red-600">{securityDashboard?.overview?.criticalEvents24h || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Events (Last Hour)</span>
                  <span className="font-bold">{securityDashboard?.overview?.eventsLastHour || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Blocked IPs</span>
                  <span className="font-bold">{securityDashboard?.overview?.blockedIPs || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>High Risk IPs</span>
                  <span className="font-bold text-orange-600">{securityDashboard?.overview?.highRiskIPs || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>Latest security incidents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityDashboard?.recentEvents && securityDashboard.recentEvents.length > 0 ? (
                    securityDashboard.recentEvents.slice(0, 5).map((event, index) => (
                      <div key={index} className="flex items-start space-x-3 p-2 bg-gray-50 rounded">
                        <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                          event?.severity === 'critical' ? 'text-red-600' :
                          event?.severity === 'high' ? 'text-orange-600' :
                          event?.severity === 'medium' ? 'text-yellow-600' : 'text-gray-600'
                        }`} />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{event?.description || 'Unknown event'}</div>
                          <div className="text-xs text-gray-600">
                            {event?.ip || 'Unknown IP'} • {event?.timestamp ? new Date(event.timestamp).toLocaleTimeString() : 'Unknown time'}
                          </div>
                        </div>
                        <Badge variant={
                          event?.severity === 'critical' ? 'destructive' :
                          event?.severity === 'high' ? 'default' : 'secondary'
                        }>
                          {event?.severity || 'unknown'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No recent security events
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Statistics</CardTitle>
                <CardDescription>Real-time notification metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Connected Clients</span>
                  <span className="font-bold">{notificationStats?.connectedClients || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Clients</span>
                  <span className="font-bold">{notificationStats?.activeClients || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Notifications</span>
                  <span className="font-bold">{notificationStats?.totalNotifications || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recent Notifications</span>
                  <span className="font-bold">{notificationStats?.recentNotifications || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Critical Notifications</span>
                  <span className="font-bold text-red-600">{notificationStats?.criticalNotifications || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unread Notifications</span>
                  <span className="font-bold">{notificationStats?.unreadNotifications || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>WebSocket Connection</CardTitle>
                <CardDescription>Real-time connection status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">WebSocket Server Active</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Endpoint: /notifications
                  </div>
                  <div className="text-sm text-gray-600">
                    Protocol: WebSocket (ws://)
                  </div>
                  <div className="mt-4">
                    <Badge variant="outline">
                      <Bell className="h-3 w-3 mr-1" />
                      Real-time Monitoring Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>API Component</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <Badge variant={systemHealth?.components?.api?.healthy ? "default" : "destructive"}>
                      {systemHealth?.components?.api?.healthy ? "Healthy" : "Unhealthy"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Response Time</span>
                    <span>{Math.round(systemHealth?.components?.api?.responseTime || 0)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Rate</span>
                    <span>{((systemHealth?.components?.api?.errorRate || 0) * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Request Count</span>
                    <span>{systemHealth?.components?.api?.requestCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Component</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <Badge variant={systemHealth?.components?.security?.healthy ? "default" : "destructive"}>
                      {systemHealth?.components?.security?.healthy ? "Healthy" : "Unhealthy"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Critical Events</span>
                    <span>{systemHealth?.components?.security?.criticalEvents || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Blocked IPs</span>
                    <span>{systemHealth?.components?.security?.blockedIPs || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk Level</span>
                    <span className="capitalize">{systemHealth?.components?.security?.riskLevel || 'unknown'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications Component</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <Badge variant={systemHealth?.components?.notifications?.healthy ? "default" : "destructive"}>
                      {systemHealth?.components?.notifications?.healthy ? "Healthy" : "Unhealthy"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Connected Clients</span>
                    <span>{systemHealth?.components?.notifications?.connectedClients || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unread Alerts</span>
                    <span>{systemHealth?.components?.notifications?.unreadNotifications || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}