import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export interface NotificationEvent {
  id: string;
  userId?: number;
  type: 'security_alert' | 'login_success' | 'login_failure' | 'password_change' | 'account_locked' | 'suspicious_activity' | 'new_device' | 'email_verification';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: Date;
  metadata?: Record<string, any>;
  read: boolean;
  actionRequired?: boolean;
}

export function useNotifications(userId?: number) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const handleNewNotification = useCallback((notification: NotificationEvent) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]);
    setUnreadCount(prev => prev + 1);

    // Show toast for important notifications
    if (notification.severity === 'critical' || notification.severity === 'error') {
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.severity === 'critical' ? "destructive" : "default",
      });
    }
  }, [toast]);

  const createNotification = useCallback((notificationData: Omit<NotificationEvent, 'id' | 'timestamp' | 'read'>) => {
    const notification: NotificationEvent = {
      ...notificationData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };
    
    handleNewNotification(notification);
    return notification;
  }, [handleNewNotification]);

  const markAsRead = useCallback(async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // Simulate real-time security notifications
  useEffect(() => {
    if (!userId) return;

    // Simulate WebSocket connection status
    setIsConnected(true);

    // Simulate initial welcome notification
    const welcomeNotification = createNotification({
      userId,
      type: 'security_alert',
      title: 'Security System Active',
      message: 'Real-time security monitoring is now active for your account',
      severity: 'info',
      channels: ['in_app'],
      metadata: {
        ipAddress: '127.0.0.1',
        location: 'Local Development',
        timestamp: new Date()
      }
    });

    return () => {
      setIsConnected(false);
    };
  }, [userId, createNotification]);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    createNotification
  };
}