/**
 * Analytics Service
 * Handles performance metrics and user behavior tracking
 */

interface PerformanceMetric {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string;
}

interface UserEvent {
  type: string;
  data: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  url: string;
}

class AnalyticsService {
  private performanceMetrics: PerformanceMetric[] = [];
  private userEvents: UserEvent[] = [];
  private maxStoredMetrics = 1000;

  recordPerformanceMetric(metric: PerformanceMetric) {
    this.performanceMetrics.push({
      ...metric,
      timestamp: Date.now()
    });

    // Keep only recent metrics
    if (this.performanceMetrics.length > this.maxStoredMetrics) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.maxStoredMetrics);
    }

    console.log('[Analytics] Performance metric recorded:', {
      lcp: metric.lcp,
      ttfb: metric.ttfb,
      url: metric.url.split('?')[0] // Remove query params for privacy
    });
  }

  recordUserEvent(event: UserEvent) {
    this.userEvents.push({
      ...event,
      timestamp: Date.now()
    });

    // Keep only recent events
    if (this.userEvents.length > this.maxStoredMetrics) {
      this.userEvents = this.userEvents.slice(-this.maxStoredMetrics);
    }
  }

  getPerformanceInsights() {
    if (this.performanceMetrics.length === 0) {
      return { message: 'No performance data available yet' };
    }

    const recent = this.performanceMetrics.slice(-100);
    const avgLCP = recent.filter(m => m.lcp).reduce((sum, m) => sum + (m.lcp || 0), 0) / recent.filter(m => m.lcp).length;
    const avgTTFB = recent.filter(m => m.ttfb).reduce((sum, m) => sum + (m.ttfb || 0), 0) / recent.filter(m => m.ttfb).length;

    return {
      averageLCP: Math.round(avgLCP) || 0,
      averageTTFB: Math.round(avgTTFB) || 0,
      totalMetrics: this.performanceMetrics.length,
      recommendations: this.generateRecommendations(avgLCP, avgTTFB)
    };
  }

  private generateRecommendations(lcp: number, ttfb: number): string[] {
    const recommendations: string[] = [];

    if (lcp > 2500) {
      recommendations.push('LCP is slow. Consider optimizing images and critical resource loading.');
    }
    if (ttfb > 600) {
      recommendations.push('TTFB is high. Consider server-side optimizations or CDN usage.');
    }
    if (lcp < 1200 && ttfb < 200) {
      recommendations.push('Excellent performance! Current optimization strategy is working well.');
    }

    return recommendations;
  }

  getUserBehaviorInsights() {
    const pageViews = this.userEvents.filter(e => e.type === 'page_view').length;
    const interactions = this.userEvents.filter(e => e.type === 'interaction').length;

    return {
      totalPageViews: pageViews,
      totalInteractions: interactions,
      engagementRate: pageViews > 0 ? (interactions / pageViews * 100).toFixed(1) : '0'
    };
  }

  getStats() {
    return {
      performanceMetrics: this.performanceMetrics.length,
      userEvents: this.userEvents.length,
      insights: this.getPerformanceInsights(),
      behavior: this.getUserBehaviorInsights()
    };
  }
}

export const analyticsService = new AnalyticsService();