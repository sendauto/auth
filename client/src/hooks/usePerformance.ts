import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null
  });

  useEffect(() => {
    // Measure TTFB
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationTiming) {
      const ttfb = navigationTiming.responseStart - navigationTiming.requestStart;
      setMetrics(prev => ({ ...prev, ttfb }));
    }

    // Measure Core Web Vitals
    if ('web-vitals' in window) {
      // This would typically use the web-vitals library
      // For now, we'll use a simplified approach
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
          }
        }
      });

      observer.observe({ type: 'largest-contentful-paint', buffered: true });

      return () => observer.disconnect();
    }
  }, []);

  const reportMetrics = () => {
    // Send metrics to analytics service
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...metrics,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(console.error);
    }
  };

  return { metrics, reportMetrics };
}