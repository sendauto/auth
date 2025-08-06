/**
 * Enterprise Dashboard Index
 * Main enterprise features navigation hub
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Shield, Globe, Upload, FileText, 
  Settings, BarChart3, Lock, ArrowRight, DollarSign, Zap 
} from 'lucide-react';
import { Link } from 'wouter';

const enterpriseFeatures = [
  {
    title: 'Active User Billing',
    description: 'Revolutionary billing that only charges for users who actually log in',
    icon: DollarSign,
    href: '/enterprise/billing',
    status: 'available',
    features: ['$0.89/active user', '70% cost savings', 'Inactive users FREE', 'Real-time billing']
  },
  {
    title: 'Migration Assistant',
    description: '15-minute setup with zero downtime migration from Auth0, Okta, Azure AD',
    icon: Zap,
    href: '/enterprise/migration',
    status: 'available',
    features: ['15-minute setup', 'Zero downtime', 'Automated migration', 'Expert support']
  },
  {
    title: 'SCIM Provisioning',
    description: 'Automated user provisioning and deprovisioning with your identity provider',
    icon: Users,
    href: '/enterprise/scim',
    status: 'available',
    features: ['Automated provisioning', 'Real-time sync', 'Group management', 'Okta & Azure AD support']
  },
  {
    title: 'Audit Logs',
    description: 'Comprehensive audit trail for compliance and security monitoring',
    icon: Shield,
    href: '/enterprise/audit-logs',
    status: 'available',
    features: ['Real-time monitoring', 'Compliance reports', 'Export capabilities', 'Advanced filtering']
  },
  {
    title: 'Domain Verification',
    description: 'Verify domain ownership for automatic user enrollment',
    icon: Globe,
    href: '/enterprise/domains',
    status: 'available',
    features: ['DNS verification', 'Auto-enrollment', 'Subdomain support', 'Bulk upload']
  },
  {
    title: 'Bulk Operations',
    description: 'Manage users in bulk with CSV imports and batch operations',
    icon: Upload,
    href: '/enterprise/bulk-operations',
    status: 'available',
    features: ['CSV imports', 'Bulk invitations', 'Role updates', 'Operation tracking']
  },
  {
    title: 'Competitor Comparison',
    description: 'Real-time cost comparison showing 70% savings vs Auth0, Okta, Azure AD',
    icon: BarChart3,
    href: '/enterprise/comparison',
    status: 'available',
    features: ['Cost calculator', 'Savings analysis', 'Feature comparison', 'Migration ROI']
  }
];

export default function EnterpriseIndex() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="default" className="bg-green-100 text-green-800">Available</Badge>;
      case 'coming-soon':
        return <Badge variant="outline">Coming Soon</Badge>;
      case 'beta':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Beta</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Enterprise Features</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Advanced authentication and user management capabilities designed for enterprise environments.
          Exceed competitor capabilities while maintaining 70% cost savings.
        </p>
      </div>

      {/* Key Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="text-center">
            <Settings className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <CardTitle>Enterprise Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Production-grade features that scale with your organization's growth and security requirements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <CardTitle>Compliance First</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Built-in compliance with GDPR, HIPAA, SOX, and other regulations with automated reporting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <CardTitle>Cost Effective</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              70% cost reduction compared to Auth0, Okta, and Azure AD while providing superior features
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {enterpriseFeatures.map((feature) => {
          const IconComponent = feature.icon;
          const isAvailable = feature.status === 'available';
          
          return (
            <Card key={feature.title} className={`relative transition-all duration-200 ${isAvailable ? 'hover:shadow-lg cursor-pointer' : 'opacity-75'}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(feature.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {feature.features.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>

                {isAvailable ? (
                  <Link href={feature.href}>
                    <Button className="w-full group">
                      Access Feature
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Migration & Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Migration Assistant</CardTitle>
            <CardDescription>
              Seamless migration from your current authentication provider
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Supported Providers</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Auth0</Badge>
                <Badge variant="outline">Okta</Badge>
                <Badge variant="outline">Azure AD</Badge>
                <Badge variant="outline">Clerk</Badge>
                <Badge variant="outline">Firebase Auth</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Start Migration
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enterprise Support</CardTitle>
            <CardDescription>
              Dedicated support for enterprise customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">What's Included</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 24/7 priority support</li>
                <li>• Dedicated customer success manager</li>
                <li>• Custom integration assistance</li>
                <li>• SLA guarantees</li>
              </ul>
            </div>
            <Button variant="outline" className="w-full">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Competitive Advantage */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Why Choose Auth247 Enterprise?</CardTitle>
          <CardDescription className="text-lg">
            Superior features at a fraction of the cost
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">70%</div>
              <div className="text-sm text-muted-foreground">Cost Savings vs Competitors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime SLA</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Enterprise Support</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}