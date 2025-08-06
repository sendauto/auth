/**
 * Advanced Monitoring API Routes
 * Provides endpoints for real-time system monitoring and analytics
 */

import { Request, Response } from 'express';
import { apiMonitor } from './api-monitor';
import { securityMonitor } from './security-monitor';
import { notificationSystem } from './real-time-notifications';
import rateLimit from 'express-rate-limit';

// Monitoring-specific rate limit - more permissive for dashboard queries
const monitoringRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // Allow 120 requests per minute (2 requests per second)
  message: {
    error: "Too Many Requests", 
    message: "Too many monitoring requests, please slow down.",
    retryAfter: "1 minute"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export function registerAdvancedMonitoringRoutes(app: any) {
  
  // API Performance Monitoring Routes
  app.get('/api/monitoring/api-stats', monitoringRateLimit, (req: Request, res: Response) => {
    try {
      const stats = apiMonitor.getRealtimeStats();
      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[Monitoring] Error getting API stats:', error);
      res.status(500).json({ error: 'Failed to get API statistics' });
    }
  });

  app.get('/api/monitoring/slow-endpoints', (req: Request, res: Response) => {
    try {
      const threshold = parseInt(req.query.threshold as string) || 500;
      const slowEndpoints = apiMonitor.getSlowEndpoints(threshold);
      res.json({
        success: true,
        data: slowEndpoints,
        threshold,
        count: slowEndpoints.length
      });
    } catch (error) {
      console.error('[Monitoring] Error getting slow endpoints:', error);
      res.status(500).json({ error: 'Failed to get slow endpoints' });
    }
  });

  app.get('/api/monitoring/error-prone', (req: Request, res: Response) => {
    try {
      const errorProne = apiMonitor.getErrorProne();
      res.json({
        success: true,
        data: errorProne,
        count: errorProne.length
      });
    } catch (error) {
      console.error('[Monitoring] Error getting error-prone endpoints:', error);
      res.status(500).json({ error: 'Failed to get error-prone endpoints' });
    }
  });

  // Security Monitoring Routes
  app.get('/api/monitoring/security-dashboard', monitoringRateLimit, (req: Request, res: Response) => {
    try {
      const dashboard = securityMonitor.getSecurityDashboard();
      res.json({
        success: true,
        data: dashboard,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[Monitoring] Error getting security dashboard:', error);
      res.status(500).json({ error: 'Failed to get security dashboard' });
    }
  });

  app.post('/api/monitoring/security-event', (req: Request, res: Response) => {
    try {
      const { type, severity, description, metadata } = req.body;
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent');
      
      securityMonitor.recordSecurityEvent(
        type, 
        severity, 
        ip, 
        description, 
        metadata, 
        userAgent
      );

      res.json({ success: true, message: 'Security event recorded' });
    } catch (error) {
      console.error('[Monitoring] Error recording security event:', error);
      res.status(500).json({ error: 'Failed to record security event' });
    }
  });

  app.get('/api/monitoring/ip-status/:ip', (req: Request, res: Response) => {
    try {
      const { ip } = req.params;
      const isBlocked = securityMonitor.isIPBlocked(ip);
      const riskScore = securityMonitor.getIPRiskScore(ip);
      
      res.json({
        success: true,
        data: {
          ip,
          blocked: isBlocked,
          riskScore,
          status: isBlocked ? 'blocked' : riskScore > 70 ? 'high-risk' : 'safe'
        }
      });
    } catch (error) {
      console.error('[Monitoring] Error checking IP status:', error);
      res.status(500).json({ error: 'Failed to check IP status' });
    }
  });

  // Notification System Routes
  app.get('/api/monitoring/notifications/stats', monitoringRateLimit, (req: Request, res: Response) => {
    try {
      const stats = notificationSystem.getSystemStats();
      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[Monitoring] Error getting notification stats:', error);
      res.status(500).json({ error: 'Failed to get notification statistics' });
    }
  });

  app.post('/api/monitoring/notifications/send', (req: Request, res: Response) => {
    try {
      const { type, priority, title, message, userId, metadata } = req.body;
      
      let notificationId;
      
      switch (type) {
        case 'security':
          notificationId = notificationSystem.sendSecurityAlert(title, message, metadata);
          break;
        case 'system':
          notificationId = notificationSystem.sendSystemAlert(title, message, priority);
          break;
        case 'performance':
          notificationId = notificationSystem.sendPerformanceAlert(title, message, metadata);
          break;
        case 'business':
          notificationId = notificationSystem.sendBusinessAlert(title, message, priority);
          break;
        case 'user':
          if (!userId) {
            return res.status(400).json({ error: 'userId required for user notifications' });
          }
          notificationId = notificationSystem.sendUserNotification(userId, title, message, priority);
          break;
        default:
          return res.status(400).json({ error: 'Invalid notification type' });
      }

      res.json({ 
        success: true, 
        notificationId,
        message: 'Notification sent successfully' 
      });
    } catch (error) {
      console.error('[Monitoring] Error sending notification:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  });

  // Combined System Health Route
  app.get('/api/monitoring/system-health', monitoringRateLimit, (req: Request, res: Response) => {
    try {
      const apiStats = apiMonitor.getRealtimeStats();
      const securityDashboard = securityMonitor.getSecurityDashboard();
      const notificationStats = notificationSystem.getSystemStats();

      // Calculate overall system health score
      let healthScore = 100;
      
      // Deduct for API performance issues
      if (apiStats.current.avgResponseTime5Min > 1000) healthScore -= 20;
      else if (apiStats.current.avgResponseTime5Min > 500) healthScore -= 10;
      
      if (apiStats.current.errorRate5Min > 0.05) healthScore -= 15;
      else if (apiStats.current.errorRate5Min > 0.01) healthScore -= 5;

      // Deduct for security issues
      if (securityDashboard.overview.criticalEvents24h > 0) healthScore -= 25;
      if (securityDashboard.overview.highRiskIPs > 5) healthScore -= 10;

      // Deduct for notification system issues
      if (notificationStats.connectedClients === 0) healthScore -= 5;

      healthScore = Math.max(0, Math.min(100, healthScore));
      
      let status = 'excellent';
      if (healthScore < 50) status = 'poor';
      else if (healthScore < 70) status = 'fair';
      else if (healthScore < 90) status = 'good';

      res.json({
        success: true,
        data: {
          overallHealth: {
            score: healthScore,
            status,
            timestamp: new Date().toISOString()
          },
          components: {
            api: {
              healthy: apiStats.current.errorRate5Min < 0.01 && apiStats.current.avgResponseTime5Min < 500,
              responseTime: apiStats.current.avgResponseTime5Min,
              errorRate: apiStats.current.errorRate5Min,
              requestCount: apiStats.current.requestsLast5Min
            },
            security: {
              healthy: securityDashboard.overview.criticalEvents24h === 0,
              criticalEvents: securityDashboard.overview.criticalEvents24h,
              blockedIPs: securityDashboard.overview.blockedIPs,
              riskLevel: securityDashboard.overview.highRiskIPs > 5 ? 'high' : 'normal'
            },
            notifications: {
              healthy: notificationStats.connectedClients > 0,
              connectedClients: notificationStats.connectedClients,
              unreadNotifications: notificationStats.unreadNotifications
            }
          }
        }
      });
    } catch (error) {
      console.error('[Monitoring] Error getting system health:', error);
      res.status(500).json({ error: 'Failed to get system health' });
    }
  });

  // Maintenance and cleanup routes
  app.post('/api/monitoring/cleanup', (req: Request, res: Response) => {
    try {
      // Cleanup old notifications
      notificationSystem.cleanupOldNotifications();
      
      res.json({ 
        success: true, 
        message: 'Cleanup completed successfully' 
      });
    } catch (error) {
      console.error('[Monitoring] Error during cleanup:', error);
      res.status(500).json({ error: 'Cleanup failed' });
    }
  });

  // Real-time monitoring WebSocket info
  app.get('/api/monitoring/websocket-info', (req: Request, res: Response) => {
    const protocol = req.protocol === 'https' ? 'wss' : 'ws';
    const host = req.get('host');
    
    res.json({
      success: true,
      data: {
        websocketUrl: `${protocol}://${host}/notifications`,
        connectionInstructions: {
          subscribe: 'Send {"type": "subscribe", "topics": ["security", "system"], "userId": "optional"}',
          ping: 'Send {"type": "ping"} to keep connection alive',
          markRead: 'Send {"type": "markRead", "notificationId": "id"} to mark notification as read',
          getHistory: 'Send {"type": "getHistory", "userId": "optional"} to get notification history'
        }
      }
    });
  });

  console.log('[Monitoring] Advanced monitoring routes registered');
}