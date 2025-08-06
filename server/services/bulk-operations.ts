/**
 * Bulk Operations Service
 * Handle bulk user invitations, imports, and management operations
 */

import { Request } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { EmailService } from './email';
import { auditLogService } from './audit-log';
import { organizationService } from './organization';

export interface BulkInvitation {
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  customMessage?: string;
  department?: string;
  jobTitle?: string;
}

export interface BulkImportUser {
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  role?: string;
  department?: string;
  jobTitle?: string;
  phone?: string;
  metadata?: Record<string, any>;
}

export interface BulkOperationResult {
  operationId: string;
  status: 'processing' | 'completed' | 'failed' | 'partial';
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    email?: string;
    error: string;
  }>;
  results: Array<{
    email: string;
    status: 'success' | 'error' | 'skipped';
    userId?: number;
    invitationId?: string;
    error?: string;
  }>;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
}

class BulkOperationsService {
  private operations: Map<string, BulkOperationResult> = new Map();
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  // Bulk invite users from CSV
  async bulkInviteUsers(data: {
    organizationId: number;
    adminUserId: number;
    csvContent: string;
    customTemplate?: string;
    req: Request;
  }): Promise<BulkOperationResult> {
    const operationId = this.generateOperationId();
    
    try {
      const invitations = this.parseInvitationCSV(data.csvContent);
      
      const operation: BulkOperationResult = {
        operationId,
        status: 'processing',
        total: invitations.length,
        successful: 0,
        failed: 0,
        errors: [],
        results: [],
        createdAt: new Date().toISOString()
      };

      this.operations.set(operationId, operation);

      // Process invitations asynchronously
      this.processInvitations(operation, invitations, data);

      return operation;
    } catch (error) {
      const operation: BulkOperationResult = {
        operationId,
        status: 'failed',
        total: 0,
        successful: 0,
        failed: 0,
        errors: [{ row: 0, error: error instanceof Error ? error.message : 'Unknown error' }],
        results: [],
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };

      this.operations.set(operationId, operation);
      return operation;
    }
  }

  // Bulk import users from CSV
  async bulkImportUsers(data: {
    organizationId: number;
    adminUserId: number;
    csvContent: string;
    sendWelcomeEmail?: boolean;
    req: Request;
  }): Promise<BulkOperationResult> {
    const operationId = this.generateOperationId();
    
    try {
      const users = this.parseUserCSV(data.csvContent);
      
      const operation: BulkOperationResult = {
        operationId,
        status: 'processing',
        total: users.length,
        successful: 0,
        failed: 0,
        errors: [],
        results: [],
        createdAt: new Date().toISOString()
      };

      this.operations.set(operationId, operation);

      // Process imports asynchronously
      this.processImports(operation, users, data);

      return operation;
    } catch (error) {
      const operation: BulkOperationResult = {
        operationId,
        status: 'failed',
        total: 0,
        successful: 0,
        failed: 0,
        errors: [{ row: 0, error: error instanceof Error ? error.message : 'Unknown error' }],
        results: [],
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };

      this.operations.set(operationId, operation);
      return operation;
    }
  }

