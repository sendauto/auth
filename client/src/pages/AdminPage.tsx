import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Shield, 
  Key, 
  Database, 
  Users, 
  AlertTriangle, 
  Settings, 
  Activity,
  Lock,
  CheckCircle,
  XCircle,
  Server,
  BarChart3,
  DollarSign,
  Save
} from "lucide-react";

export function AdminPage() {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mock admin data - in real app this would come from API
  const adminStats = {
    totalUsers: 1247,
    activeUsers: 1134,
    inactiveUsers: 113,
    securityAlerts: 3,
    systemHealth: 99.9,
    apiCalls: 45678,
    dataProcessed: "2.3 TB",
    uptime: 99.98
  };

  // Fetch pricing configuration
  const { data: pricingConfig, isLoading: isPricingLoading } = useQuery({
    queryKey: ['/api/pricing/config'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Pricing form state
  const [pricingForm, setPricingForm] = useState({
    pricePerUser: '',
    platformMaintenanceFee: '',
    currency: 'USD',
    trialDays: 14,
    annualDiscountPercent: 15
  });

  // Update form when data loads
  React.useEffect(() => {
    if (pricingConfig) {
      setPricingForm({
        pricePerUser: pricingConfig.pricePerUser || '',
        platformMaintenanceFee: pricingConfig.platformMaintenanceFee || '',
        currency: pricingConfig.currency || 'USD',
        trialDays: pricingConfig.trialDays || 14,
        annualDiscountPercent: pricingConfig.annualDiscountPercent || 15
      });
    }
  }, [pricingConfig]);

  // Update pricing configuration
  const updatePricingMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PUT', '/api/admin/pricing/config', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Pricing configuration updated successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pricing/config'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update pricing configuration",
        variant: "destructive",
      });
    }
  });

  const handlePricingUpdate = () => {
    updatePricingMutation.mutate(pricingForm);
  };

  const recentSecurityEvents = [
    {
      id: 1,
      type: 'warning',
      message: 'Multiple failed login attempts detected',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      handled: false
    },
    {
      id: 2,
      type: 'info',
      message: 'New API key generated for production',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      handled: true
    },
    {
      id: 3,
      type: 'success',
      message: 'Security patch applied successfully',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      handled: true
    }
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      case 'error': return XCircle;
      default: return Activity;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'success': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Administration</h1>
          <p className="text-muted-foreground">
            Monitor system health, manage security, and configure enterprise settings
          </p>
        </div>

            {/* System Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold">{adminStats.totalUsers.toLocaleString()}</p>
                      <p className="text-xs text-green-600">+12% this month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Server className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">System Health</p>
                      <p className="text-2xl font-bold">{adminStats.systemHealth}%</p>
                      <p className="text-xs text-green-600">Excellent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Security Alerts</p>
                      <p className="text-2xl font-bold">{adminStats.securityAlerts}</p>
                      <p className="text-xs text-yellow-600">Requires attention</p>
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
                      <p className="text-2xl font-bold">{adminStats.apiCalls.toLocaleString()}</p>
                      <p className="text-xs text-purple-600">Last 24h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Admin Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Security Settings */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-4 w-4 text-red-600" />
                    </div>
                    <CardTitle className="text-lg">Security Settings</CardTitle>
                  </div>
                  <CardDescription>
                    Configure authentication policies and security rules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">2FA Required</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">Enabled</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Session Timeout</span>
                      <span className="text-sm font-medium">24 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Password Policy</span>
                      <Badge variant="outline">Strong</Badge>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </CardContent>
              </Card>

              {/* API Key Management */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Key className="h-4 w-4 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">API Keys</CardTitle>
                  </div>
                  <CardDescription>
                    Manage API keys and access tokens
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Active Keys</span>
                      <span className="text-sm font-medium">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last Generated</span>
                      <span className="text-sm font-medium">2 days ago</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Expired Keys</span>
                      <Badge variant="destructive">3</Badge>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <Key className="h-4 w-4 mr-2" />
                    Manage Keys
                  </Button>
                </CardContent>
              </Card>

              {/* Data Management */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Database className="h-4 w-4 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg">Data Management</CardTitle>
                  </div>
                  <CardDescription>
                    Backup, restore, and manage system data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last Backup</span>
                      <span className="text-sm font-medium">6 hours ago</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Storage Used</span>
                      <span className="text-sm font-medium">2.4 GB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Auto Backup</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">Enabled</Badge>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Manage Data
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Admin Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Administrative Actions</CardTitle>
                <CardDescription>
                  Latest security and configuration changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Security policy updated</p>
                      <p className="text-xs text-muted-foreground">
                        Modified password requirements • 2 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Key className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">API key revoked</p>
                      <p className="text-xs text-muted-foreground">
                        Revoked compromised API key for security • 1 day ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">User roles modified</p>
                      <p className="text-xs text-muted-foreground">
                        Updated team member permissions • 3 days ago
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span>Pricing Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure platform pricing and billing settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isPricingLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pricePerUser">Price per User (USD)</Label>
                        <Input
                          id="pricePerUser"
                          type="number"
                          step="0.01"
                          min="0"
                          value={pricingForm.pricePerUser}
                          onChange={(e) => setPricingForm({...pricingForm, pricePerUser: e.target.value})}
                          placeholder="0.89"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="platformMaintenanceFee">Platform Maintenance Fee (USD)</Label>
                        <Input
                          id="platformMaintenanceFee"
                          type="number"
                          step="0.01"
                          min="0"
                          value={pricingForm.platformMaintenanceFee}
                          onChange={(e) => setPricingForm({...pricingForm, platformMaintenanceFee: e.target.value})}
                          placeholder="1.99"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="trialDays">Trial Days</Label>
                        <Input
                          id="trialDays"
                          type="number"
                          min="0"
                          value={pricingForm.trialDays}
                          onChange={(e) => setPricingForm({...pricingForm, trialDays: parseInt(e.target.value) || 0})}
                          placeholder="14"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="annualDiscountPercent">Annual Discount (%)</Label>
                        <Input
                          id="annualDiscountPercent"
                          type="number"
                          min="0"
                          max="100"
                          value={pricingForm.annualDiscountPercent}
                          onChange={(e) => setPricingForm({...pricingForm, annualDiscountPercent: parseInt(e.target.value) || 0})}
                          placeholder="15"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        onClick={handlePricingUpdate}
                        disabled={updatePricingMutation.isPending}
                        className="flex items-center space-x-2"
                      >
                        {updatePricingMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            <span>Save Configuration</span>
                          </>
                        )}
                      </Button>
                    </div>
                    {pricingConfig && (
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Configuration:</p>
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <p>• Price per User: ${pricingConfig.pricePerUser}</p>
                          <p>• Platform Fee: ${pricingConfig.platformMaintenanceFee}</p>
                          <p>• Trial Period: {pricingConfig.trialDays} days</p>
                          <p>• Annual Discount: {pricingConfig.annualDiscountPercent}%</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <span>System Alerts</span>
                </CardTitle>
                <CardDescription>
                  Important notifications requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border border-amber-200 bg-amber-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-amber-800">
                          3 API keys expiring soon
                        </p>
                        <p className="text-xs text-amber-600">
                          Keys will expire in the next 7 days
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="text-amber-700 border-amber-300">
                        Review
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Security scan completed
                        </p>
                        <p className="text-xs text-blue-600">
                          No vulnerabilities detected in the last scan
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="text-blue-700 border-blue-300">
                        View Report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

      </div>
    </DashboardLayout>
  );
}
