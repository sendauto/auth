import { Request } from 'express';
import { storage } from '../storage';
import { PasswordService } from './password';
import { SecurityService } from './security';
import { notificationService } from './notification';
import { EmailService } from './email';
import { MFAService } from './mfa';
import { EnhancedSessionManager } from './session';
import { auditLogger } from './audit';
import { User } from '@shared/schema';

export interface LoginAttempt {
  email: string;
  password: string;
  ipAddress: string;
  userAgent: string;
  rememberMe?: boolean;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  sessionId?: string;
  requiresMFA?: boolean;
  mfaToken?: string;
  error?: string;
  errorCode?: string;
  lockoutInfo?: {
    isLocked: boolean;
    remainingAttempts: number;
    lockoutExpiresAt?: Date;
  };
}

export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organization?: string;
  jobTitle?: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  agreeToMarketing?: boolean;
}

export interface RegistrationResult {
  success: boolean;
  user?: User;
  error?: string;
  errorCode?: string;
  verificationToken?: string;
}

export class AuthenticationService {
  private static instance: AuthenticationService;

  private constructor() {
    // No need for sessionManager instance as EnhancedSessionManager uses static methods
  }

  static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  async authenticateUser(attempt: LoginAttempt, req: Request): Promise<LoginResult> {
    const { email, password, ipAddress, userAgent, rememberMe } = attempt;

    try {
      // Check for account lockout
      const lockoutStatus = await SecurityService.checkAccountLockout(email);
      if (lockoutStatus.isLocked) {
        await this.logSecurityEvent(req, 'failed_login', {
          email,
          reason: 'account_locked',
          lockoutExpiresAt: lockoutStatus.lockoutExpiresAt
        });

        return {
          success: false,
          error: 'Account is temporarily locked',
          errorCode: 'ACCOUNT_LOCKED',
          lockoutInfo: lockoutStatus
        };
      }

      // Get user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        await SecurityService.recordFailedLogin(email, ipAddress);
        await this.logSecurityEvent(req, 'failed_login', {
          email,
          reason: 'user_not_found'
        });

        return {
          success: false,
          error: 'Invalid email or password',
          errorCode: 'INVALID_CREDENTIALS'
        };
      }

      // Check if user is active
      if (!user.isActive) {
        await this.logSecurityEvent(req, 'failed_login', {
          email,
          reason: 'account_inactive'
        });

        return {
          success: false,
          error: 'Account is deactivated',
          errorCode: 'ACCOUNT_INACTIVE'
        };
      }

      // Verify password
      const isPasswordValid = await PasswordService.verifyPassword(password, user.password || '');
      if (!isPasswordValid) {
        await SecurityService.recordFailedLogin(email, ipAddress);
        await this.logSecurityEvent(req, 'failed_login', {
          email,
          reason: 'invalid_password'
        });

        // Check if account should be locked
        const updatedLockoutStatus = await SecurityService.checkAccountLockout(email);
        if (updatedLockoutStatus.isLocked) {
          await notificationService.notifySecurityEvent(user.id, 'account_locked', {
            ipAddress,
            userAgent,
            timestamp: new Date()
          });
        }

        return {
          success: false,
          error: 'Invalid email or password',
          errorCode: 'INVALID_CREDENTIALS',
          lockoutInfo: updatedLockoutStatus
        };
      }

      // Clear failed login attempts on successful authentication
      await SecurityService.clearFailedLogins(email);

      // Check for MFA requirement
      if (user.mfaEnabled) {
        const mfaToken = await MFAService.generateMFAToken(user.id);
        return {
          success: false,
          requiresMFA: true,
          mfaToken,
          error: 'MFA verification required',
          errorCode: 'MFA_REQUIRED'
        };
      }

      // Create session
      const sessionData = await this.sessionManager.createSession({
        userId: user.id,
        ipAddress,
        userAgent,
        rememberMe: rememberMe || false
      });

      // Log successful login
      await this.logSecurityEvent(req, 'successful_login', {
        userId: user.id,
        email: user.email,
        sessionId: sessionData.sessionId
      });

      // Send security notification
      await notificationService.notifySecurityEvent(user.id, 'login_success', {
        ipAddress,
        userAgent,
        timestamp: new Date(),
        location: await this.getLocationFromIP(ipAddress)
      });

      // Check for new device
      const isNewDevice = await this.sessionManager.isNewDevice(user.id, userAgent);
      if (isNewDevice) {
        await notificationService.notifySecurityEvent(user.id, 'new_device', {
          ipAddress,
          userAgent,
          timestamp: new Date(),
          location: await this.getLocationFromIP(ipAddress)
        });
      }

      return {
        success: true,
        user,
        sessionId: sessionData.sessionId
      };

    } catch (error) {
      console.error('Authentication error:', error);
      
      await this.logSecurityEvent(req, 'failed_login', {
        email,
        reason: 'system_error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: 'Authentication failed',
        errorCode: 'SYSTEM_ERROR'
      };
    }
  }

