import React from "react";
import { Link } from "wouter";
import { Shield, Users, Clock, Globe, ArrowLeft, Target, Heart, Zap } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicNavigation } from "@/components/layout/PublicNavigation";

export function AboutPage() {
  const team = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-Founder",
      bio: "Former VP of Security at Microsoft Azure. 15+ years in enterprise authentication.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b2e41e47?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO & Co-Founder",
      bio: "Ex-Google Cloud architect. PhD in Cryptography from Stanford University.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "Emily Watson",
      role: "VP of Engineering",
      bio: "Former Principal Engineer at Auth0. Expert in distributed systems and security.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "David Kim",
      role: "Head of Security",
      bio: "Former CISO at Stripe. Certified in SOC 2, ISO 27001, and CISSP.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
    }
  ];

  const values = [
    {
      icon: Shield,
      title: "Security First",
      description: "Every decision we make is guided by security best practices and zero-trust principles."
    },
    {
      icon: Users,
      title: "Customer Success",
      description: "We measure our success by the success of our customers and their security posture."
    },
    {
      icon: Clock,
      title: "Always Available",
      description: "Reliability is not optional. We build systems that work 24/7, 365 days a year."
    },
    {
      icon: Heart,
      title: "Privacy Respect",
      description: "User privacy is fundamental. We collect only what's necessary and protect everything."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Enterprise Customers" },
    { number: "50M+", label: "Daily Authentications" },
    { number: "99.99%", label: "Uptime Achieved" },
    { number: "150+", label: "Countries Served" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation currentPage="/about" />

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Building the Future of
              <span className="block text-primary">Enterprise Authentication</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Founded in 2023, Auth247 is on a mission to make enterprise-grade authentication 
              accessible, reliable, and secure for organizations of all sizes.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                We believe that security should never be a barrier to innovation. Auth247 was born 
                from the frustration of dealing with complex, expensive, and unreliable authentication 
                systems that hindered rather than helped business growth.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Our platform democratizes enterprise-grade security, making it accessible to startups 
                and Fortune 500 companies alike. We're building the authentication infrastructure 
                that powers the next generation of digital experiences.
              </p>
              <div className="flex items-center space-x-4">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Simple, Secure, Scalable</h3>
                  <p className="text-muted-foreground">Three principles that guide everything we build.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Global Scale</h3>
                    <p className="text-muted-foreground">Serving customers across 150+ countries</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Lightning Fast</h3>
                    <p className="text-muted-foreground">Sub-100ms authentication worldwide</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Security First</h3>
                    <p className="text-muted-foreground">SOC 2 Type II certified infrastructure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide our decisions and shape our culture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-sm text-center">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              World-class experts in security, distributed systems, and enterprise software.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20"></div>
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Us on Our Mission
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Whether you're looking to secure your organization or join our team, 
            we'd love to hear from you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="min-w-[200px]">
                Get Started
              </Button>
            </Link>
            <Link href="/careers">
              <Button size="lg" variant="outline" className="min-w-[200px] border-white text-white hover:bg-white hover:text-primary">
                View Careers
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