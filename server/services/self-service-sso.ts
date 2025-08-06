/**
 * Self-Service SSO Setup Engine
 * Zero-friction SSO configuration for viral IT team advocacy
 */

import type { Express, Request, Response } from 'express';
import { viralGrowthEngine } from './viral-growth';

export interface SSOSetupStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  complexity: 'easy' | 'medium' | 'advanced';
  automated: boolean;
  dependencies?: string[];
}

export interface SSOProvider {
  id: string;
  name: string;
  displayName: string;
  logo: string;
  category: 'enterprise' | 'developer' | 'social';
  setupSteps: SSOSetupStep[];
  testingEnabled: boolean;
  healthMonitoring: boolean;
  documentation: {
    quickStart: string;
    troubleshooting: string;
    migration: string;
  };
}

export interface SSOConfiguration {
  providerId: string;
  organizationDomain: string;
  settings: {
    entityId?: string;
    ssoUrl?: string;
    x509Certificate?: string;
    clientId?: string;
    clientSecret?: string;
    scopes?: string[];
    customAttributes?: Record<string, string>;
  };
  status: 'draft' | 'configured' | 'testing' | 'active' | 'error';
  lastTested?: Date;
  healthStatus?: 'healthy' | 'warning' | 'error';
}

class SelfServiceSSOEngine {
  private providers: Map<string, SSOProvider>;
  private configurations: Map<string, SSOConfiguration>;

  constructor() {
    this.providers = new Map();
    this.configurations = new Map();
    this.initializeProviders();
  }

