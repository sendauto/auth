import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, BarChart3, UserPlus, UserCheck, Clock, TrendingUp } from "lucide-react";

export function ManagerPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
          <p className="text-muted-foreground">
            Monitor team performance and manage user access
          </p>
        </div>

            {/* Management Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                      <p className="text-2xl font-bold text-foreground">24</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Active Today</p>
                      <p className="text-2xl font-bold text-foreground">18</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Pending Access</p>
                      <p className="text-2xl font-bold text-foreground">3</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Growth</p>
                      <p className="text-2xl font-bold text-foreground">+12%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserPlus className="h-5 w-5" />
                    <span>Team Management</span>
                  </CardTitle>
                  <CardDescription>
                    Add new team members and manage permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Team Member
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Roles
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Analytics</span>
                  </CardTitle>
                  <CardDescription>
                    View team performance and usage metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Reports
                  </Button>
                  <Button variant="outline" className="w-full">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Team Members List */}
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage your team's access and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Alice Johnson", email: "alice@company.com", role: "user", status: "active", lastSeen: "2 hours ago" },
                    { name: "Bob Smith", email: "bob@company.com", role: "user", status: "active", lastSeen: "1 day ago" },
                    { name: "Carol Davis", email: "carol@company.com", role: "user", status: "pending", lastSeen: "Never" },
                    { name: "David Wilson", email: "david@company.com", role: "user", status: "inactive", lastSeen: "1 week ago" },
                  ].map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={member.status === "active" ? "default" : member.status === "pending" ? "secondary" : "outline"}>
                          {member.status}
                        </Badge>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Last seen</p>
                          <p className="text-xs font-medium">{member.lastSeen}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Team Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Team Activity</CardTitle>
                <CardDescription>
                  Latest actions and changes within your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <UserPlus className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">New team member added</p>
                      <p className="text-xs text-muted-foreground">
                        Carol Davis joined the team • 2 days ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCheck className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Permissions updated</p>
                      <p className="text-xs text-muted-foreground">
                        Modified access for Bob Smith • 1 week ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Analytics report generated</p>
                      <p className="text-xs text-muted-foreground">
                        Monthly team performance report • 1 week ago
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

      </div>
    </DashboardLayout>
  );
}
