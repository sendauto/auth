import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { auth247Bridge, base44AuthMiddleware } from './base44-integration';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for authentication endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { error: 'Too many authentication attempts' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: { error: 'Rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
const RegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  organizationId: z.string().optional()
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

const UpdateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().optional(),
  avatar: z.string().url().optional(),
  metadata: z.record(z.any()).optional()
});

const CreateOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  description: z.string().optional(),
  website: z.string().url().optional(),
  settings: z.record(z.any()).optional()
});

// Helper function for handling validation errors
const handleValidationError = (error: z.ZodError, res: Response) => {
  const errors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }));
  
  res.status(400).json({
    error: 'Validation failed',
    details: errors
  });
};

// Authentication Routes

/**
 * POST /api/base44/auth/register
 * Register a new user in Auth247 + Base44
 */
router.post('/auth/register', authRateLimit, async (req: Request, res: Response) => {
  try {
    const validation = RegisterSchema.safeParse(req.body);
    
    if (!validation.success) {
      return handleValidationError(validation.error, res);
    }

    const { email, password, firstName, lastName, organizationId } = validation.data;

    console.log('[Base44 Auth] Registration attempt:', email);

    const result = await auth247Bridge.registerUser({
      email,
      password,
      firstName,
      lastName,
      organizationId
    });

    if (!result.success) {
      console.log('[Base44 Auth] Registration failed:', result.error);
      return res.status(400).json({
        error: result.error || 'Registration failed'
      });
    }

    console.log('[Base44 Auth] Registration successful:', email);

    res.status(201).json({
      success: true,
      user: {
        id: result.user?.id,
        email: result.user?.email,
        firstName: result.user?.firstName,
        lastName: result.user?.lastName,
        role: result.user?.role,
        organizationId: result.user?.organizationId,
        emailVerified: result.user?.emailVerified
      },
      token: result.token,
      refreshToken: result.refreshToken
    });
  } catch (error) {
    console.error('[Base44 Auth] Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/base44/auth/login
 * Login user with Auth247 + Base44
 */
router.post('/auth/login', authRateLimit, async (req: Request, res: Response) => {
  try {
    const validation = LoginSchema.safeParse(req.body);
    
    if (!validation.success) {
      return handleValidationError(validation.error, res);
    }

    const { email, password } = validation.data;

    console.log('[Base44 Auth] Login attempt:', email);

    const result = await auth247Bridge.loginUser(email, password);

    if (!result.success) {
      console.log('[Base44 Auth] Login failed:', result.error);
      return res.status(401).json({
        error: result.error || 'Authentication failed'
      });
    }

    console.log('[Base44 Auth] Login successful:', email);

    res.json({
      success: true,
      user: {
        id: result.user?.id,
        email: result.user?.email,
        firstName: result.user?.firstName,
        lastName: result.user?.lastName,
        role: result.user?.role,
        organizationId: result.user?.organizationId,
        emailVerified: result.user?.emailVerified
      },
      token: result.token,
      refreshToken: result.refreshToken
    });
  } catch (error) {
    console.error('[Base44 Auth] Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/base44/auth/refresh
 * Refresh authentication token
 */
router.post('/auth/refresh', generalRateLimit, async (req: Request, res: Response) => {
  try {
    const validation = RefreshTokenSchema.safeParse(req.body);
    
    if (!validation.success) {
      return handleValidationError(validation.error, res);
    }

    const { refreshToken } = validation.data;

    console.log('[Base44 Auth] Token refresh attempt');

    const result = await auth247Bridge.refreshSession(refreshToken);

    if (!result.success) {
      console.log('[Base44 Auth] Token refresh failed:', result.error);
      return res.status(401).json({
        error: result.error || 'Token refresh failed'
      });
    }

    console.log('[Base44 Auth] Token refresh successful');

    res.json({
      success: true,
      user: {
        id: result.user?.id,
        email: result.user?.email,
        firstName: result.user?.firstName,
        lastName: result.user?.lastName,
        role: result.user?.role,
        organizationId: result.user?.organizationId,
        emailVerified: result.user?.emailVerified
      },
      token: result.token,
      refreshToken: result.refreshToken
    });
  } catch (error) {
    console.error('[Base44 Auth] Token refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/base44/auth/me
 * Get current user profile
 */
router.get('/auth/me', generalRateLimit, base44AuthMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
        organizationId: user.organizationId,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        metadata: user.metadata,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('[Base44 Auth] Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/base44/auth/me
 * Update current user profile
 */
router.patch('/auth/me', generalRateLimit, base44AuthMiddleware, async (req: Request, res: Response) => {
  try {
    const validation = UpdateUserSchema.safeParse(req.body);
    
    if (!validation.success) {
      return handleValidationError(validation.error, res);
    }

    const user = (req as any).user;
    const updates = validation.data;

    console.log('[Base44 Auth] Profile update attempt:', user.id);

    const result = await auth247Bridge.updateUser(user.id, updates);

    if (!result.success) {
      console.log('[Base44 Auth] Profile update failed:', result.error);
      return res.status(400).json({
        error: result.error || 'Profile update failed'
      });
    }

    console.log('[Base44 Auth] Profile update successful:', user.id);

    res.json({
      success: true,
      user: {
        id: result.user?.id,
        email: result.user?.email,
        firstName: result.user?.firstName,
        lastName: result.user?.lastName,
        username: result.user?.username,
        avatar: result.user?.avatar,
        role: result.user?.role,
        organizationId: result.user?.organizationId,
        emailVerified: result.user?.emailVerified,
        metadata: result.user?.metadata
      }
    });
  } catch (error) {
    console.error('[Base44 Auth] Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Organization Routes

/**
 * GET /api/base44/organizations
 * Get user's organizations
 */
router.get('/organizations', generalRateLimit, base44AuthMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    console.log('[Base44 Orgs] Fetching organizations for user:', user.id);

    const result = await auth247Bridge.getUserOrganizations(user.id);

    if (!result.success) {
      console.log('[Base44 Orgs] Fetch failed:', result.error);
      return res.status(400).json({
        error: result.error || 'Failed to fetch organizations'
      });
    }

    res.json({
      success: true,
      organizations: result.organizations
    });
  } catch (error) {
    console.error('[Base44 Orgs] Fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/base44/organizations
 * Create new organization
 */
router.post('/organizations', generalRateLimit, base44AuthMiddleware, async (req: Request, res: Response) => {
  try {
    const validation = CreateOrganizationSchema.safeParse(req.body);
    
    if (!validation.success) {
      return handleValidationError(validation.error, res);
    }

    const user = (req as any).user;
    const orgData = {
      ...validation.data,
      ownerId: user.id,
      createdBy: user.id
    };

    console.log('[Base44 Orgs] Creating organization:', orgData.name);

    const result = await auth247Bridge.createOrganization(orgData);

    if (!result.success) {
      console.log('[Base44 Orgs] Creation failed:', result.error);
      return res.status(400).json({
        error: result.error || 'Failed to create organization'
      });
    }

    console.log('[Base44 Orgs] Organization created:', result.organization.id);

    res.status(201).json({
      success: true,
      organization: result.organization
    });
  } catch (error) {
    console.error('[Base44 Orgs] Creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'Auth247 Base44 Integration',
    status: 'operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;