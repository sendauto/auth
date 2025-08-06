/**
 * Comprehensive Audit Logging Service
 * Enterprise-grade audit trail for all authentication and authorization events
 */

import { Request } from 'express';

export interface AuditEvent {
  id: string;
  timestamp: string;
  organizationId?: number;
  userId?: number;
  sessionId?: string;
  eventType: string;
  eventCategory: 'authentication' | 'authorization' | 'user_management' | 'organization' | 'security' | 'system';
  action: string;
  resource: string;
  resourceId?: string;
  outcome: 'success' | 'failure' | 'pending';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: {
    description: string;
    metadata?: Record<string, any>;
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  context: {
    userAgent?: string;
    ipAddress: string;
    location?: {
      country?: string;
      region?: string;
      city?: string;
    };
    device?: {
      type?: string;
      os?: string;
      browser?: string;
    };
  };
  risk: {
    score: number; // 0-100
    factors: string[];
    verdict: 'low' | 'medium' | 'high' | 'critical';
  };
  compliance: {
    regulations: string[]; // GDPR, HIPAA, SOX, etc.
    retentionPeriod: number; // days
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  };
}

export interface AuditQuery {
  organizationId?: number;
  userId?: number;
  eventTypes?: string[];
  categories?: string[];
  outcomes?: string[];
  severities?: string[];
  startDate?: string;
  endDate?: string;
  ipAddress?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'severity' | 'risk_score';
  sortOrder?: 'asc' | 'desc';
}

class AuditLogService {
  private events: AuditEvent[] = [];

  // Log authentication events
  async logAuth(data: {
    userId?: number;
    organizationId?: number;
    sessionId?: string;
    action: 'login' | 'logout' | 'login_failed' | 'password_reset' | 'mfa_challenge' | 'mfa_success' | 'mfa_failed';
    email?: string;
    provider?: string;
    outcome: 'success' | 'failure';
    req: Request;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const event: AuditEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      organizationId: data.organizationId,
      userId: data.userId,
      sessionId: data.sessionId,
      eventType: `auth.${data.action}`,
      eventCategory: 'authentication',
      action: data.action,
      resource: 'user_session',
      resourceId: data.userId?.toString(),
      outcome: data.outcome,
      severity: this.calculateSeverity(data.action, data.outcome),
      details: {
        description: this.getAuthDescription(data.action, data.outcome, data.email),
        metadata: {
          provider: data.provider,
          email: data.email,
          ...data.metadata
        }
      },
      context: this.extractContext(data.req),
      risk: this.calculateRisk(data.action, data.outcome, data.req),
      compliance: {
        regulations: ['GDPR', 'CCPA'],
        retentionPeriod: 2555, // 7 years
        dataClassification: 'confidential'
      }
    };

    await this.storeEvent(event);
  }

  // Log authorization events
  async logAuthz(data: {
    userId: number;
    organizationId?: number;
    action: 'access_granted' | 'access_denied' | 'permission_check' | 'role_assigned' | 'role_removed';
    resource: string;
    resourceId?: string;
    permission?: string;
    role?: string;
    outcome: 'success' | 'failure';
    req: Request;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const event: AuditEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      organizationId: data.organizationId,
      userId: data.userId,
      eventType: `authz.${data.action}`,
      eventCategory: 'authorization',
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      outcome: data.outcome,
      severity: data.outcome === 'failure' ? 'medium' : 'low',
      details: {
        description: this.getAuthzDescription(data.action, data.resource, data.outcome),
        metadata: {
          permission: data.permission,
          role: data.role,
          ...data.metadata
        }
      },
      context: this.extractContext(data.req),
      risk: this.calculateRisk(data.action, data.outcome, data.req),
      compliance: {
        regulations: ['SOX', 'GDPR'],
        retentionPeriod: 2555,
        dataClassification: 'confidential'
      }
    };

    await this.storeEvent(event);
  }

