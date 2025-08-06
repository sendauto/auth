/**
 * Auth247 Viral Growth Engine
 * Implements viral mechanisms, SSO integrations, and growth tracking
 */

import { storage } from '../storage';
import { db } from '../db';
import { eq, and, gte, desc, count } from 'drizzle-orm';

export interface ViralMetrics {
  viralCoefficient: number;
  timeToValue: number;
  trialToPaidConversion: number;
  networkEffectValue: number;
  enterprisePenetration: {
    individual: number;
    team: number;
    organization: number;
  };
}

export interface InvitationData {
  inviterId: string;
  inviteeEmail: string;
  organizationDomain: string;
  invitationType: 'team' | 'sso_setup' | 'app_sharing' | 'security_review';
  source: 'dashboard' | 'sso_setup' | 'security_feature' | 'collaboration';
}

export interface SSOSetupData {
  organizationDomain: string;
  provider: 'google' | 'microsoft' | 'github' | 'okta' | 'custom_saml';
  setupTime: number; // milliseconds
  userId: string;
  success: boolean;
}

class ViralGrowthEngine {
  private metrics: ViralMetrics;
  private invitations: Map<string, InvitationData[]>;
  private ssoSetups: Map<string, SSOSetupData[]>;

  constructor() {
    this.metrics = {
      viralCoefficient: 0,
      timeToValue: 0,
      trialToPaidConversion: 0,
      networkEffectValue: 0,
      enterprisePenetration: {
        individual: 0,
        team: 0,
        organization: 0
      }
    };
    this.invitations = new Map();
    this.ssoSetups = new Map();
  }

