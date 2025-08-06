import { storage } from "../storage";
import { InsertWebhook, InsertWebhookEvent, InsertWebhookDelivery, Webhook, WebhookEvent } from "../../shared/schema";
import crypto from "crypto";

export class WebhookService {
  /**
   * Create a new webhook for a tenant
   */
  async createWebhook(tenantId: number, webhookData: Omit<InsertWebhook, 'tenantId' | 'secret'>): Promise<Webhook> {
    // Generate a secure secret for webhook verification
    const secret = crypto.randomBytes(32).toString('hex');
    
    const webhook = await storage.createWebhook({
      ...webhookData,
      tenantId,
      secret
    });
    
    console.log(`[Webhook] Created webhook ${webhook.id} for tenant ${tenantId}`);
    return webhook;
  }

  /**
   * Get all webhooks for a tenant
   */
  async getWebhooks(tenantId: number): Promise<Webhook[]> {
    return storage.getWebhooksByTenant(tenantId);
  }

  /**
   * Get webhook by ID
   */
  async getWebhook(webhookId: number, tenantId: number): Promise<Webhook | null> {
    const webhook = await storage.getWebhookById(webhookId);
    if (!webhook || webhook.tenantId !== tenantId) {
      return null;
    }
    return webhook;
  }

  /**
   * Update webhook configuration
   */
  async updateWebhook(webhookId: number, tenantId: number, updates: Partial<InsertWebhook>): Promise<Webhook | null> {
    const webhook = await this.getWebhook(webhookId, tenantId);
    if (!webhook) {
      return null;
    }

    const updatedWebhook = await storage.updateWebhook(webhookId, {
      ...updates,
      updatedAt: new Date()
    });

    console.log(`[Webhook] Updated webhook ${webhookId}`);
    return updatedWebhook;
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(webhookId: number, tenantId: number): Promise<boolean> {
    const webhook = await this.getWebhook(webhookId, tenantId);
    if (!webhook) {
      return false;
    }

    await storage.deleteWebhook(webhookId);
    console.log(`[Webhook] Deleted webhook ${webhookId}`);
    return true;
  }

  /**
   * Create and queue a webhook event
   */
  async createEvent(tenantId: number, eventData: Omit<InsertWebhookEvent, 'tenantId'>): Promise<WebhookEvent> {
    const event = await storage.createWebhookEvent({
      ...eventData,
      tenantId
    });

    // Asynchronously trigger webhooks for this event
    this.triggerWebhooks(tenantId, event).catch(error => {
      console.error(`[Webhook] Failed to trigger webhooks for event ${event.id}:`, error);
    });

    return event;
  }

  /**
   * Trigger all webhooks for a specific event
   */
  private async triggerWebhooks(tenantId: number, event: WebhookEvent): Promise<void> {
    const webhooks = await storage.getActiveWebhooksForEvent(tenantId, event.eventType);
    
    const deliveryPromises = webhooks.map(webhook => 
      this.deliverWebhook(webhook, event)
    );

    await Promise.allSettled(deliveryPromises);
  }

  /**
   * Deliver webhook to a single endpoint
   */
  private async deliverWebhook(webhook: Webhook, event: WebhookEvent): Promise<void> {
    const payload = {
      id: event.id,
      event: event.eventType,
      timestamp: event.createdAt,
      data: event.data,
      organizationId: event.tenantId.toString()
    };

    const signature = this.generateSignature(JSON.stringify(payload), webhook.secret);
    
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth247-Signature': signature,
          'User-Agent': 'Auth247-Webhook/1.0',
          ...webhook.headers
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      const responseBody = await response.text().catch(() => '');

      // Record delivery attempt
      await storage.createWebhookDelivery({
        webhookId: webhook.id,
        eventId: event.id.toString(),
        eventType: event.eventType,
        payload,
        responseStatus: response.status,
        responseBody: responseBody.substring(0, 1000), // Limit response body size
        success: response.ok,
        deliveredAt: response.ok ? new Date() : undefined
      });

      // Update webhook last triggered time
      await storage.updateWebhook(webhook.id, {
        lastTriggeredAt: new Date(),
        ...(response.ok ? { lastSuccessAt: new Date() } : { lastFailureAt: new Date() })
      });

      console.log(`[Webhook] Delivered event ${event.eventType} to ${webhook.url} - Status: ${response.status}`);

    } catch (error) {
      console.error(`[Webhook] Failed to deliver to ${webhook.url}:`, error);
      
      // Record failed delivery
      await storage.createWebhookDelivery({
        webhookId: webhook.id,
        eventId: event.id.toString(),
        eventType: event.eventType,
        payload,
        responseStatus: 0,
        responseBody: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });

      // Update webhook failure time
      await storage.updateWebhook(webhook.id, {
        lastTriggeredAt: new Date(),
        lastFailureAt: new Date()
      });
    }
  }

  /**
   * Generate HMAC signature for webhook verification
   */
  private generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Test webhook endpoint
   */
  async testWebhook(webhookId: number, tenantId: number): Promise<{ success: boolean; response?: any; error?: string }> {
    const webhook = await this.getWebhook(webhookId, tenantId);
    if (!webhook) {
      return { success: false, error: 'Webhook not found' };
    }

    const testPayload = {
      id: 'test-' + Date.now(),
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: { message: 'This is a test webhook from Auth247' },
      organizationId: tenantId.toString()
    };

    const signature = this.generateSignature(JSON.stringify(testPayload), webhook.secret);

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth247-Signature': signature,
          'User-Agent': 'Auth247-Webhook-Test/1.0',
          ...webhook.headers
        },
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(15000) // 15 second timeout for tests
      });

      const responseBody = await response.text().catch(() => '');

      return {
        success: response.ok,
        response: {
          status: response.status,
          statusText: response.statusText,
          body: responseBody.substring(0, 500) // Limit response for testing
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Get webhook delivery history
   */
  async getDeliveries(webhookId: number, tenantId: number, limit: number = 50): Promise<any[]> {
    const webhook = await this.getWebhook(webhookId, tenantId);
    if (!webhook) {
      return [];
    }

    return storage.getWebhookDeliveries(webhookId, limit);
  }

  /**
   * Retry failed webhook delivery
   */
  async retryDelivery(deliveryId: number, tenantId: number): Promise<boolean> {
    const delivery = await storage.getWebhookDeliveryById(deliveryId);
    if (!delivery) {
      return false;
    }

    const webhook = await storage.getWebhookById(delivery.webhookId);
    if (!webhook || webhook.tenantId !== tenantId) {
      return false;
    }

    // Recreate the event for retry
    const event = {
      id: parseInt(delivery.eventId),
      eventType: delivery.eventType,
      tenantId,
      data: delivery.payload.data,
      createdAt: new Date()
    } as WebhookEvent;

    await this.deliverWebhook(webhook, event);
    return true;
  }

  /**
   * Get webhook statistics
   */
  async getWebhookStats(tenantId: number): Promise<{
    totalWebhooks: number;
    activeWebhooks: number;
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    successRate: number;
  }> {
    const stats = await storage.getWebhookStats(tenantId);
    
    return {
      totalWebhooks: stats.totalWebhooks || 0,
      activeWebhooks: stats.activeWebhooks || 0,
      totalDeliveries: stats.totalDeliveries || 0,
      successfulDeliveries: stats.successfulDeliveries || 0,
      failedDeliveries: stats.failedDeliveries || 0,
      successRate: stats.totalDeliveries > 0 
        ? Math.round((stats.successfulDeliveries / stats.totalDeliveries) * 100) 
        : 0
    };
  }
}

export const webhookService = new WebhookService();