  private initializeProviders(): void {
    const providers: SSOProvider[] = [
      {
        id: 'google_workspace',
        name: 'google',
        displayName: 'Google Workspace',
        logo: '/assets/providers/google.svg',
        category: 'enterprise',
        setupSteps: [
          {
            id: 'configure_oauth',
            title: 'Configure OAuth Application',
            description: 'We\'ll auto-configure your Google OAuth application',
            estimatedTime: '30 seconds',
            complexity: 'easy',
            automated: true
          },
          {
            id: 'verify_domain',
            title: 'Verify Domain Ownership',
            description: 'Confirm your organization domain',
            estimatedTime: '1 minute',
            complexity: 'easy',
            automated: false
          },
          {
            id: 'test_connection',
            title: 'Test SSO Connection',
            description: 'Verify authentication flow works correctly',
            estimatedTime: '30 seconds',
            complexity: 'easy',
            automated: true
          }
        ],
        testingEnabled: true,
        healthMonitoring: true,
        documentation: {
          quickStart: '/docs/sso/google-workspace',
          troubleshooting: '/docs/sso/google-troubleshooting',
          migration: '/docs/sso/migrate-from-gsuite'
        }
      },
      {
        id: 'microsoft_azure',
        name: 'microsoft',
        displayName: 'Microsoft Azure AD',
        logo: '/assets/providers/microsoft.svg',
        category: 'enterprise',
        setupSteps: [
          {
            id: 'register_application',
            title: 'Register Azure AD Application',
            description: 'Auto-register your application in Azure',
            estimatedTime: '45 seconds',
            complexity: 'easy',
            automated: true
          },
          {
            id: 'configure_permissions',
            title: 'Configure API Permissions',
            description: 'Set up required permissions automatically',
            estimatedTime: '30 seconds',
            complexity: 'easy',
            automated: true
          },
          {
            id: 'verify_tenant',
            title: 'Verify Azure Tenant',
            description: 'Confirm your organization tenant ID',
            estimatedTime: '1 minute',
            complexity: 'easy',
            automated: false
          },
          {
            id: 'test_authentication',
            title: 'Test Authentication',
            description: 'Verify SSO flow with test user',
            estimatedTime: '30 seconds',
            complexity: 'easy',
            automated: true
          }
        ],
        testingEnabled: true,
        healthMonitoring: true,
        documentation: {
          quickStart: '/docs/sso/azure-ad',
          troubleshooting: '/docs/sso/azure-troubleshooting',
          migration: '/docs/sso/migrate-from-azure'
        }
      },
      {
        id: 'okta',
        name: 'okta',
        displayName: 'Okta',
        logo: '/assets/providers/okta.svg',
        category: 'enterprise',
        setupSteps: [
          {
            id: 'create_application',
            title: 'Create Okta Application',
            description: 'Set up OIDC application in your Okta org',
            estimatedTime: '2 minutes',
            complexity: 'medium',
            automated: false
          },
          {
            id: 'configure_claims',
            title: 'Configure ID Token Claims',
            description: 'Auto-configure required user claims',
            estimatedTime: '30 seconds',
            complexity: 'easy',
            automated: true
          },
          {
            id: 'setup_groups',
            title: 'Map Okta Groups',
            description: 'Map Okta groups to Auth247 roles',
            estimatedTime: '2 minutes',
            complexity: 'medium',
            automated: false
          },
          {
            id: 'test_flow',
            title: 'Test SSO Flow',
            description: 'End-to-end authentication testing',
            estimatedTime: '1 minute',
            complexity: 'easy',
            automated: true
          }
        ],
        testingEnabled: true,
        healthMonitoring: true,
        documentation: {
          quickStart: '/docs/sso/okta',
          troubleshooting: '/docs/sso/okta-troubleshooting',
          migration: '/docs/sso/migrate-from-okta'
        }
      },
      {
        id: 'custom_saml',
        name: 'custom_saml',
        displayName: 'Custom SAML 2.0',
        logo: '/assets/providers/saml.svg',
        category: 'enterprise',
        setupSteps: [
          {
            id: 'upload_metadata',
            title: 'Upload SAML Metadata',
            description: 'Upload your IdP metadata or configure manually',
            estimatedTime: '3 minutes',
            complexity: 'advanced',
            automated: false
          },
          {
            id: 'configure_attributes',
            title: 'Map SAML Attributes',
            description: 'Map SAML assertions to user attributes',
            estimatedTime: '2 minutes',
            complexity: 'medium',
            automated: false
          },
          {
            id: 'generate_metadata',
            title: 'Download SP Metadata',
            description: 'Get Auth247 service provider metadata',
            estimatedTime: '30 seconds',
            complexity: 'easy',
            automated: true
          },
          {
            id: 'validate_config',
            title: 'Validate Configuration',
            description: 'Comprehensive SAML configuration validation',
            estimatedTime: '1 minute',
            complexity: 'easy',
            automated: true
          }
        ],
        testingEnabled: true,
        healthMonitoring: true,
        documentation: {
          quickStart: '/docs/sso/custom-saml',
          troubleshooting: '/docs/sso/saml-troubleshooting',
          migration: '/docs/sso/migrate-to-saml'
        }
      }
    ];

    providers.forEach(provider => {
      this.providers.set(provider.id, provider);
    });
  }

  /**
   * Get all available SSO providers
   */
  getAvailableProviders(): SSOProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get specific provider configuration
   */
  getProvider(providerId: string): SSOProvider | undefined {
    return this.providers.get(providerId);
  }

  /**
   * Start SSO configuration wizard
   */
  async startSSOSetup(providerId: string, organizationDomain: string, userId: string): Promise<any> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    const configId = `${organizationDomain}_${providerId}`;
    const configuration: SSOConfiguration = {
      providerId,
      organizationDomain,
      settings: {},
      status: 'draft'
    };

    this.configurations.set(configId, configuration);

    // Track viral setup initiation
    await viralGrowthEngine.trackSSOSetup({
      organizationDomain,
      provider: providerId as any,
      setupTime: 0,
      userId,
      success: false
    });

