/**
 * Advanced Analytics Platform - Enterprise-grade insights
 * User behavior analytics, security posture, and predictive intelligence
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Eye,
  Clock,
  Globe,
  Activity,
  Brain,
  Target,
  DollarSign,
  Zap,
  Lock,
  UserCheck,
  Download,
  Calendar,
  Filter
} from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  loginSuccessRate: number;
  securityScore: number;
  threatsPrevented: number;
  avgSessionDuration: number;
  topCountries: Array<{ country: string; users: number; percentage: number }>;
  securityEvents: Array<{ type: string; count: number; severity: 'high' | 'medium' | 'low' }>;
  userBehavior: {
    peakHours: Array<{ hour: number; activity: number }>;
    deviceTypes: Array<{ type: string; percentage: number }>;
    browserUsage: Array<{ browser: string; percentage: number }>;
  };
  businessMetrics: {
    conversionRate: number;
    customerLifetimeValue: number;
    churnRate: number;
    revenueGrowth: number;
  };
}

const mockAnalyticsData: AnalyticsData = {
  totalUsers: 24567,
  activeUsers: 18432,
  loginSuccessRate: 98.7,
  securityScore: 94,
  threatsPrevented: 1247,
  avgSessionDuration: 34.5,
  topCountries: [
    { country: 'United States', users: 9823, percentage: 40.0 },
    { country: 'United Kingdom', users: 3691, percentage: 15.0 },
    { country: 'Canada', users: 2457, percentage: 10.0 },
    { country: 'Australia', users: 1968, percentage: 8.0 },
    { country: 'Germany', users: 1721, percentage: 7.0 }
  ],
  securityEvents: [
    { type: 'Brute Force Attempts', count: 234, severity: 'high' },
    { type: 'Suspicious IPs', count: 89, severity: 'medium' },
    { type: 'Failed MFA', count: 156, severity: 'medium' },
    { type: 'Password Breaches', count: 12, severity: 'high' },
    { type: 'Anomalous Login Times', count: 45, severity: 'low' }
  ],
  userBehavior: {
    peakHours: [
      { hour: 9, activity: 85 }, { hour: 10, activity: 92 }, { hour: 11, activity: 88 },
      { hour: 12, activity: 65 }, { hour: 13, activity: 78 }, { hour: 14, activity: 89 },
      { hour: 15, activity: 91 }, { hour: 16, activity: 87 }, { hour: 17, activity: 76 }
    ],
    deviceTypes: [
      { type: 'Desktop', percentage: 68 },
      { type: 'Mobile', percentage: 28 },
      { type: 'Tablet', percentage: 4 }
    ],
    browserUsage: [
      { type: 'Chrome', percentage: 65 },
      { type: 'Safari', percentage: 20 },
      { type: 'Firefox', percentage: 10 },
      { type: 'Edge', percentage: 5 }
    ]
  },
  businessMetrics: {
    conversionRate: 3.2,
    customerLifetimeValue: 2840,
    churnRate: 2.1,
    revenueGrowth: 23.5
  }
};

export function AdvancedAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>(mockAnalyticsData);
  const [dateRange, setDateRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10) - 5,
        threatsPrevented: prev.threatsPrevented + Math.floor(Math.random() * 3)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Advanced Analytics
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enterprise insights into user behavior, security posture, and business metrics
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              {dateRange === '7d' ? 'Last 7 Days' : dateRange === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </Button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold">{data.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.3% from last month
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                  <p className="text-2xl font-bold">{data.activeUsers.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <Activity className="h-3 w-3 mr-1" />
                    Real-time
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Security Score</p>
                  <p className={`text-2xl font-bold ${getSecurityScoreColor(data.securityScore)}`}>
                    {data.securityScore}%
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Excellent security posture</p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Threats Prevented</p>
                  <p className="text-2xl font-bold text-red-600">{data.threatsPrevented}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">This month</p>
                </div>
                <Lock className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="behavior">User Behavior</TabsTrigger>
            <TabsTrigger value="business">Business Metrics</TabsTrigger>
            <TabsTrigger value="predictive">AI Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Login Success Rate */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Login Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {data.loginSuccessRate}%
                  </div>
                  <Progress value={data.loginSuccessRate} className="mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Excellent authentication performance with minimal failed attempts
                  </p>
                </CardContent>
              </Card>

              {/* Geographic Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Top Countries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.topCountries.map((country) => (
                      <div key={country.country} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{country.country}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${country.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                            {country.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Session Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Session Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{data.avgSessionDuration} min</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Session Duration</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">2.3</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sessions per User</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">87%</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Return User Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Security Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    Security Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.securityEvents.map((event) => (
                      <div key={event.type} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">{event.type}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{event.count} incidents</p>
                        </div>
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Security Score Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Security Score Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Password Security</span>
                        <span className="text-sm text-green-600">98%</span>
                      </div>
                      <Progress value={98} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">MFA Adoption</span>
                        <span className="text-sm text-yellow-600">87%</span>
                      </div>
                      <Progress value={87} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Session Security</span>
                        <span className="text-sm text-green-600">96%</span>
                      </div>
                      <Progress value={96} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Access Control</span>
                        <span className="text-sm text-green-600">94%</span>
                      </div>
                      <Progress value={94} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Behavior Tab */}
          <TabsContent value="behavior" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Device Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Device Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.userBehavior.deviceTypes.map((device) => (
                      <div key={device.type}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">{device.type}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{device.percentage}%</span>
                        </div>
                        <Progress value={device.percentage} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Browser Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Browser Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.userBehavior.browserUsage.map((browser) => (
                      <div key={browser.type}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">{browser.type}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{browser.percentage}%</span>
                        </div>
                        <Progress value={browser.percentage} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Peak Activity Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Peak Activity Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-9 gap-2">
                  {data.userBehavior.peakHours.map((hour) => (
                    <div key={hour.hour} className="text-center">
                      <div 
                        className="bg-blue-600 rounded-t" 
                        style={{ height: `${hour.activity}px` }}
                      />
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {hour.hour}:00
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Metrics Tab */}
          <TabsContent value="business" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-blue-600">{data.businessMetrics.conversionRate}%</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-green-600">${data.businessMetrics.customerLifetimeValue}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Customer LTV</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-purple-600">{data.businessMetrics.revenueGrowth}%</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Revenue Growth</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Activity className="h-8 w-8 text-red-600 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-red-600">{data.businessMetrics.churnRate}%</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Churn Rate</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="predictive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Predictive Analytics</h4>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Usage Spike Prediction</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        23% increase in authentication requests expected next Tuesday based on historical patterns.
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium">Security Alert</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Unusual login patterns detected from Eastern Europe. Consider implementing geo-blocking.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Optimization Recommendations</h4>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">MFA Optimization</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Implementing adaptive MFA could reduce friction by 15% while maintaining security.
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">Conversion Optimization</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Simplifying the registration flow could improve conversion rate by 8-12%.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}