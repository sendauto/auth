// Enterprise SSO utilities and domain-specific authentication

export interface SSOProvider {
  name: string;
  displayName: string;
  loginUrl: string;
  enabled: boolean;
}

export interface SSOConfig {
  domain: string;
  tenant: string;
  ssoEnabled: boolean;
  providers: SSOProvider[];
}

export interface SilentCheckResult {
  authenticated: boolean;
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    tenant: string;
    lastLogin?: Date | null;
  };
  session?: {
    id: string;
    expiresAt: Date;
  };
}

/**
 * Performs a silent authentication check without redirecting
 * Used for automatic session validation and token refresh
 */
export async function silentAuthCheck(): Promise<SilentCheckResult> {
  try {
    const response = await fetch("/api/auth/silent-check", {
      credentials: "include",
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      return {
        authenticated: true,
        user: data.user,
        session: {
          ...data.session,
          expiresAt: new Date(data.session.expiresAt),
        },
      };
    } else {
      return { authenticated: false };
    }
  } catch (error) {
    console.error("Silent auth check failed:", error);
    return { authenticated: false };
  }
}

/**
 * Attempts to refresh the current session token
 * Returns true if successful, false if refresh failed
 */
export async function refreshAuthToken(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    return response.ok;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
}

/**
 * Discovers SSO configuration for a given email domain
 * Used for enterprise authentication flows
 */
export async function discoverSSOConfig(domain: string): Promise<SSOConfig | null> {
  try {
    const response = await fetch(`/api/auth/discover/${encodeURIComponent(domain)}`, {
      credentials: "include",
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("SSO discovery failed:", error);
    return null;
  }
}

/**
 * Extracts domain from email address
 */
export function extractDomainFromEmail(email: string): string {
  const atIndex = email.indexOf('@');
  return atIndex !== -1 ? email.substring(atIndex + 1) : '';
}

/**
 * Determines if an email belongs to an enterprise domain
 * Based on common enterprise domain patterns
 */
export function isEnterpriseDomain(domain: string): boolean {
  const consumerDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
    'aol.com', 'icloud.com', 'protonmail.com', 'tutanota.com'
  ];
  
  return !consumerDomains.includes(domain.toLowerCase());
}

/**
 * Initiates SSO login with a specific provider
 */
export function initiateSSO(provider: SSOProvider, redirectUri?: string): void {
  const url = new URL(provider.loginUrl);
  
  if (redirectUri) {
    url.searchParams.set('redirect_uri', redirectUri);
  }
  
  // Add state parameter for security
  const state = btoa(JSON.stringify({
    provider: provider.name,
    timestamp: Date.now(),
    redirectUri: redirectUri || window.location.origin + '/dashboard'
  }));
  
  url.searchParams.set('state', state);
  
  window.location.href = url.toString();
}

/**
 * Sets up automatic token refresh before session expiry
 */
export function setupAutoRefresh(expiresAt: Date, onRefreshSuccess?: () => void, onRefreshFailure?: () => void): () => void {
  // Refresh 5 minutes before expiry
  const refreshTime = expiresAt.getTime() - Date.now() - (5 * 60 * 1000);
  
  if (refreshTime <= 0) {
    // Already expired or will expire soon
    return () => {};
  }
  
  const timeoutId = setTimeout(async () => {
    const success = await refreshAuthToken();
    if (success) {
      onRefreshSuccess?.();
    } else {
      onRefreshFailure?.();
    }
  }, refreshTime);
  
  // Return cleanup function
  return () => clearTimeout(timeoutId);
}

/**
 * Shared authentication domain configuration
 * Used for centralizing authentication across subdomains
 */
export const AUTH_DOMAIN_CONFIG = {
  // In production, this would be something like 'auth.authmesh.com'
  authDomain: import.meta.env.VITE_AUTH_DOMAIN || window.location.hostname,
  
  // Whether to use a centralized auth domain
  useCentralizedAuth: import.meta.env.VITE_USE_CENTRALIZED_AUTH === 'true',
  
  // Cookie domain for shared sessions
  cookieDomain: import.meta.env.VITE_COOKIE_DOMAIN || window.location.hostname,
};

/**
 * Builds authentication URL for centralized auth domain
 */
export function buildCentralizedAuthUrl(action: 'login' | 'logout' | 'callback', params?: Record<string, string>): string {
  const baseUrl = AUTH_DOMAIN_CONFIG.useCentralizedAuth 
    ? `https://${AUTH_DOMAIN_CONFIG.authDomain}`
    : window.location.origin;
    
  const url = new URL(`/api/auth/${action}`, baseUrl);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.toString();
}