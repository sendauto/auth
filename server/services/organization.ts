import { Request } from 'express';
import { storage } from '../storage';
import { PasswordService } from './password';
import { SecurityService } from './security';
import { notificationService } from './notification';
import { EmailService } from './email';
import { auditLogger } from './audit';
import { User, InsertUser } from '@shared/schema';

export interface OrganizationLimits {
  maxUsers: number;
  maxAdmins: number;
  maxManagers: number;
  ssoEnabled: boolean;
  mfaRequired: boolean;
  advancedSecurity: boolean;
  auditRetentionDays: number;
  apiAccess: boolean;
  customBranding: boolean;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  limits: OrganizationLimits;
}

export interface OrganizationStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  managerUsers: number;
  regularUsers: number;
  lastLogin: Date | null;
  subscriptionTier: string;
  limits: OrganizationLimits;
  usage: {
    userSlots: { used: number; available: number };
    adminSlots: { used: number; available: number };
    managerSlots: { used: number; available: number };
  };
}

export interface UserInvitation {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  invitedBy: number;
  token: string;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  createdAt: Date;
}

export class OrganizationService {
  private static readonly SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
    free: {
      id: 'free',
      name: 'Free',
      limits: {
        maxUsers: 10,
        maxAdmins: 1,
        maxManagers: 2,
        ssoEnabled: false,
        mfaRequired: false,
        advancedSecurity: false,
        auditRetentionDays: 30,
        apiAccess: false,
        customBranding: false
      }
    },
    professional: {
      id: 'professional',
      name: 'Professional',
      limits: {
        maxUsers: 100,
        maxAdmins: 5,
        maxManagers: 10,
        ssoEnabled: true,
        mfaRequired: false,
        advancedSecurity: true,
        auditRetentionDays: 90,
        apiAccess: true,
        customBranding: false
      }
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise',
      limits: {
        maxUsers: 1000,
        maxAdmins: 20,
        maxManagers: 50,
        ssoEnabled: true,
        mfaRequired: true,
        advancedSecurity: true,
        auditRetentionDays: 365,
        apiAccess: true,
        customBranding: true
      }
    }
  };

  private static invitations = new Map<string, UserInvitation>();

  static async getOrganizationStats(tenantId: string, subscriptionTier: string = 'free'): Promise<OrganizationStats> {
    // Get all users in organization
    const allUsers = await this.getOrganizationUsers(tenantId);
    
    const activeUsers = allUsers.filter(u => u.isActive);
    const adminUsers = allUsers.filter(u => u.roles.includes('admin'));
    const managerUsers = allUsers.filter(u => u.roles.includes('manager'));
    const regularUsers = allUsers.filter(u => u.roles.includes('user') && !u.roles.includes('admin') && !u.roles.includes('manager'));

    const tier = this.SUBSCRIPTION_TIERS[subscriptionTier] || this.SUBSCRIPTION_TIERS.free;
    const lastLogin = allUsers
      .filter(u => u.lastLogin)
      .sort((a, b) => (b.lastLogin?.getTime() || 0) - (a.lastLogin?.getTime() || 0))[0]?.lastLogin || null;

    return {
      totalUsers: allUsers.length,
      activeUsers: activeUsers.length,
      adminUsers: adminUsers.length,
      managerUsers: managerUsers.length,
      regularUsers: regularUsers.length,
      lastLogin,
      subscriptionTier: tier.name,
      limits: tier.limits,
      usage: {
        userSlots: {
          used: allUsers.length,
          available: tier.limits.maxUsers
        },
        adminSlots: {
          used: adminUsers.length,
          available: tier.limits.maxAdmins
        },
        managerSlots: {
          used: managerUsers.length,
          available: tier.limits.maxManagers
        }
      }
    };
  }

  static async getOrganizationUsers(tenantId: string): Promise<User[]> {
    // In production, this would query the database with tenant filter
    // For now, simulate with storage
    const allUsers: User[] = [];
    
    // Get users from memory storage for demo
    try {
      for (let i = 1; i <= 10; i++) {
        const user = await storage.getUser(i);
        if (user && user.tenant === tenantId) {
          allUsers.push(user);
        }
      }
    } catch (error) {
      // Continue if user doesn't exist
    }
    
    return allUsers;
  }

  static async canAddUser(tenantId: string, role: string, subscriptionTier: string = 'free'): Promise<{
    allowed: boolean;
    reason?: string;
    currentUsage?: any;
  }> {
    const stats = await this.getOrganizationStats(tenantId, subscriptionTier);
    const tier = this.SUBSCRIPTION_TIERS[subscriptionTier] || this.SUBSCRIPTION_TIERS.free;

    // Check total user limit
    if (stats.totalUsers >= tier.limits.maxUsers) {
      return {
        allowed: false,
        reason: `Organization has reached maximum user limit (${tier.limits.maxUsers} users)`,
        currentUsage: stats.usage
      };
    }

    // Check role-specific limits
    if (role === 'admin' && stats.adminUsers >= tier.limits.maxAdmins) {
      return {
        allowed: false,
        reason: `Organization has reached maximum admin limit (${tier.limits.maxAdmins} admins)`,
        currentUsage: stats.usage
      };
    }

    if (role === 'manager' && stats.managerUsers >= tier.limits.maxManagers) {
      return {
        allowed: false,
        reason: `Organization has reached maximum manager limit (${tier.limits.maxManagers} managers)`,
        currentUsage: stats.usage
      };
    }

    return { allowed: true };
  }

  static async inviteUser(
    organizationId: string,
    inviterUserId: number,
    email: string,
    role: string,
    subscriptionTier: string = 'free',
    req: Request
  ): Promise<{
    success: boolean;
    invitation?: UserInvitation;
    error?: string;
  }> {
    try {
      // Check if user can be added
      const canAdd = await this.canAddUser(organizationId, role, subscriptionTier);
      if (!canAdd.allowed) {
        return {
          success: false,
          error: canAdd.reason
        };
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists'
        };
      }

      // Check if invitation already exists
      const existingInvitation = Array.from(this.invitations.values())
        .find(inv => inv.email === email && inv.organizationId === organizationId && inv.status === 'pending');
      
      if (existingInvitation) {
        return {
          success: false,
          error: 'Invitation already sent to this email'
        };
      }

      // Create invitation
      const invitation: UserInvitation = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        organizationId,
        email,
        role,
        invitedBy: inviterUserId,
        token: await this.generateInvitationToken(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'pending',
        createdAt: new Date()
      };

      this.invitations.set(invitation.id, invitation);

      // Send invitation email
      await EmailService.sendUserInvitation({
        email,
        organizationId,
        role,
        token: invitation.token,
        inviterName: `Organization Admin`
      });

      // Log invitation
      await auditLogger.logUserAction(req, 'user_invited', {
        invitationId: invitation.id,
        email,
        role,
        organizationId,
        invitedBy: inviterUserId
      });

      console.log(`[ORG] User invitation sent to ${email} for role ${role} in org ${organizationId}`);

      return {
        success: true,
        invitation
      };

    } catch (error) {
      console.error('[ORG] User invitation error:', error);
      return {
        success: false,
        error: 'Failed to send invitation'
      };
    }
  }

  static async acceptInvitation(
    token: string,
    userData: {
      firstName: string;
      lastName: string;
      password: string;
    },
    req: Request
  ): Promise<{
    success: boolean;
    user?: User;
    error?: string;
  }> {
    try {
      // Find invitation by token
      const invitation = Array.from(this.invitations.values())
        .find(inv => inv.token === token && inv.status === 'pending');

      if (!invitation) {
        return {
          success: false,
          error: 'Invalid or expired invitation'
        };
      }

      // Check if invitation is expired
      if (invitation.expiresAt < new Date()) {
        invitation.status = 'expired';
        this.invitations.set(invitation.id, invitation);
        return {
          success: false,
          error: 'Invitation has expired'
        };
      }

      // Validate password
      const passwordStrength = await PasswordService.calculateStrength(userData.password);
      if (passwordStrength.score < 60) {
        return {
          success: false,
          error: 'Password does not meet security requirements'
        };
      }

      // Hash password
      const hashedPassword = await PasswordService.hashPassword(userData.password);

      // Create user
      const user = await storage.createUser({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: invitation.email,
        password: hashedPassword,
        roles: [invitation.role],
        tenant: invitation.organizationId,
        isActive: true,
        emailVerified: true, // Auto-verify for invited users
        mfaEnabled: false,
        failedLoginAttempts: 0,
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
        lastPasswordChange: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Mark invitation as accepted
      invitation.status = 'accepted';
      this.invitations.set(invitation.id, invitation);

      // Send welcome notification
      await notificationService.createNotification({
        userId: user.id,
        type: 'email_verification',
        title: 'Welcome to your organization!',
        message: `You've successfully joined as ${invitation.role}`,
        severity: 'info',
        metadata: {
          organizationId: invitation.organizationId,
          role: invitation.role
        }
      });

      // Log user creation
      await auditLogger.logUserAction(req, 'user_created_via_invitation', {
        userId: user.id,
        invitationId: invitation.id,
        organizationId: invitation.organizationId,
        role: invitation.role
      });

      console.log(`[ORG] User ${user.email} accepted invitation for role ${invitation.role}`);

      return {
        success: true,
        user
      };

    } catch (error) {
      console.error('[ORG] Accept invitation error:', error);
      return {
        success: false,
        error: 'Failed to accept invitation'
      };
    }
  }

  static async revokeInvitation(invitationId: string, req: Request): Promise<boolean> {
    const invitation = this.invitations.get(invitationId);
    if (!invitation || invitation.status !== 'pending') {
      return false;
    }

    invitation.status = 'revoked';
    this.invitations.set(invitationId, invitation);

    await auditLogger.logUserAction(req, 'invitation_revoked', {
      invitationId,
      email: invitation.email,
      organizationId: invitation.organizationId
    });

    return true;
  }

  static async getOrganizationInvitations(organizationId: string): Promise<UserInvitation[]> {
    return Array.from(this.invitations.values())
      .filter(inv => inv.organizationId === organizationId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static async updateUserRole(
    userId: number,
    newRole: string,
    organizationId: string,
    adminUserId: number,
    subscriptionTier: string = 'free',
    req: Request
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const user = await storage.getUser(userId);
      if (!user || user.tenant !== organizationId) {
        return {
          success: false,
          error: 'User not found in organization'
        };
      }

      // Check if role change is allowed by subscription
      const canAdd = await this.canAddUser(organizationId, newRole, subscriptionTier);
      if (!canAdd.allowed && !user.roles.includes(newRole)) {
        return {
          success: false,
          error: canAdd.reason
        };
      }

      // Update user role
      await storage.updateUser(userId, {
        roles: [newRole],
        updatedAt: new Date()
      });

      // Log role change
      await auditLogger.logUserAction(req, 'user_role_changed', {
        userId,
        oldRoles: user.roles,
        newRole,
        changedBy: adminUserId,
        organizationId
      });

      // Send notification to user
      await notificationService.createNotification({
        userId,
        type: 'security_alert',
        title: 'Role Updated',
        message: `Your role has been updated to ${newRole}`,
        severity: 'info',
        metadata: {
          oldRoles: user.roles,
          newRole,
          organizationId
        }
      });

      console.log(`[ORG] User ${user.email} role changed from ${user.roles.join(', ')} to ${newRole}`);

      return { success: true };

    } catch (error) {
      console.error('[ORG] Update user role error:', error);
      return {
        success: false,
        error: 'Failed to update user role'
      };
    }
  }

  static async deactivateUser(
    userId: number,
    organizationId: string,
    adminUserId: number,
    req: Request
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const user = await storage.getUser(userId);
      if (!user || user.tenant !== organizationId) {
        return {
          success: false,
          error: 'User not found in organization'
        };
      }

      // Deactivate user
      await storage.updateUser(userId, {
        isActive: false,
        updatedAt: new Date()
      });

      // Invalidate all user sessions
      await storage.deleteUserSessions(userId);

      // Log deactivation
      await auditLogger.logUserAction(req, 'user_deactivated', {
        userId,
        deactivatedBy: adminUserId,
        organizationId
      });

      console.log(`[ORG] User ${user.email} deactivated by admin ${adminUserId}`);

      return { success: true };

    } catch (error) {
      console.error('[ORG] Deactivate user error:', error);
      return {
        success: false,
        error: 'Failed to deactivate user'
      };
    }
  }

  private static async generateInvitationToken(): Promise<string> {
    return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  static getSubscriptionTiers(): Record<string, SubscriptionTier> {
    return this.SUBSCRIPTION_TIERS;
  }
}

export const organizationService = OrganizationService;