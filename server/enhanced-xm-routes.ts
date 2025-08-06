/**
 * Enhanced XM API Routes
 * Comprehensive endpoints for health monitoring, optimization, and business intelligence
 */

import type { Express, Request, Response } from "express";
import { enhancedXM } from "./xm-enhanced-system";
import { logActivity } from "./conversation-system";
import { consoleLogLearning } from "./console-learning-system";
import { monitoringRateLimit } from "./middleware/security";

export function registerEnhancedXMRoutes(app: Express): void {
  // System Control Endpoints
  app.get("/api/xm/status", monitoringRateLimit, async (req: Request, res: Response) => {
    try {
      await logActivity('Enhanced XM status check requested');
      const status = enhancedXM.getSystemStatus();
      res.json(status);
    } catch (error) {
      console.error('[Enhanced XM] Status endpoint error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get system status' 
      });
    }
  });

  app.get("/api/xm/health", monitoringRateLimit, async (req: Request, res: Response) => {
    try {
      await logActivity('Enhanced XM health dashboard requested');
      const dashboard = enhancedXM.getHealthDashboard();
      res.json(dashboard);
    } catch (error) {
      console.error('[Enhanced XM] Health endpoint error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get health dashboard' 
      });
    }
  });

  app.post("/api/xm/start", async (req: Request, res: Response) => {
    try {
      enhancedXM.startMonitoring();
      await logActivity('Enhanced XM monitoring started manually');
      res.json({ 
        success: true, 
        message: 'Enhanced XM monitoring started' 
      });
    } catch (error) {
      console.error('[Enhanced XM] Start endpoint error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to start monitoring' 
      });
    }
  });

  app.post("/api/xm/stop", async (req: Request, res: Response) => {
    try {
      enhancedXM.stopMonitoring();
      await logActivity('Enhanced XM monitoring stopped manually');
      res.json({ 
        success: true, 
        message: 'Enhanced XM monitoring stopped' 
      });
    } catch (error) {
      console.error('[Enhanced XM] Stop endpoint error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to stop monitoring' 
      });
    }
  });

  // Optimization Endpoints
  app.get("/api/xm/optimization", monitoringRateLimit, async (req: Request, res: Response) => {
    try {
      await logActivity('Enhanced XM optimization recommendations requested');
      const recommendations = enhancedXM.getOptimizationRecommendations();
      res.json(recommendations);
    } catch (error) {
      console.error('[Enhanced XM] Optimization endpoint error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get optimization recommendations' 
      });
    }
  });

  app.get("/api/xm/optimization/:priority", async (req: Request, res: Response) => {
    try {
      const { priority } = req.params;
      if (!['low', 'medium', 'high', 'critical'].includes(priority)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid priority. Use: low, medium, high, or critical'
        });
      }

      await logActivity(`Enhanced XM ${priority} priority recommendations requested`);
      const recommendations = enhancedXM.getOptimizationRecommendations();
      
      const filtered = {
        ...recommendations,
        data: {
          ...recommendations.data,
          recommendations: recommendations.data.recommendations.filter(r => r.priority === priority)
        }
      };

      res.json(filtered);
    } catch (error) {
      console.error('[Enhanced XM] Priority optimization endpoint error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get priority recommendations' 
      });
    }
  });

  // Business Intelligence Endpoints
  app.get("/api/xm/analytics", monitoringRateLimit, async (req: Request, res: Response) => {
    try {
      await logActivity('Enhanced XM business analytics requested');
      const analytics = enhancedXM.getBusinessAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('[Enhanced XM] Analytics endpoint error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get business analytics' 
      });
    }
  });

  app.get("/api/xm/insights", monitoringRateLimit, async (req: Request, res: Response) => {
    try {
      await logActivity('Enhanced XM business insights requested');
      const analytics = enhancedXM.getBusinessAnalytics();
      
      const insights = {
        success: true,
        data: {
          insights: analytics.data.insights,
          recommendations: analytics.data.recommendations,
          keyMetrics: {
            userEngagement: analytics.data.currentMetrics?.userEngagement,
            conversionRate: analytics.data.currentMetrics?.conversionRate,
            revenueImpact: analytics.data.currentMetrics?.revenueImpact
          },
          trends: analytics.data.trends
        }
      };

      res.json(insights);
    } catch (error) {
      console.error('[Enhanced XM] Insights endpoint error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get business insights' 
      });
    }
  });

  // Performance Monitoring Endpoints
  app.get("/api/xm/performance", monitoringRateLimit, async (req: Request, res: Response) => {
    try {
      await logActivity('Enhanced XM performance metrics requested');
      const dashboard = enhancedXM.getHealthDashboard();
      
      const performance = {
        success: true,
        data: {
          systemHealth: dashboard.data.systemHealth,
          performanceMetrics: dashboard.data.performanceMetrics,
          trends: dashboard.data.trends,
          alerts: dashboard.data.alerts.filter(alert => alert.type === 'performance')
        }
      };

      res.json(performance);
    } catch (error) {
      console.error('[Enhanced XM] Performance endpoint error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get performance metrics' 
      });
    }
  });

  // Alert Management Endpoints
  app.get("/api/xm/alerts", monitoringRateLimit, async (req: Request, res: Response) => {
    try {
      await logActivity('Enhanced XM alerts requested');
      const dashboard = enhancedXM.getHealthDashboard();
      
      const alerts = {
        success: true,
        data: {
          alerts: dashboard.data.alerts,
          summary: {
            total: dashboard.data.alerts.length,
            critical: dashboard.data.alerts.filter(a => a.priority === 'critical').length,
            high: dashboard.data.alerts.filter(a => a.priority === 'high').length
          }
        }
      };

      res.json(alerts);
    } catch (error) {
      console.error('[Enhanced XM] Alerts endpoint error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get alerts' 
      });
    }
  });

  // Detailed System Information
  app.get("/api/xm/system-info", async (req: Request, res: Response) => {
    try {
      await logActivity('Enhanced XM system information requested');
      
      const memUsage = process.memoryUsage();
      const uptime = process.uptime();
      
      const systemInfo = {
        success: true,
        data: {
          process: {
            pid: process.pid,
            uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
            memoryUsage: {
              rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
              heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
              heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
              external: Math.round(memUsage.external / 1024 / 1024) + 'MB'
            }
          },
          environment: {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            environment: process.env.NODE_ENV || 'development'
          },
          xmStatus: enhancedXM.getSystemStatus().data
        }
      };

      res.json(systemInfo);
    } catch (error) {
      console.error('[Enhanced XM] System info endpoint error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get system information' 
      });
    }
  });

  // Configuration Endpoints
  app.get("/api/xm/config", async (req: Request, res: Response) => {
    try {
      const config = {
        success: true,
        data: {
          monitoring: {
            interval: '30 seconds',
            metricsRetention: '30 minutes',
            alertThresholds: {
              responseTime: '100ms',
              memoryUsage: '500MB',
              errorRate: '1%'
            }
          },
          features: {
            healthMonitoring: true,
            businessIntelligence: true,
            optimization: true,
            alerting: true,
            conversationArchiving: true
          },
          endpoints: [
            '/api/xm/status',
            '/api/xm/health',
            '/api/xm/optimization',
            '/api/xm/analytics',
            '/api/xm/performance',
            '/api/xm/alerts',
            '/api/xm/system-info'
          ]
        }
      };

      res.json(config);
    } catch (error) {
      console.error('[Enhanced XM] Config endpoint error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get configuration' 
      });
    }
  });

  // Console Learning System Endpoints
  app.post("/api/xm/console/start", async (req: Request, res: Response) => {
    try {
      await consoleLogLearning.startConsoleCapture();
      await logActivity('Console learning system started');
      res.json({
        success: true,
        message: 'Console learning system activated'
      });
    } catch (error) {
      console.error('[Enhanced XM] Console start error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start console learning'
      });
    }
  });

  app.post("/api/xm/console/stop", async (req: Request, res: Response) => {
    try {
      consoleLogLearning.stopConsoleCapture();
      await logActivity('Console learning system stopped');
      res.json({
        success: true,
        message: 'Console learning system deactivated'
      });
    } catch (error) {
      console.error('[Enhanced XM] Console stop error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to stop console learning'
      });
    }
  });

  app.get("/api/xm/console/status", async (req: Request, res: Response) => {
    try {
      const status = consoleLogLearning.getStatus();
      await logActivity('Console learning status requested');
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('[Enhanced XM] Console status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get console learning status'
      });
    }
  });

  app.get("/api/xm/console/patterns", async (req: Request, res: Response) => {
    try {
      const patterns = consoleLogLearning.getPatterns();
      await logActivity('Console learning patterns requested');
      res.json({
        success: true,
        data: patterns
      });
    } catch (error) {
      console.error('[Enhanced XM] Console patterns error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get console learning patterns'
      });
    }
  });

  app.get("/api/xm/console/insights", async (req: Request, res: Response) => {
    try {
      const status = consoleLogLearning.getStatus();
      const patterns = consoleLogLearning.getPatterns();
      
      const insights = {
        summary: {
          totalPatterns: status.patternsDetected,
          criticalIssues: status.criticalPatterns,
          bufferUtilization: (status.bufferSize / 1000) * 100,
          learningActive: status.active
        },
        recentActivity: status.recentActivity,
        criticalPatterns: patterns.critical,
        recommendations: patterns.critical.flatMap(p => p.recommendations).slice(0, 10),
        performanceMetrics: patterns.byCategory.performance,
        errorTrends: patterns.byCategory.error
      };

      await logActivity('Console learning insights requested');
      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      console.error('[Enhanced XM] Console insights error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get console learning insights'
      });
    }
  });

  console.log('[Enhanced XM] API routes registered successfully');
}