import { logActivity } from '../conversation-system';
import type { Request, Response, NextFunction } from 'express';

/**
 * Activity logging middleware for automatic conversation archiving
 * Logs significant server activities for context preservation
 */
function activityLogger() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Log significant API activities
    const originalSend = res.send;
    const originalJson = res.json;
    
    res.send = function(data) {
      logSignificantActivity(req, res);
      return originalSend.call(this, data);
    };
    
    res.json = function(data) {
      logSignificantActivity(req, res);
      return originalJson.call(this, data);
    };
    
    next();
  };
}

/**
 * Log activity based on request patterns
 */
async function logSignificantActivity(req, res) {
  try {
    const { method, path, user } = req;
    const statusCode = res.statusCode;
    const userInfo = user ? `(${user.email})` : '(anonymous)';
    
    // Only log significant activities to avoid noise
    if (shouldLogActivity(method, path, statusCode)) {
      const activity = formatActivity(method, path, statusCode, userInfo);
      await logActivity(activity);
    }
  } catch (error) {
    // Silent fail to avoid breaking request flow
    console.error('[XM Activity] Logging error:', error);
  }
}

/**
 * Determine if activity should be logged
 */
function shouldLogActivity(method, path, statusCode) {
  // Skip static assets and development requests
  if (path.includes('/src/') || path.includes('node_modules') || path.includes('.map')) {
    return false;
  }
  
  // Skip frequent polling endpoints
  if (path.includes('/silent-check')) {
    return false;
  }
  
  // Log authentication events
  if (path.startsWith('/api/auth/')) {
    return true;
  }
  
  // Log admin actions
  if (path.includes('/admin/')) {
    return true;
  }
  
  // Log subscription changes
  if (path.startsWith('/api/subscription/') || path.startsWith('/api/billing/')) {
    return true;
  }
  
  // Log user management
  if (path.startsWith('/api/organization/')) {
    return true;
  }
  
  // Log significant POST/PUT/DELETE operations
  if (['POST', 'PUT', 'DELETE'].includes(method) && statusCode < 400) {
    return true;
  }
  
  // Log errors
  if (statusCode >= 400) {
    return true;
  }
  
  return false;
}

/**
 * Format activity description
 */
function formatActivity(method, path, statusCode, userInfo) {
  // Authentication events
  if (path.includes('/login')) {
    return `Login attempt ${userInfo} - Status: ${statusCode}`;
  }
  
  if (path.includes('/logout')) {
    return `Logout ${userInfo} - Status: ${statusCode}`;
  }
  
  if (path.includes('/register')) {
    return `User registration attempt - Status: ${statusCode}`;
  }
  
  if (path.includes('/forgot-password')) {
    return `Password reset request - Status: ${statusCode}`;
  }
  
  // SSO events
  if (path.includes('/discover/')) {
    const domain = path.split('/discover/')[1];
    return `SSO discovery for domain: ${domain} - Status: ${statusCode}`;
  }
  
  if (path.includes('/callback')) {
    return `SSO callback processed ${userInfo} - Status: ${statusCode}`;
  }
  
  // Admin actions
  if (path.includes('/admin/')) {
    return `Admin action: ${method} ${path} ${userInfo} - Status: ${statusCode}`;
  }
  
  // Subscription events
  if (path.includes('/subscription/')) {
    return `Subscription operation: ${method} ${path} ${userInfo} - Status: ${statusCode}`;
  }
  
  // User management
  if (path.includes('/organization/')) {
    return `Organization management: ${method} ${path} ${userInfo} - Status: ${statusCode}`;
  }
  
  // Error events
  if (statusCode >= 400) {
    return `Error ${statusCode}: ${method} ${path} ${userInfo}`;
  }
  
  // General API operations
  return `API: ${method} ${path} ${userInfo} - Status: ${statusCode}`;
}

/**
 * Log custom activity manually
 */
async function logCustomActivity(activity) {
  try {
    await logActivity(activity);
  } catch (error) {
    console.error('[XM Activity] Custom logging error:', error);
  }
}

export {
  activityLogger,
  logCustomActivity
};