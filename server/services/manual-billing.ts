import type { User, InsertBillingTransaction, BillingTransaction } from '@shared/schema';
import { db } from '../db';
import { billingTransactions, users, subscriptions } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { emailService } from './email';

export interface ManualPaymentData {
  userId: number;
  amount: number;
  currency: string;
  description: string;
  paymentMethod: 'bank_transfer' | 'check' | 'cash' | 'wire_transfer';
  referenceNumber?: string;
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    routingNumber?: string;
    bankName?: string;
  };
  notes?: string;
}

export interface BankDepositInstructions {
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  swiftCode?: string;
  address: string;
  instructions: string[];
}

export class ManualBillingService {
  private static instance: ManualBillingService;

  static getInstance(): ManualBillingService {
    if (!ManualBillingService.instance) {
      ManualBillingService.instance = new ManualBillingService();
    }
    return ManualBillingService.instance;
  }

  // Bank deposit instructions for customers
  getBankDepositInstructions(): BankDepositInstructions {
    return {
      accountName: process.env.BANK_ACCOUNT_NAME || 'Auth247 Technologies LLC',
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || '****-****-1234',
      routingNumber: process.env.BANK_ROUTING_NUMBER || '123456789',
      bankName: process.env.BANK_NAME || 'First National Bank',
      swiftCode: process.env.BANK_SWIFT_CODE,
      address: process.env.BANK_ADDRESS || '123 Business Ave, City, ST 12345',
      instructions: [
        'Include your user ID in the transaction memo',
        'Email payment confirmation to billing@authmesh.com',
        'Processing typically takes 1-2 business days',
        'Include invoice number if applicable'
      ]
    };
  }

