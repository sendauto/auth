import React from "react";
import { useAuth, hasRequiredRole } from "@/lib/auth";
import { Auth247SessionLoader } from "./Auth247SessionLoader";
import { LoginPage } from "@/pages/LoginPage";
import { ErrorPage } from "@/pages/ErrorPage";

interface WithAuthRouteOptions {
  requiredRoles?: string[];
  redirectTo?: string;
  fallbackComponent?: React.ComponentType;
}

export function withAuthRoute<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthRouteOptions = {}
) {
  const { requiredRoles = [], fallbackComponent: FallbackComponent } = options;

  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, user, loading, error } = useAuth();

    return (
      <Auth247SessionLoader>
        {(() => {
          if (error) {
            if (FallbackComponent) {
              return <FallbackComponent />;
            }
            return <ErrorPage error={error} />;
          }

          if (!isAuthenticated) {
            return <LoginPage />;
          }

          if (user && requiredRoles.length > 0) {
            if (!hasRequiredRole(user.roles, requiredRoles)) {
              if (FallbackComponent) {
                return <FallbackComponent />;
              }
              return (
                <ErrorPage 
                  error="Access Denied" 
                  message="You don't have the required permissions to access this page."
                />
              );
            }
          }

          return <Component {...props} />;
        })()}
      </Auth247SessionLoader>
    );
  };
}
