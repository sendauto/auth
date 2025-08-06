import React from "react";
import { Link } from "wouter";
import { Shield, Users, Clock, Lock, CheckCircle, ArrowRight, Star, Building, Globe, Zap, Crown } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicNavigation } from "@/components/layout/PublicNavigation";
import { CTASection } from "@/components/marketing/CTASection";

export function HomePage() {
  const features = [
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption with multi-factor authentication and advanced threat detection.",
      stats: "99.99% secure authentication"
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Always-on authentication services with 99.9% uptime guarantee and global redundancy.",
      stats: "99.9% uptime SLA"
    },
    {
      icon: Users,
      title: "Team Management",
      description: "Sophisticated role-based access control with hierarchical permissions and audit trails.",
      stats: "Unlimited team members"
    },
    {
      icon: Globe,
      title: "SSO Integration",
      description: "Seamless single sign-on with Google Workspace, Microsoft Azure AD, Okta, and Keycloak.",
      stats: "50+ SSO providers"
    },
    {
      icon: Lock,
      title: "Compliance Ready",
      description: "GDPR, SOC 2, and enterprise compliance with comprehensive audit logging.",
      stats: "SOC 2 Type II certified"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Sub-100ms authentication response times with intelligent caching and optimization.",
      stats: "<100ms response time"
    }
  ];

  const testimonials = [
    {
      quote: "Auth247 saved us $50K annually compared to Auth0. The active-user billing model is genius.",
      author: "Sarah Johnson",
      role: "CTO at TechCorp",
      company: "TechCorp (500+ employees)"
    },
    {
      quote: "Setup took 15 minutes. The migration from Okta was seamless with their expert support.",
      author: "Michael Chen", 
      role: "DevOps Lead",
      company: "StartupXYZ (50+ employees)"
    },
    {
      quote: "Finally, an auth provider that doesn't punish growth. We only pay for users who actually log in.",
      author: "Emily Rodriguez",
      role: "Head of Engineering",
      company: "ScaleUp Inc (200+ employees)"
    }
  ];

  const competitors = [
    {
      name: "Auth0",
      price: "$2.80",
      period: "/user/month",
      billing: "All registered users",
      savings: "68% more expensive"
    },
    {
      name: "Okta",
      price: "$2.00", 
      period: "/user/month",
      billing: "All registered users",
      savings: "55% more expensive"
    },
    {
      name: "Azure AD B2C",
      price: "$1.50",
      period: "/user/month", 
      billing: "All registered users",
      savings: "41% more expensive"
    }
  ];

  const plans = [
    {
      name: "Auth247",
      price: "$0.89",
      period: "/active user/month",
      originalPrice: "$1.50",
      description: "Pay only for active users + $1.99/month platform fee",
      features: [
        "Only pay for active users (inactive users free)",
        "All SSO providers (Google, Azure AD, Okta)",
        "Advanced role-based access control",
        "24/7 priority support",
        "Complete audit logging & compliance",
        "Team management & analytics",
        "Custom integrations & API access",
        "White-label branding options",
        "99.9% SLA guarantee"
      ],
      popular: true,
      savings: "70% less than competitors",
      freeUsers: "10 users included free",
      note: "14-day free trial"
    }
  ];



  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation currentPage="/" />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center max-w-5xl mx-auto">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              SOC 2 Type II Certified • Trusted by 10,000+ companies
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Authentication that
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent block">
                only charges for active users
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Stop paying for inactive users. Auth247's revolutionary billing model charges just <strong>$0.89/month per active user</strong> + $1.99 platform fee. Save up to 70% vs Auth0, Okta, and Azure AD.
            </p>

            {/* Value Props */}
            <div className="flex flex-wrap justify-center gap-6 mb-10">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Inactive users always free
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle className="h-5 w-5 text-green-500" />
                15-minute setup
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Zero migration downtime
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 py-4 h-auto">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-auto">
                  See Live Demo
                </Button>
              </Link>
            </div>

            {/* Cost Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {competitors.map((competitor) => (
                <Card key={competitor.name} className="relative">
                  <CardContent className="p-6 text-center">
                    <h4 className="font-semibold mb-2">{competitor.name}</h4>
                    <div className="text-2xl font-bold mb-1">{competitor.price}</div>
                    <div className="text-sm text-muted-foreground mb-2">{competitor.period}</div>
                    <div className="text-xs text-red-600 font-medium">{competitor.savings}</div>
                    <div className="text-xs text-muted-foreground">{competitor.billing}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Free Tier Secondary */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 mb-8 max-w-3xl mx-auto border border-green-200 dark:border-green-800">
              <div className="text-center">
                <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">Or Start Free Forever</h3>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  Perfect for small teams: 10 users, 2 apps, 100MB storage, 10K API requests
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/signup">
                <Button size="lg" className="min-w-[220px] bg-blue-600 hover:bg-blue-700">
                  Start 14-Day Enterprise Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg" className="min-w-[200px]">
                  Try Demo First
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center text-sm text-muted-foreground mb-8">
              <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
              Full enterprise features • No credit card required • Auto-downgrade to free after trial
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-center">
              <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 shadow-sm">
                <div className="text-lg font-bold text-green-600">$1/user</div>
                <div className="text-sm text-muted-foreground mb-2">saved vs Auth0</div>
                <div className="text-xs text-muted-foreground">10 users free • Basic plan</div>
              </div>
              <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 shadow-sm">
                <div className="text-lg font-bold text-green-600">$2/user</div>
                <div className="text-sm text-muted-foreground mb-2">saved vs Okta</div>
                <div className="text-xs text-muted-foreground">Professional features</div>
              </div>
              <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 shadow-sm">
                <div className="text-lg font-bold text-green-600">$4/user</div>
                <div className="text-sm text-muted-foreground mb-2">saved vs Azure AD</div>
                <div className="text-xs text-muted-foreground">Enterprise features</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by thousands of companies worldwide
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how Auth247's revolutionary pricing model is saving companies thousands monthly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-lg font-medium mb-4 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="border-t pt-4">
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need for enterprise authentication
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for enterprise scale with features that rival Auth0, Okta, and Azure AD
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground mb-3">{feature.description}</p>
                      <div className="text-sm font-medium text-primary">{feature.stats}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Competitive Advantage */}
      <section className="py-24 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why companies choose Auth247 over Auth0, Okta, and Azure AD
            </h2>
            <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
              Stop paying for inactive users. Our revolutionary billing model charges only for users who actually log in.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Active-User-Only Billing</h3>
                  <p className="text-primary-foreground/80">
                    Pay $0.89/month only for users who actively log in. Inactive users are completely free.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">15-Minute Setup</h3>
                  <p className="text-primary-foreground/80">
                    Complete enterprise authentication setup in 15 minutes with our migration assistant.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Zero Vendor Lock-in</h3>
                  <p className="text-primary-foreground/80">
                    Export your data anytime. Standard protocols ensure easy migration if needed.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Enterprise Support</h3>
                  <p className="text-primary-foreground/80">
                    24/7 support from authentication experts, not chatbots or offshore support.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6 text-center">Cost Comparison</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span>Auth247 (1000 active users)</span>
                  <span className="font-bold text-green-300">$892/month</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-500/20 rounded-lg">
                  <span>Auth0 (1000 users)</span>
                  <span className="font-bold">$2,800/month</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-500/20 rounded-lg">
                  <span>Okta (1000 users)</span>
                  <span className="font-bold">$2,000/month</span>
                </div>
                <div className="text-center pt-4 border-t border-white/20">
                  <div className="text-3xl font-bold text-green-300">Save $22,896/year</div>
                  <div className="text-sm text-primary-foreground/80">vs Auth0 for 1000 users</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Trial Benefits */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What You Get During Your 14-Day Enterprise Trial
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Experience the full power of enterprise authentication without any limitations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Unlimited Users</h3>
              <p className="text-blue-100">
                No user limits during trial. Test with your entire organization, from 10 to 10,000+ users.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Enterprise SSO</h3>
              <p className="text-blue-100">
                Full access to SAML, OIDC, Okta, Azure AD, Google Workspace integrations.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Building className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Custom Branding</h3>
              <p className="text-blue-100">
                White-label the entire authentication flow with your company's branding and domain.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Advanced Security</h3>
              <p className="text-blue-100">
                Role-based access control, audit logs, compliance features, and security monitoring.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
              <p className="text-blue-100">
                Priority technical support with direct access to our engineering team during trial.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Custom Integrations</h3>
              <p className="text-blue-100">
                Build custom integrations with our full API access and developer tools.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center bg-white/20 rounded-full px-6 py-3 mb-6">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">After 14 days, automatically downgrades to our free plan (10 users)</span>
            </div>
            <div className="text-blue-100">
              No surprise charges • No credit card required • Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Auth247?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for enterprise scale with developer-friendly APIs and bulletproof security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Industry Leaders</h2>
            <p className="text-xl text-muted-foreground">
              See why thousands of companies choose Auth247 for their authentication needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Pricing Link */}
      <section id="pricing" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Revolutionary Pricing Model</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Only $0.89 per <strong>active user</strong> + $1.99/month platform fee per organization. 
              Inactive users cost nothing. 70% less than Auth0, Okta, and Azure AD.
            </p>
            <Link href="/pricing">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                View Pricing Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Enterprise-Grade Security You Can Trust
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Built with security-first principles and battle-tested by thousands of organizations worldwide.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Shield className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">SOC 2 Type II Certified</h3>
                    <p className="text-muted-foreground">Independently audited and certified for security controls.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Lock className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Zero-Trust Architecture</h3>
                    <p className="text-muted-foreground">Every request is verified and authenticated before access.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Building className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Enterprise Compliance</h3>
                    <p className="text-muted-foreground">GDPR, HIPAA, and PCI DSS compliant infrastructure.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-8">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime SLA</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">&lt;100ms</div>
                  <div className="text-sm text-muted-foreground">Response Time</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">256-bit</div>
                  <div className="text-sm text-muted-foreground">Encryption</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Secure Your Organization?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of companies that trust Auth247 for their authentication needs. 
            Get started in minutes with our 14-day free trial.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="min-w-[200px]">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="min-w-[200px] border-white text-blue-600 bg-white hover:bg-blue-50 hover:text-blue-700">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

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
    </div>
  );
}