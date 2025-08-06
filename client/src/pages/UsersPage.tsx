import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/dialog";
import { 
  Users, 
  MoreHorizontal, 
  Search, 
  Plus, 
  Download, 
  Upload, 
  Filter,
  UserPlus,
  Mail,
  Shield,
  Trash2,
  Edit,
  Eye
} from "lucide-react";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  tenant: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface UserFilters {
  search: string;
  role: string;
  status: string;
  tenant: string;
}

export function UsersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [filters, setFilters] = useState<UserFilters>({
    search: "",
    role: "",
    status: "",
    tenant: ""
  });
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/admin/users', filters],
    queryFn: getQueryFn<User[]>({ on401: "returnNull" }),
  });

  const inviteUserMutation = useMutation({
    mutationFn: (inviteData: { email: string; roles: string[]; sendEmail: boolean }) =>
      apiRequest("POST", "/api/admin/users/invite", inviteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowInviteDialog(false);
      toast({
        title: "User Invited",
        description: "User invitation sent successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Invitation Failed",
        description: error instanceof Error ? error.message : "Failed to send invitation",
        variant: "destructive",
      });
    }
  });

  const bulkActionMutation = useMutation({
    mutationFn: ({ action, userIds }: { action: string; userIds: number[] }) =>
      apiRequest("POST", "/api/admin/users/bulk", { action, userIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setSelectedUsers([]);
      setShowBulkActionDialog(false);
      toast({
        title: "Bulk Action Complete",
        description: `Successfully performed ${bulkAction} on ${selectedUsers.length} users`,
      });
    },
    onError: (error) => {
      toast({
        title: "Bulk Action Failed",
        description: error instanceof Error ? error.message : "Failed to perform bulk action",
        variant: "destructive",
      });
    }
  });

  const filteredUsers = users.filter(user => {
    if (filters.search && !`${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.role && !user.roles.includes(filters.role)) {
      return false;
    }
    if (filters.status === 'active' && !user.isActive) {
      return false;
    }
    if (filters.status === 'inactive' && user.isActive) {
      return false;
    }
    if (filters.tenant && user.tenant !== filters.tenant) {
      return false;
    }
    return true;
  });

  const handleSelectUser = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleBulkAction = (action: string) => {
    setBulkAction(action);
    setShowBulkActionDialog(true);
  };

  const confirmBulkAction = () => {
    bulkActionMutation.mutate({ action: bulkAction, userIds: selectedUsers });
  };

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Roles', 'Status', 'Tenant', 'Last Login'].join(','),
      ...filteredUsers.map(user => [
        `"${user.firstName} ${user.lastName}"`,
        user.email,
        `"${user.roles.join(', ')}"`,
        user.isActive ? 'Active' : 'Inactive',
        user.tenant,
        user.lastLogin || 'Never'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'manager': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-96 bg-gray-200 rounded animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions across your organization
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={exportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setShowInviteDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
            >
              <option value="">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="user">User</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={filters.tenant}
              onChange={(e) => setFilters(prev => ({ ...prev, tenant: e.target.value }))}
            >
              <option value="">All Tenants</option>
              <option value="authmesh">AuthMesh</option>
              <option value="company-main">Company Main</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>
                  Activate
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('deactivate')}>
                  Deactivate
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('send_welcome')}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Welcome
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleBulkAction('delete')}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Users ({filteredUsers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {!user.emailVerified && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Unverified
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role} className={getRoleBadgeColor(role)}>
                          {role.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.tenant}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="h-4 w-4 mr-2" />
                          Manage Roles
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invite User Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
            <DialogDescription>
              Send an invitation to a new user to join your organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email Address</label>
              <Input placeholder="user@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium">Roles</label>
              <div className="space-y-2 mt-2">
                {['user', 'manager', 'admin'].map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox id={role} />
                    <label htmlFor={role} className="text-sm capitalize">
                      {role.replace('_', ' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="sendEmail" defaultChecked />
              <label htmlFor="sendEmail" className="text-sm">
                Send welcome email
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => inviteUserMutation.mutate({ 
              email: "demo@example.com", 
              roles: ["user"], 
              sendEmail: true 
            })}>
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={showBulkActionDialog} onOpenChange={setShowBulkActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {bulkAction.replace('_', ' ')} {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkActionDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant={bulkAction === 'delete' ? 'destructive' : 'default'}
              onClick={confirmBulkAction}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
}