import { subscriptions, subscriptionPlans, users, type User, type Subscription, type SubscriptionPlan, type InsertSubscription } from "@shared/schema";
import { db } from "../db";
import { eq, and, lt, desc } from "drizzle-orm";

export interface SubscriptionWithPlan extends Subscription {
  plan: SubscriptionPlan;
}

export interface SubscriptionLimits {
  maxUsers: number;
  maxApplications: number;
  storageLimit: number; // in GB
  apiRequestLimit: number; // per month
  features: Record<string, any>;
}

export class SubscriptionService {
  private static instance: SubscriptionService;

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  // Get default free plan
  async getFreePlan(): Promise<SubscriptionPlan> {
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.name, "free"))
      .limit(1);

    if (!plan) {
      // Create default free plan if it doesn't exist
      const [newPlan] = await db
        .insert(subscriptionPlans)
        .values({
          name: "free",
          displayName: "Free",
          description: "Free tier with basic features - up to 10 users",
          price: "0.00",
          currency: "USD",
          billingInterval: "monthly",
          planType: "free",
          trialDays: 0,
          features: {
            sso: true,
            support: true,
            analytics: true,
            customBranding: false,
            auditLogs: false,
            apiAccess: true
          },
          limits: {
            users: 10,
            applications: 2,
            storage: 1,
            apiRequests: 10000
          },
          sortOrder: 0
        })
        .returning();
      return newPlan;
    }

    return plan;
  }

  // Get trial plan (Professional plan for trial)
  async getTrialPlan(): Promise<SubscriptionPlan> {
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.name, "professional"))
      .limit(1);

    if (!plan) {
      // Create professional plan if it doesn't exist
      const [newPlan] = await db
        .insert(subscriptionPlans)
        .values({
          name: "professional",
          displayName: "Professional",
          description: "For growing teams that need advanced features",
          price: "35.00",
          currency: "USD",
          billingInterval: "monthly",
          planType: "paid",
          trialDays: 14,
          features: {
            sso: true,
            support: true,
            analytics: true,
            customBranding: true,
            auditLogs: true,
            apiAccess: true
          },
          limits: {
            users: 100,
            applications: 10,
            storage: 10,
            apiRequests: 100000
          },
          sortOrder: 1
        })
        .returning();
      return newPlan;
    }

    return plan;
  }

  // Create free subscription for new user
  async createFreeSubscription(userId: number): Promise<Subscription> {
    const freePlan = await this.getFreePlan();
    
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const [subscription] = await db
      .insert(subscriptions)
      .values({
        userId,
        planId: freePlan.id,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
        cancelAtPeriodEnd: false
      })
      .returning();

    return subscription;
  }

  // Start trial for user
  async startTrial(userId: number): Promise<Subscription> {
    // Check if user already used trial
    const existingTrial = await db
      .select()
      .from(subscriptions)
      .where(and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.trialUsed, true)
      ))
      .limit(1);

    if (existingTrial.length > 0) {
      throw new Error("Trial has already been used for this account");
    }

    const trialPlan = await this.getTrialPlan();
    
    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial

    // Cancel any existing subscription
    await this.cancelCurrentSubscription(userId);

    const [subscription] = await db
      .insert(subscriptions)
      .values({
        userId,
        planId: trialPlan.id,
        status: "trial",
        currentPeriodStart: trialStartDate,
        currentPeriodEnd: trialEndDate,
        trialEnd: trialEndDate,
        trialUsed: true,
        cancelAtPeriodEnd: false
      })
      .returning();

    return subscription;
  }

  // Get user's current subscription with plan
  async getUserSubscription(userId: number): Promise<SubscriptionWithPlan | null> {
    const result = await db
      .select()
      .from(subscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const [row] = result;
    return {
      ...row.subscriptions,
      plan: row.subscription_plans
    };
  }

  // Get subscription limits for user
  async getSubscriptionLimits(userId: number): Promise<SubscriptionLimits> {
    const subscription = await this.getUserSubscription(userId);
    
    if (!subscription) {
      // Default to free plan limits
      const freePlan = await this.getFreePlan();
      const limits = freePlan.limits as Record<string, number>;
      return {
        maxUsers: limits.users || 10,
        maxApplications: limits.applications || 2,
        storageLimit: limits.storage || 1,
        apiRequestLimit: limits.apiRequests || 10000,
        features: freePlan.features as Record<string, any> || {}
      };
    }

    const limits = subscription.plan.limits as Record<string, number>;
    return {
      maxUsers: limits.users || 10,
      maxApplications: limits.applications || 2,
      storageLimit: limits.storage || 1,
      apiRequestLimit: limits.apiRequests || 10000,
      features: subscription.plan.features as Record<string, any> || {}
    };
  }

  // Check if user can perform action based on subscription limits
  async canPerformAction(userId: number, action: string, currentCount: number): Promise<{ allowed: boolean; limit: number }> {
    const limits = await this.getSubscriptionLimits(userId);
    
    let limit = 0;
    switch (action) {
      case "create_user":
        limit = limits.maxUsers;
        break;
      case "create_application":
        limit = limits.maxApplications;
        break;
      case "api_request":
        limit = limits.apiRequestLimit;
        break;
      default:
        return { allowed: true, limit: -1 };
    }

    return {
      allowed: currentCount < limit,
      limit
    };
  }

  // Cancel current subscription
  async cancelCurrentSubscription(userId: number): Promise<void> {
    await db
      .update(subscriptions)
      .set({ 
        status: "canceled",
        cancelAtPeriodEnd: true
      })
      .where(eq(subscriptions.userId, userId));
  }

  // Process trial expiration and move to free plan
  async processTrialExpiration(userId: number): Promise<void> {
    const freePlan = await this.getFreePlan();
    
    // Update current subscription to expired and create new free subscription
    await db
      .update(subscriptions)
      .set({ status: "expired" })
      .where(and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "trial")
      ));

    // Create new free subscription
    await this.createFreeSubscription(userId);
  }

  // Process all trial expirations (scheduled task)
  async processTrialExpirations(): Promise<void> {
    const expiredTrials = await db
      .select()
      .from(subscriptions)
      .where(and(
        eq(subscriptions.status, "trial"),
        lt(subscriptions.trialEnd, new Date())
      ));

    for (const subscription of expiredTrials) {
      await this.processTrialExpiration(subscription.userId);
    }
  }

  // Get all subscription plans
  async getAllPlans(): Promise<SubscriptionPlan[]> {
    return await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.sortOrder);
  }

  // Initialize default subscription plans
  async initializeDefaultPlans(): Promise<void> {
    const existingPlans = await db.select().from(subscriptionPlans).limit(1);
    
    if (existingPlans.length > 0) {
      return; // Plans already exist
    }

    const defaultPlans = [
      {
        name: "free",
        displayName: "Free",
        description: "Perfect for getting started with basic authentication",
        price: "0.00",
        currency: "USD",
        billingInterval: "monthly",
        planType: "free",
        trialDays: 0,
        features: {
          sso: true,
          support: true,
          analytics: true,
          customBranding: false,
          auditLogs: false,
          apiAccess: true
        },
        limits: {
          users: 10,
          applications: 2,
          storage: 0.1, // 100MB
          apiRequests: 10000
        },
        sortOrder: 0
      },
      {
        name: "professional",
        displayName: "Professional",
        description: "For growing teams that need advanced features",
        price: "35.00",
        currency: "USD",
        billingInterval: "monthly",
        planType: "paid",
        trialDays: 14,
        features: {
          sso: true,
          support: true,
          analytics: true,
          customBranding: true,
          auditLogs: true,
          apiAccess: true
        },
        limits: {
          users: 100,
          applications: 10,
          storage: 0.5, // 500MB
          apiRequests: 100000
        },
        sortOrder: 1
      },
      {
        name: "professional",
        displayName: "Professional",
        description: "Ideal for growing organizations",
        price: "35.00",
        currency: "USD",
        billingInterval: "monthly",
        planType: "paid",
        trialDays: 14,
        features: {
          sso: true,
          support: true,
          analytics: true,
          customBranding: true,
          auditLogs: true,
          apiAccess: true
        },
        limits: {
          users: 2500,
          applications: 100,
          storage: 2, // 2GB
          apiRequests: 1000000
        },
        sortOrder: 2
      },
      {
        name: "enterprise",
        displayName: "Enterprise",
        description: "For large organizations with custom requirements",
        price: "105.00",
        currency: "USD", 
        billingInterval: "monthly",
        planType: "paid",
        trialDays: 0,
        features: {
          sso: true,
          support: true,
          analytics: true,
          customBranding: true,
          auditLogs: true,
          apiAccess: true,
          customIntegrations: true
        },
        limits: {
          users: -1, // Unlimited
          applications: -1, // Unlimited
          storage: 10, // 10GB
          apiRequests: -1 // Unlimited
        },
        sortOrder: 3
      }
    ];

    for (const plan of defaultPlans) {
      await db
        .insert(subscriptionPlans)
        .values(plan);
    }
  }
}

export const subscriptionService = SubscriptionService.getInstance();