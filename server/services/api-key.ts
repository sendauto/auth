/**
 * API Key Service for SCIM authentication
 * Basic API key validation service
 */

export interface ApiKeyValidation {
  valid: boolean;
  organizationId?: number;
  scope?: string[];
}

class ApiKeyService {
  async validateApiKey(token: string): Promise<ApiKeyValidation> {
    // In production, would validate against database
    // For now, accept any token that starts with 'scim_'
    if (token.startsWith('scim_')) {
      return {
        valid: true,
        organizationId: 1, // Default organization
        scope: ['scim', 'users', 'groups']
      };
    }
    
    return { valid: false };
  }

  async validateBasicAuth(username: string, password: string): Promise<ApiKeyValidation> {
    // In production, would validate against database
    // For now, accept basic auth with username 'scim' and any password
    if (username === 'scim') {
      return {
        valid: true,
        organizationId: 1, // Default organization
        scope: ['scim', 'users', 'groups']
      };
    }
    
    return { valid: false };
  }
}

export const apiKeyService = new ApiKeyService();