import { randomBytes, createHash } from 'crypto';
import { storage } from '../storage';

export interface SessionConfig {
  maxAge: number; // in milliseconds
  maxConcurrentSessions: number;
  refreshThreshold: number; // Refresh token when this much time left
  fingerprint: boolean; // Use browser fingerprinting
}

export interface SessionInfo {
  id: string;
  userId: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  lastAccessedAt: Date;
  expiresAt: Date;
  isActive: boolean;
  deviceFingerprint?: string;
}

export interface DeviceInfo {
  browser: string;
  os: string;
  device: string;
  location?: string;
  trusted: boolean;
}

export class EnhancedSessionManager {
  private static readonly DEFAULT_CONFIG: SessionConfig = {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxConcurrentSessions: 5,
    refreshThreshold: 5 * 60 * 1000, // 5 minutes
    fingerprint: true
  };

  static generateSessionId(): string {
    return randomBytes(32).toString('hex');
  }

  static generateFingerprint(userAgent?: string, acceptLanguage?: string, timezone?: string): string {
    const fingerprintData = [
      userAgent || '',
      acceptLanguage || '',
      timezone || '',
      // Add more fingerprinting data as needed
    ].join('|');
    
    return createHash('sha256').update(fingerprintData).digest('hex');
  }

  static async createSession(
    userId: number,
    ipAddress?: string,
    userAgent?: string,
    deviceFingerprint?: string,
    config: SessionConfig = this.DEFAULT_CONFIG
  ): Promise<SessionInfo> {
    // Check and cleanup old sessions
    await this.cleanupExpiredSessions();
    await this.enforceConcurrentSessionLimit(userId, config.maxConcurrentSessions);

    const sessionId = this.generateSessionId();
    const expiresAt = new Date(Date.now() + config.maxAge);

    const session = await storage.createSession({
      id: sessionId,
      userId,
      expiresAt,
      ipAddress,
      userAgent,
      isActive: true
    });

    return {
      id: session.id,
      userId: session.userId,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      lastAccessedAt: session.lastAccessedAt,
      expiresAt: session.expiresAt,
      isActive: session.isActive,
      deviceFingerprint
    };
  }

  static async validateSession(
    sessionId: string,
    ipAddress?: string,
    userAgent?: string,
    deviceFingerprint?: string
  ): Promise<{ valid: boolean; session?: SessionInfo; reason?: string }> {
    const sessionData = await storage.getSessionWithUser(sessionId);
    
    if (!sessionData) {
      return { valid: false, reason: 'Session not found' };
    }

    if (!sessionData.isActive) {
      return { valid: false, reason: 'Session inactive' };
    }

    if (new Date() > sessionData.expiresAt) {
      await storage.deleteSession(sessionId);
      return { valid: false, reason: 'Session expired' };
    }

    // Check for session hijacking
    if (sessionData.ipAddress && ipAddress && sessionData.ipAddress !== ipAddress) {
      // Log suspicious activity
      console.warn(`Session IP mismatch for session ${sessionId}: ${sessionData.ipAddress} vs ${ipAddress}`);
      // Could implement IP change tolerance here
    }

    // Update last accessed time
    await this.updateLastAccessed(sessionId);

    return {
      valid: true,
      session: {
        id: sessionData.id,
        userId: sessionData.userId,
        ipAddress: sessionData.ipAddress,
        userAgent: sessionData.userAgent,
        createdAt: sessionData.createdAt,
        lastAccessedAt: sessionData.lastAccessedAt,
        expiresAt: sessionData.expiresAt,
        isActive: sessionData.isActive,
        deviceFingerprint
      }
    };
  }

  static async refreshSession(sessionId: string, config: SessionConfig = this.DEFAULT_CONFIG): Promise<boolean> {
    const session = await storage.getSession(sessionId);
    if (!session) return false;

    const timeLeft = session.expiresAt.getTime() - Date.now();
    if (timeLeft <= config.refreshThreshold) {
      const newExpiresAt = new Date(Date.now() + config.maxAge);
      // Implementation would need to add updateSession method to storage
      return true;
    }

    return false;
  }

  static async invalidateSession(sessionId: string): Promise<void> {
    await storage.deleteSession(sessionId);
  }

  static async invalidateAllUserSessions(userId: number): Promise<void> {
    await storage.deleteUserSessions(userId);
  }

  static async getUserActiveSessions(userId: number): Promise<SessionInfo[]> {
    // This would need a new storage method to get all user sessions
    // For now, return empty array
    return [];
  }

  private static async cleanupExpiredSessions(): Promise<void> {
    // Implementation would need storage method to cleanup expired sessions
    // This should run periodically
  }

  private static async enforceConcurrentSessionLimit(userId: number, maxSessions: number): Promise<void> {
    const activeSessions = await this.getUserActiveSessions(userId);
    
    if (activeSessions.length >= maxSessions) {
      // Remove oldest sessions
      const sessionsToRemove = activeSessions
        .sort((a, b) => a.lastAccessedAt.getTime() - b.lastAccessedAt.getTime())
        .slice(0, activeSessions.length - maxSessions + 1);
      
      for (const session of sessionsToRemove) {
        await this.invalidateSession(session.id);
      }
    }
  }

  private static async updateLastAccessed(sessionId: string): Promise<void> {
    // Implementation would need storage method to update lastAccessedAt
    // For now, this is a placeholder
  }

  static parseUserAgent(userAgent?: string): DeviceInfo {
    if (!userAgent) {
      return {
        browser: 'Unknown',
        os: 'Unknown',
        device: 'Unknown',
        trusted: false
      };
    }

    // Simple user agent parsing (in production, use a proper library like ua-parser-js)
    let browser = 'Unknown';
    let os = 'Unknown';
    let device = 'Desktop';

    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      device = 'Mobile';
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      device = 'Tablet';
    }

    return {
      browser,
      os,
      device,
      trusted: false // Would be determined by device registration/recognition
    };
  }
}