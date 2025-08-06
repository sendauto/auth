import React, { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Book, Code, Settings, Users, Shield, ExternalLink, Copy, Check } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PublicNavigation } from "@/components/layout/PublicNavigation";

export function DocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Code snippet copied successfully.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the code manually.",
        variant: "destructive"
      });
    }
  };

  const quickStart = `// Install Auth247 SDK
npm install @auth247/sdk

// Initialize Auth247
import { Auth247 } from '@auth247/sdk';

const auth = new Auth247({
  domain: 'your-domain.auth247.net',
  clientId: 'your-client-id',
  redirectUri: window.location.origin
});

// Login
auth.loginWithRedirect();

// Get user info
const user = await auth.getUser();
console.log(user);`;

  const ssoIntegration = `// SSO Configuration
const auth = new Auth247({
  domain: 'your-domain.auth247.net',
  clientId: 'your-client-id',
  connection: 'google-oauth2' // or 'microsoft', 'okta'
});

// Login with specific provider
auth.loginWithRedirect({
  connection: 'google-oauth2'
});`;

  const apiExample = `// API Authentication
const token = await auth.getAccessTokenSilently();

fetch('https://api.yourapp.com/data', {
  headers: {
    'Authorization': \`Bearer \${token}\`
  }
})
.then(response => response.json())
.then(data => console.log(data));`;

  const sections = [
    {
      icon: Book,
      title: "Getting Started",
      description: "Quick setup guide and basic concepts"
    },
    {
      icon: Code,
      title: "API Reference",
      description: "Complete API documentation with examples"
    },
    {
      icon: Settings,
      title: "Configuration",
      description: "Advanced settings and customization options"
    },
    {
      icon: Users,
      title: "User Management",
      description: "Managing users, roles, and permissions"
    },
    {
      icon: Shield,
      title: "Security",
      description: "Security best practices and compliance"
    }
  ];

  const guides = [
    {
      title: "Single Sign-On Setup",
      description: "Configure SSO with Google, Microsoft, or Okta",
      time: "10 min read"
    },
    {
      title: "Role-Based Access Control",
      description: "Implement fine-grained permissions",
      time: "15 min read"
    },
    {
      title: "Mobile App Integration",
      description: "Integrate Auth247 with mobile applications",
      time: "12 min read"
    },
    {
      title: "Multi-Tenant Setup",
      description: "Configure multi-tenant authentication",
      time: "20 min read"
    },
    {
      title: "Webhook Configuration",
      description: "Set up real-time event notifications",
      time: "8 min read"
    },
    {
      title: "Migration Guide",
      description: "Migrate from Auth0, Firebase, or other providers",
      time: "25 min read"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation currentPage="/docs" />

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Documentation
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Everything you need to integrate Auth247 into your applications. 
              Get started in minutes with our comprehensive guides and examples.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                <Book className="mr-2 h-4 w-4" />
                Quick Start Guide
              </Button>
              <Button variant="outline" size="lg">
                <ExternalLink className="mr-2 h-4 w-4" />
                API Reference
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Quick Start</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Get up and running with Auth247 in under 5 minutes. Follow our 
                step-by-step guide to integrate authentication into your application.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <span>Create your Auth247 account and configure your application</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <span>Install the Auth247 SDK in your project</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <span>Initialize the SDK with your configuration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    4
                  </div>
                  <span>Add login and logout functionality</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 relative">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400 text-sm">JavaScript</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  onClick={() => copyToClipboard(quickStart, 'quickstart')}
                >
                  {copiedCode === 'quickstart' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <pre className="text-green-400 text-sm overflow-x-auto">
                <code>{quickStart}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Our Documentation</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive guides and references for every aspect of Auth247.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sections.map((section, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <section.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
                  <p className="text-muted-foreground">{section.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Guides */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Guides</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Step-by-step tutorials for common integration scenarios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{guide.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{guide.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{guide.time}</span>
                    <ExternalLink className="h-4 w-4 text-primary" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Code Examples</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ready-to-use code snippets for common use cases.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">SSO Integration</h3>
              <div className="bg-gray-900 rounded-lg p-6 relative">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400 text-sm">JavaScript</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                    onClick={() => copyToClipboard(ssoIntegration, 'sso')}
                  >
                    {copiedCode === 'sso' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <pre className="text-green-400 text-sm overflow-x-auto">
                  <code>{ssoIntegration}</code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">API Authentication</h3>
              <div className="bg-gray-900 rounded-lg p-6 relative">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400 text-sm">JavaScript</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                    onClick={() => copyToClipboard(apiExample, 'api')}
                  >
                    {copiedCode === 'api' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <pre className="text-green-400 text-sm overflow-x-auto">
                  <code>{apiExample}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Need More Help?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help 
            you every step of the way.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="min-w-[200px]">
                Contact Support
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="min-w-[200px] border-white text-black bg-white hover:bg-gray-100 hover:text-primary">
              Schedule Demo
            </Button>
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