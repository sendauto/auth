import Stripe from 'stripe';
import type { User, Subscription, InsertBillingTransaction } from '@shared/schema';
import { db } from '../db';
import { users, subscriptions, billingTransactions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { EmailService } from './email';

const emailService = new EmailService();

// Initialize Stripe client
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
    })
  : null;

export interface StripeCustomerData {
  email: string;
  name: string;
  metadata?: Record<string, string>;
}

export interface SubscriptionData {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
}

export class StripeService {
  private static instance: StripeService;

  static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  private ensureStripeClient(): Stripe {
    if (!stripe) {
      throw new Error('Stripe client not initialized. Please set STRIPE_SECRET_KEY environment variable.');
    }
    return stripe;
  }

  async createCustomer(customerData: StripeCustomerData): Promise<Stripe.Customer> {
    const stripe = this.ensureStripeClient();
    
    return await stripe.customers.create({
      email: customerData.email,
      name: customerData.name,
      metadata: customerData.metadata || {},
    });
  }

  async createSubscription(subscriptionData: SubscriptionData): Promise<Stripe.Subscription> {
    const stripe = this.ensureStripeClient();
    
    return await stripe.subscriptions.create({
      customer: subscriptionData.customerId,
      items: [{ price: subscriptionData.priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: subscriptionData.metadata || {},
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    customerId?: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.PaymentIntent> {
    const stripe = this.ensureStripeClient();
    
    return await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      metadata: metadata || {},
      automatic_payment_methods: { enabled: true },
    });
  }

  async updateSubscription(
    subscriptionId: string,
    updates: Partial<Stripe.SubscriptionUpdateParams>
  ): Promise<Stripe.Subscription> {
    const stripe = this.ensureStripeClient();
    
    return await stripe.subscriptions.update(subscriptionId, updates);
  }

  async cancelSubscription(subscriptionId: string, immediately: boolean = false): Promise<Stripe.Subscription> {
    const stripe = this.ensureStripeClient();
    
    if (immediately) {
      return await stripe.subscriptions.cancel(subscriptionId);
    } else {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    const stripe = this.ensureStripeClient();
    
    return await stripe.customers.retrieve(customerId) as Stripe.Customer;
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    const stripe = this.ensureStripeClient();
    
    return await stripe.subscriptions.retrieve(subscriptionId);
  }

  async createCheckoutSession(
    priceId: string,
    customerId: string,
    successUrl: string,
    cancelUrl: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Checkout.Session> {
    const stripe = this.ensureStripeClient();
    
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata || {},
    });
  }

  async createPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    const stripe = this.ensureStripeClient();
    
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  // Webhook handling
  async handleWebhook(payload: string, signature: string): Promise<void> {
    const stripe = this.ensureStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    await this.processWebhookEvent(event);
  }

  private async processWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    try {
      const customer = await this.getCustomer(subscription.customer as string);
      
      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, customer.email!));

      if (user) {
        // Update user with Stripe customer and subscription IDs
        await db
          .update(users)
          .set({
            stripeCustomerId: customer.id,
            stripeSubscriptionId: subscription.id,
          })
          .where(eq(users.id, user.id));

        // Update subscription record
        const [existingSubscription] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.tenantId, user.tenant === 'authmesh' ? 1 : 2));

        if (existingSubscription) {
          await db
            .update(subscriptions)
            .set({
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: customer.id,
              currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
              currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
              status: subscription.status === 'active' ? 'active' : 'inactive',
            })
            .where(eq(subscriptions.id, existingSubscription.id));
        }

        // Send confirmation email
        const planName = subscription.items.data[0]?.price?.nickname || 'Premium Plan';
        await emailService.sendSubscriptionConfirmation(
          user,
          planName,
          (subscription.items.data[0]?.price?.unit_amount || 0) / 100 + '',
          new Date((subscription as any).current_period_end * 1000).toLocaleDateString()
        );
      }
    } catch (error) {
      console.error('Error handling subscription created:', error);
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.stripeSubscriptionId, subscription.id));

      if (user) {
        // Update subscription status in database
        const [existingSubscription] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

        if (existingSubscription) {
          await db
            .update(subscriptions)
            .set({
              status: subscription.status === 'active' ? 'active' : 'inactive',
              currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
              currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
              cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
            })
            .where(eq(subscriptions.id, existingSubscription.id));
        }

        // If plan was upgraded, send notification
        if (subscription.status === 'active') {
          const planName = subscription.items.data[0]?.price?.nickname || 'Premium Plan';
          await emailService.sendPlanUpgrade(user, planName);
        }
      }
    } catch (error) {
      console.error('Error handling subscription updated:', error);
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.stripeSubscriptionId, subscription.id));

      if (user) {
        // Update subscription status
        const [existingSubscription] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

        if (existingSubscription) {
          await db
            .update(subscriptions)
            .set({
              status: 'canceled',
              cancelAtPeriodEnd: false,
            })
            .where(eq(subscriptions.id, existingSubscription.id));
        }

        // Clear Stripe IDs from user
        await db
          .update(users)
          .set({
            stripeSubscriptionId: null,
          })
          .where(eq(users.id, user.id));

        // Create notification
        await emailService.createNotification(
          user.id,
          'subscription_cancelled',
          'Subscription Cancelled',
          'Your subscription has been cancelled. You can reactivate it anytime.',
          '/subscription',
          'normal'
        );
      }
    } catch (error) {
      console.error('Error handling subscription deleted:', error);
    }
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    try {
      const customerId = invoice.customer as string;
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.stripeCustomerId, customerId));

      if (user) {
        // Record transaction
        const transaction: InsertBillingTransaction = {
          userId: user.id,
          tenantId: user.tenant === 'authmesh' ? 1 : 2,
          stripePaymentIntentId: (invoice as any).payment_intent as string,
          amount: ((invoice.amount_paid || 0) / 100).toString(),
          currency: invoice.currency,
          status: 'succeeded',
          description: invoice.description || 'Subscription payment',
          metadata: {
            invoiceId: invoice.id,
            subscriptionId: (invoice as any).subscription,
          },
        };

        await db.insert(billingTransactions).values(transaction);

        // Create success notification
        await emailService.createNotification(
          user.id,
          'payment_success',
          'Payment Received',
          `Payment of $${transaction.amount} has been processed successfully.`,
          '/subscription',
          'normal'
        );
      }
    } catch (error) {
      console.error('Error handling payment succeeded:', error);
    }
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    try {
      const customerId = invoice.customer as string;
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.stripeCustomerId, customerId));

      if (user) {
        // Record failed transaction
        const transaction: InsertBillingTransaction = {
          userId: user.id,
          tenantId: user.tenant === 'authmesh' ? 1 : 2,
          stripePaymentIntentId: invoice.payment_intent as string,
          amount: (invoice.amount_due || 0) / 100,
          currency: invoice.currency,
          status: 'failed',
          description: 'Failed subscription payment',
          metadata: {
            invoiceId: invoice.id,
            subscriptionId: invoice.subscription,
            failureReason: invoice.status_transitions?.finalized_at ? 'Payment failed' : 'Unknown',
          },
        };

        await db.insert(billingTransactions).values(transaction);

        // Send payment failed email
        await emailService.sendPaymentFailed(user, transaction.amount.toString());

        // Create urgent notification
        await emailService.createNotification(
          user.id,
          'payment_failed',
          'Payment Failed',
          `Payment of $${transaction.amount} failed. Please update your payment method.`,
          '/subscription',
          'urgent'
        );
      }
    } catch (error) {
      console.error('Error handling payment failed:', error);
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const customerId = paymentIntent.customer as string;
      if (!customerId) return;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.stripeCustomerId, customerId));

      if (user) {
        // Record one-time payment transaction
        const transaction: InsertBillingTransaction = {
          userId: user.id,
          tenantId: user.tenant === 'authmesh' ? 1 : 2,
          stripePaymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: 'succeeded',
          description: paymentIntent.description || 'One-time payment',
          metadata: {
            paymentIntentId: paymentIntent.id,
          },
        };

        await db.insert(billingTransactions).values(transaction);
      }
    } catch (error) {
      console.error('Error handling payment intent succeeded:', error);
    }
  }

  // Utility methods
  async getCustomerByEmail(email: string): Promise<Stripe.Customer | null> {
    const stripe = this.ensureStripeClient();
    
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });

    return customers.data.length > 0 ? customers.data[0] : null;
  }

  async getProductPrices(productId?: string): Promise<Stripe.Price[]> {
    const stripe = this.ensureStripeClient();
    
    const prices = await stripe.prices.list({
      active: true,
      product: productId,
      expand: ['data.product'],
    });

    return prices.data;
  }

  formatAmount(amount: number, currency: string = 'usd'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }
}

export const stripeService = StripeService.getInstance();