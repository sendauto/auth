import { apiRequest } from '@/lib/queryClient';

/**
 * Archive trigger utilities for manual conversation archiving
 */

/**
 * Trigger archive on specific user actions
 */
export async function triggerOnUserAction(action, details = '') {
  try {
    const activity = details ? `${action}: ${details}` : action;
    await apiRequest('POST', '/api/conversation/log', { activity });
  } catch (error) {
    console.warn('[XM] Failed to log user action:', error);
  }
}

/**
 * Trigger archive on authentication events
 */
export async function triggerOnAuth(event, userEmail = '') {
  const activities = {
    login_success: `User login successful${userEmail ? ` (${userEmail})` : ''}`,
    login_failed: `User login failed${userEmail ? ` (${userEmail})` : ''}`,
    logout: `User logout${userEmail ? ` (${userEmail})` : ''}`,
    signup: `New user registration${userEmail ? ` (${userEmail})` : ''}`,
    password_reset: `Password reset request${userEmail ? ` (${userEmail})` : ''}`,
    sso_initiated: `SSO authentication initiated${userEmail ? ` (${userEmail})` : ''}`,
    demo_login: `Demo login accessed${userEmail ? ` (${userEmail})` : ''}`
  };
  
  const activity = activities[event] || `Authentication event: ${event}`;
  await triggerOnUserAction(activity);
}

/**
 * Trigger archive on navigation events
 */
export async function triggerOnNavigation(fromPage, toPage) {
  await triggerOnUserAction('Navigation', `${fromPage} → ${toPage}`);
}

/**
 * Trigger archive on form submissions
 */
export async function triggerOnFormSubmit(formType, success = true) {
  const status = success ? 'submitted' : 'failed';
  await triggerOnUserAction('Form submission', `${formType} ${status}`);
}

/**
 * Trigger archive on subscription events
 */
export async function triggerOnSubscription(event, planName = '') {
  const activities = {
    started: `Subscription started${planName ? ` (${planName})` : ''}`,
    upgraded: `Subscription upgraded${planName ? ` to ${planName}` : ''}`,
    downgraded: `Subscription downgraded${planName ? ` to ${planName}` : ''}`,
    cancelled: `Subscription cancelled${planName ? ` (${planName})` : ''}`,
    trial_started: `Trial started${planName ? ` (${planName})` : ''}`,
    trial_ended: `Trial ended${planName ? ` (${planName})` : ''}`
  };
  
  const activity = activities[event] || `Subscription event: ${event}`;
  await triggerOnUserAction(activity);
}

/**
 * Trigger archive on admin actions
 */
export async function triggerOnAdminAction(action, target = '') {
  await triggerOnUserAction('Admin action', `${action}${target ? ` - ${target}` : ''}`);
}

/**
 * Trigger immediate archive with custom reason
 */
export async function triggerImmediateArchive(reason = 'manual') {
  try {
    await apiRequest('POST', '/api/conversation/update', { 
      trigger: reason,
      timestamp: new Date().toISOString()
    });
    console.log(`[XM] Immediate archive triggered: ${reason}`);
  } catch (error) {
    console.warn('[XM] Failed to trigger immediate archive:', error);
  }
}

/**
 * Get current archive status
 */
export async function getArchiveStatus() {
  try {
    const response = await apiRequest('GET', '/api/conversation/status');
    return response;
  } catch (error) {
    console.warn('[XM] Failed to get archive status:', error);
    return null;
  }
}

/**
 * Auto-trigger on component mount/unmount
 */
export function useAutoTrigger(componentName) {
  return {
    onMount: () => triggerOnUserAction('Component mounted', componentName),
    onUnmount: () => triggerOnUserAction('Component unmounted', componentName)
  };
}