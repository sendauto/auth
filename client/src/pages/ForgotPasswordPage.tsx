import React, { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ProviderSelectionModal } from "@/components/auth/ProviderSelectionModal";
import { PublicNavigation } from "@/components/layout/PublicNavigation";

export function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiRequest("POST", "/api/auth/forgot-password", { email });
      setIsSubmitted(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavigation currentPage="/forgot-password" />
        
        <div className="flex items-center justify-center auth-gradient px-4 py-24">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Branding */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Logo size="xl" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Check Your Email</h1>
            <p className="mt-2 text-sm text-muted-foreground">Password reset instructions sent</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Email sent!</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    If an account exists for <strong>{email}</strong>, you will receive 
                    password reset instructions shortly.
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Didn't receive the email?</strong><br />
                    Check your spam folder or wait a few minutes before requesting another reset.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/login">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            </Link>
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

  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation currentPage="/forgot-password" />
      
      <div className="flex items-center justify-center auth-gradient px-4 py-24">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Branding */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size="xl" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Reset Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter your email to receive reset instructions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Forgot Your Password?</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@company.com"
                  required
                />
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">How it works:</p>
                    <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                      <li>1. Enter your email address below</li>
                      <li>2. Check your email for reset instructions</li>
                      <li>3. Follow the link to create a new password</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Reset Instructions
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <Link href="/login">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </Link>
          
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button 
              onClick={() => setShowProviderModal(true)}
              className="text-primary hover:underline font-medium cursor-pointer"
            >
              Create account
            </button>
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
      
      <ProviderSelectionModal
        isOpen={showProviderModal}
        onClose={() => setShowProviderModal(false)}
        mode="signup"
      />
    </div>
  );
}