import { lazy, Suspense } from 'react';
import { ComponentLoader } from './LoadingSpinner';

// Lazy load heavy components
export const LazyAnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
export const LazyAdminPage = lazy(() => import('@/pages/AdminPage'));
export const LazyMXMonitoringPage = lazy(() => import('@/pages/MXMonitoringPage'));
export const LazyOrganizationPage = lazy(() => import('@/pages/OrganizationPage'));

// Higher-order component for lazy loading
export function withLazyLoading<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: React.ReactNode
) {
  return function LazyLoadedComponent(props: T) {
    return (
      <Suspense fallback={fallback || <ComponentLoader text="Loading page..." />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// Preload utility for better UX
export function preloadComponent(importFn: () => Promise<any>) {
  return importFn();
}

// Usage example:
// const LazyComponent = withLazyLoading(MyHeavyComponent);
// And preload on hover: onMouseEnter={() => preloadComponent(() => import('./MyHeavyComponent'))}