import React from "react";
import { Link } from "wouter";
import { Shield, Users, Clock, Lock, CheckCircle, ArrowRight, Star, Building, Globe, Zap, Crown } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicNavigation } from "@/components/layout/PublicNavigation";

export function HomePage() {
  const features = [
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption with multi-factor authentication and advanced threat detection."
    },
    {
      icon: Clock,
      title: "24/7 Availability", 
      description: "Always-on authentication services with 99.9% uptime guarantee and global redundancy."
    },
    {
      icon: Users,
      title: "Team Management",
      description: "Sophisticated role-based access control with hierarchical permissions and audit trails."
    },
    {
      icon: Globe,
      title: "SSO Integration",
      description: "Seamless single sign-on with Google Workspace, Microsoft Azure AD, Okta, and Keycloak."
    },
    {
      icon: Lock,
      title: "Compliance Ready",
      description: "GDPR, SOC 2, and enterprise compliance with comprehensive audit logging."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Sub-100ms authentication response times with intelligent caching and optimization."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CTO, TechFlow Inc",
      company: "Fortune 500 Company",
      content: "Auth247 transformed our security posture. Implementation was seamless and our developers love the integration experience.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez", 
      role: "Head of Security",
      company: "Global Financial Services",
      content: "The audit compliance features saved us months of work. Auth247's enterprise support is unmatched in the industry.",
      rating: 5
    },
    {
      name: "Emily Watson",
      role: "IT Director", 
      company: "Healthcare Network",
      content: "24/7 reliability with zero downtime in 18 months. Auth247 handles our complex multi-tenant requirements perfectly.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation currentPage="/" />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 mb-8">
              <Crown className="w-4 h-4 mr-2" />
              Trusted by 10,000+ enterprises worldwide
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Secure <span className="text-primary">24/7</span> Authentication
              <br />
              <span className="text-muted-foreground">Platform</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Enterprise-grade SSO and access management that replaces Auth0, Okta, and Azure AD 
              at <span className="font-semibold text-primary">70% lower cost</span>. Deploy in minutes, 
              scale to millions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/signup">
                <Button size="lg" className="px-8 py-3 text-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                  View Live Demo
                </Button>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                14-day free trial
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                Setup in 5 minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything you need for enterprise authentication
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Complete authentication platform with advanced security, seamless integrations, 
              and enterprise-grade compliance built in.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <feature.icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              70% less than Auth0, Okta, or Azure AD. No hidden fees, no per-feature charges.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="relative overflow-hidden border-2 border-primary/20">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 text-sm font-medium rounded-b-md">
                Most Popular
              </div>
              <CardContent className="p-8 pt-12">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-5xl font-bold text-foreground">$0.89</span>
                    <span className="text-xl text-muted-foreground ml-2">/user/month</span>
                  </div>
                  <div className="text-sm text-muted-foreground line-through">
                    $3.00/user (competitor pricing)
                  </div>
                  <div className="text-primary font-semibold">
                    Save 70% • First 10 users free
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {[
                    "All SSO providers included",
                    "Advanced role-based access control", 
                    "24/7 priority support",
                    "Complete audit logging & compliance",
                    "Team management & analytics",
                    "API access & custom integrations",
                    "99.9% SLA guarantee"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href="/pricing" className="block">
                  <Button size="lg" className="w-full">
                    View Pricing Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Trusted by enterprise teams
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of companies that trust Auth247 for their authentication needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                    <div className="text-sm text-primary">
                      {testimonial.company}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Ready to secure your application?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of companies using Auth247 for enterprise-grade authentication. 
              Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="px-8 py-3 text-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Logo size="md" className="mb-4" />
              <p className="text-muted-foreground mb-4">
                Secure 24/7 authentication platform for modern enterprises.
              </p>
              <div className="text-sm text-muted-foreground">
                © 2025 Auth247. All rights reserved.
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <div className="space-y-2">
                <Link href="/features"><span className="text-muted-foreground hover:text-foreground cursor-pointer">Features</span></Link>
                <Link href="/pricing"><span className="text-muted-foreground hover:text-foreground cursor-pointer">Pricing</span></Link>
                <Link href="/demo"><span className="text-muted-foreground hover:text-foreground cursor-pointer">Demo</span></Link>
                <Link href="/docs"><span className="text-muted-foreground hover:text-foreground cursor-pointer">Documentation</span></Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <div className="space-y-2">
                <Link href="/about"><span className="text-muted-foreground hover:text-foreground cursor-pointer">About</span></Link>
                <Link href="/contact"><span className="text-muted-foreground hover:text-foreground cursor-pointer">Contact</span></Link>
                <Link href="/careers"><span className="text-muted-foreground hover:text-foreground cursor-pointer">Careers</span></Link>
                <Link href="/blog"><span className="text-muted-foreground hover:text-foreground cursor-pointer">Blog</span></Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <div className="space-y-2">
                <Link href="/terms"><span className="text-muted-foreground hover:text-foreground cursor-pointer">Terms of Service</span></Link>
                <Link href="/privacy"><span className="text-muted-foreground hover:text-foreground cursor-pointer">Privacy Policy</span></Link>
                <Link href="/security"><span className="text-muted-foreground hover:text-foreground cursor-pointer">Security</span></Link>
                <Link href="/compliance"><span className="text-muted-foreground hover:text-foreground cursor-pointer">Compliance</span></Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}