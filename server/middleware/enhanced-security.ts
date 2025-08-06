/**
 * Enhanced Security Middleware - Critical security headers and protection
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Comprehensive security headers middleware
export const enhancedSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Content Security Policy - Strict policy to prevent XSS
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.stripe.com https://*.auth247.net wss://*.replit.dev ws://*.replit.dev",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; '));

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable XSS filtering
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Force HTTPS (in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Prevent DNS prefetching
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  
  // Hide server information
  res.removeHeader('X-Powered-By');
  res.setHeader('Server', 'Auth247');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', [
    'camera=(), microphone=(), location=(), payment=(self)',
    'accelerometer=(), gyroscope=(), magnetometer=(), usb=()'
  ].join(', '));

  next();
};

// Enhanced rate limiting for different endpoint types
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for OAuth callbacks
    return req.path.includes('/oauth/') || req.path.includes('/callback');
  }
});

export const apiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 API requests per minute
  message: {
    error: 'API rate limit exceeded. Please slow down your requests.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const adminRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // More lenient for admin operations
  message: {
    error: 'Admin API rate limit exceeded. Please wait 5 minutes.',
    retryAfter: 300
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Suspicious activity detection
export const suspiciousActivityDetection = (req: Request, res: Response, next: NextFunction) => {
  const suspicious = {
    sqlInjection: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i.test(JSON.stringify(req.body)),
    xssAttempt: /<script|javascript:|on\w+\s*=/i.test(JSON.stringify(req.body)),
    pathTraversal: /\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c/i.test(req.url),
    commandInjection: /[;&|`$(){}[\]]/g.test(JSON.stringify(req.body))
  };

  const detected = Object.entries(suspicious).filter(([_, value]) => value);
  
  if (detected.length > 0) {
    console.warn(`[Security] Suspicious activity detected from ${req.ip}:`, detected.map(([key]) => key));
    
    // Log but don't block - could be false positive
    // In production, consider blocking or requiring additional verification
  }
  
  next();
};

// Request sanitization
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  next();
};

// IP-based access control for admin routes
export const adminIPWhitelist = (req: Request, res: Response, next: NextFunction) => {
  const adminAllowedIPs = process.env.ADMIN_ALLOWED_IPS?.split(',') || [];
  
  // In development, allow all IPs
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  // If no whitelist configured, allow all (but log warning)
  if (adminAllowedIPs.length === 0) {
    console.warn('[Security] No admin IP whitelist configured - allowing all IPs');
    return next();
  }
  
  const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] as string;
  
  if (!adminAllowedIPs.includes(clientIP)) {
    console.warn(`[Security] Admin access denied for IP: ${clientIP}`);
    return res.status(403).json({ 
      error: 'Admin access restricted to authorized IP addresses',
      code: 'IP_NOT_WHITELISTED'
    });
  }
  
  next();
};

// Session security enhancement
export const enhanceSessionSecurity = (req: Request, res: Response, next: NextFunction) => {
  // Regenerate session ID on privilege escalation
  if (req.session && req.path.includes('/admin') && !(req.session as any).adminSessionGenerated) {
    req.session.regenerate((err: any) => {
      if (err) {
        console.error('[Security] Session regeneration failed:', err);
        return next(err);
      }
      (req.session as any).adminSessionGenerated = true;
      next();
    });
  } else {
    next();
  }
};