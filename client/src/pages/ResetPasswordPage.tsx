import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PublicNavigation } from "@/components/layout/PublicNavigation";

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
}

function ResetPasswordPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: "bg-gray-200"
  });

  // Extract token from URL
  useEffect(() => {
    console.log('[ResetPasswordPage] Component mounted');
    console.log('[ResetPasswordPage] Current URL:', window.location.href);
    
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    const userEmail = urlParams.get('email');
    
    console.log('[ResetPasswordPage] Token from URL:', resetToken);
    console.log('[ResetPasswordPage] Email from URL:', userEmail);
    
    if (resetToken) {
      setToken(resetToken);
      if (userEmail) {
        setEmail(decodeURIComponent(userEmail));
      }
      validateToken(resetToken);
    } else {
      console.log('[ResetPasswordPage] No token found in URL');
      setTokenValid(false);
    }
  }, []);

  const validateToken = async (resetToken: string) => {
    console.log('[ResetPasswordPage] Validating token:', resetToken.substring(0, 10) + '...');
    try {
      const response = await apiRequest("POST", "/api/auth/validate-reset-token", { token: resetToken });
      console.log('[ResetPasswordPage] Token validation successful:', response);
      setTokenValid(true);
    } catch (error) {
      console.error('[ResetPasswordPage] Token validation failed:', error);
      setTokenValid(false);
      toast({
        title: "Invalid Reset Link",
        description: "This password reset link is invalid or has expired.",
        variant: "destructive",
      });
    }
  };

  const calculatePasswordStrength = (pwd: string): PasswordStrength => {
    const feedback: string[] = [];
    let score = 0;

    if (pwd.length >= 12) score += 25;
    else if (pwd.length >= 8) score += 15;
    else feedback.push("Use at least 8 characters");

    if (/[a-z]/.test(pwd)) score += 15;
    else feedback.push("Include lowercase letters");

    if (/[A-Z]/.test(pwd)) score += 15;
    else feedback.push("Include uppercase letters");

    if (/\d/.test(pwd)) score += 15;
    else feedback.push("Include numbers");

    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score += 15;
    else feedback.push("Include special characters");

    if (pwd.length >= 16) score += 15;

    let color = "bg-red-500";
    if (score >= 85) color = "bg-green-500";
    else if (score >= 60) color = "bg-yellow-500";
    else if (score >= 40) color = "bg-orange-500";

    return { score, feedback, color };
  };

  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password));
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('[ResetPasswordPage] Form submitted');
    console.log('[ResetPasswordPage] Token valid:', tokenValid);
    console.log('[ResetPasswordPage] Password strength:', passwordStrength.score);
    
    if (!token || !tokenValid) {
      toast({
        title: "Invalid Token",
        description: "Password reset token is missing or invalid.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please ensure both passwords are identical.",
        variant: "destructive",
      });
      return;
    }

    if (passwordStrength.score < 60) {
      toast({
        title: "Password Too Weak",
        description: "Please choose a stronger password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('[ResetPasswordPage] Attempting password reset...');
      const response = await apiRequest("POST", "/api/auth/reset-password", {
        token,
        password,
        confirmPassword
      });
      
      console.log('[ResetPasswordPage] Password reset successful:', response);

      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated. You can now sign in.",
      });

      // Redirect to login page after success
      setTimeout(() => {
        console.log('[ResetPasswordPage] Redirecting to login...');
        setLocation("/login");
      }, 2000);

    } catch (error) {
      console.error('[ResetPasswordPage] Password reset failed:', error);
      toast({
        title: "Reset Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavigation currentPage="/reset-password" />
        
        <div className="flex items-center justify-center auth-gradient px-4 py-24">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Logo size="xl" />
            </div>
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-sm text-muted-foreground">Validating reset link...</p>
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

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavigation currentPage="/reset-password" />
        
        <div className="flex items-center justify-center auth-gradient px-4 py-24">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Logo size="xl" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Invalid Reset Link</h1>
            <p className="mt-2 text-sm text-muted-foreground">This password reset link is invalid or has expired</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold">Link Expired</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Password reset links expire after 1 hour for security reasons.
                  </p>
                </div>
                <div className="pt-4 space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/forgot-password">Request New Reset Link</Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full">
                    <Link href="/login">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Sign In
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
      <PublicNavigation currentPage="/reset-password" />
      
      <div className="flex items-center justify-center auth-gradient px-4 py-24">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Branding */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size="xl" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Reset Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">Create a new secure password</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Set New Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Display */}
              {email && (
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-muted"
                  />
                </div>
              )}

              {/* New Password */}
              <div>
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your new password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Password Strength</span>
                      <span className={`font-medium ${
                        passwordStrength.score >= 85 ? 'text-green-600' :
                        passwordStrength.score >= 60 ? 'text-yellow-600' :
                        passwordStrength.score >= 40 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {passwordStrength.score >= 85 ? 'Very Strong' :
                         passwordStrength.score >= 60 ? 'Strong' :
                         passwordStrength.score >= 40 ? 'Fair' : 'Weak'}
                      </span>
                    </div>
                    <Progress value={passwordStrength.score} className="h-2" />
                    
                    {passwordStrength.feedback.length > 0 && (
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {passwordStrength.feedback.map((item, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                )}
                
                {confirmPassword && password === confirmPassword && (
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Passwords match
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Updating Password...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            For your security, this reset link will expire in 1 hour.
            <br />
            If you didn't request this reset, please contact support.
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

export { ResetPasswordPage };