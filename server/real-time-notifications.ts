/**
 * Real-time Notification System with WebSocket Support
 * Provides instant alerts for critical events and system changes
 */

import { WebSocketServer, WebSocket } from 'ws';
import * as crypto from 'crypto';

interface Notification {
  id: string;
  type: 'security' | 'system' | 'business' | 'user' | 'performance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, any>;
  read: boolean;
  persistent: boolean; // Whether to store in database
}

interface ClientConnection {
  ws: WebSocket;
  userId?: string;
  subscriptions: string[]; // Types of notifications to receive
  lastPing: number;
}

class RealTimeNotificationSystem {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ClientConnection> = new Map();
  private notifications: Map<string, Notification> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  initialize(server: any) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/notifications',
      perMessageDeflate: false
    });

    this.wss.on('connection', (ws: WebSocket, req: any) => {
      const clientId = crypto.randomUUID();
      
      const client: ClientConnection = {
        ws,
        subscriptions: ['all'], // Default subscription
        lastPing: Date.now()
      };

      this.clients.set(clientId, client);
      console.log(`[Notifications] Client connected: ${clientId}`);

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(clientId, message);
        } catch (error) {
          console.error('[Notifications] Invalid message from client:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`[Notifications] Client disconnected: ${clientId}`);
      });

      ws.on('error', (error) => {
        console.error(`[Notifications] WebSocket error for ${clientId}:`, error);
        this.clients.delete(clientId);
      });

      // Send initial connection success
      this.sendToClient(clientId, {
        type: 'connection',
        status: 'connected',
        clientId
      });
    });

    this.startHeartbeat();
    console.log('[Notifications] Real-time notification system initialized');
  }

  private handleClientMessage(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'subscribe':
        client.subscriptions = message.topics || ['all'];
        client.userId = message.userId;
        console.log(`[Notifications] Client ${clientId} subscribed to: ${client.subscriptions.join(', ')}`);
        break;

      case 'ping':
        client.lastPing = Date.now();
        this.sendToClient(clientId, { type: 'pong' });
        break;

      case 'markRead':
        if (message.notificationId) {
          this.markNotificationRead(message.notificationId);
        }
        break;

      case 'getHistory':
        this.sendNotificationHistory(clientId, message.userId);
        break;
    }
  }

  private sendToClient(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(data));
      } catch (error) {
        console.error(`[Notifications] Error sending to client ${clientId}:`, error);
        this.clients.delete(clientId);
      }
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const timeout = 30000; // 30 seconds

      this.clients.forEach((client, clientId) => {
        if (now - client.lastPing > timeout) {
          console.log(`[Notifications] Client ${clientId} timed out, disconnecting`);
          client.ws.terminate();
          this.clients.delete(clientId);
        } else {
          // Send ping to active clients
          this.sendToClient(clientId, { type: 'ping' });
        }
      });
    }, 15000); // Check every 15 seconds
  }

  // Main notification sending method
  sendNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const fullNotification: Notification = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    // Store notification
    this.notifications.set(fullNotification.id, fullNotification);

    // Send to appropriate clients
    this.broadcastNotification(fullNotification);

    // Log based on priority
    const logLevel = fullNotification.priority === 'critical' ? 'error' : 'info';
    console[logLevel](`[Notifications] ${fullNotification.priority.toUpperCase()}: ${fullNotification.title}`);

    return fullNotification.id;
  }

  private broadcastNotification(notification: Notification) {
    this.clients.forEach((client, clientId) => {
      // Check if client should receive this notification
      if (this.shouldReceiveNotification(client, notification)) {
        this.sendToClient(clientId, {
          type: 'notification',
          notification
        });
      }
    });
  }

  private shouldReceiveNotification(client: ClientConnection, notification: Notification): boolean {
    // If user-specific notification, only send to that user
    if (notification.userId && notification.userId !== client.userId) {
      return false;
    }

    // Check subscription preferences
    return client.subscriptions.includes('all') || 
           client.subscriptions.includes(notification.type) ||
           notification.priority === 'critical'; // Always send critical notifications
  }

  private markNotificationRead(notificationId: string) {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
      console.log(`[Notifications] Marked notification ${notificationId} as read`);
    }
  }

  private sendNotificationHistory(clientId: string, userId?: string) {
    const userNotifications = Array.from(this.notifications.values())
      .filter(n => !userId || !n.userId || n.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50); // Last 50 notifications

    this.sendToClient(clientId, {
      type: 'history',
      notifications: userNotifications
    });
  }

  // Convenience methods for different notification types
  sendSecurityAlert(title: string, message: string, metadata?: Record<string, any>) {
    return this.sendNotification({
      type: 'security',
      priority: 'critical',
      title,
      message,
      metadata,
      persistent: true
    });
  }

  sendSystemAlert(title: string, message: string, priority: 'low' | 'medium' | 'high' = 'medium') {
    return this.sendNotification({
      type: 'system',
      priority,
      title,
      message,
      persistent: true
    });
  }

  sendPerformanceAlert(title: string, message: string, metadata?: Record<string, any>) {
    return this.sendNotification({
      type: 'performance',
      priority: 'high',
      title,
      message,
      metadata,
      persistent: false
    });
  }

  sendBusinessAlert(title: string, message: string, priority: 'low' | 'medium' | 'high' = 'medium') {
    return this.sendNotification({
      type: 'business',
      priority,
      title,
      message,
      persistent: true
    });
  }

  sendUserNotification(userId: string, title: string, message: string, priority: 'low' | 'medium' | 'high' = 'low') {
    return this.sendNotification({
      type: 'user',
      priority,
      title,
      message,
      userId,
      persistent: true
    });
  }

  // Get system statistics
  getSystemStats() {
    const now = Date.now();
    const activeClients = Array.from(this.clients.values())
      .filter(client => now - client.lastPing < 30000);

    const recentNotifications = Array.from(this.notifications.values())
      .filter(n => new Date(n.timestamp).getTime() > now - 24 * 60 * 60 * 1000);

    return {
      connectedClients: this.clients.size,
      activeClients: activeClients.length,
      totalNotifications: this.notifications.size,
      recentNotifications: recentNotifications.length,
      criticalNotifications: recentNotifications.filter(n => n.priority === 'critical').length,
      unreadNotifications: Array.from(this.notifications.values()).filter(n => !n.read).length
    };
  }

  // Cleanup old notifications
  cleanupOldNotifications(maxAge: number = 7 * 24 * 60 * 60 * 1000) { // 7 days default
    const cutoff = Date.now() - maxAge;
    let cleaned = 0;

    this.notifications.forEach((notification, id) => {
      if (new Date(notification.timestamp).getTime() < cutoff && !notification.persistent) {
        this.notifications.delete(id);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      console.log(`[Notifications] Cleaned up ${cleaned} old notifications`);
    }
  }

  stop() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }

    this.clients.clear();
    console.log('[Notifications] Real-time notification system stopped');
  }
}

export const notificationSystem = new RealTimeNotificationSystem();