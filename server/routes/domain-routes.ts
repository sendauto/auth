/**
 * Domain Verification Routes
 * Smart domain verification and management endpoints
 */

import express from 'express';
import { Request, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { domainVerificationService } from '../services/domain-verification';
import { requireAuth, requireManager, requireAdmin } from '../middleware/auth';
import { auditLogService } from '../services/audit-log';
import multer from 'multer';

const router = express.Router();

// Configure multer for CSV uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Rate limiting
const domainRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: { error: 'Too many domain requests' },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply auth and rate limiting
router.use(requireAuth());
router.use(domainRateLimit);

// Add domain for verification
router.post('/add', requireManager(), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const addDomainSchema = z.object({
      domain: z.string().min(1),
      autoEnrollment: z.boolean().optional(),
      allowSubdomains: z.boolean().optional(),
      verificationMethod: z.enum(['dns_txt', 'dns_cname', 'file_upload', 'meta_tag']).optional()
    });

    const data = addDomainSchema.parse(req.body);

    const verifiedDomain = await domainVerificationService.addDomain({
      organizationId: req.user.tenant,
      ...data
    });

    // Log audit event
    await auditLogService.logOrganization({
      userId: req.user.id,
      organizationId: req.user.tenant,
      action: 'org_updated',
      after: { domainAdded: data.domain },
      req,
      metadata: { 
        domain: data.domain,
        verificationMethod: data.verificationMethod
      }
    });

    res.json(verifiedDomain);

  } catch (error) {
    console.error('[Domain] Add error:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Invalid request data',
        details: error.errors
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to add domain',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

// Verify domain
router.post('/verify', requireManager(), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const verifySchema = z.object({
      domain: z.string().min(1)
    });

    const { domain } = verifySchema.parse(req.body);

    const result = await domainVerificationService.verifyDomain(req.user.tenant, domain);

    if (result.success) {
      // Log audit event
      await auditLogService.logOrganization({
        userId: req.user.id,
        organizationId: req.user.tenant,
        action: 'org_updated',
        after: { domainVerified: domain },
        req,
        metadata: { domain }
      });
    }

    res.json(result);

  } catch (error) {
    console.error('[Domain] Verify error:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Invalid request data',
        details: error.errors
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to verify domain',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

// Get organization domains
router.get('/list', requireManager(), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const domains = domainVerificationService.getOrganizationDomains(req.user.tenant);
    res.json({ domains });

  } catch (error) {
    console.error('[Domain] List error:', error);
    res.status(500).json({ error: 'Failed to get domains' });
  }
});

// Remove domain
router.delete('/:domain', requireAdmin(), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const domain = decodeURIComponent(req.params.domain);
    const success = await domainVerificationService.removeDomain(req.user.tenant, domain);

    if (!success) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    // Log audit event
    await auditLogService.logOrganization({
      userId: req.user.id,
      organizationId: req.user.tenant,
      action: 'org_updated',
      before: { domain },
      req,
      metadata: { domainRemoved: domain }
    });

    res.json({ success: true });

  } catch (error) {
    console.error('[Domain] Remove error:', error);
    res.status(500).json({ error: 'Failed to remove domain' });
  }
});

// Bulk upload domains
router.post('/bulk-upload', requireAdmin(), upload.single('csvFile'), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'CSV file required' });
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const result = await domainVerificationService.bulkUploadDomains(req.user.tenant, csvContent);

    // Log audit event
    await auditLogService.logOrganization({
      userId: req.user.id,
      organizationId: req.user.tenant,
      action: 'org_updated',
      after: { bulkDomainsUploaded: result.success },
      req,
      metadata: { 
        successful: result.success,
        failed: result.failed,
        totalDomains: result.success + result.failed
      }
    });

    res.json(result);

  } catch (error) {
    console.error('[Domain] Bulk upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload domains',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get verification instructions
router.get('/:domain/instructions', requireManager(), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const domain = decodeURIComponent(req.params.domain);
    const instructions = domainVerificationService.getVerificationInstructions(req.user.tenant, domain);

    if (!instructions) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    res.json(instructions);

  } catch (error) {
    console.error('[Domain] Instructions error:', error);
    res.status(500).json({ error: 'Failed to get verification instructions' });
  }
});

// Check domain match for email
router.post('/check-match', async (req: Request, res: Response) => {
  try {
    const checkSchema = z.object({
      email: z.string().email()
    });

    const { email } = checkSchema.parse(req.body);
    const match = domainVerificationService.findMatchingDomain(email);

    res.json({ 
      match: !!match,
      domain: match?.domain,
      organizationId: match?.organizationId,
      autoEnrollment: match?.autoEnrollment,
      exact: match?.exact
    });

  } catch (error) {
    console.error('[Domain] Check match error:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Invalid email format',
        details: error.errors
      });
    } else {
      res.status(500).json({ error: 'Failed to check domain match' });
    }
  }
});

// Get domain CSV template
router.get('/template/csv', (req: Request, res: Response) => {
  try {
    const template = `domain,autoEnrollment,allowSubdomains
example.com,true,true
company.org,false,false`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="domain-template.csv"');
    res.send(template);

  } catch (error) {
    console.error('[Domain] Template error:', error);
    res.status(500).json({ error: 'Failed to generate template' });
  }
});

export default router;