  // Log user management events
  async logUserManagement(data: {
    adminUserId: number;
    targetUserId?: number;
    organizationId?: number;
    action: 'user_created' | 'user_updated' | 'user_deleted' | 'user_invited' | 'user_activated' | 'user_deactivated';
    before?: Record<string, any>;
    after?: Record<string, any>;
    req: Request;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const event: AuditEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      organizationId: data.organizationId,
      userId: data.adminUserId,
      eventType: `user.${data.action}`,
      eventCategory: 'user_management',
      action: data.action,
      resource: 'user',
      resourceId: data.targetUserId?.toString(),
      outcome: 'success',
      severity: this.getUserManagementSeverity(data.action),
      details: {
        description: this.getUserManagementDescription(data.action, data.targetUserId),
        metadata: data.metadata,
        before: data.before,
        after: data.after
      },
      context: this.extractContext(data.req),
      risk: this.calculateRisk(data.action, 'success', data.req),
      compliance: {
        regulations: ['GDPR', 'CCPA', 'HIPAA'],
        retentionPeriod: 2555,
        dataClassification: 'restricted'
      }
    };

    await this.storeEvent(event);
  }

  // Log organization events
  async logOrganization(data: {
    userId: number;
    organizationId?: number;
    action: 'org_created' | 'org_updated' | 'org_deleted' | 'member_added' | 'member_removed' | 'role_changed' | 'sso_configured';
    before?: Record<string, any>;
    after?: Record<string, any>;
    req: Request;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const event: AuditEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      organizationId: data.organizationId,
      userId: data.userId,
      eventType: `org.${data.action}`,
      eventCategory: 'organization',
      action: data.action,
      resource: 'organization',
      resourceId: data.organizationId?.toString(),
      outcome: 'success',
      severity: this.getOrgSeverity(data.action),
      details: {
        description: this.getOrgDescription(data.action),
        metadata: data.metadata,
        before: data.before,
        after: data.after
      },
      context: this.extractContext(data.req),
      risk: this.calculateRisk(data.action, 'success', data.req),
      compliance: {
        regulations: ['SOX', 'GDPR'],
        retentionPeriod: 2555,
        dataClassification: 'confidential'
      }
    };

    await this.storeEvent(event);
  }

  // Log security events
  async logSecurity(data: {
    userId?: number;
    organizationId?: number;
    action: 'suspicious_activity' | 'rate_limit_exceeded' | 'invalid_token' | 'session_hijack' | 'brute_force' | 'geo_anomaly';
    severity: 'low' | 'medium' | 'high' | 'critical';
    threat?: string;
    req: Request;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const event: AuditEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      organizationId: data.organizationId,
      userId: data.userId,
      eventType: `security.${data.action}`,
      eventCategory: 'security',
      action: data.action,
      resource: 'security_event',
      outcome: 'failure',
      severity: data.severity,
      details: {
        description: this.getSecurityDescription(data.action, data.threat),
        metadata: data.metadata
      },
      context: this.extractContext(data.req),
      risk: {
        score: this.getSecurityRiskScore(data.action, data.severity),
        factors: this.getSecurityRiskFactors(data.action, data.req),
        verdict: data.severity
      },
      compliance: {
        regulations: ['GDPR', 'CCPA', 'SOX', 'HIPAA'],
        retentionPeriod: 2555,
        dataClassification: 'restricted'
      }
    };

    await this.storeEvent(event);
  }

