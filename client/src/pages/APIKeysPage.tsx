import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Key, 
  Plus, 
  Copy,
  Eye,
  EyeOff,
  MoreHorizontal,
  Calendar,
  Activity,
  AlertCircle,
  Loader2
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

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed: string | null;
  expiresAt: string | null;
  isActive: boolean;
  usage: {
    requestsToday: number;
    requestsThisMonth: number;
    rateLimitRemaining: number;
  };
}

export function APIKeysPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [createForm, setCreateForm] = useState({
    name: "",
    permissions: [] as string[],
    expiresIn: "never"
  });

  // Fetch API keys
  const { data: apiKeys, isLoading } = useQuery<APIKey[]>({
    queryKey: ["/api/admin/api-keys"],
    staleTime: 30 * 1000,
  });

  // Create API key mutation
  const createKeyMutation = useMutation({
    mutationFn: async (data: { name: string; permissions: string[]; expiresIn: string }) => {
      const response = await apiRequest("POST", "/api/admin/api-keys", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create API key");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "API Key Created",
        description: "Your new API key has been generated successfully.",
      });
      setCreateForm({ name: "", permissions: [], expiresIn: "never" });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-keys"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete API key mutation
  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/api-keys/${keyId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete API key");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "API Key Deleted",
        description: "The API key has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-keys"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleKeyVisibility = (keyId: string) => {
    const newVisibleKeys = new Set(visibleKeys);
    if (newVisibleKeys.has(keyId)) {
      newVisibleKeys.delete(keyId);
    } else {
      newVisibleKeys.add(keyId);
    }
    setVisibleKeys(newVisibleKeys);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard.",
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || createForm.permissions.length === 0) {
      toast({
        title: "Invalid Input",
        description: "Please provide a name and select at least one permission.",
        variant: "destructive",
      });
      return;
    }
    createKeyMutation.mutate(createForm);
  };

  const handlePermissionToggle = (permission: string) => {
    setCreateForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const availablePermissions = [
    { id: "read", name: "Read Access", description: "View data and configurations" },
    { id: "write", name: "Write Access", description: "Create and update resources" },
    { id: "delete", name: "Delete Access", description: "Remove resources" },
    { id: "admin", name: "Admin Access", description: "Full administrative privileges" },
    { id: "analytics", name: "Analytics", description: "Access to analytics data" },
    { id: "billing", name: "Billing", description: "Access to billing information" }
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">API Keys</h1>
            <p className="text-muted-foreground">Manage API keys and access controls</p>
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
            <h1 className="text-3xl font-bold text-foreground">API Keys</h1>
            <p className="text-muted-foreground">
              Manage API keys and access controls for your applications
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  Generate a new API key with specific permissions.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Key Name</Label>
                    <Input
                      id="name"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="Production API Key"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {availablePermissions.map((permission) => (
                        <div
                          key={permission.id}
                          className={`p-2 border rounded cursor-pointer transition-colors ${
                            createForm.permissions.includes(permission.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handlePermissionToggle(permission.id)}
                        >
                          <p className="text-sm font-medium">{permission.name}</p>
                          <p className="text-xs text-muted-foreground">{permission.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="expiry">Expiration</Label>
                    <Select value={createForm.expiresIn} onValueChange={(value) => setCreateForm({ ...createForm, expiresIn: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never expires</SelectItem>
                        <SelectItem value="30d">30 days</SelectItem>
                        <SelectItem value="90d">90 days</SelectItem>
                        <SelectItem value="1y">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createKeyMutation.isPending}>
                    {createKeyMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Key
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* API Usage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Key className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Keys</p>
                  <p className="text-2xl font-bold">{apiKeys?.filter(k => k.isActive).length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Requests Today</p>
                  <p className="text-2xl font-bold">
                    {apiKeys?.reduce((sum, key) => sum + key.usage.requestsToday, 0).toLocaleString() || 0}
                  </p>
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
                  <p className="text-sm font-medium text-muted-foreground">Near Rate Limit</p>
                  <p className="text-2xl font-bold">
                    {apiKeys?.filter(k => k.usage.rateLimitRemaining < 100).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Keys List */}
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage your organization's API keys and their permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!apiKeys || apiKeys.length === 0 ? (
                <div className="text-center py-8">
                  <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No API keys found. Create your first API key to get started.</p>
                </div>
              ) : (
                apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-medium">{apiKey.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                                {apiKey.isActive ? "Active" : "Inactive"}
                              </Badge>
                              {apiKey.permissions.map(permission => (
                                <Badge key={permission} variant="outline">
                                  {permission}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          <div className="flex items-center space-x-2">
                            <Label className="text-sm">API Key:</Label>
                            <div className="flex items-center space-x-2">
                              <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                                {visibleKeys.has(apiKey.id) ? apiKey.key : apiKey.key.replace(/./g, '•')}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleKeyVisibility(apiKey.id)}
                              >
                                {visibleKeys.has(apiKey.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(apiKey.key)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Created</p>
                              <p>{formatDistanceToNow(new Date(apiKey.createdAt), { addSuffix: true })}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Last Used</p>
                              <p>{apiKey.lastUsed ? formatDistanceToNow(new Date(apiKey.lastUsed), { addSuffix: true }) : 'Never'}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Requests Today</p>
                              <p>{apiKey.usage.requestsToday.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Rate Limit</p>
                              <p>{apiKey.usage.rateLimitRemaining.toLocaleString()} remaining</p>
                            </div>
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
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Permissions</DropdownMenuItem>
                          <DropdownMenuItem>Regenerate Key</DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => deleteKeyMutation.mutate(apiKey.id)}
                          >
                            Delete Key
                          </DropdownMenuItem>
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