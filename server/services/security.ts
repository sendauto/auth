import { createHash } from 'crypto';

export interface SecurityEvent {
  userId?: number;
  type: 'failed_login' | 'successful_login' | 'password_reset' | 'mfa_failure' | 'suspicious_activity';
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

export interface AccountLockStatus {
  isLocked: boolean;
  lockoutExpiresAt?: Date;
  failedAttempts: number;
  remainingAttempts: number;
}

export interface ThreatDetectionResult {
  isThreat: boolean;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
  recommendedActions: string[];
}

export class SecurityService {
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes
  private static readonly SUSPICIOUS_IP_THRESHOLD = 10; // Failed attempts from same IP
  private static readonly BREACH_PASSWORD_HASHES = new Set([
    // Add known breached password hashes here
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // empty
    '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // password
  ]);

  // In-memory store for demonstration (use Redis in production)
  private static loginAttempts = new Map<string, { count: number; lastAttempt: Date; lockedUntil?: Date }>();
  private static ipAttempts = new Map<string, { count: number; firstAttempt: Date }>();

  static async recordSecurityEvent(event: SecurityEvent): Promise<void> {
    // Log security event (implement with your logging system)
    console.log(`[SECURITY] ${event.type.toUpperCase()}: ${JSON.stringify(event)}`);
    
    // Store in audit log if needed
    // await auditLogger.logSecurityEvent(event);
  }

  static async checkAccountLockout(identifier: string): Promise<AccountLockStatus> {
    const attempts = this.loginAttempts.get(identifier);
    
    if (!attempts) {
      return {
        isLocked: false,
        failedAttempts: 0,
        remainingAttempts: this.MAX_LOGIN_ATTEMPTS
      };
    }

    // Check if lockout has expired
    if (attempts.lockedUntil && new Date() > attempts.lockedUntil) {
      this.loginAttempts.delete(identifier);
      return {
        isLocked: false,
        failedAttempts: 0,
        remainingAttempts: this.MAX_LOGIN_ATTEMPTS
      };
    }

    const isLocked = attempts.count >= this.MAX_LOGIN_ATTEMPTS;
    
    return {
      isLocked,
      lockoutExpiresAt: attempts.lockedUntil,
      failedAttempts: attempts.count,
      remainingAttempts: Math.max(0, this.MAX_LOGIN_ATTEMPTS - attempts.count)
    };
  }

  static async recordFailedLogin(identifier: string, ipAddress?: string): Promise<AccountLockStatus> {
    const now = new Date();
    const attempts = this.loginAttempts.get(identifier) || { count: 0, lastAttempt: now };
    
    attempts.count++;
    attempts.lastAttempt = now;
    
    // Lock account if max attempts reached
    if (attempts.count >= this.MAX_LOGIN_ATTEMPTS) {
      attempts.lockedUntil = new Date(now.getTime() + this.LOCKOUT_DURATION);
    }
    
    this.loginAttempts.set(identifier, attempts);
    
    // Track IP attempts for threat detection
    if (ipAddress) {
      await this.recordIpAttempt(ipAddress);
    }
    
    // Record security event
    await this.recordSecurityEvent({
      type: 'failed_login',
      ipAddress,
      severity: attempts.count >= this.MAX_LOGIN_ATTEMPTS ? 'high' : 'medium',
      timestamp: now,
      details: { failedAttempts: attempts.count }
    });
    
    return this.checkAccountLockout(identifier);
  }

  static async recordSuccessfulLogin(identifier: string, userId: number, ipAddress?: string, userAgent?: string): Promise<void> {
    // Clear failed attempts on successful login
    this.loginAttempts.delete(identifier);
    
    await this.recordSecurityEvent({
      userId,
      type: 'successful_login',
      ipAddress,
      userAgent,
      severity: 'low',
      timestamp: new Date()
    });
  }

