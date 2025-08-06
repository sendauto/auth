import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Key, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Globe,
  Users,
  Settings,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SecurityConfig {
  mfaRequired: boolean;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number;
  };
  sessionPolicy: {
    maxDuration: number;
    idleTimeout: number;
    multipleSessionsAllowed: boolean;
  };
  loginSecurity: {
    maxFailedAttempts: number;
    lockoutDuration: number;
    enableCaptcha: boolean;
  };
  ipRestrictions: {
    enabled: boolean;
    allowedIPs: string[];
    blockSuspiciousIPs: boolean;
  };
}

export function SecuritySettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");

  // Fetch current security configuration
  const { data: securityConfig, isLoading } = useQuery<SecurityConfig>({
    queryKey: ["/api/admin/security/config"],
    staleTime: 30 * 1000,
  });

  // Update security configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (config: Partial<SecurityConfig>) => {
      const response = await apiRequest("PUT", "/api/admin/security/config", config);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update security configuration");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Security Settings Updated",
        description: "Your security configuration has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/security/config"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleMFA = (enabled: boolean) => {
    updateConfigMutation.mutate({
      mfaRequired: enabled
    });
  };

  const handlePasswordPolicyChange = (field: string, value: any) => {
    if (!securityConfig) return;
    
    updateConfigMutation.mutate({
      passwordPolicy: {
        ...securityConfig.passwordPolicy,
        [field]: value
      }
    });
  };

  const handleSessionPolicyChange = (field: string, value: any) => {
    if (!securityConfig) return;
    
    updateConfigMutation.mutate({
      sessionPolicy: {
        ...securityConfig.sessionPolicy,
        [field]: value
      }
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Security Settings</h1>
            <p className="text-muted-foreground">Configure security policies and access controls</p>
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
          <h1 className="text-3xl font-bold text-foreground">Security Settings</h1>
          <p className="text-muted-foreground">
            Configure security policies and access controls for your organization
          </p>
        </div>

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Security Score</p>
                  <p className="text-2xl font-bold text-green-600">98/100</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Key className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">MFA Adoption</p>
                  <p className="text-2xl font-bold">87.5%</p>
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
                  <p className="text-2xl font-bold text-yellow-600">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>General Security</span>
              </CardTitle>
              <CardDescription>
                Configure basic security settings for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Multi-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Force all users to enable MFA</p>
                </div>
                <Switch
                  checked={securityConfig?.mfaRequired || false}
                  onCheckedChange={handleToggleMFA}
                  disabled={updateConfigMutation.isPending}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Password Policy</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minLength">Minimum Length</Label>
                    <Input
                      id="minLength"
                      type="number"
                      value={securityConfig?.passwordPolicy?.minLength || 8}
                      onChange={(e) => handlePasswordPolicyChange('minLength', parseInt(e.target.value))}
                      min={6}
                      max={50}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxAge">Password Expiry (days)</Label>
                    <Input
                      id="maxAge"
                      type="number"
                      value={securityConfig?.passwordPolicy?.maxAge || 90}
                      onChange={(e) => handlePasswordPolicyChange('maxAge', parseInt(e.target.value))}
                      min={30}
                      max={365}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={securityConfig?.passwordPolicy?.requireUppercase || false}
                      onCheckedChange={(checked) => handlePasswordPolicyChange('requireUppercase', checked)}
                    />
                    <Label>Require uppercase letters</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={securityConfig?.passwordPolicy?.requireNumbers || false}
                      onCheckedChange={(checked) => handlePasswordPolicyChange('requireNumbers', checked)}
                    />
                    <Label>Require numbers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={securityConfig?.passwordPolicy?.requireSpecialChars || false}
                      onCheckedChange={(checked) => handlePasswordPolicyChange('requireSpecialChars', checked)}
                    />
                    <Label>Require special characters</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Session Security</span>
              </CardTitle>
              <CardDescription>
                Control user session behavior and timeouts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="maxDuration">Maximum Session Duration (hours)</Label>
                  <Input
                    id="maxDuration"
                    type="number"
                    value={securityConfig?.sessionPolicy?.maxDuration || 24}
                    onChange={(e) => handleSessionPolicyChange('maxDuration', parseInt(e.target.value))}
                    min={1}
                    max={168}
                  />
                </div>

                <div>
                  <Label htmlFor="idleTimeout">Idle Timeout (minutes)</Label>
                  <Input
                    id="idleTimeout"
                    type="number"
                    value={securityConfig?.sessionPolicy?.idleTimeout || 30}
                    onChange={(e) => handleSessionPolicyChange('idleTimeout', parseInt(e.target.value))}
                    min={5}
                    max={120}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={securityConfig?.sessionPolicy?.multipleSessionsAllowed || false}
                    onCheckedChange={(checked) => handleSessionPolicyChange('multipleSessionsAllowed', checked)}
                  />
                  <Label>Allow multiple concurrent sessions</Label>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Login Security</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxFailedAttempts">Max Failed Attempts</Label>
                    <Input
                      id="maxFailedAttempts"
                      type="number"
                      value={securityConfig?.loginSecurity?.maxFailedAttempts || 5}
                      min={3}
                      max={10}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                    <Input
                      id="lockoutDuration"
                      type="number"
                      value={securityConfig?.loginSecurity?.lockoutDuration || 15}
                      min={5}
                      max={60}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={securityConfig?.loginSecurity?.enableCaptcha || false}
                  />
                  <Label>Enable CAPTCHA after failed attempts</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Security Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Security Events</CardTitle>
            <CardDescription>Monitor recent security-related activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  event: "Failed login attempt blocked",
                  user: "unknown@suspicious.com",
                  time: "2 minutes ago",
                  severity: "high"
                },
                {
                  event: "User enabled MFA",
                  user: "john.doe@company.com",
                  time: "1 hour ago",
                  severity: "low"
                },
                {
                  event: "Password policy updated",
                  user: "admin@auth247.net",
                  time: "3 hours ago",
                  severity: "medium"
                },
                {
                  event: "New user registration",
                  user: "sarah.wilson@company.com",
                  time: "6 hours ago",
                  severity: "low"
                }
              ].map((event, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      event.severity === 'high' ? 'bg-red-100' :
                      event.severity === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                    }`}>
                      {event.severity === 'high' ? 
                        <AlertTriangle className={`h-4 w-4 ${event.severity === 'high' ? 'text-red-600' : 'text-yellow-600'}`} /> :
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      }
                    </div>
                    <div>
                      <p className="font-medium">{event.event}</p>
                      <p className="text-sm text-muted-foreground">{event.user}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{event.time}</p>
                    <Badge variant={event.severity === 'high' ? 'destructive' : 'secondary'}>
                      {event.severity}
                    </Badge>
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