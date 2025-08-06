/**
 * Authentication Middleware
 * Role-based access control middleware
 */

import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedUser {
  id: number;
  email: string;
  roles: string[];
  tenant: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function requireAuth() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Mock authentication - in production would validate JWT/session
    req.user = {
      id: 1,
      email: 'admin@auth247.net',
      roles: ['super_admin', 'admin', 'manager', 'user'],
      tenant: 1
    };
    next();
  };
}

export function requireManager() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!req.user.roles.includes('manager') && !req.user.roles.includes('admin') && !req.user.roles.includes('super_admin')) {
      return res.status(403).json({ error: 'Manager role required' });
    }
    
    next();
  };
}

export function requireAdmin() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!req.user.roles.includes('admin') && !req.user.roles.includes('super_admin')) {
      return res.status(403).json({ error: 'Admin role required' });
    }
    
    next();
  };
}