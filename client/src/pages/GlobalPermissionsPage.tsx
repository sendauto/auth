import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  Plus, 
  Edit,
  Trash2,
  Search,
  Filter,
  Users,
  Eye,
  Lock,
  Settings,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  scope: 'global' | 'tenant' | 'user';
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystemRole: boolean;
}

export function GlobalPermissionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'permissions' | 'roles'>('permissions');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCreatePermissionOpen, setIsCreatePermissionOpen] = useState(false);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  
  const [permissionForm, setPermissionForm] = useState({
    name: "",
    description: "",
    resource: "",
    action: "",
    scope: "tenant" as const,
    category: "user_management"
  });

  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: [] as string[]
  });

  // Fetch permissions
  const { data: permissions, isLoading: permissionsLoading } = useQuery<Permission[]>({
    queryKey: ["/api/system/permissions"],
    staleTime: 30 * 1000,
  });

  // Fetch roles
  const { data: roles, isLoading: rolesLoading } = useQuery<Role[]>({
    queryKey: ["/api/system/roles"],
    staleTime: 30 * 1000,
  });

  // Create permission mutation
  const createPermissionMutation = useMutation({
    mutationFn: async (data: typeof permissionForm) => {
      const response = await apiRequest("POST", "/api/system/permissions", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create permission");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Permission Created",
        description: "New permission has been created successfully.",
      });
      setPermissionForm({
        name: "",
        description: "",
        resource: "",
        action: "",
        scope: "tenant",
        category: "user_management"
      });
      setIsCreatePermissionOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/system/permissions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (data: typeof roleForm) => {
      const response = await apiRequest("POST", "/api/system/roles", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create role");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Role Created",
        description: "New role has been created successfully.",
      });
      setRoleForm({
        name: "",
        description: "",
        permissions: []
      });
      setIsCreateRoleOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/system/roles"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle permission status
  const togglePermissionMutation = useMutation({
    mutationFn: async ({ permissionId, isActive }: { permissionId: string; isActive: boolean }) => {
      const response = await apiRequest("PUT", `/api/system/permissions/${permissionId}`, { isActive });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update permission");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system/permissions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredPermissions = permissions?.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || permission.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(permissions?.map(p => p.category) || []));

  const handleCreatePermission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissionForm.name || !permissionForm.resource || !permissionForm.action) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createPermissionMutation.mutate(permissionForm);
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name || roleForm.permissions.length === 0) {
      toast({
        title: "Invalid Input",
        description: "Please provide a name and select at least one permission.",
        variant: "destructive",
      });
      return;
    }
    createRoleMutation.mutate(roleForm);
  };

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'global': return 'bg-red-100 text-red-800';
      case 'tenant': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (permissionsLoading || rolesLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Global Permissions</h1>
            <p className="text-muted-foreground">Manage system-wide permissions and role assignments</p>
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
            <h1 className="text-3xl font-bold text-foreground">Global Permissions</h1>
            <p className="text-muted-foreground">
              Manage system-wide permissions and role assignments
            </p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Permissions</p>
                  <p className="text-2xl font-bold">{permissions?.length || 0}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Active Permissions</p>
                  <p className="text-2xl font-bold">{permissions?.filter(p => p.isActive).length || 0}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">System Roles</p>
                  <p className="text-2xl font-bold">{roles?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Lock className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'permissions' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Permissions
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'roles' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Roles
          </button>
        </div>

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System Permissions</CardTitle>
                  <CardDescription>
                    Define and manage granular permissions across the platform
                  </CardDescription>
                </div>
                <Dialog open={isCreatePermissionOpen} onOpenChange={setIsCreatePermissionOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Permission
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Permission</DialogTitle>
                      <DialogDescription>
                        Define a new permission that can be assigned to roles
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreatePermission}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Permission Name</Label>
                          <Input
                            id="name"
                            value={permissionForm.name}
                            onChange={(e) => setPermissionForm({ ...permissionForm, name: e.target.value })}
                            placeholder="user.create"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={permissionForm.description}
                            onChange={(e) => setPermissionForm({ ...permissionForm, description: e.target.value })}
                            placeholder="Allows creating new users"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="resource">Resource</Label>
                            <Input
                              id="resource"
                              value={permissionForm.resource}
                              onChange={(e) => setPermissionForm({ ...permissionForm, resource: e.target.value })}
                              placeholder="user"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="action">Action</Label>
                            <Input
                              id="action"
                              value={permissionForm.action}
                              onChange={(e) => setPermissionForm({ ...permissionForm, action: e.target.value })}
                              placeholder="create"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="scope">Scope</Label>
                            <Select value={permissionForm.scope} onValueChange={(value: any) => setPermissionForm({ ...permissionForm, scope: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="global">Global</SelectItem>
                                <SelectItem value="tenant">Tenant</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Select value={permissionForm.category} onValueChange={(value) => setPermissionForm({ ...permissionForm, category: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user_management">User Management</SelectItem>
                                <SelectItem value="system_admin">System Admin</SelectItem>
                                <SelectItem value="billing">Billing</SelectItem>
                                <SelectItem value="security">Security</SelectItem>
                                <SelectItem value="analytics">Analytics</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={() => setIsCreatePermissionOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createPermissionMutation.isPending}>
                          {createPermissionMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Create Permission
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              {/* Search and Filter */}
              <div className="flex items-center space-x-4 mt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search permissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Resource/Action</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!filteredPermissions || filteredPermissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No permissions found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPermissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className="font-medium">{permission.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{permission.description}</TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {permission.resource}.{permission.action}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge className={getScopeColor(permission.scope)}>
                            {permission.scope}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {permission.category.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={permission.isActive}
                              onCheckedChange={(checked) => 
                                togglePermissionMutation.mutate({ 
                                  permissionId: permission.id, 
                                  isActive: checked 
                                })
                              }
                            />
                            {permission.isActive ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System Roles</CardTitle>
                  <CardDescription>
                    Manage roles and their associated permissions
                  </CardDescription>
                </div>
                <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Role</DialogTitle>
                      <DialogDescription>
                        Create a new role and assign permissions
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateRole}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="role-name">Role Name</Label>
                          <Input
                            id="role-name"
                            value={roleForm.name}
                            onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                            placeholder="Content Manager"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="role-description">Description</Label>
                          <Textarea
                            id="role-description"
                            value={roleForm.description}
                            onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                            placeholder="Manages content and user interactions"
                            required
                          />
                        </div>

                        <div>
                          <Label>Permissions</Label>
                          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded-md p-4">
                            {permissions?.map((permission) => (
                              <div key={permission.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`perm-${permission.id}`}
                                  checked={roleForm.permissions.includes(permission.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setRoleForm({
                                        ...roleForm,
                                        permissions: [...roleForm.permissions, permission.id]
                                      });
                                    } else {
                                      setRoleForm({
                                        ...roleForm,
                                        permissions: roleForm.permissions.filter(p => p !== permission.id)
                                      });
                                    }
                                  }}
                                  className="rounded border-gray-300"
                                />
                                <Label htmlFor={`perm-${permission.id}`} className="text-sm">
                                  {permission.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={() => setIsCreateRoleOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createRoleMutation.isPending}>
                          {createRoleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Create Role
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!roles || roles.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No roles found. Create your first role to get started.</p>
                  </div>
                ) : (
                  roles.map((role) => (
                    <div key={role.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-medium flex items-center space-x-2">
                                <span>{role.name}</span>
                                {role.isSystemRole && (
                                  <Badge variant="outline" className="text-xs">System</Badge>
                                )}
                              </h3>
                              <p className="text-sm text-muted-foreground">{role.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm">
                                <span className="flex items-center space-x-1">
                                  <Users className="h-4 w-4" />
                                  <span>{role.userCount} users</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Shield className="h-4 w-4" />
                                  <span>{role.permissions.length} permissions</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!role.isSystemRole && (
                            <>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}