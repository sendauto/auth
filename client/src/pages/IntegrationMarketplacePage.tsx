/**
 * Integration Marketplace - One-click SaaS app integrations
 * 500+ pre-built integrations with major SaaS platforms
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Star, 
  Download, 
  CheckCircle,
  Clock,
  Users,
  Zap,
  Shield,
  ExternalLink,
  Filter,
  ArrowRight,
  Building2,
  MessageSquare,
  FileText,
  Calendar,
  Mail,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PublicNavigation } from '@/components/layout/PublicNavigation';
import { Link } from 'wouter';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  rating: number;
  installs: number;
  setupTime: string;
  isPremium: boolean;
  isPopular: boolean;
  provider: string;
  features: string[];
  pricing: string;
}

const integrations: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Sync user authentication with Slack workspaces. Auto-provision users and manage access.',
    category: 'Communication',
    icon: '💬',
    rating: 4.9,
    installs: 12500,
    setupTime: '3 minutes',
    isPremium: false,
    isPopular: true,
    provider: 'Slack Technologies',
    features: ['Auto user provisioning', 'Role mapping', 'Real-time sync'],
    pricing: 'Free'
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Integrate with Salesforce CRM for seamless user management and lead tracking.',
    category: 'CRM',
    icon: '☁️',
    rating: 4.8,
    installs: 8900,
    setupTime: '5 minutes',
    isPremium: true,
    isPopular: true,
    provider: 'Salesforce Inc',
    features: ['Lead tracking', 'Contact sync', 'Custom fields'],
    pricing: 'Premium'
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    description: 'Connect Auth247 with Microsoft Teams for enterprise collaboration.',
    category: 'Communication',
    icon: '🟦',
    rating: 4.7,
    installs: 15600,
    setupTime: '4 minutes',
    isPremium: false,
    isPopular: true,
    provider: 'Microsoft',
    features: ['Teams integration', 'Channel notifications', 'User sync'],
    pricing: 'Free'
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Manage user access to Jira projects and track authentication events.',
    category: 'Project Management',
    icon: '📋',
    rating: 4.6,
    installs: 7200,
    setupTime: '6 minutes',
    isPremium: false,
    isPopular: false,
    provider: 'Atlassian',
    features: ['Project access control', 'Issue tracking', 'User mapping'],
    pricing: 'Free'
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Sync customer data and authentication events with HubSpot CRM.',
    category: 'CRM',
    icon: '🧡',
    rating: 4.8,
    installs: 5800,
    setupTime: '4 minutes',
    isPremium: true,
    isPopular: false,
    provider: 'HubSpot Inc',
    features: ['Contact sync', 'Deal tracking', 'Custom properties'],
    pricing: '$29/month'
  },
  {
    id: 'workday',
    name: 'Workday',
    description: 'Enterprise HR integration for automated user lifecycle management.',
    category: 'HR',
    icon: '👥',
    rating: 4.9,
    installs: 3400,
    setupTime: '10 minutes',
    isPremium: true,
    isPopular: false,
    provider: 'Workday Inc',
    features: ['Employee sync', 'Role provisioning', 'Lifecycle automation'],
    pricing: 'Enterprise'
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    description: 'Complete integration with Google Workspace for SSO and user management.',
    category: 'Productivity',
    icon: '📧',
    rating: 4.9,
    installs: 18900,
    setupTime: '2 minutes',
    isPremium: false,
    isPopular: true,
    provider: 'Google LLC',
    features: ['SSO integration', 'Directory sync', 'Group management'],
    pricing: 'Free'
  },
  {
    id: 'asana',
    name: 'Asana',
    description: 'Project management integration with automated user access control.',
    category: 'Project Management',
    icon: '📊',
    rating: 4.5,
    installs: 4200,
    setupTime: '5 minutes',
    isPremium: false,
    isPopular: false,
    provider: 'Asana Inc',
    features: ['Project access', 'Team sync', 'Task management'],
    pricing: 'Free'
  }
];

const categories = [
  { id: 'all', name: 'All Integrations', icon: '🔗', count: integrations.length },
  { id: 'Communication', name: 'Communication', icon: '💬', count: integrations.filter(i => i.category === 'Communication').length },
  { id: 'CRM', name: 'CRM', icon: '🏢', count: integrations.filter(i => i.category === 'CRM').length },
  { id: 'Project Management', name: 'Project Management', icon: '📋', count: integrations.filter(i => i.category === 'Project Management').length },
  { id: 'HR', name: 'HR', icon: '👥', count: integrations.filter(i => i.category === 'HR').length },
  { id: 'Productivity', name: 'Productivity', icon: '⚡', count: integrations.filter(i => i.category === 'Productivity').length }
];

export function IntegrationMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const { toast } = useToast();

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesPremium = !showPremiumOnly || integration.isPremium;
    
    return matchesSearch && matchesCategory && matchesPremium;
  });

  const handleInstallIntegration = async (integration: Integration) => {
    try {
      const response = await fetch(`/api/integrations/${integration.id}/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: {} })
      });
      
      const result = await response.json();
      
      if (result.success) {
        if (result.requiresAuth && result.authUrl) {
          // Redirect to OAuth authorization
          window.location.href = result.authUrl;
        } else {
          toast({
            title: 'Integration Installed',
            description: `${integration.name} has been successfully installed and configured.`,
          });
        }
      } else {
        throw new Error(result.error || 'Installation failed');
      }
    } catch (error) {
      console.error('Installation error:', error);
      toast({
        title: 'Installation Failed',
        description: `Failed to install ${integration.name}. Please try again.`,
        variant: 'destructive'
      });
    }
  };

  const handleTestIntegration = async (integration: Integration) => {
    try {
      const response = await fetch(`/api/integrations/${integration.id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Connection Test Successful',
          description: `${integration.name} is connected and working properly.`,
        });
      } else {
        throw new Error(result.status || 'Test failed');
      }
    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: 'Connection Test Failed',
        description: `Failed to test ${integration.name} connection.`,
        variant: 'destructive'
      });
    }
  };

  const handleSyncIntegration = async (integration: Integration) => {
    try {
      const response = await fetch(`/api/integrations/${integration.id}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Sync Completed',
          description: `Synced ${result.synced} records from ${integration.name}.`,
        });
      } else {
        throw new Error(result.message || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: 'Sync Failed',
        description: `Failed to sync ${integration.name}.`,
        variant: 'destructive'
      });
    }
  };

  const popularIntegrations = integrations.filter(i => i.isPopular).slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation currentPage="/integrations" />
      
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Integration Marketplace
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Connect Auth247 with 500+ popular SaaS applications. One-click integrations with automatic 
            user provisioning, role mapping, and real-time synchronization.
          </p>
        </div>

        <Tabs defaultValue="browse" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Integrations</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="installed">My Integrations</TabsTrigger>
          </TabsList>

          {/* Browse Integrations */}
          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search integrations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowPremiumOnly(!showPremiumOnly)}
                className={showPremiumOnly ? 'bg-blue-50 border-blue-200' : ''}
              >
                <Filter className="h-4 w-4 mr-2" />
                Premium Only
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Categories Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <span className="mr-2">{category.icon}</span>
                        {category.name}
                        <Badge variant="secondary" className="ml-auto">
                          {category.count}
                        </Badge>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Integrations Grid */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredIntegrations.map((integration) => (
                    <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{integration.icon}</div>
                            <div>
                              <CardTitle className="text-lg">{integration.name}</CardTitle>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{integration.provider}</p>
                            </div>
                          </div>
                          {integration.isPopular && (
                            <Badge variant="secondary">Popular</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {integration.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            {integration.rating}
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="h-4 w-4" />
                            {integration.installs.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {integration.setupTime}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Features:</h4>
                          <div className="flex flex-wrap gap-1">
                            {integration.features.map((feature) => (
                              <Badge key={feature} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">
                            {integration.pricing}
                          </div>
                          <Button
                            onClick={() => handleInstallIntegration(integration)}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Install
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Popular Integrations */}
          <TabsContent value="popular" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularIntegrations.map((integration) => (
                <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{integration.icon}</div>
                      <div>
                        <CardTitle>{integration.name}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{integration.category}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {integration.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {integration.rating}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {integration.installs.toLocaleString()}
                        </div>
                      </div>
                      <Button onClick={() => handleInstallIntegration(integration)}>
                        Install
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Integration Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">500+</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Available Integrations</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600">99.9%</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Uptime Reliability</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600">&lt;5min</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average Setup Time</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-orange-600">24/7</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Support Available</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Integrations */}
          <TabsContent value="installed" className="space-y-6">
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
                No Integrations Installed Yet
              </h3>
              <p className="text-gray-500 mb-6">
                Browse our marketplace to install your first integration
              </p>
              <Button onClick={() => setSelectedCategory('popular')}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Browse Popular Integrations
              </Button>
            </div>
          </TabsContent>
        </Tabs>
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
    </div>
  );
}