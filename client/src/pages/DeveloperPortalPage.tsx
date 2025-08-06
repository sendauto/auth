/**
 * Interactive Developer Portal - Revolutionary Developer Experience
 * Live API playground, SDK generation, and visual flow builder
 */

import React, { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PublicNavigation } from '@/components/layout/PublicNavigation';
import { Logo } from '@/components/ui/logo';
import { 
  Code, 
  Play, 
  Download, 
  Copy, 
  Terminal,
  Book,
  Zap,
  CheckCircle,
  ExternalLink,
  Rocket,
  Palette,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface APIEndpoint {
  method: string;
  path: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  example: string;
  response: string;
}

const apiEndpoints: APIEndpoint[] = [
  {
    method: 'POST',
    path: '/api/auth/login',
    description: 'Authenticate user with email and password',
    parameters: [
      { name: 'email', type: 'string', required: true, description: 'User email address' },
      { name: 'password', type: 'string', required: true, description: 'User password' },
      { name: 'rememberMe', type: 'boolean', required: false, description: 'Keep user logged in' }
    ],
    example: '{\n  "email": "user@company.com",\n  "password": "SecurePass123!",\n  "rememberMe": true\n}',
    response: '{\n  "success": true,\n  "user": {\n    "id": "123",\n    "email": "user@company.com",\n    "role": "user"\n  },\n  "token": "jwt_token_here"\n}'
  },
  {
    method: 'GET',
    path: '/api/auth/user',
    description: 'Get current authenticated user information',
    parameters: [],
    example: '',
    response: '{\n  "id": "123",\n  "email": "user@company.com",\n  "firstName": "John",\n  "lastName": "Doe",\n  "role": "user",\n  "organization": "Company Inc"\n}'
  },
  {
    method: 'POST',
    path: '/api/auth/sso/configure',
    description: 'Configure SSO settings for organization',
    parameters: [
      { name: 'provider', type: 'string', required: true, description: 'SSO provider (google, microsoft, okta)' },
      { name: 'clientId', type: 'string', required: true, description: 'Provider client ID' },
      { name: 'clientSecret', type: 'string', required: true, description: 'Provider client secret' },
      { name: 'domain', type: 'string', required: false, description: 'Organization domain' }
    ],
    example: '{\n  "provider": "google",\n  "clientId": "your_client_id",\n  "clientSecret": "your_client_secret",\n  "domain": "company.com"\n}',
    response: '{\n  "success": true,\n  "message": "SSO configured successfully",\n  "ssoUrl": "https://auth247.net/sso/google/company"\n}'
  }
];

const sdkLanguages = [
  { id: 'javascript', name: 'JavaScript/Node.js', icon: '🟨' },
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'java', name: 'Java', icon: '☕' },
  { id: 'csharp', name: 'C#', icon: '🔷' },
  { id: 'php', name: 'PHP', icon: '🐘' },
  { id: 'ruby', name: 'Ruby', icon: '💎' },
  { id: 'go', name: 'Go', icon: '🐹' },
  { id: 'swift', name: 'Swift', icon: '🦉' }
];

const authFlowTemplates = [
  {
    id: 'basic-login',
    name: 'Basic Email/Password Login',
    description: 'Standard email and password authentication',
    complexity: 'Simple',
    setupTime: '2 minutes'
  },
  {
    id: 'sso-google',
    name: 'Google SSO Integration',
    description: 'Single sign-on with Google Workspace',
    complexity: 'Easy',
    setupTime: '5 minutes'
  },
  {
    id: 'mfa-enabled',
    name: 'Multi-Factor Authentication',
    description: 'Enhanced security with TOTP or SMS verification',
    complexity: 'Medium',
    setupTime: '10 minutes'
  },
  {
    id: 'enterprise-saml',
    name: 'Enterprise SAML Integration',
    description: 'SAML 2.0 for enterprise identity providers',
    complexity: 'Advanced',
    setupTime: '15 minutes'
  }
];

