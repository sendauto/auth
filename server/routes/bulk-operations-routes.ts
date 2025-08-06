/**
 * Bulk Operations Routes
 * Enterprise bulk user management endpoints
 */

import express from 'express';
import { Request, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { bulkOperationsService } from '../services/bulk-operations';
import { requireAuth, requireManager, requireAdmin } from '../middleware/auth';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Rate limiting for bulk operations
const bulkRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 bulk operations per hour
  message: { error: 'Too many bulk operations' },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply auth and rate limiting
router.use(requireAuth());
router.use(bulkRateLimit);

// Bulk invite users
router.post('/invite', requireManager(), upload.single('csvFile'), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let csvContent: string;
    
    if (req.file) {
      // File upload
      csvContent = req.file.buffer.toString('utf-8');
    } else if (req.body.csvContent) {
      // Direct CSV content
      csvContent = req.body.csvContent;
    } else {
      return res.status(400).json({ error: 'CSV file or content required' });
    }

    const operation = await bulkOperationsService.bulkInviteUsers({
      organizationId: req.user.tenant,
      adminUserId: req.user.id,
      csvContent,
      customTemplate: req.body.customTemplate,
      req
    });

    res.json(operation);

  } catch (error) {
    console.error('[Bulk] Invite error:', error);
    res.status(500).json({ 
      error: 'Failed to process bulk invitations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Bulk import users
router.post('/import', requireAdmin(), upload.single('csvFile'), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let csvContent: string;
    
    if (req.file) {
      csvContent = req.file.buffer.toString('utf-8');
    } else if (req.body.csvContent) {
      csvContent = req.body.csvContent;
    } else {
      return res.status(400).json({ error: 'CSV file or content required' });
    }

    const sendWelcomeEmail = req.body.sendWelcomeEmail === 'true' || req.body.sendWelcomeEmail === true;

    const operation = await bulkOperationsService.bulkImportUsers({
      organizationId: req.user.tenant,
      adminUserId: req.user.id,
      csvContent,
      sendWelcomeEmail,
      req
    });

    res.json(operation);

  } catch (error) {
    console.error('[Bulk] Import error:', error);
    res.status(500).json({ 
      error: 'Failed to process bulk import',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Bulk update roles
router.post('/update-roles', requireAdmin(), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const updateSchema = z.object({
      updates: z.array(z.object({
        userId: z.number(),
        role: z.string()
      }))
    });

    const { updates } = updateSchema.parse(req.body);

    const operation = await bulkOperationsService.bulkUpdateRoles({
      organizationId: req.user.tenant,
      adminUserId: req.user.id,
      updates,
      req
    });

    res.json(operation);

  } catch (error) {
    console.error('[Bulk] Update roles error:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Invalid request data',
        details: error.errors
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to update roles',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

// Bulk deactivate users
router.post('/deactivate', requireAdmin(), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const deactivateSchema = z.object({
      userIds: z.array(z.number())
    });

    const { userIds } = deactivateSchema.parse(req.body);

    const operation = await bulkOperationsService.bulkDeactivateUsers({
      organizationId: req.user.tenant,
      adminUserId: req.user.id,
      userIds,
      req
    });

    res.json(operation);

  } catch (error) {
    console.error('[Bulk] Deactivate error:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Invalid request data',
        details: error.errors
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to deactivate users',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

// Get operation status
router.get('/operations/:id', requireManager(), async (req: Request, res: Response) => {
  try {
    const operationId = req.params.id;
    const operation = bulkOperationsService.getOperationStatus(operationId);

    if (!operation) {
      return res.status(404).json({ error: 'Operation not found' });
    }

    res.json(operation);

  } catch (error) {
    console.error('[Bulk] Get operation error:', error);
    res.status(500).json({ error: 'Failed to get operation status' });
  }
});

// List user operations
router.get('/operations', requireManager(), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const operations = bulkOperationsService.getUserOperations(req.user.id, req.user.tenant);
    res.json({ operations });

  } catch (error) {
    console.error('[Bulk] List operations error:', error);
    res.status(500).json({ error: 'Failed to list operations' });
  }
});

// Export operation results
router.get('/operations/:id/export', requireManager(), async (req: Request, res: Response) => {
  try {
    const operationId = req.params.id;
    const csvData = bulkOperationsService.exportResults(operationId);

    if (!csvData) {
      return res.status(404).json({ error: 'Operation not found' });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="bulk-operation-${operationId}-${timestamp}.csv"`);
    res.send(csvData);

  } catch (error) {
    console.error('[Bulk] Export error:', error);
    res.status(500).json({ error: 'Failed to export results' });
  }
});

// Get CSV templates
router.get('/templates/invitation', (req: Request, res: Response) => {
  try {
    const template = bulkOperationsService.generateInvitationTemplate();
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="invitation-template.csv"');
    res.send(template);

  } catch (error) {
    console.error('[Bulk] Template error:', error);
    res.status(500).json({ error: 'Failed to generate template' });
  }
});

router.get('/templates/import', (req: Request, res: Response) => {
  try {
    const template = bulkOperationsService.generateImportTemplate();
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="import-template.csv"');
    res.send(template);

  } catch (error) {
    console.error('[Bulk] Template error:', error);
    res.status(500).json({ error: 'Failed to generate template' });
  }
});

export default router;