  // Bulk update user roles
  async bulkUpdateRoles(data: {
    organizationId: number;
    adminUserId: number;
    updates: Array<{ userId: number; role: string }>;
    req: Request;
  }): Promise<BulkOperationResult> {
    const operationId = this.generateOperationId();
    
    const operation: BulkOperationResult = {
      operationId,
      status: 'processing',
      total: data.updates.length,
      successful: 0,
      failed: 0,
      errors: [],
      results: [],
      createdAt: new Date().toISOString()
    };

    this.operations.set(operationId, operation);

    try {
      for (const [index, update] of data.updates.entries()) {
        try {
          const user = await storage.getUser(update.userId);
          if (!user) {
            operation.failed++;
            operation.errors.push({
              row: index + 1,
              error: `User not found: ${update.userId}`
            });
            operation.results.push({
              email: `user-${update.userId}`,
              status: 'error',
              error: 'User not found'
            });
            continue;
          }

          // Check permissions
          const canUpdate = await organizationService.canUpdateUserRole(
            data.adminUserId,
            update.userId,
            update.role,
            data.organizationId
          );

          if (!canUpdate) {
            operation.failed++;
            operation.errors.push({
              row: index + 1,
              email: user.email,
              error: 'Insufficient permissions to update role'
            });
            operation.results.push({
              email: user.email,
              status: 'error',
              error: 'Insufficient permissions'
            });
            continue;
          }

          // Update role
          const updatedUser = await storage.updateUser(update.userId, {
            roles: [update.role]
          });

          // Log audit event
          await auditLogService.logUserManagement({
            adminUserId: data.adminUserId,
            targetUserId: update.userId,
            organizationId: data.organizationId,
            action: 'user_updated',
            before: { roles: user.roles },
            after: { roles: updatedUser.roles },
            req: data.req,
            metadata: { bulkOperation: operationId }
          });

          operation.successful++;
          operation.results.push({
            email: user.email,
            status: 'success',
            userId: user.id
          });

        } catch (error) {
          operation.failed++;
          operation.errors.push({
            row: index + 1,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          operation.results.push({
            email: `user-${update.userId}`,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      operation.status = operation.failed === 0 ? 'completed' : 'partial';
      operation.completedAt = new Date().toISOString();

    } catch (error) {
      operation.status = 'failed';
      operation.completedAt = new Date().toISOString();
      operation.errors.push({
        row: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    this.operations.set(operationId, operation);
    return operation;
  }

  // Bulk deactivate users
  async bulkDeactivateUsers(data: {
    organizationId: number;
    adminUserId: number;
    userIds: number[];
    req: Request;
  }): Promise<BulkOperationResult> {
    const operationId = this.generateOperationId();
    
    const operation: BulkOperationResult = {
      operationId,
      status: 'processing',
      total: data.userIds.length,
      successful: 0,
      failed: 0,
      errors: [],
      results: [],
      createdAt: new Date().toISOString()
    };

    this.operations.set(operationId, operation);

    try {
      for (const [index, userId] of data.userIds.entries()) {
        try {
          const user = await storage.getUser(userId);
          if (!user) {
            operation.failed++;
            operation.errors.push({
              row: index + 1,
              error: `User not found: ${userId}`
            });
            operation.results.push({
              email: `user-${userId}`,
              status: 'error',
              error: 'User not found'
            });
            continue;
          }

          // Deactivate user
          await storage.updateUser(userId, { isActive: false });

          // Log audit event
          await auditLogService.logUserManagement({
            adminUserId: data.adminUserId,
            targetUserId: userId,
            organizationId: data.organizationId,
            action: 'user_deactivated',
            before: { isActive: user.isActive },
            after: { isActive: false },
            req: data.req,
            metadata: { bulkOperation: operationId }
          });

          operation.successful++;
          operation.results.push({
            email: user.email,
            status: 'success',
            userId: user.id
          });

        } catch (error) {
          operation.failed++;
          operation.errors.push({
            row: index + 1,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          operation.results.push({
            email: `user-${userId}`,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      operation.status = operation.failed === 0 ? 'completed' : 'partial';
      operation.completedAt = new Date().toISOString();

    } catch (error) {
      operation.status = 'failed';
      operation.completedAt = new Date().toISOString();
      operation.errors.push({
        row: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    this.operations.set(operationId, operation);
    return operation;
  }

  // Get operation status
  getOperationStatus(operationId: string): BulkOperationResult | null {
    return this.operations.get(operationId) || null;
  }

  // Get user's operations
  getUserOperations(userId: number, organizationId?: number): BulkOperationResult[] {
    // For now, return all operations - in production would filter by user/org
    return Array.from(this.operations.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Generate CSV template for invitations
  generateInvitationTemplate(): string {
    const headers = [
      'email', 'firstName', 'lastName', 'role', 'department', 'jobTitle', 'customMessage'
    ];
    
    const sampleData = [
      ['john.doe@company.com', 'John', 'Doe', 'user', 'Engineering', 'Software Engineer', 'Welcome to the team!'],
      ['jane.smith@company.com', 'Jane', 'Smith', 'manager', 'Marketing', 'Marketing Manager', '']
    ];

    return [headers, ...sampleData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  // Generate CSV template for user import
  generateImportTemplate(): string {
    const headers = [
      'email', 'firstName', 'lastName', 'username', 'role', 'department', 'jobTitle', 'phone'
    ];
    
    const sampleData = [
      ['user1@company.com', 'User', 'One', 'user1', 'user', 'Sales', 'Sales Rep', '+1234567890'],
      ['user2@company.com', 'User', 'Two', 'user2', 'manager', 'Support', 'Support Manager', '+1234567891']
    ];

    return [headers, ...sampleData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  // Export operation results to CSV
  exportResults(operationId: string): string | null {
    const operation = this.operations.get(operationId);
    if (!operation) return null;

    const headers = ['Email', 'Status', 'User ID', 'Invitation ID', 'Error'];
    const rows = operation.results.map(result => [
      result.email,
      result.status,
      result.userId?.toString() || '',
      result.invitationId || '',
      result.error || ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  // Private helper methods
  private generateOperationId(): string {
    return `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private parseInvitationCSV(csvContent: string): BulkInvitation[] {
    const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length < 2) {
      throw new Error('CSV must contain a header row and at least one data row');
    }

    const headers = this.parseCSVRow(lines[0]).map(h => h.toLowerCase());
    const emailIndex = headers.indexOf('email');
    
    if (emailIndex === -1) {
      throw new Error('CSV must contain an "email" column');
    }

    const invitations: BulkInvitation[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = this.parseCSVRow(lines[i]);
      if (row.length === 0 || !row[emailIndex]) continue;

      const invitation: BulkInvitation = {
        email: row[emailIndex].trim(),
        firstName: this.getColumnValue(row, headers, 'firstname') || this.getColumnValue(row, headers, 'first_name'),
        lastName: this.getColumnValue(row, headers, 'lastname') || this.getColumnValue(row, headers, 'last_name'),
        role: this.getColumnValue(row, headers, 'role') || 'user',
        customMessage: this.getColumnValue(row, headers, 'custommessage') || this.getColumnValue(row, headers, 'custom_message'),
        department: this.getColumnValue(row, headers, 'department'),
        jobTitle: this.getColumnValue(row, headers, 'jobtitle') || this.getColumnValue(row, headers, 'job_title')
      };

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(invitation.email)) {
        throw new Error(`Invalid email address on row ${i + 1}: ${invitation.email}`);
      }

      invitations.push(invitation);
    }

    return invitations;
  }

  private parseUserCSV(csvContent: string): BulkImportUser[] {
    const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length < 2) {
      throw new Error('CSV must contain a header row and at least one data row');
    }

    const headers = this.parseCSVRow(lines[0]).map(h => h.toLowerCase());
    const emailIndex = headers.indexOf('email');
    const firstNameIndex = headers.indexOf('firstname') !== -1 ? headers.indexOf('firstname') : headers.indexOf('first_name');
    const lastNameIndex = headers.indexOf('lastname') !== -1 ? headers.indexOf('lastname') : headers.indexOf('last_name');
    
    if (emailIndex === -1) {
      throw new Error('CSV must contain an "email" column');
    }
    if (firstNameIndex === -1) {
      throw new Error('CSV must contain a "firstName" or "first_name" column');
    }
    if (lastNameIndex === -1) {
      throw new Error('CSV must contain a "lastName" or "last_name" column');
    }

    const users: BulkImportUser[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = this.parseCSVRow(lines[i]);
      if (row.length === 0 || !row[emailIndex] || !row[firstNameIndex] || !row[lastNameIndex]) continue;

      const user: BulkImportUser = {
        email: row[emailIndex].trim(),
        firstName: row[firstNameIndex].trim(),
        lastName: row[lastNameIndex].trim(),
        username: this.getColumnValue(row, headers, 'username'),
        role: this.getColumnValue(row, headers, 'role') || 'user',
        department: this.getColumnValue(row, headers, 'department'),
        jobTitle: this.getColumnValue(row, headers, 'jobtitle') || this.getColumnValue(row, headers, 'job_title'),
        phone: this.getColumnValue(row, headers, 'phone')
      };

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        throw new Error(`Invalid email address on row ${i + 1}: ${user.email}`);
      }

      users.push(user);
    }

    return users;
  }

  private parseCSVRow(row: string): string[] {
    // Simple CSV parser - in production would use proper CSV library
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private getColumnValue(row: string[], headers: string[], columnName: string): string | undefined {
    const index = headers.indexOf(columnName);
    return index !== -1 && row[index] ? row[index].trim() : undefined;
  }

  private async processInvitations(
    operation: BulkOperationResult,
    invitations: BulkInvitation[],
    data: {
      organizationId: number;
      adminUserId: number;
      customTemplate?: string;
      req: Request;
    }
  ): Promise<void> {
    try {
      for (const [index, invitation] of invitations.entries()) {
        try {
          // Check if user already exists
          const existingUser = await storage.getUserByEmail(invitation.email);
          if (existingUser) {
            operation.failed++;
            operation.errors.push({
              row: index + 1,
              email: invitation.email,
              error: 'User already exists'
            });
            operation.results.push({
              email: invitation.email,
              status: 'skipped',
              error: 'User already exists'
            });
            continue;
          }

          // Send invitation
          const invitationResult = await organizationService.inviteUser(
            data.organizationId,
            data.adminUserId,
            invitation.email,
            invitation.role || 'user',
            'free', // subscription tier
            data.req,
            {
              firstName: invitation.firstName,
              lastName: invitation.lastName,
              department: invitation.department,
              jobTitle: invitation.jobTitle,
              customMessage: invitation.customMessage,
              bulkOperation: operation.operationId
            }
          );

          if (invitationResult.success) {
            operation.successful++;
            operation.results.push({
              email: invitation.email,
              status: 'success',
              invitationId: invitationResult.invitation?.id
            });

            // Log audit event
            await auditLogService.logUserManagement({
              adminUserId: data.adminUserId,
              organizationId: data.organizationId,
              action: 'user_invited',
              req: data.req,
              metadata: {
                email: invitation.email,
                role: invitation.role,
                bulkOperation: operation.operationId
              }
            });
          } else {
            operation.failed++;
            operation.errors.push({
              row: index + 1,
              email: invitation.email,
              error: invitationResult.error || 'Invitation failed'
            });
            operation.results.push({
              email: invitation.email,
              status: 'error',
              error: invitationResult.error
            });
          }

        } catch (error) {
          operation.failed++;
          operation.errors.push({
            row: index + 1,
            email: invitation.email,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          operation.results.push({
            email: invitation.email,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }

        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      operation.status = operation.failed === 0 ? 'completed' : 'partial';
      operation.completedAt = new Date().toISOString();

    } catch (error) {
      operation.status = 'failed';
      operation.completedAt = new Date().toISOString();
      operation.errors.push({
        row: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    this.operations.set(operation.operationId, operation);
  }

  private async processImports(
    operation: BulkOperationResult,
    users: BulkImportUser[],
    data: {
      organizationId: number;
      adminUserId: number;
      sendWelcomeEmail?: boolean;
      req: Request;
    }
  ): Promise<void> {
    try {
      for (const [index, userData] of users.entries()) {
        try {
          // Check if user already exists
          const existingUser = await storage.getUserByEmail(userData.email);
          if (existingUser) {
            operation.failed++;
            operation.errors.push({
              row: index + 1,
              email: userData.email,
              error: 'User already exists'
            });
            operation.results.push({
              email: userData.email,
              status: 'skipped',
              error: 'User already exists'
            });
            continue;
          }

          // Create user
          const user = await storage.createUser({
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            username: userData.username,
            roles: [userData.role || 'user'],
            tenant: data.organizationId,
            isActive: true,
            emailVerified: false, // Will need to verify
            metadata: {
              department: userData.department,
              jobTitle: userData.jobTitle,
              phone: userData.phone,
              importedAt: new Date().toISOString(),
              bulkOperation: operation.operationId
            }
          });

          // Send welcome email if requested
          if (data.sendWelcomeEmail) {
            await this.emailService.sendWelcomeEmail({
              to: user.email,
              firstName: user.firstName,
              organizationName: 'Your Organization', // Would get from org service
              loginUrl: 'https://auth247.net/login'
            });
          }

          operation.successful++;
          operation.results.push({
            email: userData.email,
            status: 'success',
            userId: user.id
          });

          // Log audit event
          await auditLogService.logUserManagement({
            adminUserId: data.adminUserId,
            targetUserId: user.id,
            organizationId: data.organizationId,
            action: 'user_created',
            after: {
              email: user.email,
              roles: user.roles,
              imported: true
            },
            req: data.req,
            metadata: { bulkOperation: operation.operationId }
          });

        } catch (error) {
          operation.failed++;
          operation.errors.push({
            row: index + 1,
            email: userData.email,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          operation.results.push({
            email: userData.email,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }

        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      operation.status = operation.failed === 0 ? 'completed' : 'partial';
      operation.completedAt = new Date().toISOString();

    } catch (error) {
      operation.status = 'failed';
      operation.completedAt = new Date().toISOString();
      operation.errors.push({
        row: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    this.operations.set(operation.operationId, operation);
  }
}

export const bulkOperationsService = new BulkOperationsService();