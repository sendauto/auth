# Auth247 Authentication System Setup Guide

## Overview

This document provides a complete setup guide for implementing the Auth247 authentication system, including both backend and frontend components. The system supports multiple OAuth providers (Google, Microsoft, GitHub), custom email/password authentication, and enterprise-grade security features.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Database Schema](#database-schema)
5. [OAuth Configuration](#oauth-configuration)
6. [Security Features](#security-features)
7. [Environment Variables](#environment-variables)
8. [Testing](#testing)

---

## System Architecture

### Authentication Flow
1. User initiates login/signup
2. Frontend detects email domain for enterprise SSO discovery
3. Backend handles OAuth provider or custom authentication
4. Session created with secure token management
5. Frontend stores authentication state and manages auto-refresh

### Key Components
- **Backend**: Express.js with Passport.js for OAuth
- **Frontend**: React with Context API for state management
- **Database**: PostgreSQL with session storage
- **Security**: Rate limiting, input validation, security headers

---

## Backend Setup

### 1. Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "express-session": "^1.17.3",
    "passport": "^0.6.0",
    "passport-google-oauth20": "^2.0.0",
    "passport-github2": "^0.1.12",
    "passport-microsoft": "^1.0.0",
    "passport-local": "^1.0.0",
    "bcrypt": "^5.1.0",
    "zod": "^3.22.4",
    "drizzle-orm": "^0.29.0",
    "@neondatabase/serverless": "^0.7.2",
    "connect-pg-simple": "^9.0.1"
  }
}
```

### 2. OAuth Configuration (`server/oauth.ts`)

```typescript
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { storage } from './storage';

// Domain detection for custom vs Replit domains
function getBaseUrl(): string {
  const useCustomDomain = process.env.USE_CUSTOM_DOMAIN !== 'false';
  const customDomain = process.env.CUSTOM_DOMAIN || 'auth247.net';
  const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0];
  
  if (useCustomDomain && customDomain) {
    return `https://${customDomain}`;
  } else if (replitDomain) {
    return `https://${replitDomain}`;
  }
  return 'http://localhost:3000';
}

// OAuth provider configuration
const oauthConfig = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${getBaseUrl()}/api/auth/google/callback`,
    scope: ['profile', 'email']
  },
  github: {
    clientID: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    callbackURL: `${getBaseUrl()}/api/auth/github/callback`,
    scope: ['user:email']
  },
  microsoft: {
    clientID: process.env.MICROSOFT_CLIENT_ID!,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
    callbackURL: `${getBaseUrl()}/api/auth/microsoft/callback`,
    scope: ['user.read']
  }
};

// Initialize OAuth strategies
export function initializeOAuth() {
  // Google OAuth
  passport.use(new GoogleStrategy(oauthConfig.google, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await storage.findOrCreateOAuthUser({
        provider: 'google',
        providerId: profile.id,
        email: profile.emails?.[0]?.value,
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
        profileImageUrl: profile.photos?.[0]?.value
      });
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // GitHub OAuth
  passport.use(new GitHubStrategy(oauthConfig.github, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await storage.findOrCreateOAuthUser({
        provider: 'github',
        providerId: profile.id,
        email: profile.emails?.[0]?.value,
        firstName: profile.displayName?.split(' ')[0],
        lastName: profile.displayName?.split(' ')[1],
        profileImageUrl: profile.photos?.[0]?.value
      });
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // Microsoft OAuth
  passport.use(new MicrosoftStrategy(oauthConfig.microsoft, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await storage.findOrCreateOAuthUser({
        provider: 'microsoft',
        providerId: profile.id,
        email: profile.emails?.[0]?.value,
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
        profileImageUrl: profile.photos?.[0]?.value
      });
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // Passport serialization
  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}
```

### 3. Authentication Routes (`server/auth-routes.ts`)

```typescript
import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { storage } from './storage';
import { rateLimit } from './middleware/rate-limit';
import { validateInput } from './middleware/validation';

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  agreeToTerms: z.boolean().refine(val => val === true)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// Rate limiting for auth endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts'
});

// Register endpoint
router.post('/register', authRateLimit, validateInput(registerSchema), async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await storage.createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      isEmailVerified: false,
      role: 'user'
    });

    // Send verification email (implement as needed)
    // await sendVerificationEmail(user.email, user.id);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
router.post('/login', authRateLimit, validateInput(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await storage.getUserByEmail(email);
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Login failed' });
      }
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/dashboard');
});

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/dashboard');
});

router.get('/microsoft', passport.authenticate('microsoft', { scope: ['user.read'] }));
router.get('/microsoft/callback', passport.authenticate('microsoft', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/dashboard');
});

// Session management
router.get('/session', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
});

router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Silent authentication check
router.get('/silent-check', (req, res) => {
  res.json({ authenticated: req.isAuthenticated() });
});

export default router;
```

### 4. Session Configuration (`server/session.ts`)

```typescript
import session from 'express-session';
import connectPg from 'connect-pg-simple';

const pgSession = connectPg(session);

export const sessionConfig = session({
  store: new pgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'sessions',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
});
```

---

## Frontend Setup

### 1. Authentication Context (`client/src/contexts/AuthContext.tsx`)

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setUser(data.user);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    setUser(null);
    window.location.href = '/';
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### 2. Login Page Component (`client/src/pages/LoginPage.tsx`)

```typescript
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardContent } from '../components/ui/card';

export function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Sign In</h1>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}
            
            <div>
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Social Login Section */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-sm font-medium mb-3">Sign in with</h3>
            </div>
            
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.location.href = '/api/auth/google'}
              >
                <GoogleIcon className="h-4 w-4 mr-2" />
                Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.location.href = '/api/auth/github'}
              >
                <GitHubIcon className="h-4 w-4 mr-2" />
                GitHub
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.location.href = '/api/auth/microsoft'}
              >
                <MicrosoftIcon className="h-4 w-4 mr-2" />
                Microsoft
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 3. Route Protection (`client/src/components/ProtectedRoute.tsx`)

```typescript
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallback = <div>Access denied</div> 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return fallback;
  }

  return <>{children}</>;
}
```

---

## Database Schema

### 1. Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255), -- NULL for OAuth users
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  is_email_verified BOOLEAN DEFAULT false,
  profile_image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. OAuth Providers Table

```sql
CREATE TABLE oauth_providers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'google', 'github', 'microsoft'
  provider_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, provider_id)
);
```

### 3. Sessions Table (created automatically by connect-pg-simple)

```sql
CREATE TABLE sessions (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL,
  PRIMARY KEY (sid)
);
```

---

## OAuth Configuration

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://yourdomain.com/api/auth/google/callback`
   - `http://localhost:3000/api/auth/google/callback` (for development)

