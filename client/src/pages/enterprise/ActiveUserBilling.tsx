/**
 * Active User Billing Dashboard
 * Revolutionary billing that only charges for active users
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, Users, TrendingDown, Clock, 
  BarChart3, Download, Calendar, Zap 
} from 'lucide-react';

interface BillingData {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  currentBill: number;
  previousBill: number;
  platformFee: number;
  perUserCost: number;
  savingsVsCompetitors: {
    auth0: number;
    okta: number;
    azure: number;
  };
}

export default function ActiveUserBilling() {
  const [billingData, setBillingData] = useState<BillingData>({
    totalUsers: 847,
    activeUsers: 542,
    inactiveUsers: 305,
    currentBill: 484.38,
    previousBill: 623.15,
    platformFee: 1.99,
    perUserCost: 0.89,
    savingsVsCompetitors: {
      auth0: 1889.16,
      okta: 1084.00,
      azure: 870.50
    }
  });

  const savingsPercentage = Math.round(((billingData.previousBill - billingData.currentBill) / billingData.previousBill) * 100);
  const activeUserPercentage = Math.round((billingData.activeUsers / billingData.totalUsers) * 100);

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Active User Billing</h1>
        <p className="text-muted-foreground mt-2">
          Revolutionary billing that only charges for users who actually log in. 
          Save up to 70% vs Auth0, Okta, and Azure AD.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Bill</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${billingData.currentBill}</div>
            <p className="text-xs text-muted-foreground">
              {savingsPercentage}% less than last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingData.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {activeUserPercentage}% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingData.inactiveUsers}</div>
            <p className="text-xs text-green-600">
              100% FREE - No charge for inactive users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings vs Auth0</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${billingData.savingsVsCompetitors.auth0}
            </div>
            <p className="text-xs text-muted-foreground">
              74% less this month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Billing Overview</TabsTrigger>
          <TabsTrigger value="comparison">Competitor Comparison</TabsTrigger>
          <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
          <TabsTrigger value="savings">Savings Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Billing Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>This Month's Billing Breakdown</CardTitle>
              <CardDescription>
                Only pay for users who actually log in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">Active Users ({billingData.activeUsers})</div>
                    <div className="text-sm text-muted-foreground">
                      Users who logged in this month
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${(billingData.activeUsers * billingData.perUserCost).toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      ${billingData.perUserCost}/user
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">Platform Fee</div>
                    <div className="text-sm text-muted-foreground">
                      Monthly platform maintenance
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${billingData.platformFee}</div>
                    <div className="text-sm text-muted-foreground">
                      Fixed monthly fee
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                  <div>
                    <div className="font-medium">Inactive Users ({billingData.inactiveUsers})</div>
                    <div className="text-sm text-green-600">
                      Users who didn't log in this month
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">$0.00</div>
                    <div className="text-sm text-green-600">
                      Always FREE
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">Total Monthly Bill</div>
                  <div className="text-2xl font-bold">${billingData.currentBill}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active vs Inactive Users */}
          <Card>
            <CardHeader>
              <CardTitle>User Activity Distribution</CardTitle>
              <CardDescription>
                Visual breakdown of active vs inactive users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Active Users</span>
                    <span>{billingData.activeUsers} ({activeUserPercentage}%)</span>
                  </div>
                  <Progress value={activeUserPercentage} className="h-3" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{billingData.activeUsers}</div>
                    <div className="text-sm text-blue-600">Active Users</div>
                    <div className="text-xs text-muted-foreground mt-1">Paying users</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{billingData.inactiveUsers}</div>
                    <div className="text-sm text-green-600">Inactive Users</div>
                    <div className="text-xs text-muted-foreground mt-1">FREE users</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Comparison with Competitors</CardTitle>
              <CardDescription>
                See how much you save with Auth247's active-user billing model
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-center">
                      <Badge className="bg-blue-100 text-blue-800 mb-2">Auth247</Badge>
                      <div className="text-2xl font-bold">${billingData.currentBill}</div>
                      <div className="text-sm text-muted-foreground">Active users only</div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
                    <div className="text-center">
                      <Badge variant="outline" className="mb-2">Auth0</Badge>
                      <div className="text-2xl font-bold text-red-600">
                        ${(billingData.totalUsers * 2.80).toFixed(2)}
                      </div>
                      <div className="text-sm text-red-600">All users</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        +${billingData.savingsVsCompetitors.auth0} more
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
                    <div className="text-center">
                      <Badge variant="outline" className="mb-2">Okta</Badge>
                      <div className="text-2xl font-bold text-red-600">
                        ${(billingData.totalUsers * 2.00).toFixed(2)}
                      </div>
                      <div className="text-sm text-red-600">All users</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        +${billingData.savingsVsCompetitors.okta} more
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
                    <div className="text-center">
                      <Badge variant="outline" className="mb-2">Azure AD</Badge>
                      <div className="text-2xl font-bold text-red-600">
                        ${(billingData.totalUsers * 1.50).toFixed(2)}
                      </div>
                      <div className="text-sm text-red-600">All users</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        +${billingData.savingsVsCompetitors.azure} more
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                  <div className="text-center">
                    <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                      You're saving ${billingData.savingsVsCompetitors.auth0} per month
                    </div>
                    <div className="text-sm text-green-600">
                      That's ${(billingData.savingsVsCompetitors.auth0 * 12).toFixed(2)} saved annually vs Auth0
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>
                Understand your user activity patterns to optimize costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">64%</div>
                    <div className="text-sm text-muted-foreground">Average Activity Rate</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">23</div>
                    <div className="text-sm text-muted-foreground">Days This Month</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold">847</div>
                    <div className="text-sm text-muted-foreground">Total Registered</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Cost Optimization Tips</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 36% of your users are inactive and cost $0</li>
                    <li>• Peak activity is weekdays 9-5 PM</li>
                    <li>• Consider user engagement campaigns to increase value</li>
                    <li>• Auth247's model scales perfectly with your business</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="savings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Savings Calculator</CardTitle>
              <CardDescription>
                Calculate your potential savings with Auth247's active-user billing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Your Current Scenario</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Users:</span>
                        <span className="font-medium">{billingData.totalUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Users (64%):</span>
                        <span className="font-medium">{billingData.activeUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Inactive Users (36%):</span>
                        <span className="font-medium">{billingData.inactiveUsers}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Annual Savings</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>vs Auth0:</span>
                        <span className="font-medium text-green-600">
                          ${(billingData.savingsVsCompetitors.auth0 * 12).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>vs Okta:</span>
                        <span className="font-medium text-green-600">
                          ${(billingData.savingsVsCompetitors.okta * 12).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>vs Azure AD:</span>
                        <span className="font-medium text-green-600">
                          ${(billingData.savingsVsCompetitors.azure * 12).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                      ROI: Stop paying for inactive users today
                    </div>
                    <div className="text-sm text-blue-600 mt-1">
                      With Auth247, {billingData.inactiveUsers} inactive users cost you $0 instead of 
                      ${(billingData.inactiveUsers * 2.80).toFixed(2)}/month with Auth0
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Billing Report
        </Button>
        <Button variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          View Detailed Analytics
        </Button>
      </div>
    </div>
  );
}