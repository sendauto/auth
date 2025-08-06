import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface CurrentSubscription {
  id: string;
  status: string;
  plan: {
    id: string;
    name: string;
    description: string;
    pricePerUser: number;
    currency: string;
    features: string[];
  };
  hasSubscription: boolean;
  isTrialActive: boolean;
  daysRemaining: number | null;
  freeUsers: number;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  displayName: string;
  description: string;
  price: string;
  currency: string;
  billingInterval: string;
  features: Record<string, boolean>;
  limits: {
    users: number;
    sessions: number;
    apiCalls: number;
    storage: number;
    auditRetention: number;
  };
  isActive: boolean;
  sortOrder: number;
}

export function SubscriptionPage() {
  const [isStartingTrial, setIsStartingTrial] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current subscription
  const { data: currentSubscription, isLoading: isLoadingCurrent } = useQuery<CurrentSubscription>({
    queryKey: ["/api/subscription/current"],
  });

  // Fetch available plans
  const { data: availablePlans, isLoading: isLoadingPlans } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription/plans"],
  });

  // Start trial mutation
  const startTrialMutation = useMutation({
    mutationFn: async () => await apiRequest("POST", "/api/subscription/start-trial"),
    onSuccess: () => {
      toast({
        title: "Trial Started",
        description: "Your 14-day free trial has begun successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/current"] });
      setIsStartingTrial(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start trial",
        variant: "destructive",
      });
      setIsStartingTrial(false);
    },
  });

  const handleStartTrial = async () => {
    setIsStartingTrial(true);
    startTrialMutation.mutate();
  };

  const handleUpgrade = (planId: number) => {
    toast({
      title: "Upgrade Coming Soon",
      description: "Plan upgrade functionality will be available shortly.",
    });
  };

  const daysRemaining = currentSubscription?.daysRemaining ?? 0;
  const professionalPlan = availablePlans?.find(p => p.name === "professional");

  const isLoading = isLoadingCurrent || isLoadingPlans;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="space-y-6">
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          <p className="text-muted-foreground">
            Manage your Auth247 subscription and billing information.
          </p>
        </div>

        {/* Current Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Current Plan
              {currentSubscription?.isTrialActive && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Clock className="w-3 h-3 mr-1" />
                  Trial
                </Badge>
              )}
              {currentSubscription?.status === "free" && (
                <Badge variant="outline">Free</Badge>
              )}
            </CardTitle>
            <CardDescription>
              {currentSubscription?.plan?.name || "No active subscription"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
                  {currentSubscription && (
                    <>
                      {/* Plan Status */}
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <h3 className="font-semibold">{currentSubscription.plan?.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {currentSubscription.isTrialActive 
                              ? `Trial ends in ${daysRemaining} days`
                              : `Active subscription`
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {currentSubscription.isTrialActive ? "$0" : formatCurrency(currentSubscription.plan?.pricePerUser || 0.89)}
                          </div>
                          <div className="text-sm text-muted-foreground">per user per month</div>
                        </div>
                      </div>

                      {/* Pricing Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Free Users Included</h4>
                          <div className="flex items-center gap-3">
                            <Users className="w-8 h-8 text-blue-500" />
                            <div>
                              <div className="text-2xl font-bold">{formatNumber(currentSubscription.freeUsers)}</div>
                              <div className="text-sm text-muted-foreground">Users at no cost</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Per-User Rate</h4>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 font-bold text-sm">$</span>
                            </div>
                            <div>
                              <div className="text-2xl font-bold">${currentSubscription.plan?.pricePerUser || '0.89'}</div>
                              <div className="text-sm text-muted-foreground">Per additional user</div>
                            </div>
                          </div>
                        </div>
                      </div>
              
                      {/* Features List */}
                      {currentSubscription.plan?.features && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Included Features</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {currentSubscription.plan.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Trial Offer - Only show if not in trial */}
              {currentSubscription && !currentSubscription.isTrialActive && professionalPlan && (
                <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                      <Clock className="w-5 h-5" />
                      Try Professional Free for 14 Days
                    </CardTitle>
                    <CardDescription className="text-blue-700">
                      Unlock advanced features and see how Auth247 Professional can transform your authentication workflow
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">Up to 100 users</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">10 applications</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">10GB storage</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">100K API requests</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleStartTrial}
                      disabled={isStartingTrial || startTrialMutation.isPending}
                      className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
                    >
                      {isStartingTrial || startTrialMutation.isPending ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Starting Trial...
                        </>
                      ) : (
                        "Start 14-Day Free Trial"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* Available Plans */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold">Subscription Plans</h2>
                  <p className="text-muted-foreground">
                    Simple per-user pricing with 10 free users. No complex tiers or hidden fees.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {availablePlans?.map((plan) => (
                    <Card key={plan.id} className="relative">
                      {plan.name === "professional" && (
                        <Badge className="absolute -top-2 left-4 bg-blue-600">Most Popular</Badge>
                      )}
                      <CardHeader>
                        <CardTitle>{plan.displayName}</CardTitle>
                        <CardDescription className="min-h-[3rem]">{plan.description}</CardDescription>
                        <div className="text-3xl font-bold">
                          ${plan.price}
                          <span className="text-sm font-normal text-muted-foreground">/{plan.billingInterval}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Users:</span>
                            <span className="font-medium">
                              {plan.limits.users === -1 ? "Unlimited" : plan.limits.users}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Applications:</span>
                            <span className="font-medium">
                              {plan.limits.sessions === -1 ? "Unlimited" : plan.limits.sessions}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Storage:</span>
                            <span className="font-medium">{plan.limits.storage}GB</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>API Requests:</span>
                            <span className="font-medium">
                              {plan.limits.apiCalls === -1 ? "Unlimited" : `${plan.limits.apiCalls / 1000}K`}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant={currentSubscription?.plan?.name === plan.displayName ? "outline" : "default"}
                          className="w-full"
                          disabled={currentSubscription?.plan?.name === plan.displayName}
                        >
                          {currentSubscription?.plan?.name === plan.displayName ? "Current Plan" : "Upgrade"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
        </div>
      </div>
    </DashboardLayout>
  );
}