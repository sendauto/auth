/**
 * Integration Service - Handles third-party service integrations
 * Provides unified interface for Slack, Salesforce, and other integrations
 */

import { storage } from '../storage';

export interface Integration {
  id: string;
  name: string;
  category: string;
  status: 'available' | 'installed' | 'configured' | 'error';
  config?: Record<string, any>;
  credentials?: Record<string, string>;
  lastSync?: Date;
  webhookUrl?: string;
}

export interface IntegrationInstallation {
  integrationId: string;
  tenantId: number;
  userId: number;
  config: Record<string, any>;
  credentials: Record<string, string>;
  status: 'installing' | 'active' | 'error' | 'disabled';
  installedAt: Date;
  lastSync?: Date;
}

export class IntegrationService {
  private static readonly SUPPORTED_INTEGRATIONS = new Map([
    ['slack', {
      id: 'slack',
      name: 'Slack',
      category: 'Communication',
      setupSteps: ['authorize', 'configure_channels', 'test_connection'],
      requiredScopes: ['users:read', 'channels:read', 'chat:write'],
      authUrl: 'https://slack.com/oauth/v2/authorize'
    }],
    ['salesforce', {
      id: 'salesforce',
      name: 'Salesforce',
      category: 'CRM',
      setupSteps: ['oauth_setup', 'field_mapping', 'sync_configuration'],
      requiredScopes: ['api', 'refresh_token'],
      authUrl: 'https://login.salesforce.com/services/oauth2/authorize'
    }],
    ['microsoft-teams', {
      id: 'microsoft-teams',
      name: 'Microsoft Teams',
      category: 'Communication',
      setupSteps: ['app_registration', 'permissions', 'webhook_setup'],
      requiredScopes: ['ChannelMessage.Read.All', 'User.Read'],
      authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
    }],
    ['jira', {
      id: 'jira',
      name: 'Jira',
      category: 'Project Management',
      setupSteps: ['api_token', 'project_access', 'webhook_config'],
      requiredScopes: ['read:jira-user', 'write:jira-work'],
      authUrl: 'https://auth.atlassian.com/authorize'
    }],
    ['hubspot', {
      id: 'hubspot',
      name: 'HubSpot',
      category: 'CRM',
      setupSteps: ['oauth_flow', 'property_mapping', 'sync_settings'],
      requiredScopes: ['contacts', 'oauth'],
      authUrl: 'https://app.hubspot.com/oauth/authorize'
    }]
  ]);

  static async getAvailableIntegrations(): Promise<Integration[]> {
    const integrations: Integration[] = [];
    
    for (const [id, config] of this.SUPPORTED_INTEGRATIONS) {
      integrations.push({
        id,
        name: config.name,
        category: config.category,
        status: 'available'
      });
    }
    
    return integrations;
  }

