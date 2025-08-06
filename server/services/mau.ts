/**
 * Monthly Active Users (MAU) Service
 * Handles MAU calculation, tracking, and billing integration
 */

import { Request } from 'express';
import { users, userActivity, mauSnapshots, tenants, subscriptions } from '@shared/schema';
import { and, gte, lte, eq, desc, sql, count, countDistinct } from 'drizzle-orm';

interface MAUCalculationResult {
  tenantId: number;
  mauCount: number;
  periodStart: Date;
  periodEnd: Date;
  billingPeriod: string;
  usersList: Array<{
    userId: number;
    email: string;
    lastActivity: Date;
    activityCount: number;
  }>;
}

interface MAUBillingData {
  tenantId: number;
  mauCount: number;
  pricePerUser: number;
  totalAmount: number;
  billingPeriod: string;
  previousMauCount?: number;
  mauChange?: number;
}

export class MAUService {
  /**
   * Track user activity for MAU calculation
   */
  static async trackActivity(
    userId: number, 
    tenantId: number, 
    activityType: string, 
    req?: Request,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const { db } = await import('../db');
      
      await db.insert(userActivity).values({
        userId,
        tenantId,
        activityType,
        timestamp: new Date(),
        metadata: metadata || {},
        ipAddress: req?.ip,
        userAgent: req?.get('User-Agent'),
      });
    } catch (error) {
      console.error('Error tracking user activity:', error);
      // Don't throw - activity tracking should be non-blocking
    }
  }

  /**
   * Calculate MAU for a specific tenant and period
   */
  static async calculateMAU(
    tenantId: number, 
    periodStart: Date, 
    periodEnd: Date
  ): Promise<MAUCalculationResult> {
    const { db } = await import('../db');

    // Get unique active users in the period with their activity details
    const activeUsers = await db
      .select({
        userId: userActivity.userId,
        email: users.email,
        lastActivity: sql<Date>`MAX(${userActivity.timestamp})`.as('lastActivity'),
        activityCount: sql<number>`COUNT(*)`.as('activityCount'),
      })
      .from(userActivity)
      .innerJoin(users, eq(userActivity.userId, users.id))
      .where(
        and(
          eq(userActivity.tenantId, tenantId),
          gte(userActivity.timestamp, periodStart),
          lte(userActivity.timestamp, periodEnd),
          eq(users.isActive, true)
        )
      )
      .groupBy(userActivity.userId, users.email);

    const billingPeriod = `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, '0')}`;

    return {
      tenantId,
      mauCount: activeUsers.length,
      periodStart,
      periodEnd,
      billingPeriod,
      usersList: activeUsers.map(user => ({
        userId: user.userId,
        email: user.email,
        lastActivity: user.lastActivity,
        activityCount: Number(user.activityCount),
      })),
    };
  }

  /**
   * Calculate MAU for current billing period
   */
  static async calculateCurrentMAU(tenantId: number): Promise<MAUCalculationResult> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59); // Last day of current month

    return this.calculateMAU(tenantId, periodStart, periodEnd);
  }

  /**
   * Calculate MAU for previous billing period
   */
  static async calculatePreviousMAU(tenantId: number): Promise<MAUCalculationResult> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1); // First day of previous month
    const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59); // Last day of previous month

    return this.calculateMAU(tenantId, periodStart, periodEnd);
  }

  /**
   * Save MAU snapshot for billing purposes
   */
  static async saveMauSnapshot(mauResult: MAUCalculationResult): Promise<void> {
    const { db } = await import('../db');

    // Check if snapshot already exists for this period
    const existingSnapshot = await db
      .select()
      .from(mauSnapshots)
      .where(
        and(
          eq(mauSnapshots.tenantId, mauResult.tenantId),
          eq(mauSnapshots.billingPeriod, mauResult.billingPeriod)
        )
      )
      .limit(1);

    if (existingSnapshot.length > 0) {
      // Update existing snapshot
      await db
        .update(mauSnapshots)
        .set({
          mauCount: mauResult.mauCount,
          calculationPeriodStart: mauResult.periodStart,
          calculationPeriodEnd: mauResult.periodEnd,
          metadata: {
            usersList: mauResult.usersList,
            lastUpdated: new Date().toISOString(),
          },
        })
        .where(eq(mauSnapshots.id, existingSnapshot[0].id));
    } else {
      // Create new snapshot
      await db.insert(mauSnapshots).values({
        tenantId: mauResult.tenantId,
        mauCount: mauResult.mauCount,
        calculationPeriodStart: mauResult.periodStart,
        calculationPeriodEnd: mauResult.periodEnd,
        billingPeriod: mauResult.billingPeriod,
        metadata: {
          usersList: mauResult.usersList,
          createdAt: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * Get MAU billing data for a tenant
   */
  static async getMauBillingData(tenantId: number, billingPeriod?: string): Promise<MAUBillingData | null> {
    const { db } = await import('../db');
    const { pricingConfig } = await import('@shared/schema');

    // Get pricing configuration
    const [config] = await db.select().from(pricingConfig).limit(1);
    const pricePerUser = config ? parseFloat(config.pricePerUser) : 0.89;

    // If no specific billing period, use current month
    const targetPeriod = billingPeriod || (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    })();

    // Get MAU snapshot for the period
    const [snapshot] = await db
      .select()
      .from(mauSnapshots)
      .where(
        and(
          eq(mauSnapshots.tenantId, tenantId),
          eq(mauSnapshots.billingPeriod, targetPeriod)
        )
      )
      .limit(1);

    if (!snapshot) {
      return null;
    }

    // Get previous month's MAU for comparison
    const [prevYear, prevMonth] = targetPeriod.split('-').map(Number);
    const previousDate = new Date(prevYear, prevMonth - 2); // Go back one month
    const previousPeriod = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, '0')}`;

    const [prevSnapshot] = await db
      .select()
      .from(mauSnapshots)
      .where(
        and(
          eq(mauSnapshots.tenantId, tenantId),
          eq(mauSnapshots.billingPeriod, previousPeriod)
        )
      )
      .limit(1);

    const previousMauCount = prevSnapshot?.mauCount || 0;
    const mauChange = snapshot.mauCount - previousMauCount;

    return {
      tenantId,
      mauCount: snapshot.mauCount,
      pricePerUser,
      totalAmount: snapshot.mauCount * pricePerUser,
      billingPeriod: targetPeriod,
      previousMauCount,
      mauChange,
    };
  }

  /**
   * Update subscription with latest MAU count
   */
  static async updateSubscriptionMau(tenantId: number, mauCount: number): Promise<void> {
    const { db } = await import('../db');

    await db
      .update(subscriptions)
      .set({
        lastMauCount: mauCount,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.tenantId, tenantId));
  }

  /**
   * Get MAU trends and analytics for a tenant
   */
  static async getMauAnalytics(tenantId: number, months: number = 6): Promise<Array<{
    billingPeriod: string;
    mauCount: number;
    periodStart: Date;
    periodEnd: Date;
    growth: number | null;
  }>> {
    const { db } = await import('../db');

    const snapshots = await db
      .select()
      .from(mauSnapshots)
      .where(eq(mauSnapshots.tenantId, tenantId))
      .orderBy(desc(mauSnapshots.billingPeriod))
      .limit(months);

    return snapshots.map((snapshot, index) => {
      const nextSnapshot = snapshots[index + 1];
      const growth = nextSnapshot 
        ? ((snapshot.mauCount - nextSnapshot.mauCount) / nextSnapshot.mauCount) * 100 
        : null;

      return {
        billingPeriod: snapshot.billingPeriod,
        mauCount: snapshot.mauCount,
        periodStart: snapshot.calculationPeriodStart,
        periodEnd: snapshot.calculationPeriodEnd,
        growth,
      };
    });
  }

  /**
   * Run MAU calculation and update billing for all tenants
   * Should be run as a scheduled job (e.g., monthly on the 1st)
   */
  static async runMonthlyMauCalculation(): Promise<Array<{
    tenantId: number;
    mauCount: number;
    billingAmount: number;
    error?: string;
  }>> {
    const { db } = await import('../db');
    const results: Array<{
      tenantId: number;
      mauCount: number;
      billingAmount: number;
      error?: string;
    }> = [];

    try {
      // Get all active tenants
      const activeTenants = await db
        .select({ id: tenants.id, name: tenants.name })
        .from(tenants)
        .where(eq(tenants.isActive, true));

      const { pricingConfig } = await import('@shared/schema');
      const [config] = await db.select().from(pricingConfig).limit(1);
      const pricePerUser = config ? parseFloat(config.pricePerUser) : 0.89;

      for (const tenant of activeTenants) {
        try {
          // Calculate MAU for previous month (the month we're billing for)
          const mauResult = await this.calculatePreviousMAU(tenant.id);
          
          // Save snapshot
          await this.saveMauSnapshot(mauResult);
          
          // Update subscription
          await this.updateSubscriptionMau(tenant.id, mauResult.mauCount);

          const billingAmount = mauResult.mauCount * pricePerUser;

          results.push({
            tenantId: tenant.id,
            mauCount: mauResult.mauCount,
            billingAmount,
          });

          console.log(`[MAU] Calculated for tenant ${tenant.id}: ${mauResult.mauCount} MAU, $${billingAmount}`);
        } catch (error) {
          console.error(`[MAU] Error calculating for tenant ${tenant.id}:`, error);
          results.push({
            tenantId: tenant.id,
            mauCount: 0,
            billingAmount: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    } catch (error) {
      console.error('[MAU] Error in monthly calculation:', error);
    }

    return results;
  }

  /**
   * Get real-time MAU for dashboard display
   */
  static async getCurrentMauForTenant(tenantId: number): Promise<{
    currentMau: number;
    projectedBilling: number;
    lastUpdated: Date;
  }> {
    const mauResult = await this.calculateCurrentMAU(tenantId);
    const { pricingConfig } = await import('@shared/schema');
    const { db } = await import('../db');
    
    const [config] = await db.select().from(pricingConfig).limit(1);
    const pricePerUser = config ? parseFloat(config.pricePerUser) : 0.89;

    return {
      currentMau: mauResult.mauCount,
      projectedBilling: mauResult.mauCount * pricePerUser,
      lastUpdated: new Date(),
    };
  }
}