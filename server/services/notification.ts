import { EventEmitter } from 'events';
import { EmailService } from './email';

export interface NotificationEvent {
  id: string;
  userId?: number;
  type: 'security_alert' | 'login_success' | 'login_failure' | 'password_change' | 'account_locked' | 'suspicious_activity' | 'new_device' | 'email_verification';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: Date;
  metadata?: Record<string, any>;
  channels: ('in_app' | 'email' | 'sms')[];
  read: boolean;
  actionRequired?: boolean;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  userId: number;
  emailNotifications: boolean;
  securityAlerts: boolean;
  loginNotifications: boolean;
  marketingEmails: boolean;
  channels: {
    email: boolean;
    inApp: boolean;
    sms: boolean;
  };
}

export class NotificationService extends EventEmitter {
  private static instance: NotificationService;
  private notifications = new Map<string, NotificationEvent>();
  private userNotifications = new Map<number, string[]>();
  private preferences = new Map<number, NotificationPreferences>();

  private constructor() {
    super();
    this.setupDefaultPreferences();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private setupDefaultPreferences(): void {
    // Default notification preferences for new users
    const defaultPrefs: Omit<NotificationPreferences, 'userId'> = {
      emailNotifications: true,
      securityAlerts: true,
      loginNotifications: true,
      marketingEmails: false,
      channels: {
        email: true,
        inApp: true,
        sms: false
      }
    };
  }

  async createNotification(notification: Omit<NotificationEvent, 'id' | 'timestamp' | 'read'>): Promise<NotificationEvent> {
    const notificationEvent: NotificationEvent = {
      ...notification,
      id: this.generateNotificationId(),
      timestamp: new Date(),
      read: false
    };

    // Store notification
    this.notifications.set(notificationEvent.id, notificationEvent);

    // Add to user's notification list
    if (notificationEvent.userId) {
      const userNotifs = this.userNotifications.get(notificationEvent.userId) || [];
      userNotifs.unshift(notificationEvent.id); // Add to beginning for latest first
      
      // Keep only last 100 notifications per user
      if (userNotifs.length > 100) {
        const removedId = userNotifs.pop();
        if (removedId) {
          this.notifications.delete(removedId);
        }
      }
      
      this.userNotifications.set(notificationEvent.userId, userNotifs);
    }

    // Send via configured channels
    await this.sendNotification(notificationEvent);

    // Emit real-time event
    this.emit('notification', notificationEvent);

    return notificationEvent;
  }

  private async sendNotification(notification: NotificationEvent): Promise<void> {
    if (!notification.userId) return;

    const prefs = this.preferences.get(notification.userId);
    if (!prefs) return;

    // Send email notification
    if (notification.channels.includes('email') && prefs.channels.email) {
      await this.sendEmailNotification(notification);
    }

    // Send SMS notification (implement SMS service)
    if (notification.channels.includes('sms') && prefs.channels.sms) {
      await this.sendSMSNotification(notification);
    }

    // In-app notifications are handled by real-time events
  }

  private async sendEmailNotification(notification: NotificationEvent): Promise<void> {
    try {
      // Implementation would depend on your email service
      console.log(`[NOTIFICATION] Email sent for ${notification.type}: ${notification.title}`);
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  private async sendSMSNotification(notification: NotificationEvent): Promise<void> {
    try {
      // Implementation would depend on your SMS service (Twilio, etc.)
      console.log(`[NOTIFICATION] SMS sent for ${notification.type}: ${notification.title}`);
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
    }
  }

  async getUserNotifications(userId: number, limit: number = 50, offset: number = 0): Promise<NotificationEvent[]> {
    const userNotifIds = this.userNotifications.get(userId) || [];
    const paginatedIds = userNotifIds.slice(offset, offset + limit);
    
    return paginatedIds
      .map(id => this.notifications.get(id))
      .filter(Boolean) as NotificationEvent[];
  }

  async markAsRead(notificationId: string, userId: number): Promise<boolean> {
    const notification = this.notifications.get(notificationId);
    if (!notification || notification.userId !== userId) {
      return false;
    }

    notification.read = true;
    this.notifications.set(notificationId, notification);
    return true;
  }

  async markAllAsRead(userId: number): Promise<void> {
    const userNotifIds = this.userNotifications.get(userId) || [];
    
    for (const id of userNotifIds) {
      const notification = this.notifications.get(id);
      if (notification) {
        notification.read = true;
        this.notifications.set(id, notification);
      }
    }
  }

  async getUnreadCount(userId: number): Promise<number> {
    const userNotifIds = this.userNotifications.get(userId) || [];
    
    return userNotifIds
      .map(id => this.notifications.get(id))
      .filter(n => n && !n.read).length;
  }

  async setUserPreferences(userId: number, preferences: Partial<NotificationPreferences>): Promise<void> {
    const current = this.preferences.get(userId) || {
      userId,
      emailNotifications: true,
      securityAlerts: true,
      loginNotifications: true,
      marketingEmails: false,
      channels: { email: true, inApp: true, sms: false }
    };

    this.preferences.set(userId, { ...current, ...preferences });
  }

  async getUserPreferences(userId: number): Promise<NotificationPreferences> {
    return this.preferences.get(userId) || {
      userId,
      emailNotifications: true,
      securityAlerts: true,
      loginNotifications: true,
      marketingEmails: false,
      channels: { email: true, inApp: true, sms: false }
    };
  }

  // Security-specific notification helpers
  async notifySecurityEvent(userId: number, eventType: string, details: Record<string, any>): Promise<void> {
    const severityMap: Record<string, 'info' | 'warning' | 'error' | 'critical'> = {
      'login_success': 'info',
      'login_failure': 'warning',
      'account_locked': 'critical',
      'suspicious_activity': 'error',
      'password_change': 'info',
      'new_device': 'warning'
    };

    const titleMap: Record<string, string> = {
      'login_success': 'Successful Login',
      'login_failure': 'Failed Login Attempt',
      'account_locked': 'Account Locked',
      'suspicious_activity': 'Suspicious Activity Detected',
      'password_change': 'Password Changed',
      'new_device': 'New Device Login'
    };

    await this.createNotification({
      userId,
      type: 'security_alert',
      title: titleMap[eventType] || 'Security Alert',
      message: this.generateSecurityMessage(eventType, details),
      severity: severityMap[eventType] || 'warning',
      metadata: details,
      channels: ['in_app', 'email'],
      actionRequired: ['account_locked', 'suspicious_activity'].includes(eventType)
    });
  }

  private generateSecurityMessage(eventType: string, details: Record<string, any>): string {
    const { ipAddress, userAgent, location, timestamp } = details;
    
    switch (eventType) {
      case 'login_success':
        return `Successful login from ${ipAddress || 'unknown IP'} at ${new Date(timestamp).toLocaleString()}`;
      case 'login_failure':
        return `Failed login attempt from ${ipAddress || 'unknown IP'} at ${new Date(timestamp).toLocaleString()}`;
      case 'account_locked':
        return `Your account has been locked due to multiple failed login attempts. Contact support if this wasn't you.`;
      case 'suspicious_activity':
        return `Suspicious activity detected on your account from ${ipAddress || 'unknown IP'}. Please review your recent activity.`;
      case 'password_change':
        return `Your password was successfully changed at ${new Date(timestamp).toLocaleString()}`;
      case 'new_device':
        return `New device login detected from ${location || 'unknown location'} using ${userAgent || 'unknown browser'}`;
      default:
        return 'Security event detected on your account';
    }
  }

  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup expired notifications
  async cleanupExpiredNotifications(): Promise<void> {
    const now = new Date();
    const expiredIds: string[] = [];

    for (const [id, notification] of this.notifications) {
      if (notification.expiresAt && notification.expiresAt < now) {
        expiredIds.push(id);
      }
    }

    // Remove expired notifications
    for (const id of expiredIds) {
      this.notifications.delete(id);
      
      // Remove from user notification lists
      for (const [userId, notifIds] of this.userNotifications) {
        const index = notifIds.indexOf(id);
        if (index !== -1) {
          notifIds.splice(index, 1);
          this.userNotifications.set(userId, notifIds);
        }
      }
    }
  }
}

export const notificationService = NotificationService.getInstance();

// Start cleanup interval
setInterval(() => {
  notificationService.cleanupExpiredNotifications();
}, 60 * 60 * 1000); // Run every hour