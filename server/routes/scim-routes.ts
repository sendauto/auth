/**
 * SCIM (System for Cross-domain Identity Management) Routes
 * Enterprise-grade user provisioning endpoints
 */

import express from 'express';
import { Request, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { scimService } from '../services/scim';
import { auditLogService } from '../services/audit-log';

const router = express.Router();

// SCIM-specific rate limiting
const scimRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes for SCIM
  message: {
    schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
    detail: 'Too many SCIM requests',
    status: '429'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// SCIM authentication middleware
async function scimAuth(req: Request, res: Response, next: Function) {
  try {
    const validation = await scimService.validateSCIMAuth(req);
    
    if (!validation.valid) {
      return res.status(401).json(scimService.createError(401, 'Authentication required'));
    }
    
    // Add organization context to request
    (req as any).scimOrganizationId = validation.organizationId;
    next();
  } catch (error) {
    console.error('[SCIM] Auth error:', error);
    res.status(500).json(scimService.createError(500, 'Authentication service error'));
  }
}

// Apply rate limiting and auth to all SCIM routes
router.use(scimRateLimit);
router.use(scimAuth);

// SCIM v2.0 Service Provider Configuration
router.get('/ServiceProviderConfig', (req: Request, res: Response) => {
  try {
    const config = scimService.getServiceProviderConfig();
    res.json(config);
  } catch (error) {
    console.error('[SCIM] ServiceProviderConfig error:', error);
    res.status(500).json(scimService.createError(500, 'Service provider configuration error'));
  }
});

// SCIM v2.0 Resource Types
router.get('/ResourceTypes', (req: Request, res: Response) => {
  try {
    const resourceTypes = scimService.getResourceTypes();
    res.json(resourceTypes);
  } catch (error) {
    console.error('[SCIM] ResourceTypes error:', error);
    res.status(500).json(scimService.createError(500, 'Resource types error'));
  }
});

// SCIM v2.0 Schemas
router.get('/Schemas', (req: Request, res: Response) => {
  try {
    const schemas = scimService.getSchemas();
    res.json(schemas);
  } catch (error) {
    console.error('[SCIM] Schemas error:', error);
    res.status(500).json(scimService.createError(500, 'Schemas error'));
  }
});

// Create user
router.post('/Users', async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).scimOrganizationId;
    
    // Validate SCIM user schema
    const userData = req.body;
    
    const user = await scimService.createUser(userData, organizationId);
    
    // Log audit event
    await auditLogService.logUserManagement({
      adminUserId: 0, // SCIM system user
      targetUserId: undefined,
      organizationId,
      action: 'user_created',
      after: { email: userData.emails?.[0]?.value, scim: true },
      req,
      metadata: { 
        scim: true,
        externalId: userData.id,
        source: 'scim_provisioning'
      }
    });
    
    res.status(201).json(user);
    
  } catch (error) {
    console.error('[SCIM] Create user error:', error);
    
    if (error instanceof Error && error.message.includes('already exists')) {
      res.status(409).json(scimService.createError(409, 'User already exists'));
    } else if (error instanceof Error && error.message.includes('validation')) {
      res.status(400).json(scimService.createError(400, error.message));
    } else {
      res.status(500).json(scimService.createError(500, 'Internal server error'));
    }
  }
});

// Get user
router.get('/Users/:id', async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).scimOrganizationId;
    const userId = req.params.id;
    
    const user = await scimService.getUser(userId, organizationId);
    res.json(user);
    
  } catch (error) {
    console.error('[SCIM] Get user error:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json(scimService.createError(404, 'User not found'));
    } else {
      res.status(500).json(scimService.createError(500, 'Internal server error'));
    }
  }
});

// List users
router.get('/Users', async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).scimOrganizationId;
    
    // Parse query parameters
    const startIndex = parseInt(req.query.startIndex as string) || 1;
    const count = parseInt(req.query.count as string) || 100;
    const filter = req.query.filter as string;
    
    const result = await scimService.listUsers(organizationId, {
      startIndex,
      count,
      filter
    });
    
    // Return SCIM ListResponse format
    res.json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults: result.totalResults,
      startIndex: result.startIndex,
      itemsPerPage: result.itemsPerPage,
      Resources: result.Resources
    });
    
  } catch (error) {
    console.error('[SCIM] List users error:', error);
    res.status(500).json(scimService.createError(500, 'Internal server error'));
  }
});

