import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

// Rate limiting store
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimitStore {
  private store = new Map<string, RateLimitEntry>();
  
  increment(key: string, windowMs: number, maxRequests: number): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.store.get(key);
    
    if (!entry || now > entry.resetTime) {
      // New window or expired entry
      const resetTime = now + windowMs;
      this.store.set(key, { count: 1, resetTime });
      return { allowed: true, remaining: maxRequests - 1, resetTime };
    }
    
    entry.count++;
    const remaining = Math.max(0, maxRequests - entry.count);
    
    return {
      allowed: entry.count <= maxRequests,
      remaining,
      resetTime: entry.resetTime
    };
  }
  
  // Clean up expired entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of Array.from(this.store.entries())) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

const rateLimitStore = new RateLimitStore();

// Clean up expired entries every 5 minutes
setInterval(() => rateLimitStore.cleanup(), 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = (req) => req.ip || 'unknown',
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false
  } = options;
  
  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const result = rateLimitStore.increment(key, windowMs, maxRequests);
    
    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
    });
    
    if (!result.allowed) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message,
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
      });
    }
    
    next();
  };
}

// Predefined rate limiters for different endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 15, // Increased from 5 to 15 for better UX
  message: 'Too many authentication attempts, please try again later',
  keyGenerator: (req) => {
    const ip = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    const email = req.body?.email || 'unknown';
    return `auth:${ip}:${email}`;
  }
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 200, // Increased from 50 to 200 for better UX
  skipSuccessfulRequests: false, // Count all requests for testing
  keyGenerator: (req) => {
    const ip = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    return `api:${ip}`;
  }
});

export const strictRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 requests per minute
  message: 'Rate limit exceeded for sensitive operations'
});

// Monitoring endpoints rate limiter - more permissive for system health monitoring
export const monitoringRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute for monitoring
  message: 'Monitoring rate limit exceeded',
  keyGenerator: (req) => {
    const ip = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    return `monitoring:${ip}`;
  }
});

// XM system endpoints rate limiter - very permissive for continuous monitoring
export const xmRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 200, // 200 requests per minute for XM system
  message: 'XM system rate limit exceeded',
  keyGenerator: (req) => {
    const ip = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    return `xm:${ip}`;
  }
});

// Input validation middleware
export function validateInput<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid input data',
          details: result.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      req.body = result.data;
      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Validation failed'
      });
    }
  };
}

// Security headers middleware
export function securityHeaders() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Security headers
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self';"
    });
    
    next();
  };
}

// Request logging middleware
export function requestLogger() {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Log request
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${ip}`);
    
    // Log response when finished
    const originalSend = res.send;
    res.send = function(body) {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
      return originalSend.call(this, body);
    };
    
    next();
  };
}