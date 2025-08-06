/**
 * Anti-SSO Tax Implementation
 * The core viral differentiator - no upcharge for enterprise SSO
 */

import type { Express, Request, Response } from 'express';

export interface SSOProvider {
  name: string;
  displayName: string;
  tier: 'free' | 'premium';
  setupComplexity: 'simple' | 'medium' | 'advanced';
  setupTime: string;
  included: boolean;
  competitorPrice?: string;
}

export interface AntiSSOTaxConfig {
  providers: SSOProvider[];
  messaging: {
    headline: string;
    subheadline: string;
    competitorComparison: string;
    savings: {
      monthly: number;
      annual: number;
      percentage: string;
    };
  };
  features: string[];
}

class AntiSSOTaxService {
  private config: AntiSSOTaxConfig;

  constructor() {
    this.config = {
      providers: [
        {
          name: 'google',
          displayName: 'Google Workspace',
          tier: 'free',
          setupComplexity: 'simple',
          setupTime: '2 minutes',
          included: true
        },
        {
          name: 'microsoft',
          displayName: 'Microsoft Azure AD',
          tier: 'free',
          setupComplexity: 'simple',
          setupTime: '3 minutes',
          included: true
        },
        {
          name: 'github',
          displayName: 'GitHub Enterprise',
          tier: 'free',
          setupComplexity: 'simple',
          setupTime: '1 minute',
          included: true
        },
        {
          name: 'okta',
          displayName: 'Okta',
          tier: 'premium',
          setupComplexity: 'medium',
          setupTime: '5 minutes',
          included: true,
          competitorPrice: '$8/user/month extra'
        },
        {
          name: 'ping',
          displayName: 'Ping Identity',
          tier: 'premium',
          setupComplexity: 'advanced',
          setupTime: '10 minutes',
          included: true,
          competitorPrice: '$12/user/month extra'
        },
        {
          name: 'custom_saml',
          displayName: 'Custom SAML/OIDC',
          tier: 'premium',
          setupComplexity: 'advanced',
          setupTime: '15 minutes',
          included: true,
          competitorPrice: '$15/user/month extra'
        }
      ],
      messaging: {
        headline: 'No SSO Tax - Enterprise Security Included',
        subheadline: 'Every plan includes enterprise SSO. No upcharges, no hidden fees.',
        competitorComparison: 'Save 70% vs Auth0, Okta, and others who charge extra for basic security',
        savings: {
          monthly: 18, // $27 competitor - $9 Auth247
          annual: 216,
          percentage: '67%'
        }
      },
      features: [
        'All SSO providers included in every plan',
        'Self-service SSO setup in under 5 minutes',
        'Unlimited SSO connections',
        'Real-time SSO health monitoring',
        'Custom domain support',
        'Advanced security features included',
        'Multi-tenant architecture',
        'Compliance reporting (SOC2, GDPR)',
        'Zero-downtime SSO updates',
        'Priority enterprise support'
      ]
    };
  }

  /**
   * Get anti-SSO tax configuration for marketing pages
   */
  getAntiSSOTaxConfig(): AntiSSOTaxConfig {
    return this.config;
  }

  /**
   * Calculate savings for specific user count
   */
  calculateSavings(userCount: number = 100): any {
    const auth247Monthly = 9 * userCount;
    const competitorBase = 9 * userCount;
    const competitorSSO = 18 * userCount; // 2x upcharge
    const competitorTotal = competitorBase + competitorSSO;
    
    return {
      userCount,
      auth247: {
        base: auth247Monthly,
        sso: 0,
        total: auth247Monthly
      },
      competitor: {
        base: competitorBase,
        sso: competitorSSO,
        total: competitorTotal
      },
      savings: {
        monthly: competitorTotal - auth247Monthly,
        annual: (competitorTotal - auth247Monthly) * 12,
        percentage: ((competitorTotal - auth247Monthly) / competitorTotal * 100).toFixed(1)
      }
    };
  }

  /**
   * Get viral messaging for different contexts
   */
  getViralMessaging(context: 'landing' | 'pricing' | 'docs' | 'comparison'): any {
    const base = {
      headline: this.config.messaging.headline,
      features: this.config.features
    };

    switch (context) {
      case 'landing':
        return {
          ...base,
          cta: 'See How Much You Save',
          description: 'Enterprise SSO shouldn\'t cost extra. Auth247 includes all SSO providers in every plan - no upcharges, no surprises.'
        };
      
      case 'pricing':
        return {
          ...base,
          badge: 'No SSO Tax',
          description: 'Unlike competitors who charge 2-4x for SSO, Auth247 includes enterprise authentication in all plans.',
          comparison: this.generateCompetitorComparison()
        };
      
      case 'docs':
        return {
          ...base,
          title: 'Enterprise SSO Setup (Included Free)',
          description: 'Set up enterprise SSO in minutes, not days. All providers included.'
        };
      
      case 'comparison':
        return {
          ...base,
          table: this.generateComparisonTable()
        };
      
      default:
        return base;
    }
  }

