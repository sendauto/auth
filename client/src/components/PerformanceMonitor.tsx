import { useEffect } from 'react';
import { usePerformance } from '@/hooks/usePerformance';

export function PerformanceMonitor() {
  const { metrics, reportMetrics } = usePerformance();

  useEffect(() => {
    // Report metrics after page load
    const timer = setTimeout(() => {
      reportMetrics();
    }, 3000);

    return () => clearTimeout(timer);
  }, [reportMetrics]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="space-y-1">
        <div>LCP: {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : '...'}</div>
        <div>TTFB: {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : '...'}</div>
        <div>FID: {metrics.fid ? `${Math.round(metrics.fid)}ms` : '...'}</div>
        <div>CLS: {metrics.cls ? metrics.cls.toFixed(3) : '...'}</div>
      </div>
    </div>
  );
}