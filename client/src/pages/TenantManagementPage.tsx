import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  Plus, 
  Settings,
  Users,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  Loader2,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'suspended' | 'inactive';
  plan: string;
  userCount: number;
  maxUsers: number;
  createdAt: string;
  lastActivity: string;
  settings: {
    ssoEnabled: boolean;
    mfaRequired: boolean;
    customBranding: boolean;
  };
}

export function TenantManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    domain: "",
    plan: "professional"
  });

  // Fetch tenants
  const { data: tenants, isLoading } = useQuery<Tenant[]>({
    queryKey: ["/api/system/tenants"],
    staleTime: 30 * 1000,
  });

  // Create tenant mutation
  const createTenantMutation = useMutation({
    mutationFn: async (data: { name: string; domain: string; plan: string }) => {
      const response = await apiRequest("POST", "/api/system/tenants", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create tenant");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Tenant Created",
        description: "New tenant has been created successfully.",
      });
      setCreateForm({ name: "", domain: "", plan: "professional" });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/system/tenants"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update tenant status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ tenantId, status }: { tenantId: string; status: string }) => {
      const response = await apiRequest("PUT", `/api/system/tenants/${tenantId}/status`, { status });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update tenant status");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Tenant status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/system/tenants"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.domain) {
      toast({
        title: "Invalid Input",
        description: "Please provide both name and domain.",
        variant: "destructive",
      });
      return;
    }
    createTenantMutation.mutate(createForm);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'suspended': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'inactive': return <Activity className="h-4 w-4 text-gray-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tenant Management</h1>
            <p className="text-muted-foreground">Manage multi-tenant organizations and configurations</p>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tenant Management</h1>
            <p className="text-muted-foreground">
              Manage multi-tenant organizations and configurations
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Tenant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Tenant</DialogTitle>
                <DialogDescription>
                  Set up a new tenant organization with its own isolated environment.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Organization Name</Label>
                    <Input
                      id="name"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="Acme Corporation"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="domain">Domain</Label>
                    <Input
                      id="domain"
                      value={createForm.domain}
                      onChange={(e) => setCreateForm({ ...createForm, domain: e.target.value })}
                      placeholder="acme.auth247.net"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="plan">Initial Plan</Label>
                    <Select value={createForm.plan} onValueChange={(value) => setCreateForm({ ...createForm, plan: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free Plan</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTenantMutation.isPending}>
                    {createTenantMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Tenant
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tenant Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Tenants</p>
                  <p className="text-2xl font-bold">{tenants?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Tenants</p>
                  <p className="text-2xl font-bold">{tenants?.filter(t => t.status === 'active').length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{tenants?.reduce((sum, t) => sum + t.userCount, 0) || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Suspended</p>
                  <p className="text-2xl font-bold">{tenants?.filter(t => t.status === 'suspended').length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tenants List */}
        <Card>
          <CardHeader>
            <CardTitle>Tenant Organizations</CardTitle>
            <CardDescription>
              Manage tenant organizations and their configurations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!tenants || tenants.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tenants found. Create your first tenant to get started.</p>
                </div>
              ) : (
                tenants.map((tenant) => (
                  <div key={tenant.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-medium">{tenant.name}</h3>
                            <p className="text-sm text-muted-foreground">{tenant.domain}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={getStatusColor(tenant.status)}>
                                {getStatusIcon(tenant.status)}
                                <span className="ml-1 capitalize">{tenant.status}</span>
                              </Badge>
                              <Badge variant="outline">{tenant.plan}</Badge>
                              {tenant.settings.ssoEnabled && <Badge variant="outline">SSO</Badge>}
                              {tenant.settings.mfaRequired && <Badge variant="outline">MFA</Badge>}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Users</p>
                            <p>{tenant.userCount} / {tenant.maxUsers}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Created</p>
                            <p>{formatDistanceToNow(new Date(tenant.createdAt), { addSuffix: true })}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Last Activity</p>
                            <p>{formatDistanceToNow(new Date(tenant.lastActivity), { addSuffix: true })}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Storage</p>
                            <p>2.4 GB / 100 GB</p>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="h-4 w-4 mr-2" />
                            Manage Users
                          </DropdownMenuItem>
                          {tenant.status === 'active' ? (
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => updateStatusMutation.mutate({ tenantId: tenant.id, status: 'suspended' })}
                            >
                              Suspend
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="text-green-600"
                              onClick={() => updateStatusMutation.mutate({ tenantId: tenant.id, status: 'active' })}
                            >
                              Activate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}