import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { PublicNavigation } from "@/components/layout/PublicNavigation";
import { 
  Shield, 
  Users, 
  Settings, 
  Crown,
  ArrowLeft,
  Lock,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface DemoUser {
  email: string;
  role: string;
  displayName: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions: string[];
}

const demoUsers: DemoUser[] = [
  {
    email: "user@demo.auth247.net",
    role: "user",
    displayName: "Demo User",
    description: "Standard user access with basic features",
    icon: Users,
    permissions: [
      "View dashboard",
      "Edit profile",
      "View notifications",
      "Basic analytics"
    ]
  },
  {
    email: "manager@demo.auth247.net", 
    role: "manager",
    displayName: "Demo Manager",
    description: "Team management with extended permissions",
    icon: Settings,
    permissions: [
      "All user permissions",
      "Manage team members",
      "View team analytics",
      "User role assignment",
      "Organization settings"
    ]
  },
  {
    email: "admin@demo.auth247.net",
    role: "admin", 
    displayName: "Demo Admin",
    description: "Full administrative access and control",
    icon: Crown,
    permissions: [
      "All manager permissions",
      "System administration",
      "Advanced analytics",
      "Security monitoring",
      "Billing management",
      "Organization management"
    ]
  },
  {
    email: "john.doe@company.com",
    role: "admin",
    displayName: "John Doe",
    description: "Company administrator with full access",
    icon: Shield,
    permissions: [
      "All administrative permissions",
      "Company-wide settings",
      "User management",
      "Security configuration",
      "Analytics and reporting"
    ]
  }
];

export default function DemoLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState<string | null>(null);
  const { toast } = useToast();
  const { checkSession } = useAuth();
  const [, setLocation] = useLocation();

  const handleDemoLogin = async (user: DemoUser) => {
    setIsLoading(true);
    setLoadingUser(user.email);

    try {
      const response = await apiRequest("POST", "/api/auth/demo-login", {
        email: user.email,
        password: "demo123",
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Demo Login Successful",
          description: `Welcome! You're now logged in as ${user.displayName}.`,
        });
        
        // Refresh authentication state and redirect to dashboard
        await checkSession();
        setLocation("/dashboard");
      } else {
        const errorData = await response.json();
        toast({
          title: "Login Failed",
          description: errorData.message || "Unable to login with demo account.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error", 
        description: "Unable to connect to authentication service.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLoadingUser(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation currentPage="/dlogin" />
      
      <div className="bg-gradient-to-br from-blue-50 via-white to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Logo className="h-10 w-10" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Auth247 Demo</h1>
                <p className="text-sm text-muted-foreground">
                  Secure 24/7 authentication platform
                </p>
              </div>
            </div>
            <Link href="/login">
              <Button variant="outline" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Login</span>
              </Button>
            </Link>
          </div>

          {/* Demo Warning */}
          <Card className="mb-8 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                    Demo Environment
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    This is a demonstration environment for testing Auth247 features. 
                    Demo accounts have restricted access and no real data is processed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Experience Auth247 Demo
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose a demo account to explore different user roles and capabilities. 
                Each account demonstrates different permission levels and features.
              </p>
            </div>

            {/* Demo User Cards */}
            <div className="feature-grid">
              {demoUsers.map((user) => {
                const IconComponent = user.icon;
                const isCurrentlyLoading = loadingUser === user.email;

                return (
                  <div 
                    key={user.email} 
                    className="demo-role-card cursor-pointer"
                    onClick={() => handleDemoLogin(user)}
                  >
                    <div className="p-6 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      {/* Role Icon & Title */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{user.displayName}</h3>
                            <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                          </div>
                        </div>
                        
                        {/* Status Indicator */}
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-muted-foreground">Available</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-4">
                        {user.description}
                      </p>

                      {/* Permissions */}
                      <div className="mb-4">
                        <h4 className="text-xs font-medium text-foreground mb-2 uppercase tracking-wide">
                          Permissions
                        </h4>
                        <div className="space-y-1">
                          {user.permissions.slice(0, 3).map((permission, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-xs text-muted-foreground">{permission}</span>
                            </div>
                          ))}
                          {user.permissions.length > 3 && (
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">
                                +{user.permissions.length - 3} more permissions
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Login Button */}
                      <button
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {isCurrentlyLoading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Logging in...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <Lock className="h-4 w-4" />
                            <span>Login as {user.displayName}</span>
                          </div>
                        )}
                      </button>

                      {/* Account Details */}
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <p className="text-xs text-muted-foreground font-mono text-center bg-muted/30 px-2 py-1 rounded">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Information */}
            <div className="mt-12 text-center">
              <Card className="max-w-2xl mx-auto">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-3">
                    What You Can Test
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Core Features</h4>
                      <ul className="space-y-1 text-left">
                        <li>• Role-based access control</li>
                        <li>• User management interface</li>
                        <li>• Analytics dashboard</li>
                        <li>• Security monitoring</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Enterprise Features</h4>
                      <ul className="space-y-1 text-left">
                        <li>• Organization management</li>
                        <li>• Team collaboration tools</li>
                        <li>• Advanced security settings</li>
                        <li>• Subscription management</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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