// Update user (PUT - full replacement)
router.put('/Users/:id', async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).scimOrganizationId;
    const userId = req.params.id;
    const userData = req.body;
    
    const user = await scimService.updateUser(userId, userData, organizationId);
    
    // Log audit event
    await auditLogService.logUserManagement({
      adminUserId: 0, // SCIM system user
      organizationId,
      action: 'user_updated',
      req,
      metadata: { 
        scim: true,
        externalId: userId,
        source: 'scim_provisioning'
      }
    });
    
    res.json(user);
    
  } catch (error) {
    console.error('[SCIM] Update user error:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json(scimService.createError(404, 'User not found'));
    } else if (error instanceof Error && error.message.includes('validation')) {
      res.status(400).json(scimService.createError(400, error.message));
    } else {
      res.status(500).json(scimService.createError(500, 'Internal server error'));
    }
  }
});

// Update user (PATCH - partial update)
router.patch('/Users/:id', async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).scimOrganizationId;
    const userId = req.params.id;
    
    // Parse PATCH operations
    const operations = req.body.Operations || [];
    
    // Convert PATCH operations to update data
    const updateData: any = {};
    
    for (const operation of operations) {
      if (operation.op === 'replace') {
        if (operation.path === 'active') {
          updateData.active = operation.value;
        } else if (operation.path === 'name.givenName') {
          updateData.name = updateData.name || {};
          updateData.name.givenName = operation.value;
        } else if (operation.path === 'name.familyName') {
          updateData.name = updateData.name || {};
          updateData.name.familyName = operation.value;
        }
      }
    }
    
    const user = await scimService.updateUser(userId, updateData, organizationId);
    
    // Log audit event
    await auditLogService.logUserManagement({
      adminUserId: 0, // SCIM system user
      organizationId,
      action: 'user_updated',
      req,
      metadata: { 
        scim: true,
        externalId: userId,
        source: 'scim_provisioning',
        patchOperations: operations
      }
    });
    
    res.json(user);
    
  } catch (error) {
    console.error('[SCIM] Patch user error:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json(scimService.createError(404, 'User not found'));
    } else if (error instanceof Error && error.message.includes('validation')) {
      res.status(400).json(scimService.createError(400, error.message));
    } else {
      res.status(500).json(scimService.createError(500, 'Internal server error'));
    }
  }
});

// Delete user (deactivate)
router.delete('/Users/:id', async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).scimOrganizationId;
    const userId = req.params.id;
    
    await scimService.deleteUser(userId, organizationId);
    
    // Log audit event
    await auditLogService.logUserManagement({
      adminUserId: 0, // SCIM system user
      organizationId,
      action: 'user_deactivated',
      req,
      metadata: { 
        scim: true,
        externalId: userId,
        source: 'scim_provisioning'
      }
    });
    
    res.status(204).send();
    
  } catch (error) {
    console.error('[SCIM] Delete user error:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json(scimService.createError(404, 'User not found'));
    } else {
      res.status(500).json(scimService.createError(500, 'Internal server error'));
    }
  }
});

// Groups endpoints (basic implementation)
router.get('/Groups', (req: Request, res: Response) => {
  res.json({
    schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
    totalResults: 0,
    startIndex: 1,
    itemsPerPage: 0,
    Resources: []
  });
});

router.post('/Groups', (req: Request, res: Response) => {
  res.status(501).json(scimService.createError(501, 'Groups not implemented'));
});

router.get('/Groups/:id', (req: Request, res: Response) => {
  res.status(404).json(scimService.createError(404, 'Group not found'));
});

router.put('/Groups/:id', (req: Request, res: Response) => {
  res.status(501).json(scimService.createError(501, 'Groups not implemented'));
});

router.patch('/Groups/:id', (req: Request, res: Response) => {
  res.status(501).json(scimService.createError(501, 'Groups not implemented'));
});

router.delete('/Groups/:id', (req: Request, res: Response) => {
  res.status(501).json(scimService.createError(501, 'Groups not implemented'));
});

// Health check for SCIM service
router.get('/health', (req: Request, res: Response) => {
  res.json({
    service: 'Auth247 SCIM v2.0',
    status: 'healthy',
    version: '2.0',
    timestamp: new Date().toISOString()
  });
});

export default router;