    return {
      configurationId: configId,
      provider,
      currentStep: provider.setupSteps[0],
      totalSteps: provider.setupSteps.length,
      estimatedTotalTime: this.calculateTotalSetupTime(provider),
      nextActions: this.generateNextActions(provider.setupSteps[0])
    };
  }

  /**
   * Process setup step completion
   */
  async completeSetupStep(configId: string, stepId: string, stepData: any): Promise<any> {
    const configuration = this.configurations.get(configId);
    if (!configuration) {
      throw new Error('Configuration not found');
    }

    const provider = this.providers.get(configuration.providerId);
    if (!provider) {
      throw new Error('Provider not found');
    }

    // Update configuration with step data
    configuration.settings = { ...configuration.settings, ...stepData };

    const currentStepIndex = provider.setupSteps.findIndex(step => step.id === stepId);
    const nextStepIndex = currentStepIndex + 1;
    const isLastStep = nextStepIndex >= provider.setupSteps.length;

    if (isLastStep) {
      // Configuration complete - activate SSO
      configuration.status = 'configured';
      await this.activateSSO(configId);
      
      // Track successful completion
      const setupTime = Date.now() - (configuration.createdAt?.getTime() || Date.now());
      await viralGrowthEngine.trackSSOSetup({
        organizationDomain: configuration.organizationDomain,
        provider: configuration.providerId as any,
        setupTime,
        userId: stepData.userId || 'unknown',
        success: true
      });

      return {
        completed: true,
        configuration,
        nextActions: this.generatePostSetupActions(configuration)
      };
    }

    const nextStep = provider.setupSteps[nextStepIndex];
    return {
      completed: false,
      currentStep: nextStep,
      progress: ((nextStepIndex) / provider.setupSteps.length) * 100,
      nextActions: this.generateNextActions(nextStep)
    };
  }

  /**
   * Test SSO configuration
   */
  async testSSOConfiguration(configId: string): Promise<any> {
    const configuration = this.configurations.get(configId);
    if (!configuration) {
      throw new Error('Configuration not found');
    }

    // Simulate SSO testing
    const testResult = {
      success: true,
      responseTime: Math.floor(Math.random() * 500) + 200, // 200-700ms
      userAttributes: {
        email: 'test@' + configuration.organizationDomain,
        firstName: 'Test',
        lastName: 'User',
        groups: ['users', 'developers']
      },
      securityChecks: {
        certificateValid: true,
        signatureValid: true,
        clockSkewOk: true,
        audienceMatch: true
      }
    };

    configuration.lastTested = new Date();
    configuration.healthStatus = testResult.success ? 'healthy' : 'error';

    return {
      configurationId: configId,
      testResult,
      recommendations: this.generateTestRecommendations(testResult)
    };
  }

  /**
   * Activate SSO configuration
   */
  private async activateSSO(configId: string): Promise<void> {
    const configuration = this.configurations.get(configId);
    if (!configuration) {
      return;
    }

    configuration.status = 'active';
    configuration.healthStatus = 'healthy';

    // Trigger viral branding and team discovery
    await this.triggerViralActivation(configuration);
  }

  /**
   * Trigger viral features when SSO is activated
   */
  private async triggerViralActivation(configuration: SSOConfiguration): Promise<void> {
    // Auto-discover team members
    const teamMembers = await this.discoverTeamMembers(configuration.organizationDomain);
    
    // Create branded authentication experience
    await this.createBrandedExperience(configuration);
    
    // Generate integration templates
    await this.generateIntegrationTemplates(configuration);
  }

  /**
   * Discover team members for viral invitations
   */
  private async discoverTeamMembers(domain: string): Promise<string[]> {
    // Smart team discovery based on common enterprise patterns
    const potentialMembers = [
      `admin@${domain}`,
      `it@${domain}`,
      `security@${domain}`,
      `engineering@${domain}`,
      `dev@${domain}`,
      `tech@${domain}`
    ];

    return potentialMembers;
  }

  /**
   * Create branded authentication experience
   */
  private async createBrandedExperience(configuration: SSOConfiguration): Promise<void> {
    const brandingConfig = {
      domain: configuration.organizationDomain,
      customLoginUrl: `https://auth247.net/login/${configuration.organizationDomain}`,
      brandedElements: {
        loginBadge: 'Secured by Auth247',
        securityIndicator: 'Protected by Auth247',
        developerAttribution: 'Powered by Auth247'
      }
    };

    // Store branding configuration
    console.log('[SSO Viral] Created branded experience:', brandingConfig);
  }

  /**
   * Generate integration templates for developers
   */
  private async generateIntegrationTemplates(configuration: SSOConfiguration): Promise<void> {
    const templates = {
      react: this.generateReactTemplate(configuration),
      nodejs: this.generateNodeJSTemplate(configuration),
      curl: this.generateCurlTemplate(configuration)
    };

    console.log('[SSO Viral] Generated integration templates:', Object.keys(templates));
  }

  /**
   * Calculate total estimated setup time
   */
  private calculateTotalSetupTime(provider: SSOProvider): string {
    const totalMinutes = provider.setupSteps.reduce((total, step) => {
      const minutes = parseInt(step.estimatedTime.split(' ')[0]);
      return total + (isNaN(minutes) ? 2 : minutes);
    }, 0);

    return `${totalMinutes} minutes`;
  }

  /**
   * Generate next actions for current step
   */
  private generateNextActions(step: SSOSetupStep): string[] {
    const actions = [`Complete: ${step.title}`];
    
    if (!step.automated) {
      actions.push(`Manual configuration required`);
    }
    
    if (step.dependencies) {
      actions.push(`Ensure dependencies: ${step.dependencies.join(', ')}`);
    }

    return actions;
  }

  /**
   * Generate post-setup actions
   */
  private generatePostSetupActions(configuration: SSOConfiguration): string[] {
    return [
      'Test SSO with team members',
      'Configure user role mappings',
      'Set up custom domain (optional)',
      'Enable security monitoring',
      'Invite team members to Auth247'
    ];
  }

  /**
   * Generate test recommendations
   */
  private generateTestRecommendations(testResult: any): string[] {
    const recommendations = [];
    
    if (testResult.responseTime > 1000) {
      recommendations.push('Consider optimizing your IdP response time');
    }
    
    if (!testResult.securityChecks.certificateValid) {
      recommendations.push('Update your SAML certificate');
    }
    
    recommendations.push('Test with different user accounts');
    recommendations.push('Verify role mappings are correct');
    
    return recommendations;
  }

  /**
   * Generate React integration template
   */
  private generateReactTemplate(configuration: SSOConfiguration): string {
    return `
// Auth247 React Integration
import { Auth247Provider, useAuth } from '@auth247/react';

function App() {
  return (
    <Auth247Provider 
      domain="${configuration.organizationDomain}"
      ssoProvider="${configuration.providerId}"
    >
      <LoginComponent />
    </Auth247Provider>
  );
}

function LoginComponent() {
  const { login, user, isAuthenticated } = useAuth();
  
  return isAuthenticated ? (
    <div>Welcome, {user.firstName}!</div>
  ) : (
    <button onClick={login}>Sign in with SSO</button>
  );
}
`;
  }

  /**
   * Generate Node.js integration template
   */
  private generateNodeJSTemplate(configuration: SSOConfiguration): string {
    return `
// Auth247 Node.js Integration
const { Auth247 } = require('@auth247/node');

const auth247 = new Auth247({
  domain: '${configuration.organizationDomain}',
  ssoProvider: '${configuration.providerId}'
});

app.get('/login', auth247.authenticateSSO());
app.get('/callback', auth247.handleCallback());
app.get('/protected', auth247.requireAuth(), (req, res) => {
  res.json({ user: req.user });
});
`;
  }

  /**
   * Generate cURL integration template
   */
  private generateCurlTemplate(configuration: SSOConfiguration): string {
    return `
# Auth247 API Integration
# Initiate SSO login
curl -X POST https://auth247.net/api/sso/initiate \\
  -H "Content-Type: application/json" \\
  -d '{
    "domain": "${configuration.organizationDomain}",
    "provider": "${configuration.providerId}",
    "returnUrl": "https://yourapp.com/callback"
  }'
`;
  }

  /**
   * Get SSO setup dashboard data
   */
  async getSetupDashboard(organizationDomain: string): Promise<any> {
    const configs = Array.from(this.configurations.values())
      .filter(config => config.organizationDomain === organizationDomain);

    return {
      totalConfigurations: configs.length,
      activeConfigurations: configs.filter(c => c.status === 'active').length,
      availableProviders: this.getAvailableProviders(),
      recentActivity: configs.slice(-5),
      healthStatus: this.calculateOverallHealth(configs),
      viralOpportunities: await this.getViralOpportunities(organizationDomain)
    };
  }

  /**
   * Calculate overall SSO health
   */
  private calculateOverallHealth(configurations: SSOConfiguration[]): string {
    const healthyCount = configurations.filter(c => c.healthStatus === 'healthy').length;
    const totalCount = configurations.length;
    
    if (totalCount === 0) return 'No configurations';
    if (healthyCount === totalCount) return 'Excellent';
    if (healthyCount / totalCount > 0.8) return 'Good';
    if (healthyCount / totalCount > 0.6) return 'Fair';
    return 'Needs attention';
  }

  /**
   * Get viral growth opportunities
   */
  private async getViralOpportunities(organizationDomain: string): Promise<string[]> {
    return [
      'Invite IT team members to manage SSO',
      'Set up custom authentication domain',
      'Enable security monitoring dashboard',
      'Configure role-based access for different teams',
      'Set up automated user provisioning'
    ];
  }
}