  /**
   * Track viral invitation sent
   */
  async trackInvitation(data: InvitationData): Promise<void> {
    const domain = data.organizationDomain;
    const existing = this.invitations.get(domain) || [];
    existing.push({
      ...data,
      timestamp: new Date().toISOString()
    } as any);
    this.invitations.set(domain, existing);

    // Store in database for persistence
    try {
      await db.insert(viralInvitations).values({
        inviterId: data.inviterId,
        inviteeEmail: data.inviteeEmail,
        organizationDomain: data.organizationDomain,
        invitationType: data.invitationType,
        source: data.source,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Failed to store viral invitation:', error);
    }
  }

  /**
   * Track SSO setup completion
   */
  async trackSSOSetup(data: SSOSetupData): Promise<void> {
    const domain = data.organizationDomain;
    const existing = this.ssoSetups.get(domain) || [];
    existing.push({
      ...data,
      timestamp: new Date().toISOString()
    } as any);
    this.ssoSetups.set(domain, existing);

    // Calculate time to value
    if (data.success && data.setupTime < 300000) { // Under 5 minutes
      await this.recordTimeToValue(data.setupTime);
    }

    // Track viral SSO effect
    if (data.success) {
      await this.triggerSSOViralLoop(data);
    }
  }

  /**
   * Calculate current viral coefficient
   */
  async calculateViralCoefficient(): Promise<number> {
    try {
      // Get total invitations sent in last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const invitationCount = await db.select({ count: count() })
        .from(viralInvitations)
        .where(gte(viralInvitations.createdAt, thirtyDaysAgo));

      // Get total active users in last 30 days
      const activeUsers = await db.select({ count: count() })
        .from(users)
        .where(and(
          gte(users.lastLogin, thirtyDaysAgo),
          eq(users.isActive, true)
        ));

      const invites = invitationCount[0]?.count || 0;
      const users = activeUsers[0]?.count || 1;
      
      // Simplified viral coefficient: invites per user
      const coefficient = invites / users;
      this.metrics.viralCoefficient = coefficient;
      
      return coefficient;
    } catch (error) {
      console.error('Failed to calculate viral coefficient:', error);
      return 0;
    }
  }

  /**
   * Trigger viral loop when SSO is successfully set up
   */
  private async triggerSSOViralLoop(ssoData: SSOSetupData): Promise<void> {
    // Auto-discover team members from same domain
    const domainUsers = await this.discoverTeamMembers(ssoData.organizationDomain);
    
    // Send smart invitations to discovered team members
    for (const userEmail of domainUsers) {
      await this.trackInvitation({
        inviterId: ssoData.userId,
        inviteeEmail: userEmail,
        organizationDomain: ssoData.organizationDomain,
        invitationType: 'sso_setup',
        source: 'sso_setup'
      });
    }

    // Create viral authentication branding opportunity
    await this.createViralBranding(ssoData.organizationDomain);
  }

  /**
   * Discover potential team members from email domain
   */
  private async discoverTeamMembers(domain: string): Promise<string[]> {
    // In production, this would integrate with directory services
    // For now, simulate smart discovery
    const commonEmails = [
      `admin@${domain}`,
      `it@${domain}`,
      `security@${domain}`,
      `tech@${domain}`,
      `dev@${domain}`,
      `engineering@${domain}`
    ];

    return commonEmails.filter(email => {
      // Only suggest if not already a user
      return !this.isExistingUser(email);
    });
  }

  /**
   * Create viral branding opportunities
   */
  private async createViralBranding(domain: string): Promise<void> {
    // Generate branded elements for viral exposure
    const brandingConfig = {
      domain,
      loginBadge: `Secured by Auth247`,
      securityIndicator: `Protected by Auth247`,
      developerAttribution: `Powered by Auth247`,
      customDomain: `auth.${domain}`,
      brandedLoginUrl: `https://auth247.net/login?org=${domain}`
    };

    // Store branding config for the domain
    try {
      await db.insert(viralBranding).values({
        domain,
        config: brandingConfig,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Failed to create viral branding:', error);
    }
  }

  /**
   * Record time to value metric
   */
  private async recordTimeToValue(setupTime: number): Promise<void> {
    // Track average time to value
    const currentAvg = this.metrics.timeToValue;
    const newAvg = currentAvg === 0 ? setupTime : (currentAvg + setupTime) / 2;
    this.metrics.timeToValue = newAvg;
  }

  /**
   * Check if email is already a user
   */
  private async isExistingUser(email: string): Promise<boolean> {
    try {
      const user = await storage.getUserByEmail(email);
      return !!user;
    } catch {
      return false;
    }
  }

  /**
   * Generate viral growth dashboard data
   */
  async getViralDashboard(): Promise<any> {
    const coefficient = await this.calculateViralCoefficient();
    
    return {
      metrics: {
        ...this.metrics,
        viralCoefficient: coefficient
      },
      recentInvitations: Array.from(this.invitations.values()).flat().slice(-10),
      recentSSOSetups: Array.from(this.ssoSetups.values()).flat().slice(-10),
      recommendations: await this.generateGrowthRecommendations(),
      antiSSOTaxSavings: await this.calculateSSOTaxSavings()
    };
  }

  /**
   * Generate growth recommendations
   */
  private async generateGrowthRecommendations(): Promise<string[]> {
    const recommendations = [];
    
    if (this.metrics.viralCoefficient < 1.0) {
      recommendations.push('Increase viral coefficient by improving invitation flows');
    }
    
    if (this.metrics.timeToValue > 300000) { // > 5 minutes
      recommendations.push('Optimize SSO setup time - target under 5 minutes');
    }
    
    recommendations.push('Implement team discovery for enterprise domains');
    recommendations.push('Add viral branding to all authentication flows');
    
    return recommendations;
  }

  /**
   * Calculate SSO tax savings for marketing
   */
  private async calculateSSOTaxSavings(): Promise<any> {
    // Industry average SSO upcharge is 2-4x base price
    const basePrice = 9; // Auth247 base price
    const competitorSSO = basePrice * 3; // 3x upcharge
    const auth247SSO = basePrice; // No upcharge
    
    return {
      competitorPrice: competitorSSO,
      auth247Price: auth247SSO,
      monthlySavings: competitorSSO - auth247SSO,
      annualSavings: (competitorSSO - auth247SSO) * 12,
      percentageSavings: ((competitorSSO - auth247SSO) / competitorSSO * 100).toFixed(1)
    };
  }

  /**
   * Track enterprise penetration progression
   */
  async trackEnterprisePenetration(domain: string, stage: 'individual' | 'team' | 'organization'): Promise<void> {
    try {
      const existing = await db.select()
        .from(enterprisePenetration)
        .where(eq(enterprisePenetration.domain, domain));

      if (existing.length > 0) {
        await db.update(enterprisePenetration)
          .set({ 
            stage,
            updatedAt: new Date()
          })
          .where(eq(enterprisePenetration.domain, domain));
      } else {
        await db.insert(enterprisePenetration).values({
          domain,
          stage,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Failed to track enterprise penetration:', error);
    }
  }
}

// Database schema additions for viral tracking
import { pgTable, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';

export const viralInvitations = pgTable('viral_invitations', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  inviterId: text('inviter_id').notNull(),
  inviteeEmail: text('invitee_email').notNull(),
  organizationDomain: text('organization_domain').notNull(),
  invitationType: text('invitation_type').notNull(),
  source: text('source').notNull(),
  accepted: timestamp('accepted'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const viralBranding = pgTable('viral_branding', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  domain: text('domain').notNull().unique(),
  config: jsonb('config').$type<Record<string, any>>().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const enterprisePenetration = pgTable('enterprise_penetration', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  domain: text('domain').notNull().unique(),
  stage: text('stage').notNull(), // 'individual' | 'team' | 'organization'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const viralGrowthEngine = new ViralGrowthEngine();