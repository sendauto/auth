/**
 * Viral Growth Dashboard
 * Monitor and optimize viral growth metrics and features
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Zap, 
  Shield, 
  Clock, 
  Target,
  Share2,
  Settings,
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { AntiSSOTaxWidget } from '@/components/viral/AntiSSOTaxWidget';
import { SelfServiceSSOWizard } from '@/components/viral/SelfServiceSSOWizard';

interface ViralMetrics {
  viralCoefficient: number;
  timeToValue: number;
  trialToPaidConversion: number;
  networkEffectValue: number;
  enterprisePenetration: {
    individual: number;
    team: number;
    organization: number;
  };
}

export function ViralGrowthDashboard() {
  const [metrics, setMetrics] = useState<ViralMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from /api/viral/dashboard
      // For now, we'll simulate the data
      const mockData = {
        metrics: {
          viralCoefficient: 1.3,
          timeToValue: 280000, // 4m 40s in milliseconds
          trialToPaidConversion: 23.5,
          networkEffectValue: 85,
          enterprisePenetration: {
            individual: 45,
            team: 28,
            organization: 12
          }
        },
        recentInvitations: [
          { inviteeEmail: 'dev@techcorp.com', organizationDomain: 'techcorp.com', source: 'sso_setup' },
          { inviteeEmail: 'it@startup.io', organizationDomain: 'startup.io', source: 'dashboard' }
        ],
        recentSSOSetups: [
          { organizationDomain: 'enterprise.com', provider: 'google', setupTime: 245000, success: true },
          { organizationDomain: 'company.net', provider: 'microsoft', setupTime: 325000, success: true }
        ],
        recommendations: [
          'Optimize SSO setup time - currently 4m 40s, target under 5 minutes ✓',
          'Viral coefficient at 1.3 (target >1.0) - excellent viral growth',
          'Add team discovery for enterprise domains',
          'Implement viral branding in all authentication flows'
        ],
        antiSSOTaxSavings: {
          competitorPrice: 27,
          auth247Price: 9,
          monthlySavings: 18,
          annualSavings: 216,
          percentageSavings: '67%'
        }
      };
      
      setMetrics(mockData.metrics);
      setDashboardData(mockData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getViralCoefficientColor = (coefficient: number) => {
    if (coefficient >= 1.0) return 'text-green-600';
    if (coefficient >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Viral Growth Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and optimize Auth247's viral growth mechanisms
          </p>
        </div>
        <Button onClick={loadDashboardData}>
          <BarChart3 className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Viral Coefficient
                </p>
                <p className={`text-2xl font-bold ${getViralCoefficientColor(metrics?.viralCoefficient || 0)}`}>
                  {metrics?.viralCoefficient.toFixed(1)}
                </p>
              </div>
              <TrendingUp className={`h-8 w-8 ${getViralCoefficientColor(metrics?.viralCoefficient || 0)}`} />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {(metrics?.viralCoefficient || 0) >= 1.0 ? 'Exponential growth' : 'Target: >1.0'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Time to Value
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatTime(metrics?.timeToValue || 0)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              SSO setup time (target: &lt;5min)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Trial Conversion
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics?.trialToPaidConversion.toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Trial to paid conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Network Effect
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {metrics?.networkEffectValue}%
                </p>
              </div>
              <Share2 className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Value increase per user
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="anti-sso-tax">Anti-SSO Tax</TabsTrigger>
          <TabsTrigger value="sso-setup">SSO Setup</TabsTrigger>
          <TabsTrigger value="enterprise">Enterprise Growth</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Enterprise Penetration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Individual Users</span>
                      <span>{metrics?.enterprisePenetration.individual}%</span>
                    </div>
                    <Progress value={metrics?.enterprisePenetration.individual} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Team Adoption</span>
                      <span>{metrics?.enterprisePenetration.team}%</span>
                    </div>
                    <Progress value={metrics?.enterprisePenetration.team} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Organization-wide</span>
                      <span>{metrics?.enterprisePenetration.organization}%</span>
                    </div>
                    <Progress value={metrics?.enterprisePenetration.organization} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Recent Viral Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Recent Invitations</h4>
                    <div className="space-y-2">
                      {dashboardData?.recentInvitations.map((invite: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="text-xs">
                            {invite.source}
                          </Badge>
                          <span>{invite.inviteeEmail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Recent SSO Setups</h4>
                    <div className="space-y-2">
                      {dashboardData?.recentSSOSetups.map((setup: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{setup.organizationDomain}</span>
                          <Badge variant="secondary" className="text-xs">
                            {formatTime(setup.setupTime)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="anti-sso-tax" className="space-y-6">
          <AntiSSOTaxWidget variant="comparison" />
        </TabsContent>

        <TabsContent value="sso-setup" className="space-y-6">
          <SelfServiceSSOWizard />
        </TabsContent>

        <TabsContent value="enterprise" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Enterprise Viral Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {metrics?.enterprisePenetration.individual}%
                    </div>
                    <div className="text-sm font-medium">Individual Developers</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Single user adoption
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 mb-1">
                      {metrics?.enterprisePenetration.team}%
                    </div>
                    <div className="text-sm font-medium">Team Expansion</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Department-level growth
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {metrics?.enterprisePenetration.organization}%
                    </div>
                    <div className="text-sm font-medium">Organization-wide</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Enterprise adoption
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Viral Growth Opportunities</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Invite IT team members to manage SSO</li>
                    <li>• Set up custom authentication domain</li>
                    <li>• Enable security monitoring dashboard</li>
                    <li>• Configure role-based access for different teams</li>
                    <li>• Set up automated user provisioning</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                Growth Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.recommendations.map((recommendation: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    {recommendation.includes('✓') ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    )}
                    <span className="text-sm">{recommendation}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Viral Coefficient Analysis
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Current viral coefficient of {metrics?.viralCoefficient} indicates{' '}
                  {(metrics?.viralCoefficient || 0) >= 1.0 ? 'strong exponential growth' : 'room for improvement'}.
                  {(metrics?.viralCoefficient || 0) >= 1.0 
                    ? ' Continue optimizing invitation flows and reducing setup friction.'
                    : ' Focus on improving invitation flows and reducing time to value.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}