  /**
   * Generate competitor comparison data
   */
  private generateCompetitorComparison(): any[] {
    return [
      {
        provider: 'Auth247',
        basePlan: '$9/user/month',
        ssoUpcharge: '$0',
        total: '$9/user/month',
        included: 'All SSO providers included',
        highlight: true
      },
      {
        provider: 'Auth0',
        basePlan: '$23/user/month',
        ssoUpcharge: '+$8/user/month',
        total: '$31/user/month',
        included: 'SAML extra cost'
      },
      {
        provider: 'Okta',
        basePlan: '$2/user/month',
        ssoUpcharge: '+$6/user/month',
        total: '$8/user/month',
        included: 'Limited features'
      },
      {
        provider: 'AWS Cognito',
        basePlan: '$0.0055/MAU',
        ssoUpcharge: 'Complex pricing',
        total: 'Variable',
        included: 'Developer setup required'
      }
    ];
  }

  /**
   * Generate detailed comparison table
   */
  private generateComparisonTable(): any {
    return {
      headers: ['Feature', 'Auth247', 'Auth0', 'Okta', 'AWS Cognito'],
      rows: [
        ['Google Workspace SSO', '✅ Included', '❌ $8/month extra', '✅ Included', '⚠️ Complex setup'],
        ['Microsoft Azure AD', '✅ Included', '❌ $8/month extra', '✅ Included', '⚠️ Complex setup'],
        ['Custom SAML', '✅ Included', '❌ $8/month extra', '❌ $6/month extra', '⚠️ Developer required'],
        ['Setup Time', '✅ 2-5 minutes', '⚠️ 30+ minutes', '⚠️ 45+ minutes', '❌ Hours/days'],
        ['Self-Service', '✅ Yes', '❌ No', '⚠️ Limited', '❌ No'],
        ['Custom Domains', '✅ Included', '❌ Enterprise only', '❌ Extra cost', '⚠️ Complex'],
        ['Multi-Tenant', '✅ Included', '❌ Extra cost', '✅ Included', '⚠️ Manual setup'],
        ['Support', '✅ Included', '❌ Paid tiers only', '⚠️ Limited', '❌ AWS support only']
      ]
    };
  }

  /**
   * Track anti-SSO tax viral impact
   */
  async trackViralImpact(event: 'pricing_viewed' | 'comparison_viewed' | 'savings_calculated' | 'trial_started', data?: any): Promise<void> {
    // Track how anti-SSO tax messaging drives viral adoption
    const timestamp = new Date().toISOString();
    const impact = {
      event,
      timestamp,
      data: data || {},
      source: 'anti_sso_tax'
    };

    // In production, this would send to analytics
    console.log('[Anti-SSO Tax] Viral impact:', impact);
  }

  /**
   * Get dynamic savings message based on user context
   */
  getDynamicSavingsMessage(userCount?: number, currentProvider?: string): string {
    const savings = this.calculateSavings(userCount || 100);
    const provider = currentProvider || 'competitors';
    
    return `Save $${savings.savings.monthly}/month vs ${provider}. That's $${savings.savings.annual}/year with no SSO upcharges.`;
  }
}

export const antiSSOTaxService = new AntiSSOTaxService();

/**
 * Register anti-SSO tax API routes
 */
export function registerAntiSSOTaxRoutes(app: Express): void {
  // Get anti-SSO tax configuration
  app.get('/api/viral/anti-sso-tax', (req: Request, res: Response) => {
    try {
      const context = req.query.context as string || 'landing';
      const config = antiSSOTaxService.getAntiSSOTaxConfig();
      const messaging = antiSSOTaxService.getViralMessaging(context as any);
      
      res.json({
        success: true,
        config,
        messaging,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[Anti-SSO Tax] Error getting config:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get anti-SSO tax configuration'
      });
    }
  });

  // Calculate savings for specific user count
  app.get('/api/viral/savings-calculator', (req: Request, res: Response) => {
    try {
      const userCount = parseInt(req.query.users as string) || 100;
      const currentProvider = req.query.provider as string;
      
      const savings = antiSSOTaxService.calculateSavings(userCount);
      const message = antiSSOTaxService.getDynamicSavingsMessage(userCount, currentProvider);
      
      // Track viral impact
      antiSSOTaxService.trackViralImpact('savings_calculated', { userCount, currentProvider });
      
      res.json({
        success: true,
        savings,
        message,
        userCount
      });
    } catch (error) {
      console.error('[Anti-SSO Tax] Error calculating savings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to calculate savings'
      });
    }
  });

  // Track viral events
  app.post('/api/viral/track-impact', (req: Request, res: Response) => {
    try {
      const { event, data } = req.body;
      antiSSOTaxService.trackViralImpact(event, data);
      
      res.json({
        success: true,
        message: 'Viral impact tracked'
      });
    } catch (error) {
      console.error('[Anti-SSO Tax] Error tracking impact:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to track viral impact'
      });
    }
  });
}