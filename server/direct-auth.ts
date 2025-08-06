/**
 * Direct Authentication System - Bypasses session infrastructure
 * Provides direct login functionality without session dependencies
 */

import { Request, Response } from 'express';
import { storage } from './storage';
import { randomBytes } from 'crypto';

interface DirectAuthSession {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  tenant: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

// In-memory store for direct authentication
const directSessions = new Map<string, DirectAuthSession>();

export async function handleDirectLogin(req: Request, res: Response) {
  try {
    const { email } = req.body;
    
    // PRODUCTION: Allow all registered users
    console.log(`[Direct Auth] Production authentication enabled for: ${email}`);
    
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Generate secure token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Create direct session
    const session: DirectAuthSession = {
      userId: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      roles: user.roles || [],
      tenant: user.tenant || 'default',
      token,
      createdAt: new Date(),
      expiresAt
    };
    
    directSessions.set(token, session);
    
    console.log(`[Direct Auth] Login successful for ${email}, token: ${token.substring(0, 8)}...`);
    
    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        tenant: user.tenant
      },
      token,
      authType: "direct",
      expiresAt
    });
    
  } catch (error) {
    console.error('[Direct Auth] Login error:', error);
    return res.status(500).json({ error: "Login failed" });
  }
}

export async function handleDirectAuthCheck(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }
    
    const session = directSessions.get(token);
    if (!session) {
      return res.status(401).json({ error: "Invalid token" });
    }
    
    if (new Date() > session.expiresAt) {
      directSessions.delete(token);
      return res.status(401).json({ error: "Token expired" });
    }
    
    return res.json({
      authenticated: true,
      user: {
        id: session.userId,
        email: session.email,
        firstName: session.firstName,
        lastName: session.lastName,
        roles: session.roles,
        tenant: session.tenant
      }
    });
    
  } catch (error) {
    console.error('[Direct Auth] Check error:', error);
    return res.status(500).json({ error: "Auth check failed" });
  }
}

export async function handleDirectLogout(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      directSessions.delete(token);
      console.log(`[Direct Auth] Logout successful for token: ${token.substring(0, 8)}...`);
    }
    
    return res.json({ success: true });
    
  } catch (error) {
    console.error('[Direct Auth] Logout error:', error);
    return res.status(500).json({ error: "Logout failed" });
  }
}

// Clean up expired sessions every 5 minutes
setInterval(() => {
  const now = new Date();
  for (const [token, session] of directSessions.entries()) {
    if (now > session.expiresAt) {
      directSessions.delete(token);
    }
  }
}, 5 * 60 * 1000);