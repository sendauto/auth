import React, { useState, useEffect, useCallback } from "react";
import { AuthContext, type AuthState, type AuthUser, type AuthSession } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { silentAuthCheck, refreshAuthToken, setupAutoRefresh } from "@/lib/sso";

interface Auth247ProviderProps {
  children: React.ReactNode;
}

export function Auth247Provider({ children }: Auth247ProviderProps) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  const checkSession = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Try silent check first for better UX with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const silentResult = await silentAuthCheck();
        clearTimeout(timeoutId);
        
        if (silentResult.authenticated && silentResult.user && silentResult.session) {
          const newState: AuthState = {
            isAuthenticated: true,
            user: silentResult.user,
            session: silentResult.session,
            loading: false,
            error: null,
          };
          setState(newState);
          
          // Set up automatic token refresh
          if (silentResult.session) {
            setupAutoRefresh(
              silentResult.session.expiresAt,
              () => checkSession(), // Refresh success - reload session
              () => setState(prev => ({ ...prev, isAuthenticated: false, user: null, session: null })) // Refresh failed
            );
          }
          return;
        }

        // Fallback to V2 session check
        const response = await fetch("/api/v2/auth/session", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal
        });

        if (response.ok) {
          const data = await response.json();
          
          // Validate data structure before using
          if (data.user) {
            const newState: AuthState = {
              isAuthenticated: true,
              user: {
                ...data.user,
                lastLogin: data.user.lastLogin ? new Date(data.user.lastLogin) : null,
                tenant: data.user.tenant || "default", // Add tenant field if missing
              },
              session: {
                id: data.session?.id || "unknown",
                expiresAt: data.session?.expiresAt ? new Date(data.session.expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000),
                ipAddress: data.session?.ipAddress || "unknown",
              },
              loading: false,
              error: null,
            };
            setState(newState);
            
            // Set up automatic token refresh
            if (newState.session) {
              setupAutoRefresh(
                newState.session.expiresAt,
                () => checkSession(),
                () => setState(prev => ({ ...prev, isAuthenticated: false, user: null, session: null }))
              );
            }
          } else {
            // No user data, treat as unauthenticated
            setState({
              isAuthenticated: false,
              user: null,
              session: null,
              loading: false,
              error: null,
            });
          }
        } else if (response.status === 401) {
          setState({
            isAuthenticated: false,
            user: null,
            session: null,
            loading: false,
            error: null,
          });
        } else {
          throw new Error(`Session check failed: ${response.status} ${response.statusText}`);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.warn('[Auth247Provider] Session check error:', error);
      
      // Handle specific error types gracefully
      let errorMessage = "Authentication failed";
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = "Session check timed out";
        } else if (error.message.includes('fetch')) {
          errorMessage = "Network connection error";
        } else {
          errorMessage = error.message;
        }
      }
      
      setState({
        isAuthenticated: false,
        user: null,
        session: null,
        loading: false,
        error: errorMessage,
      });
    }
  }, []);

  const login = useCallback(async (credentials?: { email: string; password: string }) => {
    if (credentials) {
      // Username/password login
      try {
        const response = await apiRequest("POST", "/api/auth/login", credentials);
        if (response.ok) {
          const data = await response.json();
          
          setState({
            isAuthenticated: true,
            user: {
              ...data.user,
              lastLogin: data.user.lastLogin ? new Date(data.user.lastLogin) : null,
            },
            session: {
              ...data.session,
              expiresAt: new Date(data.session.expiresAt),
            },
            loading: false,
            error: null,
          });
          
          // Set up automatic token refresh
          setupAutoRefresh(
            new Date(data.session.expiresAt),
            () => checkSession(),
            () => setState(prev => ({ ...prev, isAuthenticated: false, user: null, session: null }))
          );
          
          return { success: true };
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Login failed");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Login failed";
        setState(prev => ({ ...prev, error: errorMessage }));
        throw error;
      }
    } else {
      // SSO login
      window.location.href = "/api/auth/sso-login";
    }
  }, [checkSession]);

  const logout = useCallback(async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      setState({
        isAuthenticated: false,
        user: null,
        session: null,
        loading: false,
        error: null,
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      // Force logout on client side even if server call fails
      setState({
        isAuthenticated: false,
        user: null,
        session: null,
        loading: false,
        error: null,
      });
      window.location.href = "/";
    }
  }, []);

  const hasRole = useCallback((role: string) => {
    return state.user?.roles.includes(role) || false;
  }, [state.user]);

  const hasAnyRole = useCallback((roles: string[]) => {
    if (!state.user) return false;
    return roles.some(role => state.user!.roles.includes(role));
  }, [state.user]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const contextValue = {
    ...state,
    login,
    logout,
    checkSession,
    hasRole,
    hasAnyRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