  // Query audit events
  async queryEvents(query: AuditQuery): Promise<{
    events: AuditEvent[];
    totalCount: number;
    hasMore: boolean;
  }> {
    let filteredEvents = this.events;

    // Apply filters
    if (query.organizationId) {
      filteredEvents = filteredEvents.filter(e => e.organizationId === query.organizationId);
    }

    if (query.userId) {
      filteredEvents = filteredEvents.filter(e => e.userId === query.userId);
    }

    if (query.eventTypes?.length) {
      filteredEvents = filteredEvents.filter(e => query.eventTypes!.includes(e.eventType));
    }

    if (query.categories?.length) {
      filteredEvents = filteredEvents.filter(e => query.categories!.includes(e.eventCategory));
    }

    if (query.outcomes?.length) {
      filteredEvents = filteredEvents.filter(e => query.outcomes!.includes(e.outcome));
    }

    if (query.severities?.length) {
      filteredEvents = filteredEvents.filter(e => query.severities!.includes(e.severity));
    }

    if (query.startDate) {
      filteredEvents = filteredEvents.filter(e => e.timestamp >= query.startDate!);
    }

    if (query.endDate) {
      filteredEvents = filteredEvents.filter(e => e.timestamp <= query.endDate!);
    }

    if (query.ipAddress) {
      filteredEvents = filteredEvents.filter(e => e.context.ipAddress === query.ipAddress);
    }

    // Sort
    const sortBy = query.sortBy || 'timestamp';
    const sortOrder = query.sortOrder || 'desc';
    
    filteredEvents.sort((a, b) => {
      let aVal: any = a[sortBy as keyof AuditEvent];
      let bVal: any = b[sortBy as keyof AuditEvent];
      
      if (sortBy === 'risk_score') {
        aVal = a.risk.score;
        bVal = b.risk.score;
      }
      
      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });

    // Paginate
    const limit = query.limit || 100;
    const offset = query.offset || 0;
    const paginatedEvents = filteredEvents.slice(offset, offset + limit);

    return {
      events: paginatedEvents,
      totalCount: filteredEvents.length,
      hasMore: offset + limit < filteredEvents.length
    };
  }

  // Get compliance report
  async getComplianceReport(organizationId: number, regulation: string, startDate: string, endDate: string): Promise<{
    regulation: string;
    period: { start: string; end: string };
    summary: {
      totalEvents: number;
      criticalEvents: number;
      failedEvents: number;
      complianceScore: number;
    };
    categories: Record<string, number>;
    riskDistribution: Record<string, number>;
    recommendations: string[];
  }> {
    const events = await this.queryEvents({
      organizationId,
      startDate,
      endDate
    });

    const relevantEvents = events.events.filter(e => 
      e.compliance.regulations.includes(regulation)
    );

    const criticalEvents = relevantEvents.filter(e => e.severity === 'critical').length;
    const failedEvents = relevantEvents.filter(e => e.outcome === 'failure').length;
    const complianceScore = Math.max(0, 100 - (criticalEvents * 10) - (failedEvents * 5));

    const categories: Record<string, number> = {};
    const riskDistribution: Record<string, number> = {};

    relevantEvents.forEach(event => {
      categories[event.eventCategory] = (categories[event.eventCategory] || 0) + 1;
      riskDistribution[event.risk.verdict] = (riskDistribution[event.risk.verdict] || 0) + 1;
    });

    const recommendations = this.generateComplianceRecommendations(
      regulation,
      complianceScore,
      criticalEvents,
      failedEvents
    );

    return {
      regulation,
      period: { start: startDate, end: endDate },
      summary: {
        totalEvents: relevantEvents.length,
        criticalEvents,
        failedEvents,
        complianceScore
      },
      categories,
      riskDistribution,
      recommendations
    };
  }

  // Generate export for compliance
  async exportForCompliance(query: AuditQuery, format: 'json' | 'csv' | 'pdf'): Promise<Buffer | string> {
    const result = await this.queryEvents(query);
    
    switch (format) {
      case 'json':
        return JSON.stringify({
          exportTime: new Date().toISOString(),
          query,
          totalEvents: result.totalCount,
          events: result.events
        }, null, 2);
        
      case 'csv':
        return this.generateCSV(result.events);
        
      case 'pdf':
        // Would integrate with PDF generation library
        return 'PDF export not implemented yet';
        
      default:
        throw new Error('Unsupported export format');
    }
  }

  // Private helper methods
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async storeEvent(event: AuditEvent): Promise<void> {
    // Store in memory for now - in production would store in database
    this.events.push(event);
    
    // Keep only last 100,000 events in memory
    if (this.events.length > 100000) {
      this.events = this.events.slice(-100000);
    }

    console.log(`[Audit] ${event.eventType}: ${event.details.description}`);
  }

  private extractContext(req: Request): AuditEvent['context'] {
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    return {
      userAgent,
      ipAddress,
      device: this.parseUserAgent(userAgent)
    };
  }