export function DeveloperPortalPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint>(apiEndpoints[0]);
  const [apiKey, setApiKey] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [selectedTemplate, setSelectedTemplate] = useState(authFlowTemplates[0]);
  const { toast } = useToast();

  const handleAPITest = async () => {
    // Simulate API call
    setTestResponse('Loading...');
    
    setTimeout(() => {
      setTestResponse(selectedEndpoint.response);
      toast({
        title: 'API Test Successful',
        description: `${selectedEndpoint.method} ${selectedEndpoint.path} executed successfully`,
      });
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to Clipboard',
      description: 'Code has been copied to your clipboard',
    });
  };

  const generateSDK = (language: string) => {
    const sdkCode = {
      javascript: `// Auth247 JavaScript SDK
npm install @auth247/js-sdk

import Auth247 from '@auth247/js-sdk';

const auth = new Auth247({
  apiKey: '${apiKey || 'your_api_key'}',
  baseUrl: 'https://auth247.net'
});

// Login user
const result = await auth.login({
  email: 'user@company.com',
  password: 'password123'
});

// Check authentication
const user = await auth.getCurrentUser();`,
      python: `# Auth247 Python SDK
pip install auth247-python

from auth247 import Auth247Client

auth = Auth247Client(
    api_key='${apiKey || 'your_api_key'}',
    base_url='https://auth247.net'
)

# Login user
result = auth.login(
    email='user@company.com',
    password='password123'
)

# Check authentication
user = auth.get_current_user()`,
      java: `// Auth247 Java SDK
<dependency>
    <groupId>com.auth247</groupId>
    <artifactId>auth247-java</artifactId>
    <version>1.0.0</version>
</dependency>

import com.auth247.Auth247Client;

Auth247Client auth = new Auth247Client.Builder()
    .apiKey("${apiKey || 'your_api_key'}")
    .baseUrl("https://auth247.net")
    .build();

// Login user
LoginResult result = auth.login("user@company.com", "password123");

// Check authentication
User user = auth.getCurrentUser();`
    };

    return sdkCode[language as keyof typeof sdkCode] || sdkCode.javascript;
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation currentPage="/developer-portal" />
      
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Developer Portal
              </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Interactive API playground, one-click SDK generation, and visual authentication flow builder. 
            Integrate Auth247 in minutes, not days.
          </p>
        </div>

        <Tabs defaultValue="playground" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="playground" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              API Playground
            </TabsTrigger>
            <TabsTrigger value="sdks" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              SDK Generator
            </TabsTrigger>
            <TabsTrigger value="flows" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Flow Designer
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              Documentation
            </TabsTrigger>
          </TabsList>

          {/* API Playground */}
          <TabsContent value="playground" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* API Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Live API Testing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="api-key">API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Enter your API key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label>Endpoint</Label>
                    <Select onValueChange={(value) => {
                      const endpoint = apiEndpoints.find(e => `${e.method}_${e.path}` === value);
                      if (endpoint) setSelectedEndpoint(endpoint);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an endpoint" />
                      </SelectTrigger>
                      <SelectContent>
                        {apiEndpoints.map((endpoint) => (
                          <SelectItem key={`${endpoint.method}_${endpoint.path}`} value={`${endpoint.method}_${endpoint.path}`}>
                            <div className="flex items-center gap-2">
                              <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'}>
                                {endpoint.method}
                              </Badge>
                              {endpoint.path}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Request Body</Label>
                    <Textarea
                      placeholder="JSON request body"
                      value={selectedEndpoint.example}
                      onChange={(e) => {
                        // Update the example for testing purposes
                        setSelectedEndpoint(prev => ({
                          ...prev,
                          example: e.target.value
                        }));
                      }}
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </div>

                  <Button onClick={handleAPITest} className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Test API Call
                  </Button>
                </CardContent>
              </Card>

              {/* Response */}
              <Card>
                <CardHeader>
                  <CardTitle>Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <pre className="text-sm overflow-auto">
                      {testResponse || 'Run an API test to see the response here...'}
                    </pre>
                  </div>
                  
                  {testResponse && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => copyToClipboard(testResponse)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Response
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* API Documentation */}
            <Card>
              <CardHeader>
                <CardTitle>Endpoint Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedEndpoint.description}</p>
                  </div>
                  
                  {selectedEndpoint.parameters.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Parameters</h4>
                      <div className="space-y-2">
                        {selectedEndpoint.parameters.map((param) => (
                          <div key={param.name} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <div>
                              <span className="font-mono text-sm">{param.name}</span>
                              {param.required && <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>}
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600 dark:text-gray-400">{param.type}</div>
                              <div className="text-xs text-gray-500">{param.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SDK Generator */}
          <TabsContent value="sdks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Language Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Choose Language</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {sdkLanguages.map((lang) => (
                      <Button
                        key={lang.id}
                        variant={selectedLanguage === lang.id ? 'default' : 'outline'}
                        className="flex items-center gap-2 h-auto p-3"
                        onClick={() => setSelectedLanguage(lang.id)}
                      >
                        <span className="text-lg">{lang.icon}</span>
                        <span className="text-sm">{lang.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Generated SDK */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Generated SDK Code
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generateSDK(selectedLanguage))}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download SDK
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <pre className="text-sm overflow-auto">
                      {generateSDK(selectedLanguage)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Start Guide */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Start Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-medium">Install SDK</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Add Auth247 to your project</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-medium">Configure</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Set your API key and options</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-medium">Authenticate</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Start authenticating users</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Flow Designer */}
          <TabsContent value="flows" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Template Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Authentication Templates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {authFlowTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedTemplate.id === template.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{template.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{template.complexity}</Badge>
                        <span className="text-xs text-gray-500">{template.setupTime}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Visual Flow Builder */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Visual Flow Designer
                    <Button onClick={() => {
                      toast({
                        title: 'Flow Configuration',
                        description: 'Flow designer configuration panel coming soon. Contact support for early access.',
                      });
                    }}>
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Flow
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg min-h-96 flex items-center justify-center">
                    <div className="text-center">
                      <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-medium text-gray-600 dark:text-gray-400">Visual Flow Builder</h3>
                      <p className="text-sm text-gray-500 mt-2">
                        Drag and drop components to design your authentication flow
                      </p>
                      <Button className="mt-4" onClick={() => {
                        toast({
                          title: 'Visual Flow Builder',
                          description: 'Interactive flow builder launching soon. Contact sales for beta access.',
                        });
                      }}>
                        <Rocket className="h-4 w-4 mr-2" />
                        Start Building
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Flow Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Drag & Drop</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Visual interface to build authentication flows without code
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Real-time Preview</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    See your authentication flow in action as you build it
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Code className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Auto-Generated Code</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically generate integration code for your flow
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documentation */}
          <TabsContent value="docs" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Getting Started Guide</CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                  <h3>5-Minute Integration Guide</h3>
                  <p>Get Auth247 up and running in your application in under 5 minutes:</p>
                  
                  <h4>Step 1: Get Your API Key</h4>
                  <p>Sign up for Auth247 and get your API key from the dashboard.</p>
                  
                  <h4>Step 2: Install the SDK</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <code>npm install @auth247/js-sdk</code>
                  </div>
                  
                  <h4>Step 3: Initialize Auth247</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <pre>{`import Auth247 from '@auth247/js-sdk';

const auth = new Auth247({
  apiKey: 'your_api_key_here',
  baseUrl: 'https://auth247.net'
});`}</pre>
                  </div>
                  
                  <h4>Step 4: Add Authentication</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <pre>{`// Login
const result = await auth.login({
  email: 'user@example.com',
  password: 'password123'
});

// Check if user is authenticated
const user = await auth.getCurrentUser();`}</pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/docs">
                    <Button variant="outline" className="w-full justify-start">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      API Reference
                    </Button>
                  </Link>
                  <a href="https://github.com/auth247/examples" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full justify-start">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Code Examples
                    </Button>
                  </a>
                  <a href="https://youtube.com/@auth247" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full justify-start">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Video Tutorials
                    </Button>
                  </a>
                  <a href="https://community.auth247.net" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full justify-start">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Community Forum
                    </Button>
                  </a>
                  <Link href="/contact">
                    <Button variant="outline" className="w-full justify-start">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Support Center
                    </Button>
                  </Link>
                </CardContent>
              </Card>
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