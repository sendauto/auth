/**
 * Token-based authentication system
 * Bypasses session middleware issues by using JWT tokens
 */

import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

const JWT_SECRET = process.env.SESSION_SECRET || 'fallback-secret';

export interface AuthToken {
  userId: string;
  email: string;
  roles: string[];
  sessionId: string;
  exp: number;
}

export function generateAuthToken(user: any): string {
  const payload: AuthToken = {
    userId: user.id,
    email: user.email,
    roles: user.roles,
    sessionId: randomBytes(16).toString('hex'),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  
  return jwt.sign(payload, JWT_SECRET);
}

export function verifyAuthToken(token: string): AuthToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthToken;
    
    // Check if token is expired
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
}

export function extractTokenFromRequest(req: any): string | null {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookies
  const cookies = req.headers.cookie;
  if (cookies) {
    const match = cookies.match(/auth_token=([^;]+)/);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}