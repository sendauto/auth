import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Code, 
  Copy, 
  Download, 
  ExternalLink, 
  Zap, 
  Shield, 
  Clock,
  CheckCircle,
  Book,
  Terminal,
  Rocket,
  Key
} from 'lucide-react';
import { PublicNavigation } from '@/components/layout/PublicNavigation';

interface CodeExample {
  language: string;
  title: string;
  code: string;
  description: string;
}

interface Framework {
  name: string;
  logo: string;
  setupTime: string;
  examples: CodeExample[];
}

const frameworks: Framework[] = [
  {
    name: "React",
    logo: "⚛️",
    setupTime: "2 minutes",
    examples: [
      {
        language: "jsx",
        title: "Basic Setup",
        description: "Initialize Auth247 in your React app",
        code: `import { Auth247Provider } from '@auth247/react';

function App() {
  return (
    <Auth247Provider
      domain="your-domain.auth247.net"
      clientId="your-client-id"
    >
      <YourApp />
    </Auth247Provider>
  );
}`
      },
      {
        language: "jsx",
        title: "Login Component",
        description: "Add login functionality with one component",
        code: `import { useAuth247 } from '@auth247/react';

function LoginButton() {
  const { login, logout, user, isLoading } = useAuth247();

  if (isLoading) return <div>Loading...</div>;

  return user ? (
    <div>
      <span>Welcome, {user.name}!</span>
      <button onClick={logout}>Logout</button>
    </div>
  ) : (
    <button onClick={login}>Login</button>
  );
}`
      }
    ]
  },
  {
    name: "Next.js",
    logo: "🔺",
    setupTime: "3 minutes",
    examples: [
      {
        language: "javascript",
        title: "API Route Protection",
        description: "Protect your API routes with middleware",
        code: `// middleware.js
import { withAuth247 } from '@auth247/nextjs';

export default withAuth247({
  pages: {
    signIn: '/login',
    signUp: '/signup'
  },
  callbacks: {
    authorized: ({ token, req }) => {
      // Add custom authorization logic
      return !!token;
    }
  }
});

export const config = {
  matcher: ['/api/protected/:path*', '/dashboard/:path*']
};`
      }
    ]
  },
  {
    name: "Node.js",
    logo: "🟢",
    setupTime: "5 minutes",
    examples: [
      {
        language: "javascript",
        title: "Express Integration",
        description: "Secure your Express API endpoints",
        code: `const express = require('express');
const { auth247Middleware } = require('@auth247/node');

const app = express();

// Initialize Auth247 middleware
app.use(auth247Middleware({
  domain: 'your-domain.auth247.net',
  clientSecret: process.env.AUTH247_CLIENT_SECRET
}));

// Protected route
app.get('/api/protected', (req, res) => {
  // req.user contains authenticated user info
  res.json({ user: req.user });
});`
      }
    ]
  },
  {
    name: "Python",
    logo: "🐍",
    setupTime: "4 minutes",
    examples: [
      {
        language: "python",
        title: "FastAPI Integration",
        description: "Secure FastAPI endpoints with decorators",
        code: `from fastapi import FastAPI, Depends
from auth247 import Auth247, get_current_user

app = FastAPI()
auth = Auth247(
    domain="your-domain.auth247.net",
    client_secret="your-client-secret"
)

@app.get("/protected")
async def protected_route(user = Depends(get_current_user)):
    return {"user": user.email, "message": "Access granted"}`
      }
    ]
  }
];

const quickStartSteps = [
  {
    title: "Create Account",
    description: "Sign up for Auth247 and get your credentials",
    time: "30 seconds",
    icon: <Key className="h-5 w-5" />
  },
  {
    title: "Install SDK",
    description: "Add Auth247 to your project with npm or yarn",
    time: "1 minute",
    icon: <Download className="h-5 w-5" />
  },
  {
    title: "Configure Provider",
    description: "Add your domain and client credentials",
    time: "2 minutes",
    icon: <Code className="h-5 w-5" />
  },
  {
    title: "Test Authentication",
    description: "Verify login flow works in your app",
    time: "2 minutes",
    icon: <CheckCircle className="h-5 w-5" />
  }
];

