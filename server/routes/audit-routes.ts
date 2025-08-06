/**
 * Audit Log API Routes
 * Enterprise-grade audit trail access and compliance reporting
 */

import express from 'express';
import { Request, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { auditLogService } from '../services/audit-log';
import { requireAuth, requireAdmin, requireManager } from '../middleware/auth';

const router = express.Router();

// Rate limiting for audit routes
const auditRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 minutes
  message: { error: 'Too many audit requests' },
  standardHeaders: true,
  legacyHeaders: false
});

// Query parameters schema
const AuditQuerySchema = z.object({
  organizationId: z.coerce.number().optional(),
  userId: z.coerce.number().optional(),
  eventTypes: z.string().optional().transform(str => str ? str.split(',') : undefined),
  categories: z.string().optional().transform(str => str ? str.split(',') : undefined),
  outcomes: z.string().optional().transform(str => str ? str.split(',') : undefined),
  severities: z.string().optional().transform(str => str ? str.split(',') : undefined),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  ipAddress: z.string().optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
  offset: z.coerce.number().min(0).default(0),
  sortBy: z.enum(['timestamp', 'severity', 'risk_score']).default('timestamp'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Apply rate limiting and auth to all routes
router.use(auditRateLimit);
router.use(requireAuth());

// Get audit events
router.get('/events', requireManager(), async (req: Request, res: Response) => {
  try {
    const query = AuditQuerySchema.parse(req.query);
    
    // Restrict to user's organization if not super admin
    if (!req.user?.roles.includes('super_admin')) {
      query.organizationId = req.user?.tenant;
    }
    
    const result = await auditLogService.queryEvents(query);
    
    res.json({
      events: result.events,
      pagination: {
        total: result.totalCount,
        limit: query.limit,
        offset: query.offset,
        hasMore: result.hasMore
      },
      query: {
        ...query,
        eventTypes: query.eventTypes?.join(','),
        categories: query.categories?.join(','),
        outcomes: query.outcomes?.join(','),
        severities: query.severities?.join(',')
      }
    });
    
  } catch (error) {
    console.error('[Audit] Query events error:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Invalid query parameters',
        details: error.errors
      });
    } else {
      res.status(500).json({ error: 'Failed to query audit events' });
    }
  }
});

// Get audit event by ID
router.get('/events/:id', requireManager(), async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    
    // Query for specific event
    const result = await auditLogService.queryEvents({
      limit: 1000000, // Large limit to search all events
      offset: 0
    });
    
    const event = result.events.find(e => e.id === eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Audit event not found' });
    }
    
    // Check organization access
    if (!req.user?.roles.includes('super_admin') && event.organizationId !== req.user?.tenant) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(event);
    
  } catch (error) {
    console.error('[Audit] Get event error:', error);
    res.status(500).json({ error: 'Failed to get audit event' });
  }
});

// Get audit statistics
router.get('/stats', requireManager(), async (req: Request, res: Response) => {
  try {
    const organizationId = req.user?.roles.includes('super_admin') 
      ? undefined 
      : req.user?.tenant;
    
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // Get events for different time periods
    const [last24hEvents, last7dEvents, last30dEvents] = await Promise.all([
      auditLogService.queryEvents({
        organizationId,
        startDate: last24h,
        limit: 10000
      }),
      auditLogService.queryEvents({
        organizationId,
        startDate: last7d,
        limit: 10000
      }),
      auditLogService.queryEvents({
        organizationId,
        startDate: last30d,
        limit: 10000
      })
    ]);
    
    // Calculate statistics
    const stats = {
      last24h: {
        total: last24hEvents.totalCount,
        successful: last24hEvents.events.filter(e => e.outcome === 'success').length,
        failed: last24hEvents.events.filter(e => e.outcome === 'failure').length,
        critical: last24hEvents.events.filter(e => e.severity === 'critical').length,
        high: last24hEvents.events.filter(e => e.severity === 'high').length
      },
      last7d: {
        total: last7dEvents.totalCount,
        successful: last7dEvents.events.filter(e => e.outcome === 'success').length,
        failed: last7dEvents.events.filter(e => e.outcome === 'failure').length,
        critical: last7dEvents.events.filter(e => e.severity === 'critical').length,
        high: last7dEvents.events.filter(e => e.severity === 'high').length
      },
      last30d: {
        total: last30dEvents.totalCount,
        successful: last30dEvents.events.filter(e => e.outcome === 'success').length,
        failed: last30dEvents.events.filter(e => e.outcome === 'failure').length,
        critical: last30dEvents.events.filter(e => e.severity === 'critical').length,
        high: last30dEvents.events.filter(e => e.severity === 'high').length
      },
      categories: {},
      topRisks: last7dEvents.events
        .sort((a, b) => b.risk.score - a.risk.score)
        .slice(0, 10)
        .map(e => ({
          id: e.id,
          eventType: e.eventType,
          description: e.details.description,
          riskScore: e.risk.score,
          timestamp: e.timestamp
        }))
    };
    
    // Calculate category distribution
    const categories: Record<string, number> = {};
    last30dEvents.events.forEach(event => {
      categories[event.eventCategory] = (categories[event.eventCategory] || 0) + 1;
    });
    stats.categories = categories;
    
    res.json(stats);
    
  } catch (error) {
    console.error('[Audit] Get stats error:', error);
    res.status(500).json({ error: 'Failed to get audit statistics' });
  }
});

