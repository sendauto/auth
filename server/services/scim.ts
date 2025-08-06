/**
 * SCIM (System for Cross-domain Identity Management) Service
 * Automated user provisioning/deprovisioning for enterprise integration
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { organizationService } from './organization';
import { authService } from './auth';

// SCIM User Schema
const SCIMUserSchema = z.object({
  id: z.string().optional(),
  userName: z.string().email(),
  name: z.object({
    givenName: z.string(),
    familyName: z.string(),
    formatted: z.string().optional()
  }),
  emails: z.array(z.object({
    value: z.string().email(),
    primary: z.boolean().optional()
  })),
  active: z.boolean().default(true),
  groups: z.array(z.object({
    value: z.string(),
    display: z.string().optional()
  })).optional(),
  roles: z.array(z.string()).optional(),
  meta: z.object({
    resourceType: z.literal('User'),
    created: z.string().optional(),
    lastModified: z.string().optional(),
    version: z.string().optional()
  }).optional(),
  schemas: z.array(z.string()).default(['urn:ietf:params:scim:schemas:core:2.0:User'])
});

// SCIM Group Schema
const SCIMGroupSchema = z.object({
  id: z.string().optional(),
  displayName: z.string(),
  members: z.array(z.object({
    value: z.string(),
    display: z.string().optional()
  })).optional(),
  meta: z.object({
    resourceType: z.literal('Group'),
    created: z.string().optional(),
    lastModified: z.string().optional()
  }).optional(),
  schemas: z.array(z.string()).default(['urn:ietf:params:scim:schemas:core:2.0:Group'])
});

// SCIM Error Response
const SCIMErrorSchema = z.object({
  schemas: z.array(z.string()).default(['urn:ietf:params:scim:api:messages:2.0:Error']),
  detail: z.string(),
  status: z.string()
});

type SCIMUser = z.infer<typeof SCIMUserSchema>;
type SCIMGroup = z.infer<typeof SCIMGroupSchema>;
type SCIMError = z.infer<typeof SCIMErrorSchema>;

class SCIMService {
  // Get service provider configuration
  getServiceProviderConfig() {
    return {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig'],
      documentationUri: 'https://auth247.net/docs/scim',
      patch: {
        supported: true
      },
      bulk: {
        supported: false,
        maxOperations: 0,
        maxPayloadSize: 0
      },
      filter: {
        supported: true,
        maxResults: 200
      },
      changePassword: {
        supported: false
      },
      sort: {
        supported: true
      },
      etag: {
        supported: false
      },
      authenticationSchemes: [{
        type: 'httpbasic',
        name: 'HTTP Basic',
        description: 'Authentication scheme using HTTP Basic',
        specUri: 'http://www.rfc-editor.org/info/rfc2617',
        documentationUri: 'https://auth247.net/docs/scim#authentication'
      }, {
        type: 'oauthbearertoken',
        name: 'OAuth Bearer Token',
        description: 'Authentication scheme using OAuth Bearer Token',
        specUri: 'http://www.rfc-editor.org/info/rfc6750',
        documentationUri: 'https://auth247.net/docs/scim#oauth'
      }],
      meta: {
        location: 'https://auth247.net/scim/v2/ServiceProviderConfig',
        resourceType: 'ServiceProviderConfig',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
    };
  }

  // Get resource types
  getResourceTypes() {
    return [
      {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:ResourceType'],
        id: 'User',
        name: 'User',
        endpoint: '/Users',
        description: 'User Account',
        schema: 'urn:ietf:params:scim:schemas:core:2.0:User',
        meta: {
          location: 'https://auth247.net/scim/v2/ResourceTypes/User',
          resourceType: 'ResourceType'
        }
      },
      {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:ResourceType'],
        id: 'Group',
        name: 'Group',
        endpoint: '/Groups',
        description: 'Group',
        schema: 'urn:ietf:params:scim:schemas:core:2.0:Group',
        meta: {
          location: 'https://auth247.net/scim/v2/ResourceTypes/Group',
          resourceType: 'ResourceType'
        }
      }
    ];
  }

  // Get schemas
  getSchemas() {
    return [
      {
        id: 'urn:ietf:params:scim:schemas:core:2.0:User',
        name: 'User',
        description: 'User Account',
        attributes: [
          {
            name: 'userName',
            type: 'string',
            multiValued: false,
            description: 'Unique identifier for the User',
            required: true,
            caseExact: false,
            mutability: 'readWrite',
            returned: 'default',
            uniqueness: 'server'
          },
          {
            name: 'name',
            type: 'complex',
            multiValued: false,
            description: 'The components of the user\'s real name',
            required: false,
            subAttributes: [
              {
                name: 'familyName',
                type: 'string',
                multiValued: false,
                description: 'The family name of the User',
                required: false
              },
              {
                name: 'givenName',
                type: 'string',
                multiValued: false,
                description: 'The given name of the User',
                required: false
              }
            ]
          },
          {
            name: 'emails',
            type: 'complex',
            multiValued: true,
            description: 'Email addresses for the user',
            required: false,
            subAttributes: [
              {
                name: 'value',
                type: 'string',
                multiValued: false,
                description: 'Email addresses for the user',
                required: false
              },
              {
                name: 'primary',
                type: 'boolean',
                multiValued: false,
                description: 'A Boolean value indicating the primary email address',
                required: false
              }
            ]
          }
        ],
        meta: {
          resourceType: 'Schema',
          location: 'https://auth247.net/scim/v2/Schemas/urn:ietf:params:scim:schemas:core:2.0:User'
        }
      }
    ];
  }

  // Create user via SCIM
  async createUser(userData: SCIMUser, organizationId: number): Promise<SCIMUser> {
    try {
      const primaryEmail = userData.emails.find(e => e.primary)?.value || userData.emails[0]?.value;
      
      if (!primaryEmail) {
        throw new Error('No primary email provided');
      }

      const user = await authService.createUser({
        email: primaryEmail,
        firstName: userData.name.givenName,
        lastName: userData.name.familyName,
        username: userData.userName,
        isActive: userData.active,
        tenant: organizationId,
        roles: userData.roles || ['user'],
        emailVerified: true, // SCIM users are pre-verified
        scimExternalId: userData.id
      });

      return this.mapUserToSCIM(user);
    } catch (error) {
      console.error('[SCIM] Create user error:', error);
      throw error;
    }
  }

  // Update user via SCIM
  async updateUser(userId: string, userData: Partial<SCIMUser>, organizationId: number): Promise<SCIMUser> {
    try {
      const user = await storage.getUserByScimId(userId, organizationId);
      if (!user) {
        throw new Error('User not found');
      }

      const updates: any = {};
      
      if (userData.name) {
        updates.firstName = userData.name.givenName;
        updates.lastName = userData.name.familyName;
      }
      
      if (userData.emails && userData.emails.length > 0) {
        const primaryEmail = userData.emails.find(e => e.primary)?.value || userData.emails[0].value;
        updates.email = primaryEmail;
      }
      
      if (userData.active !== undefined) {
        updates.isActive = userData.active;
      }
      
      if (userData.roles) {
        updates.roles = userData.roles;
      }

      const updatedUser = await storage.updateUser(user.id, updates);
      return this.mapUserToSCIM(updatedUser);
    } catch (error) {
      console.error('[SCIM] Update user error:', error);
      throw error;
    }
  }

  // Delete user via SCIM
  async deleteUser(userId: string, organizationId: number): Promise<void> {
    try {
      const user = await storage.getUserByScimId(userId, organizationId);
      if (!user) {
        throw new Error('User not found');
      }

      // Soft delete by deactivating
      await storage.updateUser(user.id, { isActive: false });
    } catch (error) {
      console.error('[SCIM] Delete user error:', error);
      throw error;
    }
  }

  // Get user via SCIM
  async getUser(userId: string, organizationId: number): Promise<SCIMUser> {
    try {
      const user = await storage.getUserByScimId(userId, organizationId);
      if (!user) {
        throw new Error('User not found');
      }

      return this.mapUserToSCIM(user);
    } catch (error) {
      console.error('[SCIM] Get user error:', error);
      throw error;
    }
  }

  // List users via SCIM
  async listUsers(organizationId: number, filters?: {
    startIndex?: number;
    count?: number;
    filter?: string;
  }): Promise<{ Resources: SCIMUser[]; totalResults: number; startIndex: number; itemsPerPage: number }> {
    try {
      const { startIndex = 1, count = 100, filter } = filters || {};
      
      const users = await organizationService.getOrganizationUsers(organizationId);
      let filteredUsers = users;

      // Apply filter if provided
      if (filter) {
        // Simple filter implementation - can be enhanced
        const filterLower = filter.toLowerCase();
        filteredUsers = users.filter(user => 
          user.email.toLowerCase().includes(filterLower) ||
          user.firstName.toLowerCase().includes(filterLower) ||
          user.lastName.toLowerCase().includes(filterLower)
        );
      }

      const paginatedUsers = filteredUsers.slice(startIndex - 1, startIndex - 1 + count);
      const scimUsers = paginatedUsers.map(user => this.mapUserToSCIM(user));

      return {
        Resources: scimUsers,
        totalResults: filteredUsers.length,
        startIndex,
        itemsPerPage: scimUsers.length
      };
    } catch (error) {
      console.error('[SCIM] List users error:', error);
      throw error;
    }
  }

  // Map internal user to SCIM format
  private mapUserToSCIM(user: any): SCIMUser {
    return {
      id: user.scimExternalId || user.id.toString(),
      userName: user.username || user.email,
      name: {
        givenName: user.firstName,
        familyName: user.lastName,
        formatted: `${user.firstName} ${user.lastName}`
      },
      emails: [{
        value: user.email,
        primary: true
      }],
      active: user.isActive,
      roles: user.roles,
      meta: {
        resourceType: 'User',
        created: user.createdAt,
        lastModified: user.updatedAt || user.createdAt,
        version: '1'
      },
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User']
    };
  }

  // Create SCIM error response
  createError(status: number, detail: string): SCIMError {
    return {
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail,
      status: status.toString()
    };
  }

  // Validate SCIM authentication
  async validateSCIMAuth(req: Request): Promise<{ valid: boolean; organizationId?: number }> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return { valid: false };
      }

      if (authHeader.startsWith('Bearer ')) {
        // OAuth Bearer Token authentication
        const token = authHeader.substring(7);
        const { apiKeyService } = await import('./api-key');
        const validation = await apiKeyService.validateApiKey(token);
        
        if (validation.valid && validation.scope?.includes('scim')) {
          return { valid: true, organizationId: validation.organizationId };
        }
      } else if (authHeader.startsWith('Basic ')) {
        // HTTP Basic authentication
        const credentials = Buffer.from(authHeader.substring(6), 'base64').toString();
        const [username, password] = credentials.split(':');
        
        // Validate SCIM credentials (implement based on your auth system)
        const { apiKeyService } = await import('./api-key');
        const validation = await apiKeyService.validateBasicAuth(username, password);
        
        if (validation.valid && validation.scope?.includes('scim')) {
          return { valid: true, organizationId: validation.organizationId };
        }
      }

      return { valid: false };
    } catch (error) {
      console.error('[SCIM] Auth validation error:', error);
      return { valid: false };
    }
  }
}

export const scimService = new SCIMService();