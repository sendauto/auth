import { storage } from "../storage";
import { InsertApiKey, ApiKey } from "../../shared/schema";
import crypto from "crypto";
import bcrypt from "bcrypt";

export class ApiKeyService {
  /**
   * Generate a new API key with prefix and secure hash
   */
  private generateApiKey(): { key: string; hash: string; prefix: string } {
    const prefix = 'ak';
    const randomPart = crypto.randomBytes(32).toString('hex');
    const key = `${prefix}_${randomPart}`;
    const hash = bcrypt.hashSync(key, 12);
    
    return {
      key,
      hash,
      prefix: `${prefix}_${'*'.repeat(8)}`
    };
  }

  /**
   * Create a new API key
   */
  async createApiKey(
    tenantId: number,
    userId: number,
    name: string,
    permissions: string[] = [],
    environment: string = 'production',
    expiresAt?: Date
  ): Promise<{ apiKey: ApiKey; key: string }> {
    const { key, hash, prefix } = this.generateApiKey();

    const apiKeyData = await storage.createApiKey({
      tenantId,
      userId,
      name,
      keyHash: hash,
      keyPrefix: prefix,
      permissions,
      environment,
      expiresAt,
      isActive: true,
      requestCount: 0,
      rateLimitPerHour: 1000
    });

    console.log(`[API Key] Created API key ${apiKeyData.id} for tenant ${tenantId}`);
    
    return {
      apiKey: apiKeyData,
      key // Return the actual key only once during creation
    };
  }

  /**
   * Get all API keys for a tenant
   */
  async getApiKeys(tenantId: number): Promise<ApiKey[]> {
    return storage.getApiKeysByTenant(tenantId);
  }

  /**
   * Get API key by ID
   */
  async getApiKey(apiKeyId: number, tenantId: number): Promise<ApiKey | null> {
    const apiKey = await storage.getApiKeyById(apiKeyId);
    if (!apiKey || apiKey.tenantId !== tenantId) {
      return null;
    }
    return apiKey;
  }

