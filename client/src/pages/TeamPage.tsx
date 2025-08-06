import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  Mail,
  Calendar,
  Shield,
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

interface TeamMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  lastLogin: Date | null;
  tenant: string;
  status: 'active' | 'invited' | 'inactive';
  isEmailVerified: boolean;
  createdAt: Date;
}

export function TeamPage() {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "user"
  });

  // Fetch real organization users
  const { data: teamMembers, isLoading: isLoadingTeam } = useQuery<{ users: TeamMember[] }>({
    queryKey: ["/api/organization/users"],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Invite user mutation
  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      const response = await apiRequest("POST", "/api/organization/invite", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to invite user");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Invitation Sent",
        description: "User invitation has been sent successfully.",
      });
      setInviteForm({ email: "", role: "user" });
      setIsInviteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/organization/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Invitation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getRoleBadgeColor = (roles: string[]) => {
    if (roles.includes('super_admin')) return 'bg-purple-100 text-purple-800';
    if (roles.includes('admin')) return 'bg-red-100 text-red-800';
    if (roles.includes('manager')) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  const getHighestRole = (roles: string[]) => {
    if (roles.includes('super_admin')) return 'Super Admin';
    if (roles.includes('admin')) return 'Admin';
    if (roles.includes('manager')) return 'Manager';
    return 'User';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'invited': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const users = teamMembers?.users || [];
  
  const filteredMembers = users.filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) || member.email.toLowerCase().includes(searchLower);
  });

  const stats = {
    total: users.length,
    active: users.filter(m => m.isEmailVerified && m.lastLogin).length,
    pending: users.filter(m => !m.isEmailVerified).length,
    inactive: users.filter(m => m.isEmailVerified && !m.lastLogin).length
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email || !inviteForm.role) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    inviteMutation.mutate(inviteForm);
  };

  return (
    <DashboardLayout showTabs={false}>
      <div className="space-y-8">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Team Members</h1>
                <p className="text-muted-foreground">
                  Manage your team members and their permissions
                </p>
              </div>
              {hasRole('admin') && (
                <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                      <DialogDescription>
                        Send an invitation to join your organization.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleInviteSubmit}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={inviteForm.email}
                            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                            placeholder="user@company.com"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Select value={inviteForm.role} onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              {hasRole('super_admin') && <SelectItem value="admin">Admin</SelectItem>}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={inviteMutation.isPending}>
                          {inviteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Send Invitation
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Active</p>
                      <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                      <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Team Members List */}
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingTeam ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : filteredMembers.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No team members found.</p>
                    </div>
                  ) : (
                    filteredMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>
                              {`${member.firstName} ${member.lastName}`.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{member.firstName} {member.lastName}</h3>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getRoleBadgeColor(member.roles)}>
                                {getHighestRole(member.roles)}
                              </Badge>
                              <Badge className={getStatusBadgeColor(member.isEmailVerified ? 'active' : 'invited')}>
                                {member.isEmailVerified ? 'Active' : 'Pending'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Last active</p>
                              <p className="text-sm font-medium">
                                {member.lastLogin 
                                  ? formatDistanceToNow(new Date(member.lastLogin), { addSuffix: true })
                                  : 'Never'
                                }
                              </p>
                            </div>
                          
                            {hasRole('admin') && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem>Edit Role</DropdownMenuItem>
                                  <DropdownMenuItem>Resend Invitation</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    Remove Member
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
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