import { useEffect, useRef, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';

// Configuration
const INACTIVITY_TIMEOUT = 120000; // 2 minutes
const TRIGGER_COOLDOWN = 30000; // 30 seconds
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Session monitor hook for automatic conversation archiving
 * Detects user inactivity, page visibility changes, and unload events
 */
export function useSessionMonitor() {
  const lastTriggerTime = useRef(0);
  const inactivityTimer = useRef(null);
  const retryCount = useRef(0);

  /**
   * Check if enough time has passed since last trigger
   */
  const shouldTrigger = useCallback(() => {
    const now = Date.now();
    if (now - lastTriggerTime.current < TRIGGER_COOLDOWN) {
      return false;
    }
    lastTriggerTime.current = now;
    return true;
  }, []);

  /**
   * Log activity to conversation system
   */
  const logActivity = useCallback(async (activity) => {
    try {
      await apiRequest('POST', '/api/conversation/log', { activity });
      retryCount.current = 0; // Reset retry count on success
    } catch (error) {
      console.warn('[XM] Failed to log activity:', error);
      
      // Retry with exponential backoff
      if (retryCount.current < MAX_RETRY_ATTEMPTS) {
        retryCount.current++;
        setTimeout(() => {
          logActivity(activity);
        }, 1000 * Math.pow(2, retryCount.current));
      }
    }
  }, []);

  /**
   * Trigger immediate archive
   */
  const triggerArchive = useCallback(async (triggerType) => {
    if (!shouldTrigger()) return;
    
    try {
      await apiRequest('POST', '/api/conversation/update', { 
        trigger: triggerType,
        timestamp: new Date().toISOString()
      });
      // Reduced logging - only in development mode
      if (import.meta.env.DEV) {
        console.log(`[XM] Archive triggered: ${triggerType}`);
      }
    } catch (error) {
      console.warn('[XM] Failed to trigger archive:', error);
    }
  }, [shouldTrigger]);

  /**
   * Reset inactivity timer
   */
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    
    inactivityTimer.current = setTimeout(() => {
      triggerArchive('inactivity');
    }, INACTIVITY_TIMEOUT);
  }, [triggerArchive]);

  /**
   * Handle user activity
   */
  const handleUserActivity = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  /**
   * Handle page visibility change
   */
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      triggerArchive('page_hidden');
    } else {
      logActivity('User returned to page');
      resetInactivityTimer();
    }
  }, [triggerArchive, logActivity, resetInactivityTimer]);

  /**
   * Handle page unload (emergency archive)
   */
  const handleBeforeUnload = useCallback(() => {
    // Use sendBeacon for reliability during page unload
    const data = JSON.stringify({
      trigger: 'page_unload',
      timestamp: new Date().toISOString()
    });
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/conversation/update', data);
    } else {
      // Fallback for older browsers
      triggerArchive('page_unload');
    }
  }, [triggerArchive]);

  /**
   * Handle focus/blur events
   */
  const handleFocus = useCallback(() => {
    logActivity('Application gained focus');
    resetInactivityTimer();
  }, [logActivity, resetInactivityTimer]);

  const handleBlur = useCallback(() => {
    triggerArchive('focus_lost');
  }, [triggerArchive]);

  /**
   * Initialize session monitoring
   */
  useEffect(() => {
    // Log session start
    logActivity('Frontend session monitoring started');
    
    // Set up initial inactivity timer
    resetInactivityTimer();

    // User activity events
    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 
      'touchstart', 'touchmove', 'click'
    ];

    // Add activity listeners with throttling
    let activityThrottle = false;
    const throttledActivity = () => {
      if (!activityThrottle) {
        activityThrottle = true;
        handleUserActivity();
        setTimeout(() => {
          activityThrottle = false;
        }, 1000); // Throttle to once per second
      }
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, throttledActivity, { passive: true });
    });

    // Page visibility API
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Window focus/blur
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Page unload detection
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Mobile-specific events
    document.addEventListener('pagehide', () => triggerArchive('page_hide'));
    document.addEventListener('pageshow', () => {
      logActivity('Page shown (mobile)');
      resetInactivityTimer();
    });

    // Cleanup function
    return () => {
      // Clear timer
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }

      // Remove all event listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledActivity);
      });
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('pagehide', () => triggerArchive('page_hide'));
      document.removeEventListener('pageshow', () => {
        logActivity('Page shown (mobile)');
        resetInactivityTimer();
      });

      // Final archive on cleanup
      triggerArchive('session_end');
    };
  }, [
    logActivity, resetInactivityTimer, handleUserActivity, 
    handleVisibilityChange, handleFocus, handleBlur, 
    handleBeforeUnload, triggerArchive
  ]);

  // Return utilities for manual control
  return {
    logActivity,
    triggerArchive,
    resetInactivityTimer
  };
}