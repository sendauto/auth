/**
 * MX Console Learning System
 * Captures and analyzes console logs for intelligent pattern recognition
 */

import fs from 'fs-extra';
import crypto from 'crypto';

interface ConsoleLogEntry {
  timestamp: string;
  level: 'log' | 'error' | 'warn' | 'info' | 'debug';
  message: string;
  source?: string;
  metadata?: any;
  pattern?: string;
  frequency?: number;
}

interface LogPattern {
  id: string;
  pattern: string;
  category: 'error' | 'performance' | 'user_behavior' | 'system' | 'api';
  frequency: number;
  lastSeen: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  trend: 'increasing' | 'decreasing' | 'stable';
}

class ConsoleLogLearningSystem {
  private logBuffer: ConsoleLogEntry[] = [];
  private patterns: Map<string, LogPattern> = new Map();
  private originalConsole: any = {};
  private isActive = false;
  private bufferSize = 1000;
  private analysisInterval: NodeJS.Timeout | null = null;
  private logFile = './mx-console-logs.json';
  private patternsFile = './mx-log-patterns.json';

  constructor() {
    this.initializePatternDetection();
    this.loadExistingData();
  }

  /**
   * Start console log capture and learning
   */
  async startConsoleCapture() {
    if (this.isActive) return;

    console.log('[MX Console Learning] Initializing console capture system...');
    
    // Backup original console methods
    this.originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug
    };

    // Override console methods
    console.log = this.createInterceptor('log', this.originalConsole.log);
    console.error = this.createInterceptor('error', this.originalConsole.error);
    console.warn = this.createInterceptor('warn', this.originalConsole.warn);
    console.info = this.createInterceptor('info', this.originalConsole.info);
    console.debug = this.createInterceptor('debug', this.originalConsole.debug);

    this.isActive = true;

    // Start periodic analysis
    this.analysisInterval = setInterval(() => {
      this.analyzeLogPatterns();
    }, 30000); // Analyze every 30 seconds

