/**
 * Bulk Operations Service - Enterprise admin efficiency
 * Handle bulk user operations like import, export, provisioning
 */

import { Request, Response } from 'express';
import { storage } from '../storage';

interface BulkUserData {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organization: string;
  department?: string;
}

interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: Array<{ row: number; error: string; email: string }>;
  duplicates: string[];
}

export class BulkOperationsService {
  /**
   * Import users from CSV data
   */
  async importUsers(csvData: string): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: [],
      duplicates: []
    };

    try {
      // Parse CSV data
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Validate required headers
      const requiredFields = ['email', 'firstname', 'lastname', 'role'];
      const missingFields = requiredFields.filter(field => !headers.includes(field));
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Process each user row
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const userData: any = {};
        
        headers.forEach((header, index) => {
          userData[header] = values[index] || '';
        });

        try {
          // Check for existing user
          const existingUser = await storage.getUserByEmail(userData.email);
          if (existingUser) {
            result.duplicates.push(userData.email);
            continue;
          }

          // Create user
          await storage.createUser({
            email: userData.email,
            firstName: userData.firstname,
            lastName: userData.lastname,
            role: userData.role,
            organization: userData.organization || 'Default',
            department: userData.department,
            isActive: true,
            emailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date()
          });

          result.processed++;
        } catch (error) {
          result.failed++;
          result.errors.push({
            row: i + 1,
            error: error.message,
            email: userData.email
          });
        }
      }

      result.success = result.errors.length === 0;
      return result;

    } catch (error) {
      return {
        success: false,
        processed: 0,
        failed: 0,
        errors: [{ row: 0, error: error.message, email: '' }],
        duplicates: []
      };
    }
  }

  /**
   * Export users to CSV format
   */
  async exportUsers(filters?: any): Promise<string> {
    try {
      const users = await storage.getAllUsers(filters);
      
      // CSV headers
      const headers = [
        'Email',
        'First Name',
        'Last Name',
        'Role',
        'Organization',
        'Department',
        'Status',
        'Last Login',
        'Created Date'
      ];

      // Convert users to CSV rows
      const rows = users.map(user => [
        user.email,
        user.firstName,
        user.lastName,
        user.role,
        user.organization || '',
        user.department || '',
        user.isActive ? 'Active' : 'Inactive',
        user.lastLoginAt ? user.lastLoginAt.toISOString() : 'Never',
        user.createdAt.toISOString()
      ]);

      // Combine headers and rows
      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      return csvContent;

    } catch (error) {
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  /**
   * Bulk update user roles
   */
  async bulkUpdateRoles(userIds: string[], newRole: string): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: [],
      duplicates: []
    };

    for (const userId of userIds) {
      try {
        await storage.updateUser(userId, { role: newRole });
        result.processed++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: 0,
          error: error.message,
          email: userId
        });
      }
    }

    result.success = result.errors.length === 0;
    return result;
  }

  /**
   * Bulk activate/deactivate users
   */
  async bulkToggleStatus(userIds: string[], isActive: boolean): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: [],
      duplicates: []
    };

    for (const userId of userIds) {
      try {
        await storage.updateUser(userId, { isActive });
        result.processed++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: 0,
          error: error.message,
          email: userId
        });
      }
    }

    result.success = result.errors.length === 0;
    return result;
  }

  /**
   * Bulk delete users
   */
  async bulkDeleteUsers(userIds: string[]): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: [],
      duplicates: []
    };

    for (const userId of userIds) {
      try {
        await storage.deleteUser(userId);
        result.processed++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: 0,
          error: error.message,
          email: userId
        });
      }
    }

    result.success = result.errors.length === 0;
    return result;
  }
}

export const bulkOperationsService = new BulkOperationsService();

// API Routes
export function registerBulkOperationsRoutes(app: any) {
  // Import users from CSV
  app.post('/api/bulk/import-users', async (req: Request, res: Response) => {
    try {
      const { csvData } = req.body;
      
      if (!csvData) {
        return res.status(400).json({ error: 'CSV data is required' });
      }

      const result = await bulkOperationsService.importUsers(csvData);
      res.json(result);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Export users to CSV
  app.get('/api/bulk/export-users', async (req: Request, res: Response) => {
    try {
      const filters = req.query;
      const csvData = await bulkOperationsService.exportUsers(filters);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users-export.csv');
      res.send(csvData);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk update roles
  app.post('/api/bulk/update-roles', async (req: Request, res: Response) => {
    try {
      const { userIds, newRole } = req.body;
      
      if (!userIds || !Array.isArray(userIds) || !newRole) {
        return res.status(400).json({ error: 'User IDs array and new role are required' });
      }

      const result = await bulkOperationsService.bulkUpdateRoles(userIds, newRole);
      res.json(result);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk toggle user status
  app.post('/api/bulk/toggle-status', async (req: Request, res: Response) => {
    try {
      const { userIds, isActive } = req.body;
      
      if (!userIds || !Array.isArray(userIds) || typeof isActive !== 'boolean') {
        return res.status(400).json({ error: 'User IDs array and status are required' });
      }

      const result = await bulkOperationsService.bulkToggleStatus(userIds, isActive);
      res.json(result);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk delete users
  app.delete('/api/bulk/delete-users', async (req: Request, res: Response) => {
    try {
      const { userIds } = req.body;
      
      if (!userIds || !Array.isArray(userIds)) {
        return res.status(400).json({ error: 'User IDs array is required' });
      }

      const result = await bulkOperationsService.bulkDeleteUsers(userIds);
      res.json(result);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get bulk operation template
  app.get('/api/bulk/import-template', (req: Request, res: Response) => {
    const template = `email,firstname,lastname,role,organization,department
john.doe@company.com,John,Doe,user,"Acme Corp",Engineering
jane.smith@company.com,Jane,Smith,manager,"Acme Corp",Marketing
admin@company.com,Admin,User,admin,"Acme Corp",IT`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=user-import-template.csv');
    res.send(template);
  });
}