  // Record manual payment (admin function)
  async recordManualPayment(paymentData: ManualPaymentData): Promise<BillingTransaction> {
    const transaction: InsertBillingTransaction = {
      userId: paymentData.userId,
      tenantId: 1, // Default tenant
      amount: paymentData.amount.toString(),
      currency: paymentData.currency,
      status: 'completed',
      description: paymentData.description,
      metadata: {
        paymentMethod: paymentData.paymentMethod,
        referenceNumber: paymentData.referenceNumber,
        bankDetails: paymentData.bankDetails,
        notes: paymentData.notes,
        processedBy: 'manual',
        processedAt: new Date().toISOString()
      }
    };

    const [newTransaction] = await db
      .insert(billingTransactions)
      .values(transaction)
      .returning();

    // Get user for notifications
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, paymentData.userId));

    if (user) {
      // Send payment confirmation email
      await emailService.sendEmail(
        user.email,
        'payment_confirmation',
        {
          firstName: user.firstName,
          lastName: user.lastName,
          amount: paymentData.amount.toString(),
          paymentMethod: this.getPaymentMethodDisplay(paymentData.paymentMethod),
          referenceNumber: paymentData.referenceNumber || 'N/A',
          appName: 'AuthMesh'
        },
        user.id
      );

      // Create in-app notification
      await emailService.createNotification(
        user.id,
        'payment_received',
        'Payment Received',
        `Your payment of $${paymentData.amount} has been processed successfully.`,
        '/subscription',
        'normal',
        { transactionId: newTransaction.id }
      );
    }

    return newTransaction;
  }

  // Mark payment as pending (when customer submits bank transfer)
  async recordPendingPayment(
    userId: number,
    amount: number,
    planName: string,
    referenceNumber?: string
  ): Promise<BillingTransaction> {
    const transaction: InsertBillingTransaction = {
      userId,
      tenantId: 1,
      amount: amount.toString(),
      currency: 'usd',
      status: 'pending',
      description: `${planName} subscription payment`,
      metadata: {
        paymentMethod: 'bank_transfer',
        referenceNumber: referenceNumber,
        submittedAt: new Date().toISOString(),
        requiresVerification: true
      }
    };

    const [newTransaction] = await db
      .insert(billingTransactions)
      .values(transaction)
      .returning();

    // Get user for notifications
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (user) {
      // Send confirmation that payment is being processed
      await emailService.sendEmail(
        user.email,
        'payment_pending',
        {
          firstName: user.firstName,
          lastName: user.lastName,
          amount: amount.toString(),
          referenceNumber: referenceNumber || 'N/A',
          planName,
          appName: 'AuthMesh'
        },
        user.id
      );

      // Create in-app notification
      await emailService.createNotification(
        userId,
        'payment_pending',
        'Payment Submitted',
        `Your bank transfer of $${amount} is being processed. You'll be notified once confirmed.`,
        '/subscription',
        'normal',
        { transactionId: newTransaction.id }
      );
    }

    return newTransaction;
  }

  // Get user's transaction history
  async getUserTransactions(userId: number, limit: number = 20): Promise<BillingTransaction[]> {
    return db
      .select()
      .from(billingTransactions)
      .where(eq(billingTransactions.userId, userId))
      .orderBy(desc(billingTransactions.createdAt))
      .limit(limit);
  }

  // Get pending payments for admin review
  async getPendingPayments(limit: number = 50): Promise<(BillingTransaction & { user: User })[]> {
    const pendingTransactions = await db
      .select({
        transaction: billingTransactions,
        user: users
      })
      .from(billingTransactions)
      .innerJoin(users, eq(billingTransactions.userId, users.id))
      .where(eq(billingTransactions.status, 'pending'))
      .orderBy(desc(billingTransactions.createdAt))
      .limit(limit);

    return pendingTransactions.map(item => ({
      ...item.transaction,
      user: item.user
    }));
  }

  // Approve pending payment
  async approvePayment(transactionId: number, adminNotes?: string): Promise<BillingTransaction> {
    const [transaction] = await db
      .select()
      .from(billingTransactions)
      .where(eq(billingTransactions.id, transactionId));

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== 'pending') {
      throw new Error('Transaction is not pending approval');
    }

    // Update transaction status
    const [updatedTransaction] = await db
      .update(billingTransactions)
      .set({
        status: 'completed',
        metadata: {
          ...transaction.metadata,
          approvedAt: new Date().toISOString(),
          adminNotes
        }
      })
      .where(eq(billingTransactions.id, transactionId))
      .returning();

    // Get user for notifications
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, transaction.userId));

    if (user) {
      // Send approval confirmation
      await emailService.sendEmail(
        user.email,
        'payment_confirmed',
        {
          firstName: user.firstName,
          lastName: user.lastName,
          amount: transaction.amount.toString(),
          referenceNumber: (transaction.metadata as any)?.referenceNumber || 'N/A',
          appName: 'AuthMesh'
        },
        user.id
      );

      // Update in-app notification
      await emailService.createNotification(
        user.id,
        'payment_confirmed',
        'Payment Confirmed',
        `Your payment of $${transaction.amount} has been confirmed and processed.`,
        '/subscription',
        'normal',
        { transactionId }
      );
    }

    return updatedTransaction;
  }

  // Reject pending payment
  async rejectPayment(transactionId: number, reason: string): Promise<BillingTransaction> {
    const [transaction] = await db
      .select()
      .from(billingTransactions)
      .where(eq(billingTransactions.id, transactionId));

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Update transaction status
    const [updatedTransaction] = await db
      .update(billingTransactions)
      .set({
        status: 'failed',
        metadata: {
          ...transaction.metadata,
          rejectedAt: new Date().toISOString(),
          rejectionReason: reason
        }
      })
      .where(eq(billingTransactions.id, transactionId))
      .returning();

    // Get user for notifications
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, transaction.userId));

    if (user) {
      // Send rejection notification
      await emailService.sendEmail(
        user.email,
        'payment_rejected',
        {
          firstName: user.firstName,
          lastName: user.lastName,
          amount: transaction.amount.toString(),
          reason,
          appName: 'AuthMesh'
        },
        user.id
      );

      // Create urgent notification
      await emailService.createNotification(
        user.id,
        'payment_rejected',
        'Payment Issue',
        `Your payment of $${transaction.amount} requires attention. Reason: ${reason}`,
        '/subscription',
        'urgent',
        { transactionId, reason }
      );
    }

    return updatedTransaction;
  }

  private getPaymentMethodDisplay(method: string): string {
    const methods: Record<string, string> = {
      bank_transfer: 'Bank Transfer',
      check: 'Check',
      cash: 'Cash',
      wire_transfer: 'Wire Transfer'
    };
    return methods[method] || method;
  }

  // Generate invoice for manual payment
  async generateInvoice(userId: number, planId: number, customAmount?: number) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new Error('User not found');
    }

    // Get plan details from subscription plans API
    const planDetails = await this.getPlanDetails(planId);
    const amount = customAmount || parseFloat(planDetails.price);

    const invoice = {
      invoiceNumber: `INV-${Date.now()}-${userId}`,
      userId,
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      planName: planDetails.displayName,
      amount,
      currency: 'USD',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      bankInstructions: this.getBankDepositInstructions(),
      items: [
        {
          description: `${planDetails.displayName} Subscription`,
          quantity: 1,
          unitPrice: amount,
          total: amount
        }
      ],
      subtotal: amount,
      tax: 0,
      total: amount,
      createdAt: new Date()
    };

    return invoice;
  }

  private async getPlanDetails(planId: number) {
    // This would integrate with your subscription plans
    const plans = [
      { id: 1, name: 'free', displayName: 'Free', price: '0.00' },
      { id: 2, name: 'professional', displayName: 'Professional', price: '29.00' },
      { id: 3, name: 'enterprise', displayName: 'Enterprise', price: '99.00' }
    ];
    
    return plans.find(p => p.id === planId) || plans[0];
  }
}

export const manualBillingService = ManualBillingService.getInstance();