  private parseUserAgent(userAgent: string): { type?: string; os?: string; browser?: string } {
    // Simple user agent parsing - would use a proper library in production
    const device: any = {};
    
    if (userAgent.includes('Mobile')) device.type = 'mobile';
    else if (userAgent.includes('Tablet')) device.type = 'tablet';
    else device.type = 'desktop';
    
    if (userAgent.includes('Windows')) device.os = 'Windows';
    else if (userAgent.includes('Mac')) device.os = 'macOS';
    else if (userAgent.includes('Linux')) device.os = 'Linux';
    else if (userAgent.includes('Android')) device.os = 'Android';
    else if (userAgent.includes('iOS')) device.os = 'iOS';
    
    if (userAgent.includes('Chrome')) device.browser = 'Chrome';
    else if (userAgent.includes('Firefox')) device.browser = 'Firefox';
    else if (userAgent.includes('Safari')) device.browser = 'Safari';
    else if (userAgent.includes('Edge')) device.browser = 'Edge';

    return device;
  }

  private calculateRisk(action: string, outcome: string, req: Request): AuditEvent['risk'] {
    let score = 10; // Base score
    const factors: string[] = [];

    // Increase risk for failures
    if (outcome === 'failure') {
      score += 30;
      factors.push('Authentication failure');
    }

    // Increase risk for sensitive actions
    if (['user_deleted', 'org_deleted', 'sso_configured'].includes(action)) {
      score += 20;
      factors.push('Sensitive operation');
    }

    // Check for suspicious patterns
    const userAgent = req.headers['user-agent'] || '';
    if (!userAgent || userAgent.length < 10) {
      score += 15;
      factors.push('Suspicious user agent');
    }

    // Risk verdict
    let verdict: 'low' | 'medium' | 'high' | 'critical';
    if (score >= 80) verdict = 'critical';
    else if (score >= 60) verdict = 'high';
    else if (score >= 30) verdict = 'medium';
    else verdict = 'low';

    return { score: Math.min(100, score), factors, verdict };
  }

  private calculateSeverity(action: string, outcome: string): 'low' | 'medium' | 'high' | 'critical' {
    if (outcome === 'failure') {
      if (['login_failed', 'mfa_failed'].includes(action)) return 'medium';
      return 'high';
    }
    
    if (['password_reset', 'mfa_challenge'].includes(action)) return 'medium';
    return 'low';
  }

  private getAuthDescription(action: string, outcome: string, email?: string): string {
    const user = email ? ` for ${email}` : '';
    const result = outcome === 'success' ? 'successful' : 'failed';
    
    switch (action) {
      case 'login': return `User login ${result}${user}`;
      case 'logout': return `User logout${user}`;
      case 'login_failed': return `Failed login attempt${user}`;
      case 'password_reset': return `Password reset requested${user}`;
      case 'mfa_challenge': return `MFA challenge initiated${user}`;
      case 'mfa_success': return `MFA verification successful${user}`;
      case 'mfa_failed': return `MFA verification failed${user}`;
      default: return `Authentication event: ${action}${user}`;
    }
  }

  private getAuthzDescription(action: string, resource: string, outcome: string): string {
    const result = outcome === 'success' ? 'granted' : 'denied';
    return `Access ${result} to ${resource}`;
  }

  private getUserManagementDescription(action: string, targetUserId?: number): string {
    const target = targetUserId ? ` (ID: ${targetUserId})` : '';
    
    switch (action) {
      case 'user_created': return `User account created${target}`;
      case 'user_updated': return `User account updated${target}`;
      case 'user_deleted': return `User account deleted${target}`;
      case 'user_invited': return `User invitation sent${target}`;
      case 'user_activated': return `User account activated${target}`;
      case 'user_deactivated': return `User account deactivated${target}`;
      default: return `User management action: ${action}${target}`;
    }
  }

