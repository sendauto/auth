/**
 * Anti-SSO Tax Widget - Core viral differentiator
 * Shows competitive pricing advantage and drives viral adoption
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X, Calculator, TrendingUp, Shield } from 'lucide-react';

interface SavingsData {
  userCount: number;
  auth247: {
    base: number;
    sso: number;
    total: number;
  };
  competitor: {
    base: number;
    sso: number;
    total: number;
  };
  savings: {
    monthly: number;
    annual: number;
    percentage: string;
  };
}

interface AntiSSOTaxWidgetProps {
  variant?: 'landing' | 'pricing' | 'comparison' | 'embedded';
  defaultUserCount?: number;
  showCalculator?: boolean;
  showComparison?: boolean;
}

export function AntiSSOTaxWidget({ 
  variant = 'landing', 
  defaultUserCount = 100,
  showCalculator = true,
  showComparison = true 
}: AntiSSOTaxWidgetProps) {
  const [userCount, setUserCount] = useState(defaultUserCount);
  const [savingsData, setSavingsData] = useState<SavingsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [messaging, setMessaging] = useState<any>(null);

  useEffect(() => {
    loadMessaging();
    if (showCalculator) {
      calculateSavings(userCount);
    }
  }, [variant, userCount, showCalculator]);

  const loadMessaging = async () => {
    try {
      const response = await fetch(`/api/viral/anti-sso-tax?context=${variant}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessaging(data.messaging);
      }
    } catch (error) {
      console.error('Failed to load anti-SSO tax messaging:', error);
    }
  };

  const calculateSavings = async (users: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/viral/savings-calculator?users=${users}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSavingsData(data.savings);
        
        // Track viral impact
        trackViralImpact('savings_calculated', { userCount: users });
      }
    } catch (error) {
      console.error('Failed to calculate savings:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackViralImpact = async (event: string, data: any) => {
    try {
      await fetch('/api/viral/track-impact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ event, data })
      });
    } catch (error) {
      console.error('Failed to track viral impact:', error);
    }
  };

  const handleUserCountChange = (value: string) => {
    const count = parseInt(value) || 0;
    setUserCount(count);
    if (count > 0 && showCalculator) {
      calculateSavings(count);
    }
  };

  if (variant === 'embedded') {
    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-5 w-5 text-green-600" />
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            No SSO Tax
          </Badge>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Enterprise SSO included free. Save {savingsData?.savings.percentage || '67%'} vs competitors.
        </p>
        {savingsData && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            ${savingsData.savings.annual}/year savings
          </p>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-green-600" />
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            No SSO Tax
          </Badge>
        </div>
        <CardTitle className="text-2xl lg:text-3xl">
          {messaging?.headline || 'No SSO Tax - Enterprise Security Included'}
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-400">
          {messaging?.description || 'Enterprise SSO shouldn\'t cost extra. Auth247 includes all SSO providers in every plan.'}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {showCalculator && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Calculate Your Savings</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="userCount">Number of Users</Label>
                <Input
                  id="userCount"
                  type="number"
                  value={userCount}
                  onChange={(e) => handleUserCountChange(e.target.value)}
                  placeholder="100"
                  min="1"
                  max="10000"
                />
              </div>
              
              {savingsData && !loading && (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${savingsData.savings.monthly}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Monthly savings
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${savingsData.savings.annual}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Annual savings
                    </div>
                  </div>
                </>
              )}
            </div>

            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            )}
          </div>
        )}

        {showComparison && savingsData && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Pricing Comparison
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Auth247 Pricing */}
              <Card className="border-2 border-green-500 relative">
                <Badge className="absolute -top-2 left-4 bg-green-500 text-white">
                  Recommended
                </Badge>
                <CardHeader>
                  <CardTitle className="text-green-600">Auth247</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Base Plan ({userCount} users)</span>
                      <span>${savingsData.auth247.base}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Enterprise SSO</span>
                      <span className="flex items-center gap-1">
                        <Check className="h-4 w-4" />
                        Free
                      </span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-bold">
                      <span>Total Monthly</span>
                      <span>${savingsData.auth247.total}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Competitor Pricing */}
              <Card className="border border-gray-300">
                <CardHeader>
                  <CardTitle className="text-gray-600">Typical Competitor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Base Plan ({userCount} users)</span>
                      <span>${savingsData.competitor.base}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>SSO "Tax"</span>
                      <span className="flex items-center gap-1">
                        <X className="h-4 w-4" />
                        +${savingsData.competitor.sso}
                      </span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-bold">
                      <span>Total Monthly</span>
                      <span>${savingsData.competitor.total}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                Save {savingsData.savings.percentage}% with Auth247
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                That's ${savingsData.savings.annual} annually with no hidden SSO costs
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => {
              trackViralImpact('cta_clicked', { variant, userCount, context: 'anti_sso_tax' });
              window.location.href = '/signup';
            }}
          >
            Start Free Trial - No SSO Tax
          </Button>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            All enterprise features included. No credit card required.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Embedded version for use in other components
export function AntiSSOTaxBadge() {
  return (
    <AntiSSOTaxWidget 
      variant="embedded" 
      showCalculator={false} 
      showComparison={false} 
    />
  );
}