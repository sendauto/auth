import { createContext, useContext } from "react";

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  tenant: string;
  lastLogin?: Date | null;
}

export interface AuthSession {
  id: string;
  expiresAt: Date;
  ipAddress?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials?: { email: string; password: string }) => Promise<{ success: boolean } | void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an Auth247Provider");
  }
  return context;
}

// Role hierarchy for access control
export const ROLE_HIERARCHY: Record<string, string[]> = {
  super_admin: ["super_admin", "admin", "manager", "user"],
  admin: ["admin", "manager", "user"],
  manager: ["manager", "user"],
  user: ["user"],
};

export function hasRequiredRole(userRoles: string[], requiredRoles: string[]): boolean {
  if (requiredRoles.length === 0) return true;
  
  return requiredRoles.some(requiredRole => 
    userRoles.some(userRole => {
      const allowedRoles = ROLE_HIERARCHY[userRole] || [userRole];
      return allowedRoles.includes(requiredRole);
    })
  );
}
