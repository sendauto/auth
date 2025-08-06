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
    username?: string;
    isActive?: boolean;
    tenant?: number;
    roles?: string[];
    emailVerified?: boolean;
    scimExternalId?: string;
  }): Promise<any> {
    const insertUser: InsertUser = {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      isActive: userData.isActive ?? true,
      tenant: userData.tenant?.toString() || 'default',
      roles: userData.roles || ['user'],
      emailVerified: userData.emailVerified ?? false,
      scimExternalId: userData.scimExternalId
    };

    const user = await storage.createUser(insertUser);
    return user;
  }
}

export const authService = new AuthService();