  static async getInstalledIntegrations(tenantId: number): Promise<IntegrationInstallation[]> {
    // In production, this would query the database
    // For now, return mock installed integrations
    return [
      {
        integrationId: 'slack',
        tenantId,
        userId: 1,
        config: { channels: ['#general', '#alerts'] },
        credentials: { access_token: 'xoxb-***', team_id: 'T1234567' },
        status: 'active',
        installedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ];
  }

  static async installIntegration(
    integrationId: string,
    tenantId: number,
    userId: number,
    config: Record<string, any> = {}
  ): Promise<{ success: boolean; authUrl?: string; installation?: IntegrationInstallation }> {
    const integrationConfig = this.SUPPORTED_INTEGRATIONS.get(integrationId);
    
    if (!integrationConfig) {
      throw new Error(`Integration ${integrationId} not supported`);
    }

    // For OAuth-based integrations, return authorization URL
    if (integrationConfig.authUrl) {
      const params = new URLSearchParams({
        client_id: process.env[`${integrationId.toUpperCase()}_CLIENT_ID`] || 'demo_client_id',
        redirect_uri: `${process.env.BASE_URL}/api/integrations/${integrationId}/callback`,
        scope: integrationConfig.requiredScopes.join(' '),
        state: `${tenantId}:${userId}:${Date.now()}`
      });

      return {
        success: true,
        authUrl: `${integrationConfig.authUrl}?${params.toString()}`
      };
    }

    // For API key-based integrations, create installation directly
    const installation: IntegrationInstallation = {
      integrationId,
      tenantId,
      userId,
      config,
      credentials: {},
      status: 'installing',
      installedAt: new Date()
    };

    // In production, save to database here
    console.log(`[Integration] Installing ${integrationId} for tenant ${tenantId}`);

    return {
      success: true,
      installation
    };
  }

  static async handleOAuthCallback(
    integrationId: string,
    code: string,
    state: string
  ): Promise<{ success: boolean; installation?: IntegrationInstallation }> {
    const [tenantId, userId] = state.split(':').map(Number);
    const integrationConfig = this.SUPPORTED_INTEGRATIONS.get(integrationId);
    
    if (!integrationConfig) {
      throw new Error(`Integration ${integrationId} not supported`);
    }

    // Mock OAuth token exchange
    const mockTokens = {
      access_token: `${integrationId}_access_token_${Date.now()}`,
      refresh_token: `${integrationId}_refresh_token_${Date.now()}`,
      expires_in: 3600
    };

    const installation: IntegrationInstallation = {
      integrationId,
      tenantId,
      userId,
      config: {},
      credentials: mockTokens,
      status: 'active',
      installedAt: new Date(),
      lastSync: new Date()
    };

    console.log(`[Integration] OAuth callback processed for ${integrationId}`);
    
    return {
      success: true,
      installation
    };
  }

  static async uninstallIntegration(integrationId: string, tenantId: number): Promise<{ success: boolean }> {
    console.log(`[Integration] Uninstalling ${integrationId} for tenant ${tenantId}`);
    
    // In production, remove from database and revoke tokens
    return { success: true };
  }

  static async testIntegrationConnection(integrationId: string, tenantId: number): Promise<{
    success: boolean;
    status: string;
    details?: Record<string, any>;
  }> {
    const integrationConfig = this.SUPPORTED_INTEGRATIONS.get(integrationId);
    
    if (!integrationConfig) {
      return { success: false, status: 'Integration not found' };
    }

    // Mock connection test
    const testResults = {
      slack: { 
        connected: true, 
        team: 'Demo Team', 
        channels: ['#general', '#alerts'],
        botUserId: 'U1234567'
      },
      salesforce: { 
        connected: true, 
        instance: 'demo.salesforce.com',
        user: 'admin@demo.com',
        objects: ['Account', 'Contact', 'Lead']
      },
      'microsoft-teams': { 
        connected: true, 
        tenant: 'demo.onmicrosoft.com',
        permissions: ['ChannelMessage.Read.All']
      },
      jira: { 
        connected: true, 
        instance: 'demo.atlassian.net',
        projects: ['DEMO', 'TEST']
      },
      hubspot: { 
        connected: true, 
        portalId: '12345',
        scopes: ['contacts', 'oauth']
      }
    };

    const result = testResults[integrationId as keyof typeof testResults];
    
    return {
      success: true,
      status: result?.connected ? 'Connected successfully' : 'Connection failed',
      details: result || {}
    };
  }

  static async syncIntegration(integrationId: string, tenantId: number): Promise<{
    success: boolean;
    synced: number;
    errors?: string[];
  }> {
    console.log(`[Integration] Syncing ${integrationId} for tenant ${tenantId}`);
    
    // Mock sync operation
    const mockSyncResults = {
      slack: { synced: 25, type: 'users' },
      salesforce: { synced: 142, type: 'contacts' },
      'microsoft-teams': { synced: 18, type: 'team_members' },
      jira: { synced: 7, type: 'users' },
      hubspot: { synced: 89, type: 'contacts' }
    };

    const result = mockSyncResults[integrationId as keyof typeof mockSyncResults];
    
    return {
      success: true,
      synced: result?.synced || 0
    };
  }

  static async getIntegrationLogs(integrationId: string, tenantId: number, limit: number = 50): Promise<Array<{
    timestamp: Date;
    level: 'info' | 'warn' | 'error';
    message: string;
    details?: Record<string, any>;
  }>> {
    // Mock integration logs
    return [
      {
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        level: 'info',
        message: `${integrationId} sync completed successfully`,
        details: { recordsProcessed: 25, duration: '2.3s' }
      },
      {
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        level: 'info',
        message: `${integrationId} webhook received`,
        details: { event: 'user.created', processed: true }
      },
      {
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        level: 'warn',
        message: `${integrationId} rate limit approached`,
        details: { remaining: 15, resetTime: '2024-08-06T12:00:00Z' }
      }
    ];
  }

  static async getIntegrationStats(integrationId: string, tenantId: number): Promise<{
    totalSyncs: number;
    lastSync: Date;
    successRate: number;
    totalUsers: number;
    activeWebhooks: number;
  }> {
    // Mock integration statistics
    return {
      totalSyncs: 347,
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
      successRate: 98.7,
      totalUsers: 142,
      activeWebhooks: 3
    };
  }
}

export const integrationService = new IntegrationService();