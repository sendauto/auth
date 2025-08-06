/**
 * Competitor Comparison Dashboard
 * Real-time cost comparison with Auth0, Okta, Azure AD showing 70% savings
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, TrendingDown, Zap, Users, 
  CheckCircle, XCircle, BarChart3 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface CompetitorData {
  auth247: {
    name: string;
    monthlyPrice: number;
    activeUsersOnly: boolean;
    features: string[];
    pros: string[];
  };
  auth0: {
    name: string;
    monthlyPrice: number;
    activeUsersOnly: boolean;
    features: string[];
    cons: string[];
  };
  okta: {
    name: string;
    monthlyPrice: number;
    activeUsersOnly: boolean;
    features: string[];
    cons: string[];
  };
  azure: {
    name: string;
    monthlyPrice: number;
    activeUsersOnly: boolean;
    features: string[];
    cons: string[];
  };
}

export default function CompetitorComparison() {
  const [userCount, setUserCount] = useState(1000);
  const [activeUserRate, setActiveUserRate] = useState(64); // 64% default active rate

  const { data: billingData } = useQuery({
    queryKey: ['/api/enterprise/billing'],
    queryFn: async () => {
      const response = await fetch('/api/enterprise/billing');
      return response.json();
    }
  });

  const activeUsers = Math.round(userCount * (activeUserRate / 100));
  const inactiveUsers = userCount - activeUsers;

  const competitorData: CompetitorData = {
    auth247: {
      name: 'Auth247',
      monthlyPrice: (activeUsers * 0.89) + 1.99,
      activeUsersOnly: true,
      features: ['Active user billing', 'Free inactive users', 'Enterprise SSO', 'SCIM provisioning', 'Audit logs'],
      pros: ['70% cost savings', 'Pay only for active users', '15-minute setup', 'Zero downtime migration']
    },
    auth0: {
      name: 'Auth0',
      monthlyPrice: userCount * 2.80,
      activeUsersOnly: false,
      features: ['All user billing', 'Enterprise SSO', 'Rules engine', 'Extensive integrations'],
      cons: ['Expensive pricing', 'Pay for inactive users', 'Complex setup', 'Vendor lock-in']
    },
    okta: {
      name: 'Okta',
      monthlyPrice: userCount * 2.00,
      activeUsersOnly: false,
      features: ['All user billing', 'Identity governance', 'Lifecycle management', 'API access'],
      cons: ['High costs', 'Pay for inactive users', 'Enterprise focus only', 'Limited developer tools']
    },
    azure: {
      name: 'Azure AD B2C',
      monthlyPrice: userCount * 1.50,
      activeUsersOnly: false,
      features: ['All user billing', 'Microsoft integration', 'B2C flows', 'Custom policies'],
      cons: ['Microsoft ecosystem lock-in', 'Pay for inactive users', 'Complex configuration', 'Limited flexibility']
    }
  };

  const getSavingsPercentage = (competitorPrice: number, auth247Price: number) => {
    return Math.round(((competitorPrice - auth247Price) / competitorPrice) * 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Competitor Comparison</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          See how Auth247's revolutionary active-user billing saves you 70% compared to Auth0, Okta, and Azure AD
        </p>
      </div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Calculate Your Savings</CardTitle>
          <CardDescription>
            Adjust your organization size to see real-time cost comparisons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Total Users</label>
              <input
                type="number"
                value={userCount}
                onChange={(e) => setUserCount(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                min="1"
                max="100000"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Active User Rate (%)</label>
              <input
                type="number"
                value={activeUserRate}
                onChange={(e) => setActiveUserRate(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                min="1"
                max="100"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{userCount.toLocaleString()}</div>
              <div className="text-sm text-blue-600">Total Users</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{activeUsers.toLocaleString()}</div>
              <div className="text-sm text-green-600">Active Users (Paying)</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{inactiveUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Inactive Users (FREE)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Auth247 Card */}
        <Card className="relative border-2 border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-green-600 text-white">Recommended</Badge>
          </div>
          <CardHeader className="text-center pt-6">
            <CardTitle className="text-xl">{competitorData.auth247.name}</CardTitle>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(competitorData.auth247.monthlyPrice)}
            </div>
            <div className="text-sm text-muted-foreground">/month</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Active Users Only
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Key Features:</h4>
              <ul className="space-y-1 text-xs">
                {competitorData.auth247.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm text-green-600">Advantages:</h4>
              <ul className="space-y-1 text-xs">
                {competitorData.auth247.pros.map((pro, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            <Button className="w-full bg-green-600 hover:bg-green-700">
              Get Started Free
            </Button>
          </CardContent>
        </Card>

        {/* Auth0 Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{competitorData.auth0.name}</CardTitle>
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(competitorData.auth0.monthlyPrice)}
            </div>
            <div className="text-sm text-muted-foreground">/month</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <Badge variant="outline" className="bg-red-100 text-red-800">
                All Users Charged
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Features:</h4>
              <ul className="space-y-1 text-xs">
                {competitorData.auth0.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm text-red-600">Disadvantages:</h4>
              <ul className="space-y-1 text-xs">
                {competitorData.auth0.cons.map((con, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <XCircle className="h-3 w-3 text-red-500" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center p-2 bg-red-50 dark:bg-red-950/20 rounded">
              <div className="text-sm font-medium text-red-600">
                {getSavingsPercentage(competitorData.auth0.monthlyPrice, competitorData.auth247.monthlyPrice)}% more expensive
              </div>
              <div className="text-xs text-red-500">
                +{formatCurrency(competitorData.auth0.monthlyPrice - competitorData.auth247.monthlyPrice)}/month
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Okta Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{competitorData.okta.name}</CardTitle>
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(competitorData.okta.monthlyPrice)}
            </div>
            <div className="text-sm text-muted-foreground">/month</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <Badge variant="outline" className="bg-red-100 text-red-800">
                All Users Charged
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Features:</h4>
              <ul className="space-y-1 text-xs">
                {competitorData.okta.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm text-red-600">Disadvantages:</h4>
              <ul className="space-y-1 text-xs">
                {competitorData.okta.cons.map((con, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <XCircle className="h-3 w-3 text-red-500" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center p-2 bg-red-50 dark:bg-red-950/20 rounded">
              <div className="text-sm font-medium text-red-600">
                {getSavingsPercentage(competitorData.okta.monthlyPrice, competitorData.auth247.monthlyPrice)}% more expensive
              </div>
              <div className="text-xs text-red-500">
                +{formatCurrency(competitorData.okta.monthlyPrice - competitorData.auth247.monthlyPrice)}/month
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Azure AD Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{competitorData.azure.name}</CardTitle>
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(competitorData.azure.monthlyPrice)}
            </div>
            <div className="text-sm text-muted-foreground">/month</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <Badge variant="outline" className="bg-red-100 text-red-800">
                All Users Charged
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Features:</h4>
              <ul className="space-y-1 text-xs">
                {competitorData.azure.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm text-red-600">Disadvantages:</h4>
              <ul className="space-y-1 text-xs">
                {competitorData.azure.cons.map((con, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <XCircle className="h-3 w-3 text-red-500" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center p-2 bg-red-50 dark:bg-red-950/20 rounded">
              <div className="text-sm font-medium text-red-600">
                {getSavingsPercentage(competitorData.azure.monthlyPrice, competitorData.auth247.monthlyPrice)}% more expensive
              </div>
              <div className="text-xs text-red-500">
                +{formatCurrency(competitorData.azure.monthlyPrice - competitorData.auth247.monthlyPrice)}/month
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Your Total Savings with Auth247</CardTitle>
          <CardDescription className="text-lg">
            Stop paying for inactive users and save thousands annually
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <TrendingDown className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency((competitorData.auth0.monthlyPrice - competitorData.auth247.monthlyPrice) * 12)}
              </div>
              <div className="text-sm text-muted-foreground">Annual savings vs Auth0</div>
            </div>
            
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <div className="text-3xl font-bold text-blue-600">
                {getSavingsPercentage(competitorData.auth0.monthlyPrice, competitorData.auth247.monthlyPrice)}%
              </div>
              <div className="text-sm text-muted-foreground">Average cost reduction</div>
            </div>
            
            <div className="text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <div className="text-3xl font-bold text-purple-600">
                {inactiveUsers.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Inactive users (FREE)</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/20 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
              Ready to save {formatCurrency((competitorData.auth0.monthlyPrice - competitorData.auth247.monthlyPrice) * 12)} annually?
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mb-4">
              Join thousands of companies that switched to Auth247's revolutionary active-user billing
            </p>
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Start Free Trial - No Credit Card Required
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}