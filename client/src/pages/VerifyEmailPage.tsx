import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle2, AlertCircle, Loader2, Mail } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function VerifyEmailPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      verifyEmail(token);
    } else {
      setVerificationStatus('error');
      setErrorMessage('No verification token provided');
    }
  }, []);

  const verifyEmail = async (token: string) => {
    setIsVerifying(true);
    
    try {
      const response = await apiRequest("POST", "/api/auth/verify-email", { token });
      
      setVerificationStatus('success');
      toast({
        title: "Email verified successfully!",
        description: "Your account is now active. You can sign in.",
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        setLocation('/login?message=email-verified');
      }, 2000);
      
    } catch (error) {
      setVerificationStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Verification failed';
      setErrorMessage(errorMsg);
      toast({
        title: "Verification failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center auth-gradient px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo />
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Email Verification
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Verifying your Auth247 account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {verificationStatus === 'pending' && "Verifying your email..."}
              {verificationStatus === 'success' && "Email verified!"}
              {verificationStatus === 'error' && "Verification failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              {verificationStatus === 'pending' && (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
                  <p className="text-muted-foreground">
                    Please wait while we verify your email address...
                  </p>
                </div>
              )}

              {verificationStatus === 'success' && (
                <div className="space-y-4">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-600" />
                  <div className="space-y-2">
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Your email has been verified successfully!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your Auth247 account is now active. You'll be redirected to the login page shortly.
                    </p>
                  </div>
                </div>
              )}

              {verificationStatus === 'error' && (
                <div className="space-y-4">
                  <AlertCircle className="h-12 w-12 mx-auto text-red-600" />
                  <div className="space-y-2">
                    <p className="font-medium text-red-800 dark:text-red-200">
                      Verification failed
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {errorMessage}
                    </p>
                  </div>
                  
                  <div className="space-y-3 pt-4">
                    <Button
                      onClick={() => setLocation('/signup')}
                      className="w-full"
                    >
                      Try signing up again
                    </Button>
                    
                    <p className="text-xs text-muted-foreground">
                      Need help? Contact us at{' '}
                      <a href="mailto:support@auth247.net" className="text-primary hover:underline">
                        support@auth247.net
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {verificationStatus === 'success' && (
              <div className="space-y-3">
                <Button
                  onClick={() => setLocation('/login')}
                  className="w-full"
                >
                  Continue to Sign In
                </Button>
                
                <div className="text-center">
                  <Link href="/" className="text-sm text-primary hover:underline">
                    Return to homepage
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2025 Auth247. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}