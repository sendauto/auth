import React, { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle, Star, Users, Building, Crown, ArrowRight, Loader2, Calculator } from "lucide-react";
import { AntiSSOTaxWidget } from "@/components/viral/AntiSSOTaxWidget";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicNavigation } from "@/components/layout/PublicNavigation";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface PricingConfig {
  pricePerUser: string;
  platformMaintenanceFee: string;
  currency: string;
  trialDays: number;
  annualDiscountPercent: number;
}

export function PricingPage() {
  const [userCount, setUserCount] = useState(50);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  const { data: config, isLoading, error } = useQuery<PricingConfig>({
    queryKey: ['/api/pricing/config'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const calculatePricing = () => {
    if (!config) return { total: 0, activeUsers: 0, discount: 0, subtotal: 0, platformFee: 0 };
    
    const pricePerUser = parseFloat(config.pricePerUser);
    const platformMaintenanceFee = parseFloat(config.platformMaintenanceFee);
    
    // Active User Model: Only active users are billable
    const activeUsers = userCount;
    const userCost = pricePerUser * activeUsers;
    const platformFee = platformMaintenanceFee;
    const subtotal = userCost + platformFee;
    const discount = billingInterval === 'yearly' ? subtotal * (config.annualDiscountPercent / 100) : 0;
    const total = subtotal - discount;
    
    return { total, activeUsers, discount, subtotal, platformFee, userCost };
  };

  const pricing = calculatePricing();

  const features = [
    "Revolutionary active-user-only billing model",
    "Inactive users completely free forever",
    "Low $1.99/month platform maintenance fee per organization",
    "Advanced role-based access control", 
    "24/7 priority support",
    "Complete audit logging & compliance",
    "Team management & analytics",
    "Custom integrations & API access",
    "White-label branding options",
    "99.9% SLA guarantee",
    "Advanced security monitoring",
    "Multi-tenant architecture",
    "Real-time notifications"
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading pricing configuration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load pricing configuration</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <PublicNavigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Revolutionary Active User Billing
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Pay only $0.89 per <strong>active user</strong> + $1.99/month platform fee. 
            Inactive users cost nothing. Get all enterprise features with complete transparency.
          </p>
          <div className="inline-flex bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-lg font-medium">
            70% less than Auth0, Okta, and Azure AD
          </div>
        </div>

        {/* Revolutionary Billing Model Callout */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-2 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-4">
                🎯 Revolutionary Active User Billing
              </h2>
              <p className="text-lg text-green-700 dark:text-green-300 mb-6">
                Unlike competitors who charge for ALL users, Auth247 only bills for <strong>active users</strong>.
                Inactive users cost you nothing, making our platform dramatically more cost-effective.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Other Providers</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Pay for every user account, even those who never log in. 
                    Seasonal employees? Still billed. Ex-employees not deleted? Still billed.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Auth247</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Only pay for users who actually use the system. 
                    Inactive users are completely free. Zero waste, maximum value.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Calculator */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <Calculator className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Calculate Your Cost</h2>
                <p className="text-muted-foreground">See exactly what you'll pay with our transparent pricing</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* User Count Input */}
                <div className="space-y-4">
                  <label className="text-sm font-medium">Number of active users</label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="1"
                      max="1000"
                      value={userCount}
                      onChange={(e) => setUserCount(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>1</span>
                      <span className="font-medium text-lg text-foreground">{formatNumber(userCount)} users</span>
                      <span>1000+</span>
                    </div>
                  </div>
                  
                  {/* Billing Interval Toggle */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Billing interval</label>
                    <div className="flex space-x-2">
                      <Button
                        variant={billingInterval === 'monthly' ? 'default' : 'outline'}
                        onClick={() => setBillingInterval('monthly')}
                        className="flex-1"
                      >
                        Monthly
                      </Button>
                      <Button
                        variant={billingInterval === 'yearly' ? 'default' : 'outline'}
                        onClick={() => setBillingInterval('yearly')}
                        className="flex-1"
                      >
                        Yearly (15% off)
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold">Cost Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Active Users</span>
                      <span className="text-sm">{formatNumber(pricing.activeUsers)} users</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Price per active user</span>
                      <span className="text-sm">${config?.pricePerUser || '0.89'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">User cost</span>
                      <span className="text-sm">{formatCurrency(pricing.userCost || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Platform maintenance fee</span>
                      <span className="text-sm">{formatCurrency(pricing.platformFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Subtotal</span>
                      <span className="text-sm">{formatCurrency(pricing.subtotal)}</span>
                    </div>
                    {billingInterval === 'yearly' && pricing.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span className="text-sm">Annual discount (15%)</span>
                        <span className="text-sm">-{formatCurrency(pricing.discount)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total per month</span>
                        <span>{formatCurrency(pricing.total)}</span>
                      </div>
                      {billingInterval === 'yearly' && (
                        <div className="text-sm text-muted-foreground text-right">
                          {formatCurrency(pricing.total * 12)} billed annually
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-8">
                <Link href="/signup">
                  <Button size="lg" className="px-8">
                    Start 14-Day Free Trial
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground mt-2">
                  No credit card required • Full access to all features
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Everything Included</h2>
                <p className="text-muted-foreground">No feature restrictions. Full enterprise platform from day one.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Compare with Competitors</h2>
            <p className="text-muted-foreground">See how Auth247 stacks up against the industry leaders</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-2 border-primary">
              <CardContent className="p-6 text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Logo className="h-8 w-8" />
                </div>
                <h3 className="font-bold mb-2">Auth247</h3>
                <div className="text-2xl font-bold text-primary mb-2">$0.89</div>
                <div className="text-sm text-muted-foreground">per active user/month</div>
                <div className="text-xs text-green-600 mt-1">+ $1.99 platform fee</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold">A0</span>
                </div>
                <h3 className="font-bold mb-2">Auth0</h3>
                <div className="text-2xl font-bold text-muted-foreground mb-2">$2.30</div>
                <div className="text-sm text-muted-foreground">per user/month</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold">OK</span>
                </div>
                <h3 className="font-bold mb-2">Okta</h3>
                <div className="text-2xl font-bold text-muted-foreground mb-2">$2.00</div>
                <div className="text-sm text-muted-foreground">per user/month</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold">AZ</span>
                </div>
                <h3 className="font-bold mb-2">Azure AD</h3>
                <div className="text-2xl font-bold text-muted-foreground mb-2">$1.80</div>
                <div className="text-sm text-muted-foreground">per user/month</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Got questions? We have answers.</p>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">What happens when I exceed 10 users?</h3>
                <p className="text-muted-foreground">You'll be charged $0.89 per month for each additional user above the 10 free users. No surprises, no hidden fees.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Can I change my billing interval?</h3>
                <p className="text-muted-foreground">Yes! You can switch between monthly and yearly billing at any time. Annual billing includes a 15% discount.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Is there a long-term commitment?</h3>
                <p className="text-muted-foreground">No contracts required. You can cancel anytime and only pay for what you use. Your data remains accessible during the trial period.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">What's included in the free trial?</h3>
                <p className="text-muted-foreground">Everything! Full access to all features, unlimited SSO providers, custom branding, and priority support for 14 days.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of companies already using Auth247 for their authentication needs.
          </p>
          <div className="space-x-4">
            <Link href="/signup">
              <Button size="lg" className="px-8">
                Start Free Trial
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="px-8">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Standard Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Product</h3>
              <div className="space-y-2">
                <Link href="/pricing" className="block text-gray-300 hover:text-white transition-colors">Pricing</Link>
                <Link href="/demo" className="block text-gray-300 hover:text-white transition-colors">Live Demo</Link>
                <Link href="/docs" className="block text-gray-300 hover:text-white transition-colors">Documentation</Link>
                <Link href="/developer-portal" className="block text-gray-300 hover:text-white transition-colors">Developer Portal</Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Company</h3>
              <div className="space-y-2">
                <Link href="/about" className="block text-gray-300 hover:text-white transition-colors">About</Link>
                <Link href="/contact" className="block text-gray-300 hover:text-white transition-colors">Contact</Link>
                <Link href="/migration-assistant" className="block text-gray-300 hover:text-white transition-colors">Migration</Link>
                <Link href="/white-label" className="block text-gray-300 hover:text-white transition-colors">White Label</Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Legal</h3>
              <div className="space-y-2">
                <Link href="/terms" className="block text-gray-300 hover:text-white transition-colors">Terms of Service</Link>
                <Link href="/privacy" className="block text-gray-300 hover:text-white transition-colors">Privacy Policy</Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Auth247</h3>
              <p className="text-gray-300 text-sm">Secure 24/7 authentication platform for modern enterprises.</p>
              <p className="text-gray-400 text-xs">© 2025 Auth247 Technologies LLC. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Anti-SSO Tax Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <AntiSSOTaxWidget variant="pricing" defaultUserCount={userCount} />
      </div>
    </div>
  );
}