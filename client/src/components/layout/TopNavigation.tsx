import React, { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Bell, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { NotificationCenter } from "@/components/ui/notification-center";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TopNavigation() {
  const { user, logout } = useAuth();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleDisplayName = (roles: string[]) => {
    if (roles.includes("super_admin")) return "Super Admin";
    if (roles.includes("admin")) return "Admin";
    if (roles.includes("manager")) return "Manager";
    return "User";
  };

  return (
    <nav className="bg-background border-b border-border px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        {/* Logo and Brand */}
        <div className="flex items-center">
          <Logo size="md" />
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          {/* Enhanced Notification Center */}
          <NotificationCenter />
          
          {/* Notifications (legacy) */}
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-medium">
                    {user ? getInitials(user.firstName, user.lastName) : "??"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-foreground">
                    {user ? `${user.firstName} ${user.lastName}` : "Unknown User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user ? getRoleDisplayName(user.roles) : "No Role"}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tenant: {user?.tenant}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/profile" className="flex items-center w-full">
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/settings" className="flex items-center w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={logout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