  private getOrgDescription(action: string): string {
    switch (action) {
      case 'org_created': return 'Organization created';
      case 'org_updated': return 'Organization updated';
      case 'org_deleted': return 'Organization deleted';
      case 'member_added': return 'Member added to organization';
      case 'member_removed': return 'Member removed from organization';
      case 'role_changed': return 'Member role changed';
      case 'sso_configured': return 'SSO configuration updated';
      default: return `Organization action: ${action}`;
    }
  }

  private getSecurityDescription(action: string, threat?: string): string {
    const threatInfo = threat ? ` (${threat})` : '';
    
    switch (action) {
      case 'suspicious_activity': return `Suspicious activity detected${threatInfo}`;
      case 'rate_limit_exceeded': return 'Rate limit exceeded';
      case 'invalid_token': return 'Invalid authentication token used';
      case 'session_hijack': return `Potential session hijacking detected${threatInfo}`;
      case 'brute_force': return 'Brute force attack detected';
      case 'geo_anomaly': return `Geographical login anomaly detected${threatInfo}`;
      default: return `Security event: ${action}${threatInfo}`;
    }
  }

  private getUserManagementSeverity(action: string): 'low' | 'medium' | 'high' | 'critical' {
    if (['user_deleted'].includes(action)) return 'critical';
    if (['user_created', 'user_deactivated'].includes(action)) return 'high';
    if (['user_updated', 'user_invited'].includes(action)) return 'medium';
    return 'low';
  }

  private getOrgSeverity(action: string): 'low' | 'medium' | 'high' | 'critical' {
    if (['org_deleted'].includes(action)) return 'critical';
    if (['org_created', 'sso_configured'].includes(action)) return 'high';
    if (['member_removed', 'role_changed'].includes(action)) return 'medium';
    return 'low';
  }

  private getSecurityRiskScore(action: string, severity: string): number {
    const baseScores = {
      'suspicious_activity': 60,
      'rate_limit_exceeded': 40,
      'invalid_token': 50,
      'session_hijack': 90,
      'brute_force': 80,
      'geo_anomaly': 70
    };

    const severityMultipliers = {
      'low': 0.5,
      'medium': 1,
      'high': 1.5,
      'critical': 2
    };

    const baseScore = baseScores[action as keyof typeof baseScores] || 50;
    const multiplier = severityMultipliers[severity as keyof typeof severityMultipliers] || 1;

    return Math.min(100, Math.round(baseScore * multiplier));
  }

  private getSecurityRiskFactors(action: string, req: Request): string[] {
    const factors = [action];
    
    const userAgent = req.headers['user-agent'] || '';
    if (!userAgent) factors.push('No user agent');
    if (userAgent.includes('bot')) factors.push('Bot user agent');
    
    return factors;
  }

  private generateComplianceRecommendations(
    regulation: string,
    score: number,
    criticalEvents: number,
    failedEvents: number
  ): string[] {
    const recommendations: string[] = [];

    if (score < 80) {
      recommendations.push('Improve overall security posture to meet compliance requirements');
    }

    if (criticalEvents > 0) {
      recommendations.push('Investigate and remediate all critical security events');
    }

    if (failedEvents > 10) {
      recommendations.push('Review and strengthen authentication mechanisms');
    }

    if (regulation === 'GDPR') {
      recommendations.push('Ensure data processing activities are documented and lawful');
      recommendations.push('Review data retention policies and implement automated deletion');
    }

    if (regulation === 'HIPAA') {
      recommendations.push('Verify PHI access controls are properly implemented');
      recommendations.push('Conduct regular security risk assessments');
    }

    return recommendations;
  }

  private generateCSV(events: AuditEvent[]): string {
    const headers = [
      'ID', 'Timestamp', 'Event Type', 'Category', 'Action', 'Resource',
      'Outcome', 'Severity', 'User ID', 'Organization ID', 'IP Address',
      'Risk Score', 'Description'
    ];

    const rows = events.map(event => [
      event.id,
      event.timestamp,
      event.eventType,
      event.eventCategory,
      event.action,
      event.resource,
      event.outcome,
      event.severity,
      event.userId || '',
      event.organizationId || '',
      event.context.ipAddress,
      event.risk.score,
      event.details.description
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }
}

export const auditLogService = new AuditLogService();