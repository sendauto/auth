import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { z } from 'zod';

// Base44 Integration Configuration
interface Base44Config {
  apiKey: string;
  baseUrl: string;
  projectId: string;
  environment: 'development' | 'production';
}

const base44Config: Base44Config = {
  apiKey: process.env.BASE44_API_KEY || '',
  baseUrl: process.env.BASE44_BASE_URL || 'https://api.base44.com',
  projectId: process.env.BASE44_PROJECT_ID || '',
  environment: (process.env.NODE_ENV as 'development' | 'production') || 'development'
};

// Base44 User Schema
const Base44UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatar: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
  organizationId: z.string().optional(),
  role: z.enum(['user', 'admin', 'manager', 'super_admin']).default('user'),
  isActive: z.boolean().default(true),
  emailVerified: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string()
});

type Base44User = z.infer<typeof Base44UserSchema>;

// Base44 Authentication Response
interface Base44AuthResponse {
  success: boolean;
  user?: Base44User;
  token?: string;
  refreshToken?: string;
  error?: string;
  message?: string;
}

// Base44 API Client
class Base44Client {
  private config: Base44Config;
  private headers: Record<string, string>;

  constructor(config: Base44Config) {
    this.config = config;
    this.headers = {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'X-Project-ID': config.projectId,
      'X-Environment': config.environment
    };
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`Base44 API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[Base44] API Request failed:', error);
      throw error;
    }
  }

  // User Management
  async createUser(userData: Partial<Base44User>): Promise<Base44AuthResponse> {
    try {
      const response = await this.makeRequest('/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      return {
        success: true,
        user: Base44UserSchema.parse(response.user),
        token: response.token,
        refreshToken: response.refreshToken
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user'
      };
    }
  }

  async getUserById(userId: string): Promise<Base44AuthResponse> {
    try {
      const response = await this.makeRequest(`/users/${userId}`);
      
      return {
        success: true,
        user: Base44UserSchema.parse(response.user)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'User not found'
      };
    }
  }

  async getUserByEmail(email: string): Promise<Base44AuthResponse> {
    try {
      const response = await this.makeRequest(`/users/email/${encodeURIComponent(email)}`);
      
      return {
        success: true,
        user: Base44UserSchema.parse(response.user)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'User not found'
      };
    }
  }

  async updateUser(userId: string, updates: Partial<Base44User>): Promise<Base44AuthResponse> {
    try {
      const response = await this.makeRequest(`/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });

      return {
        success: true,
        user: Base44UserSchema.parse(response.user)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user'
      };
    }
  }

  async deleteUser(userId: string): Promise<Base44AuthResponse> {
    try {
      await this.makeRequest(`/users/${userId}`, {
        method: 'DELETE'
      });

      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user'
      };
    }
  }

  // Authentication
  async authenticateUser(email: string, password: string): Promise<Base44AuthResponse> {
    try {
      const response = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      return {
        success: true,
        user: Base44UserSchema.parse(response.user),
        token: response.token,
        refreshToken: response.refreshToken
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<Base44AuthResponse> {
    try {
      const response = await this.makeRequest('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken })
      });

      return {
        success: true,
        token: response.token,
        refreshToken: response.refreshToken
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token refresh failed'
      };
    }
  }

  async validateToken(token: string): Promise<Base44AuthResponse> {
    try {
      const response = await this.makeRequest('/auth/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        success: true,
        user: Base44UserSchema.parse(response.user)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token validation failed'
      };
    }
  }

  // Organization Management
  async createOrganization(orgData: any): Promise<any> {
    try {
      const response = await this.makeRequest('/organizations', {
        method: 'POST',
        body: JSON.stringify(orgData)
      });

      return { success: true, organization: response.organization };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create organization'
      };
    }
  }

  async getUserOrganizations(userId: string): Promise<any> {
    try {
      const response = await this.makeRequest(`/users/${userId}/organizations`);
      
      return { success: true, organizations: response.organizations };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch organizations'
      };
    }
  }
}

// Initialize Base44 Client
export const base44Client = new Base44Client(base44Config);

// Auth247 <-> Base44 Bridge Service
export class Auth247Base44Bridge {
  private base44: Base44Client;
  private secretKey: string;

  constructor() {
    this.base44 = base44Client;
    this.secretKey = process.env.SESSION_SECRET || 'auth247-secret';
  }