  async registerUser(data: RegistrationData, req: Request): Promise<RegistrationResult> {
    const { email, password, firstName, lastName, organization, jobTitle, agreeToTerms, agreeToPrivacy } = data;

    try {
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return {
          success: false,
          error: 'An account with this email already exists',
          errorCode: 'EMAIL_EXISTS'
        };
      }

      // Validate password strength
      const passwordStrength = await PasswordService.calculateStrength(password);
      if (passwordStrength.score < 60) {
        return {
          success: false,
          error: 'Password does not meet security requirements',
          errorCode: 'PASSWORD_TOO_WEAK'
        };
      }

      // Check for breached password
      const isBreached = await PasswordService.checkBreachedPassword(password);
      if (isBreached) {
        return {
          success: false,
          error: 'This password has been found in data breaches. Please choose a different password.',
          errorCode: 'PASSWORD_BREACHED'
        };
      }

      // Hash password
      const hashedPassword = await PasswordService.hashPassword(password);

      // Auto-assign organization admin role to all new users
      const roles = ["admin", "manager", "user"]; // All new users get admin privileges

      // Create user
      const user = await storage.createUser({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        roles: roles,
        tenant: organization ? organization.toLowerCase().replace(/\s+/g, '-') : 'default',
        isActive: true,
        emailVerified: false,
        preferences: {
          theme: 'light',
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        },
        profile: {
          jobTitle: jobTitle || null,
          organization: organization || null,
          bio: null,
          website: null,
          location: null
        },
        lastPasswordChange: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Generate email verification token
      const verificationToken = await EmailService.sendEmailVerification({
        email: user.email,
        firstName: user.firstName
      });

      // Log registration event
      await auditLogger.logUserAction(req, 'user_registered', {
        userId: user.id,
        email: user.email,
        role
      });

      // Send welcome notification
      await notificationService.createNotification({
        userId: user.id,
        type: 'email_verification',
        title: 'Welcome to Auth247!',
        message: 'Please verify your email address to complete your registration',
        severity: 'info',
        channels: ['in_app', 'email'],
        actionRequired: true
      });

      return {
        success: true,
        user,
        verificationToken
      };

    } catch (error) {
      console.error('Registration error:', error);
      
      await auditLogger.logSystemEvent('registration_failed', {
        email,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: 'Registration failed',
        errorCode: 'SYSTEM_ERROR'
      };
    }
  }

  async verifyMFA(userId: number, token: string, mfaCode: string, req: Request): Promise<LoginResult> {
    try {
      // Verify MFA token
      const tokenValid = await MFAService.verifyMFAToken(token, userId);
      if (!tokenValid) {
        return {
          success: false,
          error: 'Invalid MFA token',
          errorCode: 'INVALID_MFA_TOKEN'
        };
      }

      // Verify MFA code
      const user = await storage.getUser(userId);
      if (!user || !user.mfaSecret) {
        return {
          success: false,
          error: 'MFA not configured',
          errorCode: 'MFA_NOT_CONFIGURED'
        };
      }

      const codeValid = await MFAService.verifyTOTP(user.mfaSecret, mfaCode);
      if (!codeValid) {
        await this.logSecurityEvent(req, 'mfa_failure', { userId });
        return {
          success: false,
          error: 'Invalid MFA code',
          errorCode: 'INVALID_MFA_CODE'
        };
      }

      // Create session after successful MFA
      const sessionData = await this.sessionManager.createSession({
        userId: user.id,
        ipAddress: req.ip || '',
        userAgent: req.get('user-agent') || '',
        rememberMe: false
      });

      // Log successful MFA verification
      await this.logSecurityEvent(req, 'successful_login', {
        userId: user.id,
        email: user.email,
        sessionId: sessionData.sessionId,
        mfaVerified: true
      });

      return {
        success: true,
        user,
        sessionId: sessionData.sessionId
      };

    } catch (error) {
      console.error('MFA verification error:', error);
      return {
        success: false,
        error: 'MFA verification failed',
        errorCode: 'SYSTEM_ERROR'
      };
    }
  }

  async logout(sessionId: string, req: Request): Promise<boolean> {
    try {
      // Get session info before deletion
      const session = await storage.getSessionWithUser(sessionId);
      
      // Delete session
      await storage.deleteSession(sessionId);
      
      if (session?.user) {
        // Log logout event
        await this.logSecurityEvent(req, 'user_logout', {
          userId: session.user.id,
          email: session.user.email,
          sessionId
        });
      }

      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  async refreshSession(sessionId: string, req: Request): Promise<{ success: boolean; newSessionId?: string }> {
    try {
      const session = await storage.getSessionWithUser(sessionId);
      if (!session || !session.user) {
        return { success: false };
      }

      // Check if session is still valid
      if (session.expiresAt < new Date()) {
        await storage.deleteSession(sessionId);
        return { success: false };
      }

      // Create new session
      const newSessionData = await this.sessionManager.createSession({
        userId: session.user.id,
        ipAddress: req.ip || '',
        userAgent: req.get('user-agent') || '',
        rememberMe: false
      });

      // Delete old session
      await storage.deleteSession(sessionId);

      return {
        success: true,
        newSessionId: newSessionData.sessionId
      };

    } catch (error) {
      console.error('Session refresh error:', error);
      return { success: false };
    }
  }

  private determineUserRole(email: string, organization?: string): string {
    // Enterprise domain detection
    const domain = email.split('@')[1];
    const enterpriseDomains = ['auth247.net', 'company.com'];
    
    if (enterpriseDomains.includes(domain)) {
      return 'admin';
    }

    // Organization-based role assignment
    if (organization && organization.toLowerCase().includes('admin')) {
      return 'manager';
    }

    return 'user';
  }

  private async logSecurityEvent(req: Request, eventType: string, details: any): Promise<void> {
    await auditLogger.logSecurityEvent(req, eventType, details);
  }

  private async getLocationFromIP(ipAddress: string): Promise<string> {
    // In production, use a geolocation service
    // For now, return a placeholder
    return `Location for ${ipAddress}`;
  }
}

export const authService = AuthenticationService.getInstance();