export default function DeveloperHubPage() {
  const [selectedFramework, setSelectedFramework] = useState("React");
  const [copied, setCopied] = useState<string>('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const selectedFrameworkData = frameworks.find(f => f.name === selectedFramework);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <PublicNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Developer Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Get started with Auth247 in minutes. Complete documentation, code examples, and 5-minute setup for any framework.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <Zap className="h-3 w-3 mr-1" />
              5-minute setup
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              <Shield className="h-3 w-3 mr-1" />
              Enterprise security
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
              <Code className="h-3 w-3 mr-1" />
              15+ frameworks
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="quickstart" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
            <TabsTrigger value="examples">Code Examples</TabsTrigger>
            <TabsTrigger value="apis">API Reference</TabsTrigger>
            <TabsTrigger value="migration">Migration Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="quickstart" className="space-y-8">
            {/* Quick Start Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Get Started in 5 Minutes
                </CardTitle>
                <CardDescription>
                  Follow these simple steps to add authentication to your app
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {quickStartSteps.map((step, index) => (
                    <div key={index} className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
                        {step.icon}
                      </div>
                      <h3 className="font-semibold mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {step.time}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Installation */}
            <Card>
              <CardHeader>
                <CardTitle>Installation</CardTitle>
                <CardDescription>Choose your preferred package manager</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {['npm', 'yarn', 'pnpm'].map((manager) => (
                    <div key={manager} className="relative">
                      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                        {manager} install @auth247/react
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(`${manager} install @auth247/react`, manager)}
                      >
                        {copied === manager ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Framework Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Framework</CardTitle>
                <CardDescription>Get framework-specific setup instructions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  {frameworks.map((framework) => (
                    <Card 
                      key={framework.name}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedFramework === framework.name ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedFramework(framework.name)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl mb-2">{framework.logo}</div>
                        <h3 className="font-semibold">{framework.name}</h3>
                        <Badge variant="outline" className="text-xs mt-2">
                          {framework.setupTime}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedFrameworkData && (
                  <div className="space-y-4">
                    {selectedFrameworkData.examples.map((example, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{example.title}</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(example.code, `${selectedFramework}-${index}`)}
                          >
                            {copied === `${selectedFramework}-${index}` ? 
                              <CheckCircle className="h-4 w-4" /> : 
                              <Copy className="h-4 w-4" />
                            }
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{example.description}</p>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                          <pre><code>{example.code}</code></pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Authentication Examples</CardTitle>
                  <CardDescription>Common authentication patterns</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Protected Routes</h4>
                    <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
                      <pre>{`const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth247();
  
  if (isLoading) return <Loading />;
  if (!user) return <Redirect to="/login" />;
  
  return children;
};`}</pre>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Role-Based Access</h4>
                    <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
                      <pre>{`const AdminOnly = ({ children }) => {
  const { user } = useAuth247();
  
  if (!user?.roles?.includes('admin')) {
    return <AccessDenied />;
  }
  
  return children;
};`}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Integration</CardTitle>
                  <CardDescription>Making authenticated API calls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Fetch with Auth</h4>
                    <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
                      <pre>{`const { getAccessToken } = useAuth247();

const apiCall = async () => {
  const token = await getAccessToken();
  
  const response = await fetch('/api/data', {
    headers: {
      'Authorization': \`Bearer \${token}\`
    }
  });
  
  return response.json();
};`}</pre>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Axios Interceptor</h4>
                    <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
                      <pre>{`axios.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    config.headers.Authorization = \`Bearer \${token}\`;
    return config;
  }
);`}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="apis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>REST API Endpoints</CardTitle>
                <CardDescription>Complete API reference for Auth247 services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Authentication</h3>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-green-100 text-green-800">POST</Badge>
                          <code className="text-sm">/api/auth/login</code>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Authenticate user with email and password</p>
                        <details className="text-sm">
                          <summary className="cursor-pointer">View details</summary>
                          <div className="mt-2 bg-gray-50 p-3 rounded">
                            <pre>{`{
  "email": "user@example.com",
  "password": "securepassword"
}`}</pre>
                          </div>
                        </details>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-100 text-blue-800">GET</Badge>
                          <code className="text-sm">/api/auth/user</code>
                        </div>
                        <p className="text-sm text-gray-600">Get current authenticated user profile</p>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-red-100 text-red-800">POST</Badge>
                          <code className="text-sm">/api/auth/logout</code>
                        </div>
                        <p className="text-sm text-gray-600">End user session and invalidate tokens</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">User Management</h3>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-green-100 text-green-800">POST</Badge>
                          <code className="text-sm">/api/users</code>
                        </div>
                        <p className="text-sm text-gray-600">Create new user account</p>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-100 text-blue-800">GET</Badge>
                          <code className="text-sm">/api/users/{"{id}"}</code>
                        </div>
                        <p className="text-sm text-gray-600">Get user details by ID</p>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-yellow-100 text-yellow-800">PUT</Badge>
                          <code className="text-sm">/api/users/{"{id}"}</code>
                        </div>
                        <p className="text-sm text-gray-600">Update user profile information</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="migration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Migration Assistant</CardTitle>
                <CardDescription>Seamlessly migrate from other authentication providers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Supported Providers</h3>
                    <div className="space-y-3">
                      {['Auth0', 'Okta', 'Firebase Auth', 'AWS Cognito'].map((provider) => (
                        <div key={provider} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium">{provider}</span>
                          <Badge variant="outline">Supported</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4">Migration Features</h3>
                    <div className="space-y-2">
                      {[
                        'User data export/import',
                        'Application configuration transfer',
                        'Social provider settings',
                        'Custom rules migration',
                        'Zero-downtime migration'
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                    Start Migration Assistant
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <div className="text-center mt-12">
          <Alert className="max-w-2xl mx-auto mb-6">
            <Terminal className="h-4 w-4" />
            <AlertDescription>
              Need help? Join our developer community or contact our support team for personalized assistance.
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-center gap-4">
            <Button variant="outline">
              <Book className="mr-2 h-4 w-4" />
              View Full Docs
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              Get Started Free
            </Button>
          </div>
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