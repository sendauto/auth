import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell, Check, AlertCircle, Info, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  metadata: Record<string, any>;
  createdAt: string;
}

export function NotificationCenter() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: getQueryFn<Notification[]>({ on401: "returnNull" }),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const markReadMutation = useMutation({
    mutationFn: (notificationId: number) =>
      apiRequest("POST", `/api/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'normal':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'normal':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-0 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNotificationClick(notification);
                }}
              >
                <div 
                  className={`w-full p-3 border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.isRead ? 'font-medium' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getPriorityIcon(notification.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      {notification.actionUrl && (
                        <p className="text-xs text-blue-600 mt-1">
                          Click to view →
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-center text-blue-600 cursor-pointer"
              onClick={() => {
                // Navigate to full notifications page if it exists
                window.location.href = '/notifications';
              }}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Full notifications page component
export function NotificationsPage() {
  const { toast } = useToast();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: getQueryFn<Notification[]>({ on401: "returnNull" }),
  });

  const markReadMutation = useMutation({
    mutationFn: (notificationId: number) =>
      apiRequest("POST", `/api/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  });

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'normal':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'normal':
        return 'border-l-blue-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-blue-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your account activity and important alerts
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {notifications.filter(n => !n.isRead).length} unread
        </Badge>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">You're all caught up! Check back later for updates.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotifications).map(([date, dayNotifications]) => (
            <div key={date}>
              <h2 className="text-sm font-medium text-gray-500 mb-3">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>
              <div className="space-y-3">
                {dayNotifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`transition-all hover:shadow-md cursor-pointer border-l-4 ${getPriorityColor(notification.priority)} ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      if (!notification.isRead) {
                        markReadMutation.mutate(notification.id);
                      }
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl;
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-1">
                          {getPriorityIcon(notification.priority)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {formatDate(notification.createdAt)}
                              </span>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {notification.type.replace('_', ' ')}
                            </Badge>
                            {notification.actionUrl && (
                              <span className="text-xs text-blue-600">
                                Click to view →
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}