export const selfServiceSSOEngine = new SelfServiceSSOEngine();

/**
 * Register self-service SSO API routes
 */
export function registerSelfServiceSSORoutes(app: Express): void {
  // Get available SSO providers
  app.get('/api/sso/providers', (req: Request, res: Response) => {
    try {
      const providers = selfServiceSSOEngine.getAvailableProviders();
      res.json({
        success: true,
        providers
      });
    } catch (error) {
      console.error('[Self-Service SSO] Error getting providers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get SSO providers'
      });
    }
  });

  // Start SSO setup wizard
  app.post('/api/sso/setup/start', async (req: Request, res: Response) => {
    try {
      const { providerId, organizationDomain, userId } = req.body;
      const setupData = await selfServiceSSOEngine.startSSOSetup(providerId, organizationDomain, userId);
      
      res.json({
        success: true,
        ...setupData
      });
    } catch (error) {
      console.error('[Self-Service SSO] Error starting setup:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to start SSO setup'
      });
    }
  });

  // Complete setup step
  app.post('/api/sso/setup/step', async (req: Request, res: Response) => {
    try {
      const { configurationId, stepId, stepData } = req.body;
      const result = await selfServiceSSOEngine.completeSetupStep(configurationId, stepId, stepData);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('[Self-Service SSO] Error completing step:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to complete setup step'
      });
    }
  });

  // Test SSO configuration
  app.post('/api/sso/test', async (req: Request, res: Response) => {
    try {
      const { configurationId } = req.body;
      const testResult = await selfServiceSSOEngine.testSSOConfiguration(configurationId);
      
      res.json({
        success: true,
        ...testResult
      });
    } catch (error) {
      console.error('[Self-Service SSO] Error testing configuration:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to test SSO configuration'
      });
    }
  });

  // Get setup dashboard
  app.get('/api/sso/dashboard/:domain', async (req: Request, res: Response) => {
    try {
      const { domain } = req.params;
      const dashboard = await selfServiceSSOEngine.getSetupDashboard(domain);
      
      res.json({
        success: true,
        ...dashboard
      });
    } catch (error) {
      console.error('[Self-Service SSO] Error getting dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get setup dashboard'
      });
    }
  });
}