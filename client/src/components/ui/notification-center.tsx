import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  X, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  TrendingUp,
  Users,
  Shield,
  Zap
} from "lucide-react";

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  actionLabel?: string;
  actionUrl?: string;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Get system alerts and recommendations
        const [alertsResponse, optimizationResponse] = await Promise.all([
          fetch('/api/xm/alerts'),
          fetch('/api/xm/optimization')
        ]);

        const alertsData = await alertsResponse.json();
        const optimizationData = await optimizationResponse.json();

        const newNotifications: Notification[] = [];

        // Process alerts
        if (alertsData.success && alertsData.data.alerts) {
          alertsData.data.alerts.forEach((alert: any, index: number) => {
            newNotifications.push({
              id: `alert-${index}`,
              type: alert.severity === 'critical' ? 'critical' : 'warning',
              title: alert.type === 'performance' ? 'Performance Alert' : 'System Alert',
              message: alert.message,
              timestamp: new Date(alert.timestamp),
              actionLabel: 'View Details',
              actionUrl: '/analytics'
            });
          });
        }

        // Process optimization recommendations
        if (optimizationData.success && optimizationData.data.recommendations) {
          optimizationData.data.recommendations.slice(0, 3).forEach((rec: any, index: number) => {
            newNotifications.push({
              id: `optimization-${index}`,
              type: rec.priority === 'high' ? 'warning' : 'info',
              title: 'Optimization Opportunity',
              message: rec.title,
              timestamp: new Date(rec.created),
              actionLabel: 'Learn More',
              actionUrl: '/analytics'
            });
          });
        }

        // Add engagement notifications
        newNotifications.push({
          id: 'welcome',
          type: 'success',
          title: 'Welcome to Auth247!',
          message: 'Your account is active and ready to use. Start by inviting team members.',
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          actionLabel: 'Invite Team',
          actionUrl: '/team'
        });

        setNotifications(newNotifications);
        setHasUnread(newNotifications.length > 0);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    
    // Refresh every 2 minutes
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'success':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notifications.length <= 1) {
      setHasUnread(false);
    }
  };

  const markAllAsRead = () => {
    setHasUnread(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) markAllAsRead();
        }}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 z-50">
          <Card className="shadow-lg border">
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Notifications</h3>
                  <div className="flex items-center space-x-2">
                    {notifications.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {notifications.length}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="p-1 h-auto"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No new notifications</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-l-4 ${getNotificationColor(notification.type)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-foreground">
                                {notification.title}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {notification.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissNotification(notification.id)}
                            className="p-1 h-auto opacity-60 hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {notification.actionLabel && notification.actionUrl && (
                          <div className="mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                window.location.href = notification.actionUrl!;
                                dismissNotification(notification.id);
                              }}
                              className="text-xs"
                            >
                              {notification.actionLabel}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}