  // Generate Auth247 JWT that includes Base44 user context
  private generateAuth247Token(user: Base44User, base44Token: string): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      base44Token,
      iss: 'auth247.net',
      aud: 'auth247-client',
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, this.secretKey, { algorithm: 'HS256' });
  }

  // Verify Auth247 JWT and extract Base44 context
  private verifyAuth247Token(token: string): any {
    try {
      const decoded = jwt.verify(token, this.secretKey) as any;
      return { success: true, payload: decoded };
    } catch (error) {
      return { success: false, error: 'Invalid token' };
    }
  }

  // Register new user in both Auth247 and Base44
  async registerUser(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    organizationId?: string;
  }): Promise<Base44AuthResponse> {
    try {
      // Hash password for local storage
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user in Base44
      const base44Response = await this.base44.createUser({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        organizationId: userData.organizationId,
        role: 'user',
        isActive: true,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      if (!base44Response.success || !base44Response.user) {
        return base44Response;
      }

      // Generate Auth247 token with Base44 context
      const auth247Token = this.generateAuth247Token(
        base44Response.user,
        base44Response.token || ''
      );

      return {
        success: true,
        user: base44Response.user,
        token: auth247Token,
        refreshToken: base44Response.refreshToken
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  // Login user and create Auth247 session with Base44 context
  async loginUser(email: string, password: string): Promise<Base44AuthResponse> {
    try {
      // Authenticate with Base44
      const base44Response = await this.base44.authenticateUser(email, password);

      if (!base44Response.success || !base44Response.user) {
        return base44Response;
      }

      // Generate Auth247 token with Base44 context
      const auth247Token = this.generateAuth247Token(
        base44Response.user,
        base44Response.token || ''
      );

      return {
        success: true,
        user: base44Response.user,
        token: auth247Token,
        refreshToken: base44Response.refreshToken
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  // Validate Auth247 token and sync with Base44
  async validateSession(auth247Token: string): Promise<Base44AuthResponse> {
    try {
      // Verify Auth247 token
      const tokenResult = this.verifyAuth247Token(auth247Token);
      if (!tokenResult.success) {
        return tokenResult;
      }

      const { payload } = tokenResult;

      // Validate Base44 token if present
      if (payload.base44Token) {
        const base44Response = await this.base44.validateToken(payload.base44Token);
        if (base44Response.success && base44Response.user) {
          return {
            success: true,
            user: base44Response.user,
            token: auth247Token
          };
        }
      }

      // Fallback: fetch user by ID from Base44
      const userResponse = await this.base44.getUserById(payload.userId);
      return {
        success: userResponse.success,
        user: userResponse.user,
        token: auth247Token,
        error: userResponse.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Session validation failed'
      };
    }
  }

  // Refresh Auth247 token with updated Base44 context
  async refreshSession(refreshToken: string): Promise<Base44AuthResponse> {
    try {
      // Refresh Base44 token
      const base44Response = await this.base44.refreshToken(refreshToken);
      
      if (!base44Response.success) {
        return base44Response;
      }

      // Get updated user data
      const userResponse = await this.base44.validateToken(base44Response.token || '');
      
      if (!userResponse.success || !userResponse.user) {
        return userResponse;
      }

      // Generate new Auth247 token
      const auth247Token = this.generateAuth247Token(
        userResponse.user,
        base44Response.token || ''
      );

      return {
        success: true,
        user: userResponse.user,
        token: auth247Token,
        refreshToken: base44Response.refreshToken
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token refresh failed'
      };
    }
  }

  // Update user in both systems
  async updateUser(userId: string, updates: Partial<Base44User>): Promise<Base44AuthResponse> {
    try {
      const response = await this.base44.updateUser(userId, updates);
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'User update failed'
      };
    }
  }

  // Get user organizations from Base44
  async getUserOrganizations(userId: string): Promise<any> {
    return await this.base44.getUserOrganizations(userId);
  }

  // Create organization in Base44
  async createOrganization(orgData: any): Promise<any> {
    return await this.base44.createOrganization(orgData);
  }
}

// Initialize bridge service
export const auth247Bridge = new Auth247Base44Bridge();

// Middleware for Base44 authentication
export const base44AuthMiddleware = async (req: Request, res: Response, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const validation = await auth247Bridge.validateSession(token);
    
    if (!validation.success) {
      return res.status(401).json({ error: validation.error });
    }

    // Add user context to request
    (req as any).user = validation.user;
    (req as any).base44Context = {
      userId: validation.user?.id,
      organizationId: validation.user?.organizationId,
      role: validation.user?.role
    };

    next();
  } catch (error) {
    console.error('[Base44 Middleware] Error:', error);
    res.status(500).json({ error: 'Authentication service error' });
  }
};

export default auth247Bridge;