// Get compliance report
router.get('/compliance/:regulation', requireAdmin(), async (req: Request, res: Response) => {
  try {
    const regulation = req.params.regulation.toUpperCase();
    const organizationId = req.user?.roles.includes('super_admin') 
      ? parseInt(req.query.organizationId as string) || req.user?.tenant
      : req.user?.tenant;
    
    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID required' });
    }
    
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date required' });
    }
    
    const report = await auditLogService.getComplianceReport(
      organizationId,
      regulation,
      startDate,
      endDate
    );
    
    res.json(report);
    
  } catch (error) {
    console.error('[Audit] Compliance report error:', error);
    res.status(500).json({ error: 'Failed to generate compliance report' });
  }
});

// Export audit data
router.post('/export', requireAdmin(), async (req: Request, res: Response) => {
  try {
    const { format = 'json', ...query } = req.body;
    
    // Validate format
    if (!['json', 'csv', 'pdf'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Supported: json, csv, pdf' });
    }
    
    // Restrict to user's organization if not super admin
    if (!req.user?.roles.includes('super_admin')) {
      query.organizationId = req.user?.tenant;
    }
    
    const result = await auditLogService.exportForCompliance(query, format);
    
    // Set appropriate content type and headers
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `audit-export-${timestamp}.${format}`;
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(result);
    } else if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(result);
    } else if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(result);
    }
    
    // Log the export event
    await auditLogService.logSecurity({
      userId: req.user?.id,
      organizationId: req.user?.tenant,
      action: 'suspicious_activity',
      severity: 'medium',
      threat: 'audit_data_export',
      req,
      metadata: {
        format,
        exportedBy: req.user?.email,
        queryParams: query
      }
    });
    
  } catch (error) {
    console.error('[Audit] Export error:', error);
    res.status(500).json({ error: 'Failed to export audit data' });
  }
});

// Get available event types
router.get('/event-types', requireManager(), (req: Request, res: Response) => {
  const eventTypes = [
    // Authentication events
    'auth.login',
    'auth.logout',
    'auth.login_failed',
    'auth.password_reset',
    'auth.mfa_challenge',
    'auth.mfa_success',
    'auth.mfa_failed',
    
    // Authorization events
    'authz.access_granted',
    'authz.access_denied',
    'authz.permission_check',
    'authz.role_assigned',
    'authz.role_removed',
    
    // User management events
    'user.user_created',
    'user.user_updated',
    'user.user_deleted',
    'user.user_invited',
    'user.user_activated',
    'user.user_deactivated',
    
    // Organization events
    'org.org_created',
    'org.org_updated',
    'org.org_deleted',
    'org.member_added',
    'org.member_removed',
    'org.role_changed',
    'org.sso_configured',
    
    // Security events
    'security.suspicious_activity',
    'security.rate_limit_exceeded',
    'security.invalid_token',
    'security.session_hijack',
    'security.brute_force',
    'security.geo_anomaly'
  ];
  
  const categories = [
    'authentication',
    'authorization',
    'user_management',
    'organization',
    'security',
    'system'
  ];
  
  const severities = ['low', 'medium', 'high', 'critical'];
  const outcomes = ['success', 'failure', 'pending'];
  
  res.json({
    eventTypes,
    categories,
    severities,
    outcomes
  });
});

// Search audit events (advanced search)
router.post('/search', requireManager(), async (req: Request, res: Response) => {
  try {
    const searchSchema = z.object({
      query: z.string().min(1),
      filters: AuditQuerySchema.omit({ limit: true, offset: true }).optional(),
      limit: z.number().min(1).max(1000).default(100),
      offset: z.number().min(0).default(0)
    });
    
    const { query: searchQuery, filters = {}, limit, offset } = searchSchema.parse(req.body);
    
    // Restrict to user's organization if not super admin
    if (!req.user?.roles.includes('super_admin')) {
      filters.organizationId = req.user?.tenant;
    }
    
    // Perform search - in production would use full-text search
    const result = await auditLogService.queryEvents({ ...filters, limit: 10000 });
    
    // Simple text search through descriptions
    const searchTerms = searchQuery.toLowerCase().split(' ');
    const filteredEvents = result.events.filter(event => {
      const searchText = [
        event.details.description,
        event.eventType,
        event.action,
        event.resource,
        event.context.ipAddress,
        JSON.stringify(event.details.metadata)
      ].join(' ').toLowerCase();
      
      return searchTerms.every(term => searchText.includes(term));
    });
    
    // Apply pagination
    const paginatedEvents = filteredEvents.slice(offset, offset + limit);
    
    res.json({
      events: paginatedEvents,
      pagination: {
        total: filteredEvents.length,
        limit,
        offset,
        hasMore: offset + limit < filteredEvents.length
      },
      query: searchQuery
    });
    
  } catch (error) {
    console.error('[Audit] Search error:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Invalid search parameters',
        details: error.errors
      });
    } else {
      res.status(500).json({ error: 'Search failed' });
    }
  }
});

export default router;