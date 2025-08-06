import { apiRequest } from './queryClient';

// Base44 User Interface
export interface Base44User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'manager' | 'super_admin';
  organizationId?: string;
  emailVerified: boolean;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Base44 Organization Interface
export interface Base44Organization {
  id: string;
  name: string;
  description?: string;
  website?: string;
  ownerId: string;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Authentication Response Interface
export interface Base44AuthResponse {
  success: boolean;
  user?: Base44User;
  token?: string;
  refreshToken?: string;
  error?: string;
}

// Organization Response Interface
export interface Base44OrganizationResponse {
  success: boolean;
  organizations?: Base44Organization[];
  organization?: Base44Organization;
  error?: string;
}

/**
 * Base44 Authentication Client
 * Handles all Auth247 + Base44 authentication operations
 */
export class Base44AuthClient {
  private baseUrl = '/api/base44';
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('base44_token');
      this.refreshToken = localStorage.getItem('base44_refresh_token');
    }
  }

  // Token Management
  private setTokens(token: string, refreshToken?: string) {
    this.token = token;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('base44_token', token);
      if (refreshToken) {
        localStorage.setItem('base44_refresh_token', refreshToken);
      }
    }
  }

  private clearTokens() {
    this.token = null;
    this.refreshToken = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('base44_token');
      localStorage.removeItem('base44_refresh_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Authentication Methods

  /**
   * Register a new user
   */
  async register(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    organizationId?: string;
  }): Promise<Base44AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success && data.token) {
        this.setTokens(data.token, data.refreshToken);
      }

      return data;
    } catch (error) {
      console.error('[Base44 Client] Registration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<Base44AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success && data.token) {
        this.setTokens(data.token, data.refreshToken);
      }

      return data;
    } catch (error) {
      console.error('[Base44 Client] Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    this.clearTokens();
  }

  /**
   * Refresh authentication token
   */
  async refreshAuthentication(): Promise<Base44AuthResponse> {
    if (!this.refreshToken) {
      return {
        success: false,
        error: 'No refresh token available'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      const data = await response.json();

      if (data.success && data.token) {
        this.setTokens(data.token, data.refreshToken);
      } else {
        this.clearTokens();
      }

      return data;
    } catch (error) {
      console.error('[Base44 Client] Token refresh error:', error);
      this.clearTokens();
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token refresh failed'
      };
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<Base44AuthResponse> {
    if (!this.token) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[Base44 Client] Get user error:', error);
      
      // If unauthorized, try to refresh token
      if (error instanceof Error && error.message.includes('401')) {
        const refreshResult = await this.refreshAuthentication();
        if (refreshResult.success) {
          // Retry the request with new token
          return this.getCurrentUser();
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user'
      };
    }
  }

  /**
   * Update current user profile
   */
  async updateProfile(updates: {
    firstName?: string;
    lastName?: string;
    username?: string;
    avatar?: string;
    metadata?: Record<string, any>;
  }): Promise<Base44AuthResponse> {
    if (!this.token) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/me`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[Base44 Client] Update profile error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Profile update failed'
      };
    }
  }

  // Organization Methods

  /**
   * Get user's organizations
   */
  async getOrganizations(): Promise<Base44OrganizationResponse> {
    if (!this.token) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/organizations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[Base44 Client] Get organizations error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get organizations'
      };
    }
  }

  /**
   * Create new organization
   */
  async createOrganization(orgData: {
    name: string;
    description?: string;
    website?: string;
    settings?: Record<string, any>;
  }): Promise<Base44OrganizationResponse> {
    if (!this.token) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/organizations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orgData)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[Base44 Client] Create organization error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Organization creation failed'
      };
    }
  }

  // Utility Methods

  /**
   * Make authenticated request with automatic token refresh
   */
  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<any> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      'Authorization': `Bearer ${this.token}`
    };

    try {
      const response = await fetch(url, { ...options, headers });
      return await response.json();
    } catch (error) {
      // If unauthorized, try to refresh token and retry
      if (error instanceof Error && error.message.includes('401')) {
        const refreshResult = await this.refreshAuthentication();
        if (refreshResult.success && this.token) {
          const newHeaders = {
            'Content-Type': 'application/json',
            ...options.headers,
            'Authorization': `Bearer ${this.token}`
          };
          const retryResponse = await fetch(url, { ...options, headers: newHeaders });
          return await retryResponse.json();
        }
      }
      throw error;
    }
  }
}

// Create singleton instance
export const base44Client = new Base44AuthClient();

// React Hook for Base44 Authentication
export const useBase44Auth = () => {
  return {
    client: base44Client,
    isAuthenticated: base44Client.isAuthenticated(),
    token: base44Client.getToken(),
    register: base44Client.register.bind(base44Client),
    login: base44Client.login.bind(base44Client),
    logout: base44Client.logout.bind(base44Client),
    getCurrentUser: base44Client.getCurrentUser.bind(base44Client),
    updateProfile: base44Client.updateProfile.bind(base44Client),
    getOrganizations: base44Client.getOrganizations.bind(base44Client),
    createOrganization: base44Client.createOrganization.bind(base44Client),
    makeAuthenticatedRequest: base44Client.makeAuthenticatedRequest.bind(base44Client)
  };
};

export default base44Client;