  private static async recordIpAttempt(ipAddress: string): Promise<void> {
    const now = new Date();
    const ipAttempts = this.ipAttempts.get(ipAddress);
    
    if (!ipAttempts) {
      this.ipAttempts.set(ipAddress, { count: 1, firstAttempt: now });
    } else {
      // Reset if more than 1 hour has passed
      if (now.getTime() - ipAttempts.firstAttempt.getTime() > 60 * 60 * 1000) {
        this.ipAttempts.set(ipAddress, { count: 1, firstAttempt: now });
      } else {
        ipAttempts.count++;
      }
    }
  }

  static async detectThreats(params: {
    ipAddress?: string;
    userAgent?: string;
    email?: string;
    loginTime?: Date;
  }): Promise<ThreatDetectionResult> {
    const reasons: string[] = [];
    let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Check for suspicious IP activity
    if (params.ipAddress) {
      const ipAttempts = this.ipAttempts.get(params.ipAddress);
      if (ipAttempts && ipAttempts.count >= this.SUSPICIOUS_IP_THRESHOLD) {
        reasons.push(`High number of failed attempts from IP: ${params.ipAddress}`);
        threatLevel = 'high';
      }
    }

    // Check for unusual login times (e.g., outside business hours)
    if (params.loginTime) {
      const hour = params.loginTime.getHours();
      if (hour < 6 || hour > 22) {
        reasons.push('Login attempt outside normal business hours');
        threatLevel = Math.max(threatLevel, 'medium') as any;
      }
    }

    // Check for suspicious user agent patterns
    if (params.userAgent) {
      const suspiciousPatterns = [
        /bot/i,
        /crawler/i,
        /spider/i,
        /automated/i
      ];
      
      if (suspiciousPatterns.some(pattern => pattern.test(params.userAgent!))) {
        reasons.push('Suspicious user agent detected');
        threatLevel = Math.max(threatLevel, 'medium') as any;
      }
    }

    const recommendedActions: string[] = [];
    
    if (threatLevel === 'critical') {
      recommendedActions.push('Immediately block IP address', 'Require MFA verification', 'Alert security team');
    } else if (threatLevel === 'high') {
      recommendedActions.push('Require additional verification', 'Monitor closely', 'Consider temporary restrictions');
    } else if (threatLevel === 'medium') {
      recommendedActions.push('Increase monitoring', 'Log detailed information');
    }

    return {
      isThreat: reasons.length > 0,
      threatLevel,
      reasons,
      recommendedActions
    };
  }

  static async checkPasswordBreach(password: string): Promise<boolean> {
    const hash = createHash('sha256').update(password).digest('hex');
    return this.BREACH_PASSWORD_HASHES.has(hash);
  }

  static async getSecurityMetrics(): Promise<{
    activeThreats: number;
    blockedIPs: number;
    recentFailedLogins: number;
    accountsLocked: number;
  }> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    let recentFailedLogins = 0;
    let accountsLocked = 0;
    
    for (const [, attempts] of this.loginAttempts) {
      if (attempts.lastAttempt > oneHourAgo) {
        recentFailedLogins += attempts.count;
      }
      if (attempts.lockedUntil && attempts.lockedUntil > now) {
        accountsLocked++;
      }
    }
    
    let blockedIPs = 0;
    for (const [, ipData] of this.ipAttempts) {
      if (ipData.count >= this.SUSPICIOUS_IP_THRESHOLD) {
        blockedIPs++;
      }
    }
    
    return {
      activeThreats: blockedIPs,
      blockedIPs,
      recentFailedLogins,
      accountsLocked
    };
  }

  static async unlockAccount(identifier: string): Promise<void> {
    this.loginAttempts.delete(identifier);
    
    await this.recordSecurityEvent({
      type: 'successful_login',
      severity: 'low',
      timestamp: new Date(),
      details: { action: 'manual_unlock', identifier }
    });
  }

  static async blacklistIP(ipAddress: string, reason: string): Promise<void> {
    // In production, this would add to IP blacklist
    await this.recordSecurityEvent({
      type: 'suspicious_activity',
      ipAddress,
      severity: 'critical',
      timestamp: new Date(),
      details: { action: 'ip_blacklisted', reason }
    });
  }
}