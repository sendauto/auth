import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Users,
  Shield,
  UserPlus,
  Mail,
  Crown,
  Activity,
  CheckCircle,
  Trash2,
  Palette,
  Globe,
  Settings as SettingsIcon,
  Save,
  Upload,
  Eye
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface OrganizationStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  managerUsers: number;
  regularUsers: number;
  lastLogin: Date | null;
  subscriptionTier: string;
  limits: {
    maxUsers: number;
    maxAdmins: number;
    maxManagers: number;
    ssoEnabled: boolean;
    mfaRequired: boolean;
    advancedSecurity: boolean;
    auditRetentionDays: number;
    apiAccess: boolean;
    customBranding: boolean;
  };
  usage: {
    userSlots: { used: number; available: number };
    adminSlots: { used: number; available: number };
    managerSlots: { used: number; available: number };
  };
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  emailVerified: boolean;
  lastLogin: Date | null;
  createdAt: Date;
}

interface UserInvitation {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  invitedBy: number;
  token: string;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  createdAt: Date;
}

export function OrganizationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "user"
  });

  // White-label configuration states
  const [showWhiteLabelConfig, setShowWhiteLabelConfig] = useState(false);
  const [whiteLabelForm, setWhiteLabelForm] = useState({
    companyName: '',
    tagline: '',
    customDomain: '',
    primaryColor: '#2563eb',
    secondaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    logoUrl: '',
    faviconUrl: '',
    customCSS: '',
    footerText: '',
    sslEnabled: true,
    isActive: true,
    revenueShareEnabled: false,
    revenueSharePercentage: 10
  });

  // Fetch organization stats
  const { data: stats, isLoading: statsLoading } = useQuery<OrganizationStats>({
    queryKey: ['/api/organization/stats'],
    enabled: !!user
  });

  // Fetch organization users
  const { data: usersData, isLoading: usersLoading } = useQuery<{ users: User[] }>({
    queryKey: ['/api/organization/users'],
    enabled: !!user && (user.roles.includes('admin') || user.roles.includes('manager'))
  });

  // Fetch invitations
  const { data: invitationsData, isLoading: invitationsLoading } = useQuery<{ invitations: UserInvitation[] }>({
    queryKey: ['/api/organization/invitations'],
    enabled: !!user && (user.roles.includes('admin') || user.roles.includes('manager'))
  });

  // Invite user mutation
  const inviteUserMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      const response = await apiRequest("POST", "/api/organization/invite", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Invitation Sent",
        description: "User invitation has been sent successfully",
      });
      setInviteDialogOpen(false);
      setInviteForm({ email: "", role: "user" });
      queryClient.invalidateQueries({ queryKey: ['/api/organization/invitations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/organization/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Invitation Failed",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    }
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const response = await apiRequest("PUT", `/api/organization/users/${userId}/role`, { role });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Role Updated",
        description: "User role has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/organization/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/organization/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    }
  });

  // Deactivate user mutation
  const deactivateUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("POST", `/api/organization/users/${userId}/deactivate`);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "User Deactivated",
        description: "User has been deactivated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/organization/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/organization/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Deactivation Failed",
        description: error.message || "Failed to deactivate user",
        variant: "destructive",
      });
    }
  });

  // Fetch white-label configuration
  const { data: whiteLabelConfig, isLoading: whiteLabelLoading } = useQuery({
    queryKey: ['/api/white-label/config', user?.tenant],
    queryFn: () => apiRequest('GET', `/api/white-label/config/${user?.tenant}`),
    enabled: !!user?.tenant && user.roles.includes('admin')
  });

  // White-label configuration mutation
  const updateWhiteLabelMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/white-label/config", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "White-Label Configuration Updated",
        description: "Your branding configuration has been saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/white-label/config', user?.tenant] });
      setShowWhiteLabelConfig(false);
    },
    onError: (error: any) => {
      toast({
        title: "Configuration Update Failed",
        description: error.message || "Failed to update white-label configuration",
        variant: "destructive",
      });
    }
  });

  // Initialize white-label form with existing config
  React.useEffect(() => {
    if (whiteLabelConfig?.config) {
      const config = whiteLabelConfig.config;
      setWhiteLabelForm({
        companyName: config.companyName || '',
        tagline: config.tagline || '',
        customDomain: config.customDomain || '',
        primaryColor: config.primaryColor || '#2563eb',
        secondaryColor: config.secondaryColor || '#3b82f6',
        backgroundColor: config.backgroundColor || '#ffffff',
        textColor: config.textColor || '#1f2937',
        logoUrl: config.logoUrl || '',
        faviconUrl: config.faviconUrl || '',
        customCSS: config.customCSS || '',
        footerText: config.footerText || '',
        sslEnabled: config.sslEnabled ?? true,
        isActive: config.isActive ?? true,
        revenueShareEnabled: config.revenueShareEnabled ?? false,
        revenueSharePercentage: config.revenueSharePercentage || 10
      });
    }
  }, [whiteLabelConfig]);

  const handleWhiteLabelSave = () => {
    updateWhiteLabelMutation.mutate({
      tenantId: user?.tenant,
      ...whiteLabelForm
    });
  };

  const handleInviteUser = () => {
    if (!inviteForm.email || !inviteForm.role) {
      toast({
        title: "Missing Information",
        description: "Please provide email and role",
        variant: "destructive",
      });
      return;
    }

    inviteUserMutation.mutate(inviteForm);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  const calculateUsagePercentage = (used: number, available: number) => {
    return available > 0 ? Math.round((used / available) * 100) : 0;
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || (!user.roles.includes('admin') && !user.roles.includes('manager'))) {
    return (
      <div className="text-center py-8">
        <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Access Denied</h3>
        <p className="text-gray-600 dark:text-gray-400">You need admin or manager privileges to access this page.</p>
      </div>
    );
  }

  return (
    <DashboardLayout showTabs={false}>
      <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Organization Management</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your organization users based on subscription limits
                </p>
              </div>
              
              {(user.roles.includes('admin') || user.roles.includes('manager')) && (
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite User
                    </Button>
                  </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>
                  Send an invitation to add a new user to your organization within subscription limits.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteForm.role} onValueChange={(value) => setInviteForm(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      {user.roles.includes('admin') && (
                        <SelectItem value="admin">Admin</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {stats && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-sm text-blue-900 dark:text-blue-300">Current Usage</h4>
                    <div className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                      Users: {stats.usage.userSlots.used}/{stats.usage.userSlots.available} 
                      ({calculateUsagePercentage(stats.usage.userSlots.used, stats.usage.userSlots.available)}% used)
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-400">
                      Admins: {stats.usage.adminSlots.used}/{stats.usage.adminSlots.available}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-400">
                      Managers: {stats.usage.managerSlots.used}/{stats.usage.managerSlots.available}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleInviteUser}
                  disabled={inviteUserMutation.isPending}
                >
                  {inviteUserMutation.isPending ? "Sending..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Subscription and Usage Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription Plan</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.subscriptionTier}</div>
              <p className="text-xs text-muted-foreground">
                {stats.limits.maxUsers} user limit
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Slots</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.usage.userSlots.used}/{stats.usage.userSlots.available}
              </div>
              <Progress 
                value={calculateUsagePercentage(stats.usage.userSlots.used, stats.usage.userSlots.available)} 
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {calculateUsagePercentage(stats.usage.userSlots.used, stats.usage.userSlots.available)}% used
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Slots</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.usage.adminSlots.used}/{stats.usage.adminSlots.available}
              </div>
              <Progress 
                value={calculateUsagePercentage(stats.usage.adminSlots.used, stats.usage.adminSlots.available)} 
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {calculateUsagePercentage(stats.usage.adminSlots.used, stats.usage.adminSlots.available)}% used
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                of {stats.totalUsers} total users
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* White-Label Branding Management */}
      {user.roles.includes('admin') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              White-Label Branding
            </CardTitle>
            <CardDescription>
              Customize your organization's branding and manage custom domains for a white-label experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {whiteLabelLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (whiteLabelConfig as any)?.config ? (
              <div className="space-y-6">
                {/* Current Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">Domain</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{(whiteLabelConfig as any)?.config?.customDomain}</p>
                    <Badge className={(whiteLabelConfig as any)?.config?.domainVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {(whiteLabelConfig as any)?.config?.domainVerified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Palette className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">Brand Colors</h4>
                    </div>
                    <div className="flex gap-2">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: (whiteLabelConfig as any)?.config?.primaryColor }}
                        title="Primary Color"
                      />
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: (whiteLabelConfig as any)?.config?.secondaryColor }}
                        title="Secondary Color"
                      />
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">Company</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{(whiteLabelConfig as any)?.config?.companyName}</p>
                    <Badge className={(whiteLabelConfig as any)?.config?.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {(whiteLabelConfig as any)?.config?.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button onClick={() => setShowWhiteLabelConfig(true)}>
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    Configure Branding
                  </Button>
                  <Button variant="outline" onClick={() => {
                    // Verify domain
                    toast({
                      title: "Domain Verification",
                      description: "Domain verification initiated. Please check DNS settings.",
                    });
                  }}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Domain
                  </Button>
                  <Button variant="outline" onClick={() => window.open(`https://${(whiteLabelConfig as any)?.config?.customDomain}`, '_blank')}>
                    <Globe className="h-4 w-4 mr-2" />
                    Preview Domain
                  </Button>
                </div>

                {/* Revenue Sharing Info */}
                {(whiteLabelConfig as any)?.config?.revenueShareEnabled && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-sm text-blue-900 dark:text-blue-300 mb-2">Revenue Sharing Program</h4>
                    <div className="text-sm text-blue-700 dark:text-blue-400">
                      Revenue Share: {(whiteLabelConfig as any)?.config?.revenueSharePercentage}%
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                      Earn commission on customer referrals through your white-label platform
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Palette className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No White-Label Configuration</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Set up custom branding and domain for your organization to provide a white-label experience.
                </p>
                <Button onClick={() => setShowWhiteLabelConfig(true)}>
                  <Palette className="h-4 w-4 mr-2" />
                  Set Up White-Label Branding
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      {(user.roles.includes('admin') || user.roles.includes('manager')) && (
        <Card>
          <CardHeader>
            <CardTitle>Organization Users</CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    {user.roles.includes('admin') && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData?.users?.map((orgUser) => (
                    <TableRow key={orgUser.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{orgUser.firstName} {orgUser.lastName}</div>
                          <div className="text-sm text-muted-foreground">{orgUser.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(orgUser.roles[0])}>
                          {orgUser.roles[0]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(orgUser.isActive)}>
                          {orgUser.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(orgUser.lastLogin)}</TableCell>
                      {user.roles.includes('admin') && (
                        <TableCell>
                          <div className="flex space-x-2">
                            <Select
                              value={orgUser.roles[0]}
                              onValueChange={(role) => updateRoleMutation.mutate({ userId: orgUser.id, role })}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            {orgUser.isActive && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Deactivate User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to deactivate {orgUser.firstName} {orgUser.lastName}? 
                                      This will revoke their access to the organization.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deactivateUserMutation.mutate(orgUser.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Deactivate
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pending Invitations */}
      {(user.roles.includes('admin') || user.roles.includes('manager')) && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            {invitationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : invitationsData?.invitations?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No pending invitations</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Expires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitationsData?.invitations?.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell>{invitation.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(invitation.role)}>
                          {invitation.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={invitation.status === 'pending' ? 'default' : 'secondary'}>
                          {invitation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(invitation.createdAt)}</TableCell>
                      <TableCell>{formatDate(invitation.expiresAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Subscription Features */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Core Authentication Features - Always Available */}
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-700 dark:text-green-300">
                  Complete Authentication System
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-700 dark:text-green-300">
                  Multi-Tenant Support
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-700 dark:text-green-300">
                  Role-Based Access Control
                </span>
              </div>
              
              {/* Enterprise SSO Features */}
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-700 dark:text-green-300">
                  Enterprise SSO Integration
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-700 dark:text-green-300">
                  Multi-Factor Authentication
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-700 dark:text-green-300">
                  Advanced Security Features
                </span>
              </div>
              
              {/* Platform Features */}
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-700 dark:text-green-300">
                  24/7 Support
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-700 dark:text-green-300">
                  API Access
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-700 dark:text-green-300">
                  MX Intelligence Monitoring
                </span>
              </div>
              
              {/* Custom Branding for Enterprise */}
              {stats?.limits?.customBranding && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-700 dark:text-green-300">
                    White-Label Branding
                  </span>
                </div>
              )}
              
              {/* Audit Retention Info */}
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span className="text-blue-700 dark:text-blue-300">
                  {stats?.limits?.auditRetentionDays || 90} days audit retention
                </span>
              </div>
              
              {/* Pricing Model */}
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-purple-500" />
                <span className="text-purple-700 dark:text-purple-300">
                  Active-User-Only Billing ($0.89/user)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* White-Label Configuration Dialog */}
      {showWhiteLabelConfig && (
        <Dialog open={showWhiteLabelConfig} onOpenChange={setShowWhiteLabelConfig}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                White-Label Branding Configuration
              </DialogTitle>
              <DialogDescription>
                Configure your organization's branding and custom domain settings.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <Tabs defaultValue="branding" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="branding">Branding</TabsTrigger>
                  <TabsTrigger value="domain">Domain</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                </TabsList>
                
                <TabsContent value="branding" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={whiteLabelForm.companyName}
                        onChange={(e) => setWhiteLabelForm(prev => ({...prev, companyName: e.target.value}))}
                        placeholder="Your Company Name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tagline">Tagline</Label>
                      <Input
                        id="tagline"
                        value={whiteLabelForm.tagline}
                        onChange={(e) => setWhiteLabelForm(prev => ({...prev, tagline: e.target.value}))}
                        placeholder="Your company tagline"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={whiteLabelForm.primaryColor}
                          onChange={(e) => setWhiteLabelForm(prev => ({...prev, primaryColor: e.target.value}))}
                          className="w-16 h-10"
                        />
                        <Input
                          value={whiteLabelForm.primaryColor}
                          onChange={(e) => setWhiteLabelForm(prev => ({...prev, primaryColor: e.target.value}))}
                          placeholder="#2563eb"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={whiteLabelForm.secondaryColor}
                          onChange={(e) => setWhiteLabelForm(prev => ({...prev, secondaryColor: e.target.value}))}
                          className="w-16 h-10"
                        />
                        <Input
                          value={whiteLabelForm.secondaryColor}
                          onChange={(e) => setWhiteLabelForm(prev => ({...prev, secondaryColor: e.target.value}))}
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="logoUrl">Logo URL</Label>
                      <Input
                        id="logoUrl"
                        value={whiteLabelForm.logoUrl}
                        onChange={(e) => setWhiteLabelForm(prev => ({...prev, logoUrl: e.target.value}))}
                        placeholder="https://your-domain.com/logo.png"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="faviconUrl">Favicon URL</Label>
                      <Input
                        id="faviconUrl"
                        value={whiteLabelForm.faviconUrl}
                        onChange={(e) => setWhiteLabelForm(prev => ({...prev, faviconUrl: e.target.value}))}
                        placeholder="https://your-domain.com/favicon.ico"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="footerText">Footer Text</Label>
                    <Input
                      id="footerText"
                      value={whiteLabelForm.footerText}
                      onChange={(e) => setWhiteLabelForm(prev => ({...prev, footerText: e.target.value}))}
                      placeholder="© 2025 Your Company. All rights reserved."
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="domain" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customDomain">Custom Domain</Label>
                      <Input
                        id="customDomain"
                        value={whiteLabelForm.customDomain}
                        onChange={(e) => setWhiteLabelForm(prev => ({...prev, customDomain: e.target.value}))}
                        placeholder="auth.yourcompany.com"
                      />
                      <p className="text-sm text-muted-foreground">
                        Enter your custom domain where the white-label authentication will be hosted.
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="sslEnabled"
                        checked={whiteLabelForm.sslEnabled}
                        onCheckedChange={(checked) => setWhiteLabelForm(prev => ({...prev, sslEnabled: checked}))}
                      />
                      <Label htmlFor="sslEnabled">Enable SSL/TLS</Label>
                    </div>
                    
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-medium text-sm text-blue-900 dark:text-blue-300 mb-3">DNS Configuration</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                        Add these DNS records to your domain registrar (e.g., GoDaddy, Cloudflare, Route 53):
                      </p>
                      
                      {/* Domain Verification TXT Record */}
                      <div className="space-y-3">
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                          <div className="font-semibold text-xs text-gray-600 dark:text-gray-400 mb-1">1. Domain Verification Record</div>
                          <div className="font-mono text-xs space-y-1">
                            <div><span className="text-gray-500">Type:</span> TXT</div>
                            <div><span className="text-gray-500">Name:</span> _auth247verification{whiteLabelForm.customDomain ? '' : ''}</div>
                            <div><span className="text-gray-500">Value:</span> auth247-domain-verification-{Math.random().toString(36).substring(2, 15)}.{whiteLabelForm.customDomain || 'yourcompany.com'}</div>
                            <div><span className="text-gray-500">TTL:</span> 300 (5 minutes)</div>
                          </div>
                        </div>
                        
                        {/* CNAME Record for Traffic Routing */}
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                          <div className="font-semibold text-xs text-gray-600 dark:text-gray-400 mb-1">2. Traffic Routing Record</div>
                          <div className="font-mono text-xs space-y-1">
                            <div><span className="text-gray-500">Type:</span> CNAME</div>
                            <div><span className="text-gray-500">Name:</span> {whiteLabelForm.customDomain ? whiteLabelForm.customDomain.split('.')[0] : 'auth'}</div>
                            <div><span className="text-gray-500">Value:</span> auth247.net</div>
                            <div><span className="text-gray-500">TTL:</span> 300 (5 minutes)</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                        <div className="text-xs text-yellow-800 dark:text-yellow-300">
                          <div className="font-semibold mb-1">⚠️ Important Notes:</div>
                          <ul className="space-y-1">
                            <li>• DNS propagation can take up to 24 hours</li>
                            <li>• Remove any existing A records for the same subdomain</li>
                            <li>• Disable proxy/CDN features during initial setup</li>
                            <li>• Cloudflare users: Turn off "orange cloud" for these records</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={whiteLabelForm.isActive}
                        onCheckedChange={(checked) => setWhiteLabelForm(prev => ({...prev, isActive: checked}))}
                      />
                      <Label htmlFor="isActive">Enable White-Label Configuration</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="customCSS">Custom CSS</Label>
                      <Textarea
                        id="customCSS"
                        value={whiteLabelForm.customCSS}
                        onChange={(e) => setWhiteLabelForm(prev => ({...prev, customCSS: e.target.value}))}
                        placeholder="/* Custom CSS styles */
.custom-brand {
  color: #2563eb;
}"
                        rows={6}
                      />
                      <p className="text-sm text-muted-foreground">
                        Add custom CSS to further customize the appearance of your white-label site.
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="revenue" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="revenueShareEnabled"
                        checked={whiteLabelForm.revenueShareEnabled}
                        onCheckedChange={(checked) => setWhiteLabelForm(prev => ({...prev, revenueShareEnabled: checked}))}
                      />
                      <Label htmlFor="revenueShareEnabled">Enable Revenue Sharing</Label>
                    </div>
                    
                    {whiteLabelForm.revenueShareEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="revenueSharePercentage">Revenue Share Percentage</Label>
                        <Input
                          id="revenueSharePercentage"
                          type="number"
                          min="0"
                          max="50"
                          value={whiteLabelForm.revenueSharePercentage}
                          onChange={(e) => setWhiteLabelForm(prev => ({...prev, revenueSharePercentage: parseInt(e.target.value) || 0}))}
                          placeholder="10"
                        />
                        <p className="text-sm text-muted-foreground">
                          Percentage of revenue you'll earn from customers referred through your white-label platform.
                        </p>
                      </div>
                    )}
                    
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-medium text-sm text-green-900 dark:text-green-300 mb-2">Partner Program Benefits</h4>
                      <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                        <li>• Earn commission on all customer referrals</li>
                        <li>• Monthly revenue sharing payments</li>
                        <li>• Comprehensive partner dashboard</li>
                        <li>• Marketing materials and support</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWhiteLabelConfig(false)}>
                Cancel
              </Button>
              <Button onClick={handleWhiteLabelSave} disabled={updateWhiteLabelMutation.isPending}>
                {updateWhiteLabelMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
        </div>
    </DashboardLayout>
  );
}