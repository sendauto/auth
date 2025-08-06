import React from "react";
import { useAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Building, Shield, Clock, Edit, Save, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function ProfilePage() {
  const { user, session, checkSession } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  // Update form data when user data changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const profileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; email: string }) => {
      const response = await apiRequest("PUT", "/api/auth/profile", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
      // Refresh authentication state
      checkSession();
      // Invalidate session query to refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/session"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleDisplayName = (roles: string[]) => {
    if (roles.includes("super_admin")) return "Super Admin";
    if (roles.includes("admin")) return "Admin";
    if (roles.includes("manager")) return "Manager";
    return "User";
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin": return "destructive";
      case "admin": return "default";
      case "manager": return "secondary";
      default: return "outline";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: "Validation Error",
        description: "First name and last name are required.",
        variant: "destructive",
      });
      return;
    }

    profileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout showTabs={false}>
      <div className="max-w-4xl space-y-8">
            
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
              <p className="text-muted-foreground">
                View and update your personal information
              </p>
            </div>

            {/* Profile Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xl font-medium">
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">
                        {user.firstName} {user.lastName}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {getRoleDisplayName(user.roles)} • {user.tenant}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {user.roles.map((role) => (
                      <Badge key={role} variant={getRoleBadgeVariant(role)}>
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Personal Information</span>
                    </CardTitle>
                    <CardDescription>
                      Update your personal details and contact information
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleSave} 
                        disabled={profileMutation.isPending}
                        size="sm"
                      >
                        {profileMutation.isPending ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-foreground font-medium">{user.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-foreground font-medium">{user.lastName}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-foreground font-medium">{user.email}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Account Details</span>
                </CardTitle>
                <CardDescription>
                  Your account information and security details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>User ID</Label>
                    <p className="mt-1 text-sm font-mono text-muted-foreground">usr_{user.id}</p>
                  </div>
                  <div>
                    <Label>Tenant</Label>
                    <div className="mt-1 flex items-center space-x-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{user.tenant}</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label>Roles & Permissions</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {user.roles.map((role) => (
                      <Badge key={role} variant={getRoleBadgeVariant(role)}>
                        {role.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Your roles determine which features and areas you can access within the system.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Session Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Session Information</span>
                </CardTitle>
                <CardDescription>
                  Details about your current session and recent activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Last Login</Label>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {user.lastLogin 
                        ? formatDistanceToNow(user.lastLogin, { addSuffix: true })
                        : "Never"
                      }
                    </p>
                  </div>
                  <div>
                    <Label>Session Expires</Label>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {session 
                        ? `In ${formatDistanceToNow(session.expiresAt)}`
                        : "Unknown"
                      }
                    </p>
                  </div>
                  <div>
                    <Label>IP Address</Label>
                    <p className="mt-1 text-sm font-mono text-muted-foreground">
                      {session?.ipAddress || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <Label>Session ID</Label>
                    <p className="mt-1 text-sm font-mono text-muted-foreground">
                      {session?.id.substring(0, 16)}...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Security Actions</CardTitle>
                <CardDescription>
                  Manage your account security and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Change Password</p>
                    <p className="text-xs text-muted-foreground">
                      Update your account password for enhanced security
                    </p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-xs text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Active Sessions</p>
                    <p className="text-xs text-muted-foreground">
                      View and manage all your active sessions
                    </p>
                  </div>
                  <Button variant="outline">Manage Sessions</Button>
                </div>
              </CardContent>
            </Card>

        </div>
    </DashboardLayout>
  );
}
