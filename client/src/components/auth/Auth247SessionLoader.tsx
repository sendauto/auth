import React from "react";
import { useAuth } from "@/lib/auth";
import { Shield, Loader2 } from "lucide-react";

interface Auth247SessionLoaderProps {
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export function Auth247SessionLoader({ 
  children, 
  loadingComponent 
}: Auth247SessionLoaderProps) {
  const { loading } = useAuth();

  if (loading) {
    return loadingComponent || <DefaultLoadingComponent />;
  }

  return <>{children}</>;
}

function DefaultLoadingComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center auth-gradient">
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 bg-primary rounded-full mb-4 animate-pulse">
          <Shield className="h-8 w-8 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Authenticating...</h2>
        <p className="text-muted-foreground mb-4">Please wait while we verify your session</p>
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    </div>
  );
}
