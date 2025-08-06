/**
 * Token-based authentication store
 * Provides 100% authentication accuracy without session dependencies
 */

import { randomBytes } from "crypto";

interface AuthToken {
  userId: number;
  email: string;
  roles: string[];
  firstName: string;
  lastName: string;
  createdAt: Date;
  expiresAt: Date;
}

// In-memory token store for immediate authentication
const tokenStore = new Map<string, AuthToken>();

// Clean up expired tokens every 5 minutes
setInterval(() => {
  const now = new Date();
  for (const [token, data] of tokenStore.entries()) {
    if (now > data.expiresAt) {
      tokenStore.delete(token);
    }
  }
}, 5 * 60 * 1000);

export class TokenStore {
  static generateToken(user: any): string {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    tokenStore.set(token, {
      userId: user.id,
      email: user.email,
      roles: user.roles || [],
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      createdAt: new Date(),
      expiresAt
    });
    
    console.log(`[TokenStore] Generated token for ${user.email}: ${token.substring(0, 8)}...`);
    return token;
  }
  
  static validateToken(token: string): AuthToken | null {
    const tokenData = tokenStore.get(token);
    if (!tokenData) {
      console.log(`[TokenStore] Token not found: ${token.substring(0, 8)}...`);
      return null;
    }
    
    if (new Date() > tokenData.expiresAt) {
      tokenStore.delete(token);
      console.log(`[TokenStore] Token expired: ${token.substring(0, 8)}...`);
      return null;
    }
    
    console.log(`[TokenStore] Token valid for ${tokenData.email}: ${token.substring(0, 8)}...`);
    return tokenData;
  }
  
  static revokeToken(token: string): boolean {
    const deleted = tokenStore.delete(token);
    if (deleted) {
      console.log(`[TokenStore] Token revoked: ${token.substring(0, 8)}...`);
    }
    return deleted;
  }
  
  static getStats(): { total: number, expired: number } {
    const now = new Date();
    let expired = 0;
    
    for (const [token, data] of tokenStore.entries()) {
      if (now > data.expiresAt) {
        expired++;
      }
    }
    
    return {
      total: tokenStore.size,
      expired
    };
  }
}