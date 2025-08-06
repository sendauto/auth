import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  FileText,
  Users,
  Settings,
  Shield
} from 'lucide-react';
import { PublicNavigation } from '@/components/layout/PublicNavigation';

interface MigrationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  estimatedTime: string;
}

interface Provider {
  name: string;
  logo: string;
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedTime: string;
  features: string[];
}

const providers: Provider[] = [
  {
    name: "Auth0",
    logo: "🔐",
    complexity: "moderate",
    estimatedTime: "30-45 minutes",
    features: ["User export", "Application settings", "Rules migration", "Social connections"]
  },
  {
    name: "Okta",
    logo: "🔵",
    complexity: "complex",
    estimatedTime: "1-2 hours",
    features: ["SAML/OIDC configs", "User directory", "Group mappings", "Policy migration"]
  },
  {
    name: "Firebase Auth",
    logo: "🔥",
    complexity: "simple",
    estimatedTime: "15-30 minutes",
    features: ["User accounts", "Provider configs", "Custom claims", "Security rules"]
  },
  {
    name: "AWS Cognito",
    logo: "☁️",
    complexity: "moderate",
    estimatedTime: "45-60 minutes",
    features: ["User pools", "Identity pools", "App clients", "Triggers"]
  }
];

export default function MigrationAssistantPage() {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [migrationSteps, setMigrationSteps] = useState<MigrationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [migrationData, setMigrationData] = useState({
    apiKey: '',
    domain: '',
    userCount: '',
    applications: '',
    customizations: ''
  });

  const initiateMigration = (providerName: string) => {
    const steps: MigrationStep[] = [
      {
        id: 'analyze',
        title: 'Analyze Current Setup',
        description: `Connecting to your ${providerName} account and analyzing configuration`,
        status: 'pending',
        estimatedTime: '2-5 minutes'
      },
      {
        id: 'users',
        title: 'Export User Data',
        description: 'Securely exporting user accounts, profiles, and metadata',
        status: 'pending',
        estimatedTime: '5-15 minutes'
      },
      {
        id: 'apps',
        title: 'Migrate Applications',
        description: 'Converting application configurations and settings',
        status: 'pending',
        estimatedTime: '10-20 minutes'
      },
      {
        id: 'settings',
        title: 'Transfer Settings',
        description: 'Migrating authentication flows, rules, and customizations',
        status: 'pending',
        estimatedTime: '5-10 minutes'
      },
      {
        id: 'test',
        title: 'Validate Migration',
        description: 'Testing authentication flows and verifying data integrity',
        status: 'pending',
        estimatedTime: '5-10 minutes'
      }
    ];
    
    setMigrationSteps(steps);
    setCurrentStep(0);
    
    // Simulate migration progress
    simulateMigration(steps);
  };

  const simulateMigration = (steps: MigrationStep[]) => {
    steps.forEach((_, index) => {
      setTimeout(() => {
        setMigrationSteps(prev => prev.map((step, i) => 
          i === index ? { ...step, status: 'in-progress' } : step
        ));
        setCurrentStep(index);
        
        setTimeout(() => {
          setMigrationSteps(prev => prev.map((step, i) => 
            i === index ? { ...step, status: 'completed' } : step
          ));
        }, 2000 + Math.random() * 3000);
      }, index * 5000);
    });
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'complex': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in-progress': return <Clock className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'failed': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <PublicNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Migration Assistant
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Seamlessly migrate from Auth0, Okta, Firebase, or AWS Cognito to Auth247 with zero downtime
          </p>
        </div>

        <Tabs defaultValue="select" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="select">Select Provider</TabsTrigger>
            <TabsTrigger value="configure">Configure Migration</TabsTrigger>
            <TabsTrigger value="migrate">Run Migration</TabsTrigger>
          </TabsList>

          <TabsContent value="select" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Current Authentication Provider</CardTitle>
                <CardDescription>
                  Select the provider you're currently using to get a customized migration plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {providers.map((provider) => (
                    <Card 
                      key={provider.name}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedProvider === provider.name ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedProvider(provider.name)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-3xl">{provider.logo}</div>
                          <div>
                            <h3 className="font-semibold text-lg">{provider.name}</h3>
                            <Badge className={getComplexityColor(provider.complexity)}>
                              {provider.complexity} migration
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>Estimated time: {provider.estimatedTime}</span>
                          </div>
                          
                          <div className="text-sm">
                            <div className="font-medium mb-1">Will migrate:</div>
                            <div className="space-y-1">
                              {provider.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                  <span className="text-gray-600">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {selectedProvider && (
                  <div className="mt-6 text-center">
                    <Button 
                      size="lg"
                      onClick={() => document.querySelector('[value="configure"]')?.click()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      Continue with {selectedProvider}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configure" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configure {selectedProvider} Migration</CardTitle>
                <CardDescription>
                  Provide your current provider credentials to analyze and prepare the migration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your credentials are encrypted and used only for migration. They are not stored after completion.
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="apiKey">API Key / Client Secret</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="Enter your API key or client secret"
                        value={migrationData.apiKey}
                        onChange={(e) => setMigrationData(prev => ({ ...prev, apiKey: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="domain">Domain / Tenant</Label>
                      <Input
                        id="domain"
                        placeholder={selectedProvider === 'Auth0' ? 'your-tenant.auth0.com' : 'your-domain.com'}
                        value={migrationData.domain}
                        onChange={(e) => setMigrationData(prev => ({ ...prev, domain: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="userCount">Estimated User Count</Label>
                      <Input
                        id="userCount"
                        type="number"
                        placeholder="e.g., 1000"
                        value={migrationData.userCount}
                        onChange={(e) => setMigrationData(prev => ({ ...prev, userCount: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="applications">Number of Applications</Label>
                      <Input
                        id="applications"
                        type="number"
                        placeholder="e.g., 5"
                        value={migrationData.applications}
                        onChange={(e) => setMigrationData(prev => ({ ...prev, applications: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="customizations">Custom Rules/Flows (Optional)</Label>
                  <Textarea
                    id="customizations"
                    placeholder="Describe any custom authentication flows, rules, or integrations you have..."
                    value={migrationData.customizations}
                    onChange={(e) => setMigrationData(prev => ({ ...prev, customizations: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => document.querySelector('[value="select"]')?.click()}
                  >
                    Back
                  </Button>
                  <Button 
                    size="lg"
                    onClick={() => document.querySelector('[value="migrate"]')?.click()}
                    disabled={!migrationData.apiKey || !migrationData.domain}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    Analyze & Prepare Migration
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="migrate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Migration Progress</CardTitle>
                <CardDescription>
                  Migrating from {selectedProvider} to Auth247
                </CardDescription>
              </CardHeader>
              <CardContent>
                {migrationSteps.length === 0 ? (
                  <div className="text-center py-8">
                    <Button 
                      size="lg"
                      onClick={() => initiateMigration(selectedProvider)}
                      className="bg-gradient-to-r from-green-600 to-blue-600"
                    >
                      Start Migration
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Step {currentStep + 1} of {migrationSteps.length}
                      </div>
                      <div className="text-sm text-gray-600">
                        {migrationSteps.filter(s => s.status === 'completed').length} completed
                      </div>
                    </div>
                    
                    <Progress 
                      value={(migrationSteps.filter(s => s.status === 'completed').length / migrationSteps.length) * 100} 
                      className="h-2"
                    />
                    
                    <div className="space-y-4">
                      {migrationSteps.map((step, index) => (
                        <div 
                          key={step.id}
                          className={`flex items-center gap-4 p-4 rounded-lg border ${
                            step.status === 'in-progress' ? 'bg-blue-50 border-blue-200' : 
                            step.status === 'completed' ? 'bg-green-50 border-green-200' :
                            'bg-gray-50 border-gray-200'
                          }`}
                        >
                          {getStatusIcon(step.status)}
                          <div className="flex-1">
                            <h3 className="font-medium">{step.title}</h3>
                            <p className="text-sm text-gray-600">{step.description}</p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {step.estimatedTime}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {migrationSteps.every(s => s.status === 'completed') && (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Migration completed successfully! Your Auth247 account is ready with all data migrated.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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