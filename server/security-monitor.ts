/**
 * Advanced Security Monitoring System
 * Real-time threat detection and security event tracking
 */

import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import * as crypto from 'crypto';

interface SecurityEvent {
  id: string;
  type: 'auth_failure' | 'rate_limit' | 'suspicious_activity' | 'permission_violation' | 'data_access' | 'session_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  ip: string;
  userAgent?: string;
  userId?: string;
  description: string;
  metadata?: Record<string, any>;
  resolved: boolean;
}

interface ThreatIntelligence {
  ip: string;
  riskScore: number; // 0-100
  failedAttempts: number;
  lastSeen: string;
  patterns: string[];
  blocked: boolean;
  country?: string;
  organization?: string;
}

interface SecurityMetrics {
  timestamp: string;
  totalEvents: number;
  criticalEvents: number;
  blockedIPs: number;
  averageRiskScore: number;
  topThreats: string[];
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private threatMap: Map<string, ThreatIntelligence> = new Map();
  private metrics: SecurityMetrics[] = [];
  private bufferSize = 10000;
  private eventsFile = './mx-security-events.json';
  private threatsFile = './mx-threat-intelligence.json';
  private metricsFile = './mx-security-metrics.json';
  private saveInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadExistingData();
    this.startPeriodicAnalysis();
  }

  recordSecurityEvent(type: SecurityEvent['type'], severity: SecurityEvent['severity'], 
                     ip: string, description: string, metadata?: Record<string, any>, 
                     userAgent?: string, userId?: string) {
    
    const event: SecurityEvent = {
      id: crypto.randomUUID(),
      type,
      severity,
      timestamp: new Date().toISOString(),
      ip,
      userAgent,
      userId,
      description,
      metadata,
      resolved: false
    };

    this.events.push(event);
    this.updateThreatIntelligence(ip, type, severity);
    
    // Immediate action for critical events
    if (severity === 'critical') {
      this.handleCriticalEvent(event);
    }

    // Maintain buffer size
    if (this.events.length > this.bufferSize) {
      this.events = this.events.slice(-this.bufferSize);
    }

    console.log(`[Security Monitor] ${severity.toUpperCase()} event: ${description} from ${ip}`);
  }

  private updateThreatIntelligence(ip: string, type: SecurityEvent['type'], severity: SecurityEvent['severity']) {
    let threat = this.threatMap.get(ip);
    
    if (!threat) {
      threat = {
        ip,
        riskScore: 0,
        failedAttempts: 0,
        lastSeen: new Date().toISOString(),
        patterns: [],
        blocked: false
      };
      this.threatMap.set(ip, threat);
    }

    // Update threat intelligence
    threat.lastSeen = new Date().toISOString();
    
    if (type === 'auth_failure') {
      threat.failedAttempts++;
    }

    // Calculate risk score based on various factors
    let riskIncrease = 0;
    switch (severity) {
      case 'low': riskIncrease = 5; break;
      case 'medium': riskIncrease = 15; break;
      case 'high': riskIncrease = 30; break;
      case 'critical': riskIncrease = 50; break;
    }

    // Additional risk for repeated failures
    if (threat.failedAttempts > 5) {
      riskIncrease += Math.min(threat.failedAttempts * 2, 30);
    }

    threat.riskScore = Math.min(threat.riskScore + riskIncrease, 100);
    threat.patterns.push(`${type}:${severity}`);
    
    // Keep only recent patterns
    if (threat.patterns.length > 20) {
      threat.patterns = threat.patterns.slice(-20);
    }

    // Auto-block high-risk IPs
    if (threat.riskScore >= 80 && !threat.blocked) {
      threat.blocked = true;
      console.log(`[Security Monitor] AUTO-BLOCKED high-risk IP: ${ip} (risk score: ${threat.riskScore})`);
    }
  }

  private handleCriticalEvent(event: SecurityEvent) {
    console.log(`[Security Monitor] CRITICAL SECURITY EVENT: ${event.description}`);
    
    // Auto-block IP for critical events
    const threat = this.threatMap.get(event.ip);
    if (threat) {
      threat.blocked = true;
      threat.riskScore = 100;
    }

    // Log to separate critical events file
    this.logCriticalEvent(event);
  }

  private async logCriticalEvent(event: SecurityEvent) {
    try {
      const criticalFile = './mx-critical-security-events.json';
      let criticalEvents = [];
      
      if (existsSync(criticalFile)) {
        const data = await fs.readFile(criticalFile, 'utf8');
        criticalEvents = JSON.parse(data);
      }
      
      criticalEvents.push(event);
      await fs.writeFile(criticalFile, JSON.stringify(criticalEvents, null, 2));
    } catch (error) {
      console.error('[Security Monitor] Error logging critical event:', error);
    }
  }

  isIPBlocked(ip: string): boolean {
    const threat = this.threatMap.get(ip);
    return threat?.blocked || false;
  }

  getIPRiskScore(ip: string): number {
    const threat = this.threatMap.get(ip);
    return threat?.riskScore || 0;
  }

  getSecurityDashboard() {
    const now = Date.now();
    const last24Hours = this.events.filter(e => 
      new Date(e.timestamp).getTime() > now - 24 * 60 * 60 * 1000
    );
    
    const last1Hour = this.events.filter(e => 
      new Date(e.timestamp).getTime() > now - 60 * 60 * 1000
    );

    const blockedIPs = Array.from(this.threatMap.values()).filter(t => t.blocked);
    const highRiskIPs = Array.from(this.threatMap.values()).filter(t => t.riskScore >= 70);

    return {
      overview: {
        totalEvents24h: last24Hours.length,
        criticalEvents24h: last24Hours.filter(e => e.severity === 'critical').length,
        eventsLastHour: last1Hour.length,
        blockedIPs: blockedIPs.length,
        highRiskIPs: highRiskIPs.length
      },
      recentEvents: this.events.slice(-10).reverse(),
      topThreats: Array.from(this.threatMap.values())
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 10),
      eventsByType: this.getEventsByType(last24Hours),
      riskDistribution: this.getRiskDistribution()
    };
  }

  private getEventsByType(events: SecurityEvent[]) {
    const byType: Record<string, number> = {};
    events.forEach(event => {
      byType[event.type] = (byType[event.type] || 0) + 1;
    });
    return byType;
  }

  private getRiskDistribution() {
    const distribution = { low: 0, medium: 0, high: 0, critical: 0 };
    
    Array.from(this.threatMap.values()).forEach(threat => {
      if (threat.riskScore < 25) distribution.low++;
      else if (threat.riskScore < 50) distribution.medium++;
      else if (threat.riskScore < 75) distribution.high++;
      else distribution.critical++;
    });

    return distribution;
  }

  // Middleware for request security monitoring
  securityMiddleware() {
    return (req: any, res: any, next: any) => {
      const ip = req.ip || req.connection.remoteAddress;
      
      // Check if IP is blocked
      if (this.isIPBlocked(ip)) {
        this.recordSecurityEvent('suspicious_activity', 'high', ip, 
          'Blocked IP attempted access', { endpoint: req.path });
        return res.status(403).json({ error: 'Access denied' });
      }

      // Monitor for suspicious patterns
      this.monitorRequest(req);
      next();
    };
  }

  private monitorRequest(req: any) {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'unknown';
    
    // Check for common attack patterns
    if (this.detectSQLInjection(req)) {
      this.recordSecurityEvent('suspicious_activity', 'high', ip, 
        'SQL injection attempt detected', { endpoint: req.path, query: req.query });
    }

    if (this.detectXSSAttempt(req)) {
      this.recordSecurityEvent('suspicious_activity', 'medium', ip, 
        'XSS attempt detected', { endpoint: req.path, body: req.body });
    }

    if (this.detectBotActivity(userAgent)) {
      this.recordSecurityEvent('suspicious_activity', 'low', ip, 
        'Bot activity detected', { userAgent });
    }
  }

  private detectSQLInjection(req: any): boolean {
    const sqlPatterns = [
      /union\s+select/i,
      /or\s+1\s*=\s*1/i,
      /drop\s+table/i,
      /insert\s+into/i,
      /delete\s+from/i
    ];

    const checkString = JSON.stringify(req.query) + JSON.stringify(req.body);
    return sqlPatterns.some(pattern => pattern.test(checkString));
  }

  private detectXSSAttempt(req: any): boolean {
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /onerror\s*=/i,
      /onload\s*=/i
    ];

    const checkString = JSON.stringify(req.query) + JSON.stringify(req.body);
    return xssPatterns.some(pattern => pattern.test(checkString));
  }

  private detectBotActivity(userAgent: string): boolean {
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i
    ];

    return botPatterns.some(pattern => pattern.test(userAgent));
  }

  private startPeriodicAnalysis() {
    this.saveInterval = setInterval(() => {
      this.generateMetrics();
      this.saveData();
      this.performMaintenanceTasks();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private generateMetrics() {
    const now = new Date().toISOString();
    const threats = Array.from(this.threatMap.values());
    
    const metrics: SecurityMetrics = {
      timestamp: now,
      totalEvents: this.events.length,
      criticalEvents: this.events.filter(e => e.severity === 'critical').length,
      blockedIPs: threats.filter(t => t.blocked).length,
      averageRiskScore: threats.reduce((sum, t) => sum + t.riskScore, 0) / threats.length || 0,
      topThreats: threats
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 5)
        .map(t => t.ip)
    };

    this.metrics.push(metrics);
    
    // Keep last 24 hours of metrics
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.metrics = this.metrics.filter(m => 
      new Date(m.timestamp).getTime() > dayAgo
    );
  }

  private performMaintenanceTasks() {
    // Reduce risk scores over time for inactive IPs
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    this.threatMap.forEach((threat, ip) => {
      const lastSeenTime = new Date(threat.lastSeen).getTime();
      
      if (lastSeenTime < weekAgo) {
        threat.riskScore = Math.max(0, threat.riskScore - 5);
        
        if (threat.riskScore < 30 && threat.blocked) {
          threat.blocked = false;
          console.log(`[Security Monitor] Auto-unblocked IP: ${ip} (risk reduced to ${threat.riskScore})`);
        }
      }
    });
  }

  private async saveData() {
    try {
      await fs.writeFile(this.eventsFile, JSON.stringify(this.events, null, 2));
      await fs.writeFile(this.threatsFile, JSON.stringify(Array.from(this.threatMap.entries()), null, 2));
      await fs.writeFile(this.metricsFile, JSON.stringify(this.metrics, null, 2));
    } catch (error: any) {
      // Silently handle file system errors to avoid log spam
      if (error.code !== 'ENOENT' && error.code !== 'EACCES') {
        console.error('[Security Monitor] Error saving data:', error.message);
      }
    }
  }

  private async loadExistingData() {
    try {
      if (existsSync(this.eventsFile)) {
        const eventsData = await fs.readFile(this.eventsFile, 'utf8');
        this.events = JSON.parse(eventsData);
      }
      
      if (existsSync(this.threatsFile)) {
        const threatsData = await fs.readFile(this.threatsFile, 'utf8');
        const threatsArray = JSON.parse(threatsData);
        this.threatMap = new Map(threatsArray);
      }

      if (existsSync(this.metricsFile)) {
        const metricsData = await fs.readFile(this.metricsFile, 'utf8');
        this.metrics = JSON.parse(metricsData);
      }
    } catch (error) {
      console.log('[Security Monitor] Starting with fresh security data');
    }
  }

  stop() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
    this.saveData();
  }
}

export const securityMonitor = new SecurityMonitor();