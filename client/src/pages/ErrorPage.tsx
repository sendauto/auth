import React from "react";
import { useAuth } from "@/lib/auth";
import { Shield, AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorPageProps {
  error?: string;
  message?: string;
  showRetry?: boolean;
  showHomeButton?: boolean;
}

export function ErrorPage({ 
  error = "Authentication Error", 
  message = "We encountered an issue while trying to authenticate your session. Please try again.",
  showRetry = true,
  showHomeButton = true
}: ErrorPageProps) {
  const { checkSession } = useAuth();

  const handleRetry = async () => {
    try {
      await checkSession();
    } catch (err) {
      console.error("Retry failed:", err);
    }
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center auth-gradient px-4">
      <div className="max-w-md w-full text-center space-y-8">
        
        {/* Logo */}
        <div className="mx-auto h-16 w-16 bg-primary rounded-lg flex items-center justify-center mb-4">
          <Shield className="text-primary-foreground text-2xl h-8 w-8" />
        </div>

        <Card className="auth-card-shadow border-border">
          <CardContent className="p-8">
            <div className="space-y-6">
              
              {/* Error Icon */}
              <div className="inline-flex items-center justify-center h-16 w-16 bg-destructive/10 rounded-full mb-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              
              {/* Error Message */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">{error}</h2>
                <p className="text-muted-foreground mb-6">{message}</p>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                {showRetry && (
                  <Button 
                    onClick={handleRetry}
                    className="w-full auth-button-primary"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
                
                {showHomeButton && (
                  <Button 
                    onClick={handleGoHome}
                    variant="outline"
                    className="w-full auth-button-secondary"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Back to Login
                  </Button>
                )}
              </div>
              
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Need help? Contact your system administrator</p>
        </div>
      </div>
    </div>
  );
}
