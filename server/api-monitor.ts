/**
 * API Performance Monitoring System
 * Tracks response times, request counts, and error rates
 */

interface APIMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: string;
  userAgent?: string;
  ip?: string;
  error?: string;
}

interface APIStats {
  current: {
    requestsLast5Min: number;
    avgResponseTime5Min: number;
    errorRate5Min: number;
  };
  hourly: {
    requestsLastHour: number;
    avgResponseTimeHour: number;
    errorRateHour: number;
  };
  endpoints: Array<{
    endpoint: string;
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
  }>;
}

class APIMonitor {
  private metrics: APIMetrics[] = [];
  private bufferSize = 5000;
  private saveInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startPeriodicSave();
  }

  startMonitoring() {
    console.log('[API Monitor] Starting comprehensive API monitoring');
    return this.middleware.bind(this);
  }

  middleware(req: any, res: any, next: any) {
    const startTime = performance.now();
    const apiMonitor = this;
    
    // Track request start
    const originalSend = res.send;
    res.send = function(data: any) {
      const responseTime = performance.now() - startTime;
      
      const metric: APIMetrics = {
        endpoint: req.path,
        method: req.method,
        responseTime: Math.round(responseTime),
        statusCode: res.statusCode,
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress
      };

      // Add error details if present
      if (res.statusCode >= 400) {
        metric.error = data?.error || data?.message || 'Unknown error';
      }

      apiMonitor.recordMetric(metric);
      return originalSend.call(this, data);
    };

    next();
  }

  recordMetric(metric: APIMetrics) {
    this.metrics.push(metric);
    
    // Maintain buffer size
    if (this.metrics.length > this.bufferSize) {
      this.metrics = this.metrics.slice(-this.bufferSize);
    }
  }

  getRealtimeStats(): APIStats {
    const now = Date.now();
    const fiveMinAgo = now - 5 * 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;

    const last5Min = this.metrics.filter(m => 
      new Date(m.timestamp).getTime() > fiveMinAgo
    );
    
    const lastHour = this.metrics.filter(m => 
      new Date(m.timestamp).getTime() > oneHourAgo
    );

    // Calculate endpoint statistics
    const endpointStats = new Map();
    this.metrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`;
      if (!endpointStats.has(key)) {
        endpointStats.set(key, {
          endpoint: key,
          requests: [],
          errors: 0
        });
      }
      const stats = endpointStats.get(key);
      stats.requests.push(metric.responseTime);
      if (metric.statusCode >= 400) stats.errors++;
    });

    const endpoints = Array.from(endpointStats.values()).map(stats => ({
      endpoint: stats.endpoint,
      totalRequests: stats.requests.length,
      averageResponseTime: stats.requests.reduce((a: number, b: number) => a + b, 0) / stats.requests.length || 0,
      errorRate: stats.errors / stats.requests.length || 0
    })).sort((a, b) => b.totalRequests - a.totalRequests);

    return {
      current: {
        requestsLast5Min: last5Min.length,
        avgResponseTime5Min: last5Min.reduce((sum, m) => sum + m.responseTime, 0) / last5Min.length || 0,
        errorRate5Min: last5Min.filter(m => m.statusCode >= 400).length / last5Min.length || 0
      },
      hourly: {
        requestsLastHour: lastHour.length,
        avgResponseTimeHour: lastHour.reduce((sum, m) => sum + m.responseTime, 0) / lastHour.length || 0,
        errorRateHour: lastHour.filter(m => m.statusCode >= 400).length / lastHour.length || 0
      },
      endpoints: endpoints.slice(0, 10)
    };
  }

  getSlowEndpoints(threshold = 500) {
    const endpointTimes = new Map();
    this.metrics.forEach(metric => {
      const key = metric.endpoint;
      if (!endpointTimes.has(key)) {
        endpointTimes.set(key, []);
      }
      endpointTimes.get(key).push(metric.responseTime);
    });

    return Array.from(endpointTimes.entries())
      .map(([endpoint, times]) => ({
        endpoint,
        averageTime: times.reduce((a: number, b: number) => a + b, 0) / times.length,
        requests: times.length
      }))
      .filter(e => e.averageTime > threshold)
      .sort((a, b) => b.averageTime - a.averageTime);
  }

  getErrorProne() {
    const endpointErrors = new Map();
    this.metrics.forEach(metric => {
      const key = metric.endpoint;
      if (!endpointErrors.has(key)) {
        endpointErrors.set(key, { total: 0, errors: 0 });
      }
      const stats = endpointErrors.get(key);
      stats.total++;
      if (metric.statusCode >= 400) stats.errors++;
    });

    return Array.from(endpointErrors.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        errorRate: stats.errors / stats.total,
        totalRequests: stats.total,
        totalErrors: stats.errors
      }))
      .filter(e => e.errorRate > 0.05) // 5% error rate threshold
      .sort((a, b) => b.errorRate - a.errorRate);
  }

  private startPeriodicSave() {
    this.saveInterval = setInterval(() => {
      // Cleanup old metrics (keep last 24 hours)
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
      this.metrics = this.metrics.filter(m => 
        new Date(m.timestamp).getTime() > dayAgo
      );
    }, 10 * 60 * 1000); // Every 10 minutes
  }

  stop() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
  }
}

export const apiMonitor = new APIMonitor();