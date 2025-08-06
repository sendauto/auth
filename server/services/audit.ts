import type { Request } from "express";
import type { InsertAuditLog, AuditLog } from "@shared/schema";
import { storage } from "../storage";

export interface AuditContext {
  userId?: number;
  tenantId?: number;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export class AuditLogger {
  private static instance: AuditLogger;

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  private extractContext(req: Request): AuditContext {
    return {
      userId: req.session?.userId,
      tenantId: req.session?.tenantId,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      sessionId: req.session?.sessionId,
    };
  }

  async logUserAction(
    req: Request,
    action: string,
    resource: string,
    resourceId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    const context = this.extractContext(req);
    
    const auditLog: InsertAuditLog = {
      userId: context.userId,
      tenantId: context.tenantId,
      action,
      resource,
      resourceId,
      details: details || {},
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    };

    try {
      await storage.createAuditLog(auditLog);
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw - audit failures shouldn't break the main operation
    }
  }

  async logSystemEvent(
    action: string,
    resource: string,
    details?: Record<string, any>,
    context?: Partial<AuditContext>
  ): Promise<void> {
    const auditLog: InsertAuditLog = {
      userId: context?.userId,
      tenantId: context?.tenantId,
      action,
      resource,
      details: details || {},
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    };

    try {
      await storage.createAuditLog(auditLog);
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  async logAuthEvent(
    req: Request,
    action: 'login' | 'logout' | 'login_attempt' | 'password_reset' | 'email_verification',
    success: boolean,
    details?: Record<string, any>
  ): Promise<void> {
    const context = this.extractContext(req);
    
    await this.logUserAction(
      req,
      action,
      'authentication',
      undefined,
      {
        success,
        ...details
      }
    );
  }

  async logDataAccess(
    req: Request,
    resource: string,
    resourceId: string,
    operation: 'read' | 'create' | 'update' | 'delete',
    details?: Record<string, any>
  ): Promise<void> {
    await this.logUserAction(
      req,
      `${operation}_${resource}`,
      resource,
      resourceId,
      details
    );
  }

  async logSecurityEvent(
    req: Request,
    eventType: 'rate_limit' | 'unauthorized_access' | 'permission_denied' | 'suspicious_activity',
    details?: Record<string, any>
  ): Promise<void> {
    const context = this.extractContext(req);
    
    await this.logSystemEvent(
      eventType,
      'security',
      {
        severity: this.getSecuritySeverity(eventType),
        ...details
      },
      context
    );
  }

  async logAdminAction(
    req: Request,
    action: string,
    targetResource: string,
    targetId?: string,
    changes?: Record<string, any>
  ): Promise<void> {
    await this.logUserAction(
      req,
      `admin_${action}`,
      targetResource,
      targetId,
      {
        changes,
        adminLevel: req.session?.user?.roles?.includes('super_admin') ? 'super_admin' : 'admin'
      }
    );
  }

  private getSecuritySeverity(eventType: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (eventType) {
      case 'rate_limit':
        return 'low';
      case 'unauthorized_access':
        return 'medium';
      case 'permission_denied':
        return 'medium';
      case 'suspicious_activity':
        return 'high';
      default:
        return 'medium';
    }
  }

  // Query methods for retrieving audit logs
  async getAuditLogs(
    tenantId?: number,
    userId?: number,
    limit: number = 100,
    offset: number = 0
  ): Promise<AuditLog[]> {
    return storage.getAuditLogs(tenantId, userId, limit);
  }

  async getSecurityEvents(
    tenantId?: number,
    severity?: string,
    limit: number = 50
  ): Promise<AuditLog[]> {
    const logs = await storage.getAuditLogs(tenantId, undefined, limit);
    return logs.filter(log => 
      log.resource === 'security' && 
      (!severity || log.details?.severity === severity)
    );
  }

  async getUserActivity(
    userId: number,
    dateFrom?: Date,
    dateTo?: Date,
    limit: number = 50
  ): Promise<AuditLog[]> {
    const logs = await storage.getAuditLogs(undefined, userId, limit);
    
    if (dateFrom || dateTo) {
      return logs.filter(log => {
        const logDate = new Date(log.createdAt);
        if (dateFrom && logDate < dateFrom) return false;
        if (dateTo && logDate > dateTo) return false;
        return true;
      });
    }
    
    return logs;
  }
}

// Middleware for automatic audit logging
export function auditMiddleware() {
  const auditLogger = AuditLogger.getInstance();
  
  return (req: any, res: any, next: any) => {
    // Store audit logger in request for easy access
    req.audit = auditLogger;
    
    // Log API requests for sensitive endpoints
    if (req.path.startsWith('/api/admin') || req.path.startsWith('/api/auth')) {
      auditLogger.logUserAction(
        req,
        `${req.method.toLowerCase()}_request`,
        'api',
        req.path,
        {
          query: req.query,
          userAgent: req.get('User-Agent'),
          referrer: req.get('Referrer')
        }
      );
    }
    
    next();
  };
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();