  /**
   * Validate API key and return associated data
   */
  async validateApiKey(key: string): Promise<{
    valid: boolean;
    apiKey?: ApiKey;
    error?: string;
  }> {
    try {
      // Extract all API keys and check each one (in production, this would be optimized)
      const allApiKeys = await this.getAllActiveApiKeys();
      
      for (const apiKey of allApiKeys) {
        if (bcrypt.compareSync(key, apiKey.keyHash)) {
          // Check if key is active
          if (!apiKey.isActive) {
            return { valid: false, error: 'API key is disabled' };
          }

          // Check if key is expired
          if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
            return { valid: false, error: 'API key has expired' };
          }

          // Update usage statistics
          await storage.incrementApiKeyUsage(apiKey.id);

          return { valid: true, apiKey };
        }
      }

      return { valid: false, error: 'Invalid API key' };
    } catch (error) {
      console.error('[API Key] Validation error:', error);
      return { valid: false, error: 'Validation failed' };
    }
  }

  /**
   * Get all active API keys (helper method)
   */
  private async getAllActiveApiKeys(): Promise<ApiKey[]> {
    // This is a simplified implementation. In production, you'd want to cache this
    // or use a more efficient lookup method
    const allTenants = [1, 2, 3]; // TODO: Get actual tenants from database
    const allKeys: ApiKey[] = [];
    
    for (const tenantId of allTenants) {
      const keys = await storage.getApiKeysByTenant(tenantId);
      allKeys.push(...keys.filter(k => k.isActive));
    }
    
    return allKeys;
  }

  /**
   * Update API key
   */
  async updateApiKey(
    apiKeyId: number,
    tenantId: number,
    updates: Partial<InsertApiKey>
  ): Promise<ApiKey | null> {
    const apiKey = await this.getApiKey(apiKeyId, tenantId);
    if (!apiKey) {
      return null;
    }

    const updatedApiKey = await storage.updateApiKey(apiKeyId, {
      ...updates,
      updatedAt: new Date()
    });

    console.log(`[API Key] Updated API key ${apiKeyId}`);
    return updatedApiKey;
  }

  /**
   * Delete API key
   */
  async deleteApiKey(apiKeyId: number, tenantId: number): Promise<boolean> {
    const apiKey = await this.getApiKey(apiKeyId, tenantId);
    if (!apiKey) {
      return false;
    }

    await storage.deleteApiKey(apiKeyId);
    console.log(`[API Key] Deleted API key ${apiKeyId}`);
    return true;
  }

  /**
   * Disable API key (soft delete)
   */
  async disableApiKey(apiKeyId: number, tenantId: number): Promise<boolean> {
    const result = await this.updateApiKey(apiKeyId, tenantId, { isActive: false });
    return result !== null;
  }

  /**
   * Get API key usage statistics
   */
  async getApiKeyStats(tenantId: number): Promise<{
    totalKeys: number;
    activeKeys: number;
    expiredKeys: number;
    totalRequests: number;
    keysCreatedThisMonth: number;
  }> {
    const apiKeys = await storage.getApiKeysByTenant(tenantId);
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      totalKeys: apiKeys.length,
      activeKeys: apiKeys.filter(k => k.isActive).length,
      expiredKeys: apiKeys.filter(k => k.expiresAt && k.expiresAt < now).length,
      totalRequests: apiKeys.reduce((sum, k) => sum + k.requestCount, 0),
      keysCreatedThisMonth: apiKeys.filter(k => k.createdAt >= thisMonth).length
    };

    return stats;
  }

  /**
   * Rotate API key - create new key and disable old one
   */
  async rotateApiKey(
    apiKeyId: number,
    tenantId: number
  ): Promise<{ apiKey: ApiKey; key: string } | null> {
    const oldApiKey = await this.getApiKey(apiKeyId, tenantId);
    if (!oldApiKey) {
      return null;
    }

    // Create new API key with same properties
    const newKeyResult = await this.createApiKey(
      tenantId,
      oldApiKey.userId,
      `${oldApiKey.name} (Rotated)`,
      oldApiKey.permissions,
      oldApiKey.environment,
      oldApiKey.expiresAt || undefined
    );

    // Disable old key
    await this.disableApiKey(apiKeyId, tenantId);

    console.log(`[API Key] Rotated API key ${apiKeyId} -> ${newKeyResult.apiKey.id}`);
    return newKeyResult;
  }

  /**
   * Check rate limit for API key
   */
  async checkRateLimit(apiKey: ApiKey): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
  }> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    // In a production system, you'd track request times more precisely
    // For now, we'll use a simple hourly limit
    const requestsThisHour = apiKey.requestCount; // Simplified
    const remaining = Math.max(0, apiKey.rateLimitPerHour - requestsThisHour);
    const resetTime = new Date(now.getTime() + 60 * 60 * 1000);

    return {
      allowed: remaining > 0,
      remaining,
      resetTime
    };
  }

  /**
   * Generate API key documentation for tenant
   */
  generateApiKeyDocumentation(apiKey: ApiKey): {
    usage: string;
    examples: Record<string, string>;
  } {
    const baseUrl = process.env.USE_CUSTOM_DOMAIN === 'false' 
      ? process.env.REPL_SLUG 
        ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER?.toLowerCase()}.repl.co`
        : 'http://localhost:5000'
      : 'https://auth247.net';

    return {
      usage: `API Key: ${apiKey.keyPrefix}
Environment: ${apiKey.environment}
Permissions: ${apiKey.permissions.join(', ') || 'All'}
Rate Limit: ${apiKey.rateLimitPerHour} requests/hour`,
      examples: {
        curl: `curl -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     ${baseUrl}/api/users`,
        javascript: `fetch('${baseUrl}/api/users', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});`,
        python: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get('${baseUrl}/api/users', headers=headers)`
      }
    };
  }
}

export const apiKeyService = new ApiKeyService();