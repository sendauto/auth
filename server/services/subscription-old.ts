import { db } from "../db";
import { subscriptions, subscriptionPlans, users, notifications, type User, type Subscription, type SubscriptionPlan, type InsertSubscription, type InsertNotification } from "@shared/schema";
import { eq, and, lte, gte, desc } from "drizzle-orm";
import { emailService } from "./email";

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
            storage: 1, // 1GB
            apiRequests: 10000 // 10k requests per month
          },
          sortOrder: 0
        })
        .returning();
      return newPlan;
    }

    return plan;
  }

  // Get trial plan
  async getTrialPlan(): Promise<SubscriptionPlan> {
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.name, "professional"))
      .limit(1);

    if (!plan) {
      throw new Error("Professional plan not found for trial");
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
    trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 days trial

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

    // Schedule trial expiration notification
    await this.scheduleTrialNotifications(userId, trialEndDate);

    // Send welcome email
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (user) {
      await emailService.sendEmail(
        user.email,
        "trial_started",
        {
          firstName: user.firstName || "User",
          planName: trialPlan.name,
          trialDays: "14",
          dashboardUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard`
        }
      );
    }

    return subscription;
  }

  // Get user's current subscription with plan details
  async getUserSubscription(userId: number): Promise<SubscriptionWithPlan | null> {
    const [result] = await db
      .select({
        subscription: subscriptions,
        plan: subscriptionPlans
      })
      .from(subscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    if (!result) return null;

    return {
      ...result.subscription,
      plan: result.plan
    };
  }

  // Get subscription limits for user
  async getSubscriptionLimits(userId: number): Promise<SubscriptionLimits> {
    const subscription = await this.getUserSubscription(userId);
    
    if (!subscription) {
      // Return free plan limits as default
      const freePlan = await this.getFreePlan();
      return {
        maxUsers: freePlan.maxUsers || 10,
        maxApplications: freePlan.maxApplications || 2,
        storageLimit: freePlan.storageLimit || 1,
        apiRequestLimit: freePlan.apiRequestLimit || 10000,
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

  // Check if user can perform action based on limits
  async canPerformAction(userId: number, action: string, currentCount: number): Promise<{ allowed: boolean; limit: number }> {
    const limits = await this.getSubscriptionLimits(userId);
    
    switch (action) {
      case "add_user":
        return {
          allowed: currentCount < limits.maxUsers,
          limit: limits.maxUsers
        };
      case "add_application":
        return {
          allowed: currentCount < limits.maxApplications,
          limit: limits.maxApplications
        };
      default:
        return { allowed: true, limit: 0 };
    }
  }

  // Cancel current subscription
  async cancelCurrentSubscription(userId: number): Promise<void> {
    await db
      .update(subscriptions)
      .set({
        status: "cancelled",
        autoRenew: false,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.userId, userId));
  }

  // Process trial expiration
  async processTrialExpiration(userId: number): Promise<void> {
    const freePlan = await this.getFreePlan();
    
    // Cancel trial subscription
    await this.cancelCurrentSubscription(userId);
    
    // Create free subscription
    await db
      .insert(subscriptions)
      .values({
        userId,
        planId: freePlan.id,
        status: "active",
        startDate: new Date(),
        autoRenew: false
      });

    // Notify user
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (user) {
      await this.createNotification(userId, {
        type: "trial_expired",
        title: "Trial Period Ended",
        message: "Your 14-day trial has ended. You've been moved to our Free plan with up to 10 users.",
        priority: "high"
      });

      await emailService.sendEmail(
        user.email,
        "trial_expired",
        {
          firstName: user.firstName || "User",
          dashboardUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard`,
          billingUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/subscription`
        }
      );
    }
  }

  // Schedule trial notifications
  private async scheduleTrialNotifications(userId: number, trialEndDate: Date): Promise<void> {
    const notifications = [
      {
        days: 7,
        type: "trial_reminder_7",
        title: "Trial Expires in 7 Days",
        message: "Your 14-day trial expires in 7 days. Upgrade now to continue using all features."
      },
      {
        days: 3,
        type: "trial_reminder_3", 
        title: "Trial Expires in 3 Days",
        message: "Your trial expires in 3 days. Don't lose access to premium features - upgrade today."
      },
      {
        days: 1,
        type: "trial_reminder_1",
        title: "Trial Expires Tomorrow",
        message: "Your trial expires tomorrow. Upgrade now to avoid interruption to your service."
      }
    ];

    for (const notification of notifications) {
      const notificationDate = new Date(trialEndDate);
      notificationDate.setDate(notificationDate.getDate() - notification.days);
      
      // In a real implementation, you'd use a job queue or cron job
      // For now, we'll create the notifications to be checked by a background process
      await this.createNotification(userId, {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: "medium",
        scheduledFor: notificationDate
      });
    }
  }

  // Create notification
  private async createNotification(userId: number, notification: {
    type: string;
    title: string;
    message: string;
    priority: string;
    scheduledFor?: Date;
  }): Promise<void> {
    await db.insert(notifications).values({
      userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      scheduledFor: notification.scheduledFor,
      isRead: false
    });
  }

  // Check and process trial expirations (to be called by a cron job)
  async processTrialExpirations(): Promise<void> {
    const now = new Date();
    
    const expiredTrials = await db
      .select()
      .from(subscriptions)
      .where(and(
        eq(subscriptions.status, "trial"),
        lte(subscriptions.trialEndDate, now)
      ));

    for (const trial of expiredTrials) {
      await this.processTrialExpiration(trial.userId);
    }
  }

  // Get all subscription plans for display
  async getAllPlans(): Promise<SubscriptionPlan[]> {
    return await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.price);
  }

  // Initialize default plans
  async initializeDefaultPlans(): Promise<void> {
    const existingPlans = await db.select().from(subscriptionPlans).limit(1);
    
    if (existingPlans.length === 0) {
      const defaultPlans = [
        {
          name: "Free",
          description: "Perfect for small teams getting started",
          price: "0.00",
          planType: "free" as const,
          maxUsers: 10,
          maxApplications: 2,
          storageLimit: 1,
          apiRequestLimit: 10000,
          features: {
            sso: ["google", "microsoft"],
            support: "email",
            analytics: "basic",
            uptime: "99%",
            customBranding: false,
            auditLogs: false
          }
        },
        {
          name: "Starter",
          description: "Perfect for small teams getting started",
          price: "14.00",
          planType: "paid" as const,
          maxUsers: 100,
          maxApplications: 5,
          storageLimit: 10,
          apiRequestLimit: 100000,
          trialDays: 14,
          features: {
            sso: ["google", "microsoft", "saml"],
            support: "email",
            analytics: "advanced",
            uptime: "99.9%",
            customBranding: false,
            auditLogs: true
          }
        },
        {
          name: "Professional",
          description: "Ideal for growing organizations",
          price: "35.00",
          planType: "paid" as const,
          maxUsers: 2500,
          maxApplications: 20,
          storageLimit: 50,
          apiRequestLimit: 1000000,
          trialDays: 14,
          features: {
            sso: ["google", "microsoft", "saml", "okta"],
            support: "priority",
            analytics: "advanced",
            uptime: "99.9%",
            customBranding: true,
            auditLogs: true,
            apiAccess: true
          }
        },
        {
          name: "Enterprise",
          description: "Advanced security for large enterprises",
          price: "105.00",
          planType: "paid" as const,
          maxUsers: null, // unlimited
          maxApplications: null, // unlimited
          storageLimit: null, // unlimited
          apiRequestLimit: null, // unlimited
          trialDays: 14,
          features: {
            sso: ["all"],
            support: "dedicated",
            analytics: "enterprise",
            uptime: "99.99%",
            customBranding: true,
            auditLogs: true,
            apiAccess: true,
            customDeployment: true,
            slaGuarantees: true
          }
        }
      ];

      await db.insert(subscriptionPlans).values(defaultPlans);
    }
  }
}

export const subscriptionService = SubscriptionService.getInstance();