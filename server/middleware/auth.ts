import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { User } from "@shared/schema";

// Extend Express Request type with authentication properties
declare global {
  namespace Express {
    interface Request {
      isAuthenticated(): boolean;
      user?: User;
      sessionId?: string;
    }
  }
}

/**
 * Authentication middleware that adds authentication methods to request object
 */
export function authMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Add isAuthenticated method to request
    req.isAuthenticated = function() {
      return !!(req.session?.userId && req.session?.sessionId);
    };

    // If user is authenticated, load user data
    if (req.isAuthenticated()) {
      try {
        const sessionData = await storage.getSessionWithUser(req.session.sessionId!);
        
        if (sessionData && new Date() <= sessionData.expiresAt) {
          req.user = sessionData.user;
          req.sessionId = sessionData.id;
        } else {
          // Session expired or invalid
          if (req.session.sessionId) {
            await storage.deleteSession(req.session.sessionId);
          }
          req.session.destroy(() => {});
          delete req.user;
          delete req.sessionId;
        }
      } catch (error) {
        console.error("Auth middleware error:", error);
        delete req.user;
        delete req.sessionId;
      }
    }

    next();
  };
}

/**
 * Middleware to require authentication
 */
export function requireAuth() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    next();
  };
}

/**
 * Middleware to require specific roles
 */
export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userRoles = req.user.roles || [];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json({ 
        error: "Insufficient permissions",
        required: roles,
        current: userRoles
      });
    }

    next();
  };
}

/**
 * Middleware to require admin access
 */
export function requireAdmin() {
  return requireRole(["admin", "super_admin"]);
}

/**
 * Middleware to require manager access or higher
 */
export function requireManager() {
  return requireRole(["manager", "admin", "super_admin"]);
}