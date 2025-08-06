/**
 * Viral Content Hub - SEO-optimized content for viral growth
 * Interactive tools, calculators, and resources designed for sharing
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calculator, 
  Download, 
  Share2, 
  CheckCircle, 
  TrendingUp,
  FileText,
  Shield,
  Clock,
  DollarSign,
  Users
} from 'lucide-react';
import { useSEOTracking } from './SEOHead';

interface CalculatorResult {
  currentCost: number;
  auth247Cost: number;
  savings: number;
  percentageSavings: number;
}

export function ViralContentHub() {
  const [userCount, setUserCount] = useState(100);
  const [currentProvider, setCurrentProvider] = useState('auth0');
  const [calculatorResult, setCalculatorResult] = useState<CalculatorResult | null>(null);
  const [downloadCount, setDownloadCount] = useState(0);
  const { trackSEOEvent } = useSEOTracking();

  useEffect(() => {
    calculateSavings();
  }, [userCount, currentProvider]);

  const calculateSavings = () => {
    const providerPricing = {
      auth0: { base: 23, sso: 8 },
      okta: { base: 8, sso: 6 },
      aws: { base: 5, sso: 12 },
      azure: { base: 6, sso: 9 }
    };

    const provider = providerPricing[currentProvider as keyof typeof providerPricing] || providerPricing.auth0;
    const currentCost = (provider.base + provider.sso) * userCount;
    const auth247Cost = 9 * userCount;
    const savings = currentCost - auth247Cost;
    const percentageSavings = Math.round((savings / currentCost) * 100);

    const result = {
      currentCost,
      auth247Cost,
      savings,
      percentageSavings
    };

    setCalculatorResult(result);
    
    // Track calculator usage for SEO
    trackSEOEvent('calculator_used', {
      userCount,
      currentProvider,
      savings,
      tool: 'sso_cost_calculator'
    });
  };

  const shareCalculatorResult = () => {
    if (!calculatorResult) return;

    const message = `I just calculated ${calculatorResult.percentageSavings}% savings (${calculatorResult.savings}/month) by switching to Auth247 from ${currentProvider}. No SSO tax! https://auth247.net/calculator`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Auth247 SSO Cost Savings',
        text: message,
        url: 'https://auth247.net/calculator'
      });
    } else {
      navigator.clipboard.writeText(message);
      alert('Savings calculation copied to clipboard!');
    }

    trackSEOEvent('calculator_shared', {
      userCount,
      savings: calculatorResult.savings,
      method: navigator.share ? 'native' : 'clipboard'
    });
  };

  const downloadResource = (resourceType: string) => {
    setDownloadCount(prev => prev + 1);
    trackSEOEvent('resource_downloaded', {
      resourceType,
      userCount,
      downloadNumber: downloadCount + 1
    });

    // Generate downloadable content
    const content = generateResourceContent(resourceType);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auth247-${resourceType}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateResourceContent = (type: string): string => {
    switch (type) {
      case 'security-checklist':
        return `AUTH247 ENTERPRISE SECURITY CHECKLIST

✓ Multi-Factor Authentication (MFA)
✓ SAML 2.0 SSO Integration
✓ OAuth2 Authorization
✓ Role-Based Access Control (RBAC)
✓ Session Management
✓ Audit Logging
✓ IP Whitelisting
✓ Custom Domain Support
✓ Real-time Security Monitoring
✓ Compliance (SOC2, GDPR, HIPAA)

Get started with Auth247: https://auth247.net`;

      case 'roi-template':
        return `AUTH247 ROI CALCULATION TEMPLATE

Current Authentication Costs:
- Base platform cost: $___/month
- SSO upcharge: $___/month
- Setup/maintenance: $___/month
Total Current Cost: $___/month

Auth247 Costs:
- Platform cost: $${calculatorResult?.auth247Cost || 900}/month
- SSO cost: $0/month (included)
- Setup time: 5 minutes
Total Auth247 Cost: $${calculatorResult?.auth247Cost || 900}/month

Monthly Savings: $${calculatorResult?.savings || 1800}
Annual Savings: $${(calculatorResult?.savings || 1800) * 12}
Percentage Saved: ${calculatorResult?.percentageSavings || 67}%

Calculate your savings: https://auth247.net/calculator`;

      case 'migration-guide':
        return `AUTH247 MIGRATION GUIDE

Step 1: Assessment
- Document current authentication setup
- Identify SSO providers in use
- List integrated applications

Step 2: Auth247 Setup (5 minutes)
- Create Auth247 account
- Configure SSO providers
- Test authentication flow

Step 3: Migration
- Update application configurations
- Migrate user accounts
- Update DNS/domain settings

Step 4: Verification
- Test all authentication flows
- Verify user access
- Monitor for issues

Migration support: https://auth247.net/migration`;

      default:
        return 'Auth247 Resource - https://auth247.net';
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Auth247 Resource Hub</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Interactive tools and resources to optimize your authentication strategy
        </p>
      </div>

      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculator">Cost Calculator</TabsTrigger>
          <TabsTrigger value="checklist">Security Checklist</TabsTrigger>
          <TabsTrigger value="guides">Migration Guides</TabsTrigger>
          <TabsTrigger value="templates">ROI Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-6 w-6 text-blue-600" />
                SSO Cost Calculator
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Calculate how much you'll save by switching to Auth247
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="userCount">Number of Users</Label>
                  <Input
                    id="userCount"
                    type="number"
                    value={userCount}
                    onChange={(e) => setUserCount(parseInt(e.target.value) || 0)}
                    min="1"
                    max="10000"
                  />
                </div>
                <div>
                  <Label htmlFor="provider">Current Provider</Label>
                  <select
                    id="provider"
                    value={currentProvider}
                    onChange={(e) => setCurrentProvider(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="auth0">Auth0</option>
                    <option value="okta">Okta</option>
                    <option value="aws">AWS Cognito</option>
                    <option value="azure">Azure AD B2C</option>
                  </select>
                </div>
              </div>

              {calculatorResult && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        ${calculatorResult.currentCost.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Current Monthly Cost
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        ${calculatorResult.auth247Cost.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Auth247 Monthly Cost
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-600">
                        ${calculatorResult.savings.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Monthly Savings ({calculatorResult.percentageSavings}%)
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <div className="text-lg font-semibold text-green-600 mb-4">
                      Annual Savings: ${(calculatorResult.savings * 12).toLocaleString()}
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button onClick={shareCalculatorResult}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Results
                      </Button>
                      <Button variant="outline" onClick={() => downloadResource('roi-template')}>
                        <Download className="h-4 w-4 mr-2" />
                        Download ROI Report
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-green-600" />
                Enterprise Security Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  'Multi-Factor Authentication (MFA)',
                  'SAML 2.0 SSO Integration',
                  'OAuth2 Authorization',
                  'Role-Based Access Control',
                  'Session Management',
                  'Audit Logging',
                  'IP Whitelisting',
                  'Compliance Certifications'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>{item}</span>
                    <Badge variant="secondary" className="ml-auto">
                      Included
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Button onClick={() => downloadResource('security-checklist')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Complete Checklist
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-6 w-6 text-blue-600" />
                  Quick Migration Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Step-by-step guide to migrate from your current provider to Auth247 in under 30 minutes.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => downloadResource('migration-guide')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Guide
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-purple-600" />
                  Team Onboarding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Complete guide for onboarding your team to Auth247 with minimal disruption.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => downloadResource('team-onboarding')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Guide
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  ROI Calculation Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Calculate the return on investment for switching to Auth247.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => downloadResource('roi-template')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                  Business Case Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Present the business case for Auth247 to stakeholders.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => downloadResource('business-case')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {downloadCount > 0 && (
        <div className="text-center">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Download className="h-4 w-4 mr-2" />
            {downloadCount} resources downloaded
          </Badge>
        </div>
      )}
    </div>
  );
}