### 2. GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL:
   - `https://yourdomain.com/api/auth/github/callback`

### 3. Microsoft OAuth Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Register a new application in Azure AD
3. Add redirect URI:
   - `https://yourdomain.com/api/auth/microsoft/callback`

---

## Security Features

### 1. Rate Limiting (`server/middleware/rate-limit.ts`)

```typescript
import rateLimit from 'express-rate-limit';

export const createRateLimit = (options: {
  windowMs: number;
  max: number;
  message: string;
}) => rateLimit({
  windowMs: options.windowMs,
  max: options.max,
  message: { error: options.message },
  standardHeaders: true,
  legacyHeaders: false
});

// Pre-configured rate limiters
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts'
});

export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests'
});
```

### 2. Input Validation (`server/middleware/validation.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validateInput(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid input data' });
    }
  };
}
```

### 3. Security Headers (`server/middleware/security.ts`)

```typescript
import helmet from 'helmet';
import { Express } from 'express';

export function setupSecurity(app: Express) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));
}
```

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Session
SESSION_SECRET=your-super-secret-session-key

# Domain Configuration
CUSTOM_DOMAIN=yourdomain.com
USE_CUSTOM_DOMAIN=true

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# Development
NODE_ENV=production
```

---

## Testing

### 1. Backend API Testing

```javascript
// Test authentication endpoints
const tests = [
  {
    name: 'Register new user',
    method: 'POST',
    url: '/api/auth/register',
    data: {
      email: 'test@example.com',
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
      agreeToTerms: true
    }
  },
  {
    name: 'Login with credentials',
    method: 'POST',
    url: '/api/auth/login',
    data: {
      email: 'test@example.com',
      password: 'SecurePassword123!'
    }
  },
  {
    name: 'Check session',
    method: 'GET',
    url: '/api/auth/session'
  }
];
```

### 2. Frontend Testing

```typescript
// Test authentication hooks
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../contexts/AuthContext';

test('should login user successfully', async () => {
  const { result } = renderHook(() => useAuth());
  
  await act(async () => {
    await result.current.login('test@example.com', 'password');
  });
  
  expect(result.current.isAuthenticated).toBe(true);
});
```

---

## Implementation Checklist

### Backend Setup
- [ ] Install dependencies
- [ ] Configure OAuth strategies
- [ ] Set up authentication routes
- [ ] Configure session management
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Set up security headers
- [ ] Configure database schema

### Frontend Setup
- [ ] Create authentication context
- [ ] Build login/signup pages
- [ ] Implement route protection
- [ ] Add social login buttons
- [ ] Handle authentication state
- [ ] Implement auto-refresh logic

### OAuth Configuration
- [ ] Set up Google OAuth
- [ ] Configure GitHub OAuth
- [ ] Set up Microsoft OAuth
- [ ] Test callback URLs
- [ ] Verify scopes and permissions

### Security
- [ ] Configure rate limiting
- [ ] Set up input validation
- [ ] Add security headers
- [ ] Test authentication flows
- [ ] Verify session security

### Testing
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test OAuth providers
- [ ] Test session management
- [ ] Test route protection
- [ ] Test logout functionality

---

## Deployment Notes

1. **Environment Variables**: Ensure all required environment variables are set in production
2. **HTTPS**: OAuth providers require HTTPS in production
3. **Database**: Set up PostgreSQL with proper connection pooling
4. **Session Store**: Use PostgreSQL session store in production (not memory store)
5. **Rate Limiting**: Configure appropriate rate limits for your use case
6. **Monitoring**: Set up logging for authentication events and failures

---

This comprehensive guide provides everything needed to implement the Auth247 authentication system in another application. The modular design allows for easy customization and extension based on specific requirements.