    console.log('[MX Console Learning] Console capture active - learning enabled');
  }

  /**
   * Stop console log capture
   */
  stopConsoleCapture() {
    if (!this.isActive) return;

    // Restore original console methods
    console.log = this.originalConsole.log;
    console.error = this.originalConsole.error;
    console.warn = this.originalConsole.warn;
    console.info = this.originalConsole.info;
    console.debug = this.originalConsole.debug;

    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }

    this.isActive = false;
    console.log('[MX Console Learning] Console capture stopped');
  }

  /**
   * Create console method interceptor
   */
  private createInterceptor(level: string, originalMethod: Function) {
    return (...args: any[]) => {
      // Call original method first
      originalMethod.apply(console, args);

      // Capture for learning
      this.captureLogEntry(level as any, args);
    };
  }

  /**
   * Capture log entry for analysis
   */
  private captureLogEntry(level: ConsoleLogEntry['level'], args: any[]) {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');

    const entry: ConsoleLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      source: this.detectSource(message),
      metadata: this.extractMetadata(message)
    };

    this.logBuffer.push(entry);

    // Maintain buffer size
    if (this.logBuffer.length > this.bufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.bufferSize);
    }

    // Immediate pattern detection for critical errors
    if (level === 'error') {
      this.detectCriticalPattern(entry);
    }
  }

  /**
   * Detect source of log message
   */
  private detectSource(message: string): string {
    if (message.includes('[express]')) return 'express';
    if (message.includes('[XM]')) return 'xm_system';
    if (message.includes('[OAuth]')) return 'oauth';
    if (message.includes('[Enhanced XM]')) return 'enhanced_xm';
    if (message.includes('GET ') || message.includes('POST ')) return 'api_requests';
    if (message.includes('Error:')) return 'application_error';
    if (message.includes('SQL') || message.includes('database')) return 'database';
    return 'general';
  }

  /**
   * Extract metadata from log message
   */
  private extractMetadata(message: string): any {
    const metadata: any = {};

    // Extract HTTP status codes
    const statusMatch = message.match(/(\d{3})/);
    if (statusMatch) metadata.statusCode = parseInt(statusMatch[1]);

    // Extract response times
    const timeMatch = message.match(/(\d+)ms/);
    if (timeMatch) metadata.responseTime = parseInt(timeMatch[1]);

    // Extract IP addresses
    const ipMatch = message.match(/IP: ([\d.]+)/);
    if (ipMatch) metadata.clientIP = ipMatch[1];

    // Extract API endpoints
    const endpointMatch = message.match(/(GET|POST|PUT|DELETE) ([^\s]+)/);
    if (endpointMatch) {
      metadata.method = endpointMatch[1];
      metadata.endpoint = endpointMatch[2];
    }

    // Extract error types
    if (message.includes('Error:')) {
      const errorMatch = message.match(/(\w+Error):/);
      if (errorMatch) metadata.errorType = errorMatch[1];
    }

    return metadata;
  }

  /**
   * Initialize pattern detection rules
   */
  private initializePatternDetection() {
    // Performance patterns
    this.addPatternRule('slow_api_response', /(\d+)ms/, (match, entry) => {
      const responseTime = parseInt(match[1]);
      return responseTime > 1000 ? {
        category: 'performance' as const,
        severity: responseTime > 5000 ? 'critical' as const : 'high' as const,
        recommendations: [
          'Optimize database queries',
          'Add response caching',
          'Review endpoint logic'
        ]
      } : null;
    });

    // Error patterns
    this.addPatternRule('authentication_error', /401|Unauthorized/, () => ({
      category: 'error' as const,
      severity: 'medium' as const,
      recommendations: [
        'Check OAuth configuration',
        'Verify session management',
        'Review authentication flow'
      ]
    }));

    // User behavior patterns
    this.addPatternRule('high_traffic_endpoint', /GET|POST/, (match, entry) => {
      if (entry.metadata?.endpoint) {
        return {
          category: 'user_behavior' as const,
          severity: 'low' as const,
          recommendations: [
            'Consider endpoint caching',
            'Monitor for abuse',
            'Optimize popular endpoints'
          ]
        };
      }
      return null;
    });

    // System health patterns
    this.addPatternRule('memory_usage', /Memory.*(\d+)/, (match, entry) => {
      const usage = parseInt(match[1]);
      return usage > 500 ? {
        category: 'system' as const,
        severity: usage > 1000 ? 'critical' as const : 'high' as const,
        recommendations: [
          'Enable memory cleanup',
          'Review memory leaks',
          'Optimize data structures'
        ]
      } : null;
    });
  }

  private patternRules: Array<{
    id: string;
    regex: RegExp;
    analyzer: (match: RegExpMatchArray, entry: ConsoleLogEntry) => LogPattern | null;
  }> = [];

  private addPatternRule(
    id: string, 
    regex: RegExp, 
    analyzer: (match: RegExpMatchArray, entry: ConsoleLogEntry) => any
  ) {
    this.patternRules.push({ id, regex, analyzer });
  }

  /**
   * Detect critical patterns immediately
   */
  private detectCriticalPattern(entry: ConsoleLogEntry) {
    for (const rule of this.patternRules) {
      const match = entry.message.match(rule.regex);
      if (match) {
        const pattern = rule.analyzer(match, entry);
        if (pattern && pattern.severity === 'critical') {
          console.log(`[MX Critical Alert] ${rule.id}: ${entry.message}`);
          this.updatePattern(rule.id, pattern, entry);
        }
      }
    }
  }

  /**
   * Analyze log patterns periodically
   */
  private async analyzeLogPatterns() {
    if (this.logBuffer.length === 0) return;

    console.log(`[MX Console Learning] Analyzing ${this.logBuffer.length} log entries...`);

    // Group logs by patterns
    const patternCounts = new Map<string, number>();
    
    for (const entry of this.logBuffer) {
      for (const rule of this.patternRules) {
        const match = entry.message.match(rule.regex);
        if (match) {
          const pattern = rule.analyzer(match, entry);
          if (pattern) {
            const count = patternCounts.get(rule.id) || 0;
            patternCounts.set(rule.id, count + 1);
            this.updatePattern(rule.id, pattern, entry);
          }
        }
      }
    }

    // Calculate trends
    this.calculateTrends();

    // Save patterns to disk
    await this.savePatterns();

    // Generate insights
    this.generateInsights();

    console.log(`[MX Console Learning] Analysis complete - ${this.patterns.size} patterns tracked`);
  }

  /**
   * Update pattern frequency and data
   */
  private updatePattern(id: string, patternData: any, entry: ConsoleLogEntry) {
    const existing = this.patterns.get(id);
    
    if (existing) {
      existing.frequency++;
      existing.lastSeen = entry.timestamp;
    } else {
      this.patterns.set(id, {
        id,
        pattern: entry.message,
        category: patternData.category,
        frequency: 1,
        lastSeen: entry.timestamp,
        severity: patternData.severity,
        recommendations: patternData.recommendations,
        trend: 'stable'
      });
    }
  }

  /**
   * Calculate pattern trends
   */
  private calculateTrends() {
    // Simple trend calculation based on recent activity
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);

    for (const [id, pattern] of this.patterns) {
      const recentLogs = this.logBuffer.filter(entry => 
        new Date(entry.timestamp).getTime() > hourAgo
      );
      
      const recentCount = recentLogs.filter(entry => 
        entry.message.includes(pattern.pattern.substring(0, 20))
      ).length;

      if (recentCount > pattern.frequency * 0.3) {
        pattern.trend = 'increasing';
      } else if (recentCount < pattern.frequency * 0.1) {
        pattern.trend = 'decreasing';
      } else {
        pattern.trend = 'stable';
      }
    }
  }

  /**
   * Generate insights from patterns
   */
  private generateInsights() {
    const insights = {
      criticalIssues: Array.from(this.patterns.values()).filter(p => p.severity === 'critical').length,
      performanceIssues: Array.from(this.patterns.values()).filter(p => p.category === 'performance').length,
      errorPatterns: Array.from(this.patterns.values()).filter(p => p.category === 'error').length,
      topPatterns: Array.from(this.patterns.values())
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5),
      recommendations: this.generateRecommendations()
    };

    console.log(`[MX Insights] Critical: ${insights.criticalIssues}, Performance: ${insights.performanceIssues}, Errors: ${insights.errorPatterns}`);
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations = new Set<string>();
    
    Array.from(this.patterns.values())
      .filter(p => p.severity === 'critical' || p.frequency > 10)
      .forEach(pattern => {
        pattern.recommendations.forEach(rec => recommendations.add(rec));
      });

    return Array.from(recommendations).slice(0, 10);
  }

  /**
   * Load existing log data
   */
  private async loadExistingData() {
    try {
      if (await fs.pathExists(this.patternsFile)) {
        const data = await fs.readJson(this.patternsFile);
        this.patterns = new Map(Object.entries(data));
        console.log(`[MX Console Learning] Loaded ${this.patterns.size} existing patterns`);
      }
    } catch (error) {
      console.log('[MX Console Learning] No existing patterns found, starting fresh');
    }
  }

  /**
   * Save patterns to disk
   */
  private async savePatterns() {
    try {
      const patternsObj = Object.fromEntries(this.patterns);
      await fs.writeJson(this.patternsFile, patternsObj, { spaces: 2 });
    } catch (error) {
      console.error('[MX Console Learning] Failed to save patterns:', error);
    }
  }

  /**
   * Get learning status and insights
   */
  getStatus() {
    return {
      active: this.isActive,
      bufferSize: this.logBuffer.length,
      patternsDetected: this.patterns.size,
      criticalPatterns: Array.from(this.patterns.values()).filter(p => p.severity === 'critical').length,
      recentActivity: this.logBuffer.slice(-10),
      topPatterns: Array.from(this.patterns.values())
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5)
    };
  }

  /**
   * Get detailed patterns analysis
   */
  getPatterns() {
    return {
      all: Array.from(this.patterns.values()),
      critical: Array.from(this.patterns.values()).filter(p => p.severity === 'critical'),
      byCategory: {
        error: Array.from(this.patterns.values()).filter(p => p.category === 'error'),
        performance: Array.from(this.patterns.values()).filter(p => p.category === 'performance'),
        user_behavior: Array.from(this.patterns.values()).filter(p => p.category === 'user_behavior'),
        system: Array.from(this.patterns.values()).filter(p => p.category === 'system'),
        api: Array.from(this.patterns.values()).filter(p => p.category === 'api')
      }
    };
  }
}

// Create singleton instance
export const consoleLogLearning = new ConsoleLogLearningSystem();