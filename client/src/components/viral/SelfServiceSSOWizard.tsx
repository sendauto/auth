/**
 * Self-Service SSO Setup Wizard
 * Zero-friction SSO configuration for viral IT team advocacy
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Clock, 
  Settings, 
  Shield, 
  Zap, 
  Users, 
  ExternalLink,
  Copy,
  Play,
  AlertTriangle
} from 'lucide-react';

interface SSOProvider {
  id: string;
  name: string;
  displayName: string;
  logo: string;
  category: 'enterprise' | 'developer' | 'social';
  setupSteps: SSOSetupStep[];
  testingEnabled: boolean;
  healthMonitoring: boolean;
}

interface SSOSetupStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  complexity: 'easy' | 'medium' | 'advanced';
  automated: boolean;
}

interface SetupState {
  configurationId?: string;
  provider?: SSOProvider;
  currentStep?: SSOSetupStep;
  totalSteps: number;
  progress: number;
  completed: boolean;
  testResult?: any;
}

export function SelfServiceSSOWizard() {
  const [providers, setProviders] = useState<SSOProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [organizationDomain, setOrganizationDomain] = useState('');
  const [setupState, setSetupState] = useState<SetupState>({
    totalSteps: 0,
    progress: 0,
    completed: false
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('select');

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const response = await fetch('/api/sso/providers', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setProviders(data.providers);
      }
    } catch (error) {
      console.error('Failed to load SSO providers:', error);
    }
  };

  const startSetup = async () => {
    if (!selectedProvider || !organizationDomain) return;

    setLoading(true);
    try {
      const response = await fetch('/api/sso/setup/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          providerId: selectedProvider,
          organizationDomain,
          userId: 'current-user' // In real app, get from auth context
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSetupState({
          configurationId: data.configurationId,
          provider: data.provider,
          currentStep: data.currentStep,
          totalSteps: data.totalSteps,
          progress: 0,
          completed: false
        });
        setActiveTab('setup');
      }
    } catch (error) {
      console.error('Failed to start SSO setup:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeStep = async (stepData: any) => {
    if (!setupState.configurationId || !setupState.currentStep) return;

    setLoading(true);
    try {
      const response = await fetch('/api/sso/setup/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          configurationId: setupState.configurationId,
          stepId: setupState.currentStep.id,
          stepData
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSetupState(prev => ({
          ...prev,
          completed: data.completed,
          currentStep: data.currentStep,
          progress: data.progress || 100
        }));

        if (data.completed) {
          setActiveTab('test');
        }
      }
    } catch (error) {
      console.error('Failed to complete setup step:', error);
    } finally {
      setLoading(false);
    }
  };

  const testConfiguration = async () => {
    if (!setupState.configurationId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/sso/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          configurationId: setupState.configurationId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSetupState(prev => ({
          ...prev,
          testResult: data.testResult
        }));
        setActiveTab('complete');
      }
    } catch (error) {
      console.error('Failed to test SSO configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProviderLogo = (provider: SSOProvider) => {
    const logos: Record<string, string> = {
      google_workspace: '🚀',
      microsoft_azure: '🔷',
      okta: '🔵',
      custom_saml: '🔐'
    };
    return logos[provider.id] || '🔑';
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'advanced': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Self-Service SSO Setup</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure enterprise SSO in minutes, not days. Zero friction, maximum security.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="select">Select Provider</TabsTrigger>
          <TabsTrigger value="setup" disabled={!setupState.configurationId}>
            Setup
          </TabsTrigger>
          <TabsTrigger value="test" disabled={!setupState.completed}>
            Test
          </TabsTrigger>
          <TabsTrigger value="complete" disabled={!setupState.testResult}>
            Complete
          </TabsTrigger>
        </TabsList>

        <TabsContent value="select" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Choose Your SSO Provider
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="domain">Organization Domain</Label>
                <Input
                  id="domain"
                  placeholder="company.com"
                  value={organizationDomain}
                  onChange={(e) => setOrganizationDomain(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers.map((provider) => (
                  <Card 
                    key={provider.id}
                    className={`cursor-pointer transition-all ${
                      selectedProvider === provider.id 
                        ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedProvider(provider.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-2xl">{getProviderLogo(provider)}</div>
                        <div>
                          <h3 className="font-semibold">{provider.displayName}</h3>
                          <Badge variant="outline" className="text-xs">
                            {provider.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>~{provider.setupSteps.reduce((total, step) => {
                            const minutes = parseInt(step.estimatedTime.split(' ')[0]) || 2;
                            return total + minutes;
                          }, 0)} minutes</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Settings className="h-4 w-4 text-gray-500" />
                          <span>{provider.setupSteps.length} steps</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Zap className="h-4 w-4 text-green-500" />
                          <span>
                            {provider.setupSteps.filter(s => s.automated).length} automated
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button 
                className="w-full" 
                onClick={startSetup}
                disabled={!selectedProvider || !organizationDomain || loading}
              >
                {loading ? 'Starting Setup...' : 'Start SSO Setup'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          {setupState.provider && setupState.currentStep && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="text-2xl">
                      {getProviderLogo(setupState.provider)}
                    </div>
                    Setting up {setupState.provider.displayName}
                  </CardTitle>
                  <Badge>
                    Step {setupState.provider.setupSteps.findIndex(s => s.id === setupState.currentStep?.id) + 1} of {setupState.totalSteps}
                  </Badge>
                </div>
                <Progress value={setupState.progress} className="w-full" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {setupState.currentStep.automated ? (
                      <Zap className="h-5 w-5 text-green-500" />
                    ) : (
                      <Settings className="h-5 w-5 text-blue-500" />
                    )}
                    {setupState.currentStep.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400">
                    {setupState.currentStep.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {setupState.currentStep.estimatedTime}
                    </div>
                    <div className={`flex items-center gap-1 ${getComplexityColor(setupState.currentStep.complexity)}`}>
                      <AlertTriangle className="h-4 w-4" />
                      {setupState.currentStep.complexity}
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {setupState.currentStep.automated 
                      ? "This step will be completed automatically when you click continue."
                      : "Please follow the instructions and provide the required information."
                    }
                  </AlertDescription>
                </Alert>

                {/* Step-specific forms would go here */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Configuration Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Organization Domain:</span>
                      <span className="font-mono">{organizationDomain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Provider:</span>
                      <span>{setupState.provider.displayName}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => completeStep({})}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Continue Setup'}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-green-600" />
                Test SSO Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your SSO configuration is complete! Let's test it to ensure everything works correctly.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                    What we'll test:
                  </h4>
                  <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                    <li>• SSO authentication flow</li>
                    <li>• User attribute mapping</li>
                    <li>• Security certificate validation</li>
                    <li>• Response time performance</li>
                  </ul>
                </div>

                <Button 
                  className="w-full" 
                  onClick={testConfiguration}
                  disabled={loading}
                >
                  {loading ? 'Testing Configuration...' : 'Run SSO Test'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complete" className="space-y-6">
          {setupState.testResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  SSO Setup Complete!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your SSO configuration is active and working correctly. Response time: {setupState.testResult.responseTime}ms
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Test Results</h4>
                    <div className="space-y-2 text-sm">
                      {Object.entries(setupState.testResult.securityChecks).map(([check, passed]) => (
                        <div key={check} className="flex items-center gap-2">
                          {passed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="capitalize">{check.replace(/([A-Z])/g, ' $1')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Next Steps</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Invite team members</li>
                      <li>• Configure user roles</li>
                      <li>• Set up monitoring</li>
                      <li>• Enable custom domain</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Integration Code</h4>
                  <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span>React Integration</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => copyToClipboard(`<Auth247Provider domain="${organizationDomain}" />`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <pre>{`<Auth247Provider domain="${organizationDomain}" />`}</pre>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button className="flex-1">
                    <Users className="h-4 w-4 mr-2" />
                    Invite Team Members
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}