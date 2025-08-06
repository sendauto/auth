/**
 * Auth Service for user creation
 * Basic authentication service
 */

import { storage } from '../storage';
import { InsertUser } from '@shared/schema';

class AuthService {
  async createUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
    isActive?: boolean;
    tenant?: number;
    roles?: string[];
    emailVerified?: boolean;
    scimExternalId?: string;
    organization?: string;
    jobTitle?: string;
  }): Promise<any> {
    const insertUser: InsertUser = {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      password: userData.password || null, // Add password field
      isActive: userData.isActive ?? true,
      tenant: userData.tenant?.toString() || 'default',
      roles: userData.roles || ['user'],
      emailVerified: userData.emailVerified ?? false,
      scimExternalId: userData.scimExternalId,
      organization: userData.organization || null,
      jobTitle: userData.jobTitle || null,
      // Set required fields with defaults
      passwordResetToken: null,
      passwordResetTokenExpires: null,
      pinCode: null,
      pinExpiresAt: null,
      pinAttempts: 0,
      pinGeneratedAt: null,
      requiresPinVerification: false
    };

    const user = await storage.createUser(insertUser);
    return user;
  }
}

export const authService = new AuthService();