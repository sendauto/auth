/**
 * Migration Assistant
 * 15-minute setup with zero downtime migration from Auth0, Okta, Azure AD
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, Clock, Shield, CheckCircle, ArrowRight, 
  Database, Users, Settings, AlertTriangle, Download, Upload 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MigrationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  estimatedTime: string;
}

export default function MigrationAssistant() {
  const [currentProvider, setCurrentProvider] = useState<string>('');
  const [migrationSteps, setMigrationSteps] = useState<MigrationStep[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [migrationStarted, setMigrationStarted] = useState(false);
  const { toast } = useToast();

  const providers = [
    { value: 'auth0', label: 'Auth0', logo: '🔐' },
    { value: 'okta', label: 'Okta', logo: '🏢' },
    { value: 'azure', label: 'Azure AD', logo: '☁️' },
    { value: 'clerk', label: 'Clerk', logo: '👤' },
    { value: 'firebase', label: 'Firebase Auth', logo: '🔥' },
    { value: 'cognito', label: 'AWS Cognito', logo: '☁️' },
    { value: 'other', label: 'Other Provider', logo: '⚙️' }
  ];

  const analyzeCurrentSetup = async () => {
    if (!currentProvider) {
      toast({
        title: 'Error',
        description: 'Please select your current provider',
        variant: 'destructive'
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 3000));

    const steps: MigrationStep[] = [
      {
        id: '1',
        title: 'Environment Analysis',
        description: `Analyze your current ${currentProvider} configuration`,
        status: 'completed',
        estimatedTime: '2 min'
      },
      {
        id: '2',
        title: 'User Data Export',
        description: 'Export user data and configurations',
        status: 'pending',
        estimatedTime: '3 min'
      },
      {
        id: '3',
        title: 'Auth247 Setup',
        description: 'Configure Auth247 with your settings',
        status: 'pending',
        estimatedTime: '5 min'
      },
      {
        id: '4',
        title: 'Data Migration',
        description: 'Migrate users and configurations',
        status: 'pending',
        estimatedTime: '3 min'
      },
      {
        id: '5',
        title: 'Testing & Validation',
        description: 'Test authentication flows',
        status: 'pending',
        estimatedTime: '2 min'
      }
    ];

    setMigrationSteps(steps);
    setIsAnalyzing(false);

    toast({
      title: 'Analysis Complete',
      description: 'Your migration plan is ready. Estimated time: 15 minutes'
    });
  };

  const startMigration = async () => {
    setMigrationStarted(true);
    
    for (let i = 0; i < migrationSteps.length; i++) {
      // Update step to in-progress
      setMigrationSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: 'in-progress' } : step
      ));
      
      // Simulate step execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update step to completed
      setMigrationSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: 'completed' } : step
      ));
    }

    toast({
      title: 'Migration Complete!',
      description: 'Your migration to Auth247 is now complete with zero downtime'
    });
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress': return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'failed': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const completedSteps = migrationSteps.filter(step => step.status === 'completed').length;
  const progressPercentage = migrationSteps.length > 0 ? (completedSteps / migrationSteps.length) * 100 : 0;

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Migration Assistant</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Migrate from Auth0, Okta, or Azure AD to Auth247 in just 15 minutes with zero downtime.
          Save up to 70% on your authentication costs immediately.
        </p>
      </div>

      {/* Benefits Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="text-center pb-2">
            <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <CardTitle className="text-lg">15-Minute Setup</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Complete migration in under 15 minutes with our automated assistant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center pb-2">
            <Zap className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <CardTitle className="text-lg">Zero Downtime</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Seamless migration with no service interruption for your users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center pb-2">
            <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <CardTitle className="text-lg">70% Cost Savings</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Immediate cost reduction with active-user-only billing
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="migration">Migration</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Provider Analysis</CardTitle>
              <CardDescription>
                Tell us about your current authentication provider to create a personalized migration plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="provider">Current Authentication Provider</Label>
                <Select value={currentProvider} onValueChange={setCurrentProvider}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your current provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        <div className="flex items-center gap-2">
                          <span>{provider.logo}</span>
                          {provider.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {currentProvider && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="users">Approximate User Count</Label>
                    <Input
                      id="users"
                      type="number"
                      placeholder="e.g., 1000"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="apps">Number of Applications</Label>
                    <Input
                      id="apps"
                      type="number"
                      placeholder="e.g., 5"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              <Button 
                onClick={analyzeCurrentSetup} 
                disabled={!currentProvider || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Analyzing Setup...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Analyze Current Setup
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {currentProvider && (
            <Card>
              <CardHeader>
                <CardTitle>Provider-Specific Benefits</CardTitle>
                <CardDescription>
                  Advantages of migrating from {providers.find(p => p.value === currentProvider)?.label} to Auth247
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-600">Cost Savings</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• 70% reduction in monthly bills</li>
                      <li>• Pay only for active users</li>
                      <li>• No surprise overage charges</li>
                      <li>• Transparent pricing model</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-600">Enhanced Features</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Advanced SCIM provisioning</li>
                      <li>• Comprehensive audit logs</li>
                      <li>• Smart domain verification</li>
                      <li>• Enterprise analytics</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="migration" className="space-y-6">
          {migrationSteps.length > 0 ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Migration Progress</CardTitle>
                  <CardDescription>
                    Your personalized migration plan - estimated completion: 15 minutes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span>{completedSteps}/{migrationSteps.length} steps</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                  </div>

                  <div className="space-y-3">
                    {migrationSteps.map((step, index) => (
                      <div key={step.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        {getStepIcon(step.status)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{step.title}</span>
                            <Badge variant="outline">{step.estimatedTime}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                        {step.status === 'completed' && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>

                  {!migrationStarted && completedSteps === 0 && (
                    <Button onClick={startMigration} className="w-full" size="lg">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Start Migration
                    </Button>
                  )}

                  {completedSteps === migrationSteps.length && (
                    <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700 dark:text-green-300">
                        <strong>Migration Complete!</strong> Your users can now authenticate through Auth247.
                        You're now saving up to 70% on authentication costs.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Ready to Migrate?</h3>
                <p className="text-muted-foreground mb-4">
                  Complete the setup analysis first to generate your personalized migration plan.
                </p>
                <Button variant="outline">
                  Go to Setup Tab
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post-Migration Validation</CardTitle>
              <CardDescription>
                Ensure everything is working correctly after migration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Authentication Test</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Test login flows with sample users
                  </p>
                  <Button variant="outline" className="w-full">
                    Run Auth Test
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">User Data Verification</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Verify all user data migrated correctly
                  </p>
                  <Button variant="outline" className="w-full">
                    Verify Data
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Application Integration</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Test SSO with your applications
                  </p>
                  <Button variant="outline" className="w-full">
                    Test SSO
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Performance Check</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Validate response times and reliability
                  </p>
                  <Button variant="outline" className="w-full">
                    Check Performance
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Migration Support</CardTitle>
              <CardDescription>
                Get expert help with your migration to Auth247
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Live Chat Support</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get instant help from our migration experts
                  </p>
                  <Button className="w-full">
                    Start Live Chat
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Migration Documentation</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Detailed guides for different providers
                  </p>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    View Docs
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Expert Consultation</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Schedule a call with our team
                  </p>
                  <Button variant="outline" className="w-full">
                    Schedule Call
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Custom Migration</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Enterprise migration assistance
                  </p>
                  <Button variant="outline" className="w-full">
                    Contact Enterprise
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Need help?</strong> Our migration success rate is 99.8% with zero data loss.
                  Contact our team if you encounter any issues during migration.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}