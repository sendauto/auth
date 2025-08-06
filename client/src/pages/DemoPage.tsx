import React from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Lock, Shield, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicNavigation } from "@/components/layout/PublicNavigation";
import { Logo } from "@/components/ui/logo";

export function DemoPage() {
  const [, setLocation] = useLocation();

  const demoFeatures = [
    {
      title: "Role-Based Access Control",
      description: "Experience different user roles and permission levels",
      icon: "🔐",
    },
    {
      title: "User Management",
      description: "Manage team members and organizational structure",
      icon: "👥",
    },
    {
      title: "Analytics Dashboard",
      description: "View comprehensive security and usage analytics",
      icon: "📊",
    },
  ];

  const redirectToDemoLogin = () => {
    setLocation("/dlogin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <PublicNavigation />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Experience Auth247 Demo
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Discover the power of enterprise-grade authentication with our interactive demo. 
            Test different user roles and explore comprehensive security features.
          </p>
        </div>

        {/* Demo Features */}
        <div className="feature-grid mb-16">
          {demoFeatures.map((feature, index) => (
            <div key={index} className="feature-card text-center">
              <div className="text-5xl mb-6 filter drop-shadow-sm">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-4 text-gradient">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="auth-card max-w-2xl mx-auto p-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl flex items-center justify-center border-2 border-blue-200/50 dark:border-blue-700/50">
                <Shield className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            
            <h2 className="text-4xl font-bold mb-6 text-gradient">
              Ready to Explore?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg mx-auto">
              Access our dedicated demo environment with pre-configured user accounts 
              showcasing different roles and permissions.
            </p>
            
            <button 
              className="btn-primary text-lg px-10 py-4 mb-6"
              onClick={redirectToDemoLogin}
            >
              <Lock className="h-5 w-5 mr-3" />
              Launch Demo Environment
              <ExternalLink className="h-5 w-5 ml-3" />
            </button>

            <div className="text-sm text-muted-foreground space-y-2">
              <div className="flex items-center justify-center space-x-6">
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  No registration required
                </span>
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Instant access
                </span>
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Multiple user roles
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mt-20">
          <div className="feature-card text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-green-200/50 dark:border-green-700/50 group-hover:scale-110 transition-transform duration-200">
              <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-bold text-lg mb-3 text-gradient">Enterprise Security</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Military-grade encryption and security protocols with continuous threat monitoring
            </p>
          </div>
          <div className="feature-card text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-blue-200/50 dark:border-blue-700/50 group-hover:scale-110 transition-transform duration-200">
              <CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-bold text-lg mb-3 text-gradient">RBAC System</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Granular role-based access control with hierarchical permission management
            </p>
          </div>
          <div className="feature-card text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-purple-200/50 dark:border-purple-700/50 group-hover:scale-110 transition-transform duration-200">
              <Lock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-bold text-lg mb-3 text-gradient">24/7 Monitoring</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Continuous security monitoring with real-time alerts and threat detection
            </p>
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