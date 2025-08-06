import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { storage } from './storage';
import { getProjectConfig, type ProjectConfig } from './project-config';
import { EmailService } from './services/email';
import type { Express } from 'express';

// Multi-Project OAuth Configuration
// Supports different OAuth credentials for different projects/domains
interface OAuthProject {
  name: string;
  domain: string;
  google?: {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
  };
  github?: {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
  };
  microsoft?: {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope: string[];
  };
}

// Project-specific OAuth configurations
const OAUTH_PROJECTS: OAuthProject[] = [
  {
    name: 'Auth247-Main',
    domain: 'auth247.net',
    google: {
      clientID: process.env.GOOGLE_CLIENT_ID_AUTH247 || process.env.GOOGLE_CLIENT_ID || 'demo_google_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET_AUTH247 || process.env.GOOGLE_CLIENT_SECRET || 'demo_google_secret',
      callbackURL: 'https://auth247.net/api/auth/google/callback'
    },
    github: {
      clientID: process.env.GITHUB_CLIENT_ID_AUTH247 || process.env.GITHUB_CLIENT_ID || 'demo_github_client_id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET_AUTH247 || process.env.GITHUB_CLIENT_SECRET || 'demo_github_secret',
      callbackURL: 'https://auth247.net/api/auth/github/callback'
    },
    microsoft: {
      clientID: process.env.MICROSOFT_CLIENT_ID_AUTH247 || process.env.MICROSOFT_CLIENT_ID || 'demo_microsoft_client_id',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET_AUTH247 || process.env.MICROSOFT_CLIENT_SECRET || 'demo_microsoft_secret',
      callbackURL: 'https://auth247.net/api/auth/microsoft/callback',
      scope: ['user.read']
    }
  },
  // Add more projects here as needed
  // {
  //   name: 'MyCompany-SSO',
  //   domain: 'mycompany.com',
  //   google: {
  //     clientID: process.env.GOOGLE_CLIENT_ID_MYCOMPANY,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET_MYCOMPANY,
  //     callbackURL: '/api/auth/google/callback'
  //   }
  // }
];

// Get OAuth config for current domain/project
function getOAuthConfigForDomain(domain?: string): OAuthProject {
  const currentDomain = domain || process.env.REPLIT_DOMAINS?.split(',')[0] || 'auth247.net';
  
  // Find matching project by domain
  const project = OAUTH_PROJECTS.find(p => 
    currentDomain.includes(p.domain) || p.domain.includes(currentDomain)
  );
  
  // Return matched project or default to first project
  return project || OAUTH_PROJECTS[0];
}

// Get OAuth config using project-specific system with custom domain support
const OAUTH_CONFIG = (() => {
  const projectConfig = getProjectConfig();
  
  // Check for custom domain preference
  const customDomain = process.env.CUSTOM_DOMAIN || 'auth247.net';
  const currentDomain = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
  const isLocal = currentDomain.includes('localhost');
  
  // Default to custom domain for Auth247, unless explicitly disabled
  const shouldUseCustomDomain = process.env.USE_CUSTOM_DOMAIN !== 'false' && !isLocal;
  const useDomain = shouldUseCustomDomain ? customDomain : currentDomain;
  const protocol = isLocal ? 'http' : 'https';
  const baseUrl = `${protocol}://${useDomain}`;
  
  console.log(`[OAuth] Using domain: ${useDomain}`);
  console.log(`[OAuth] Full base URL: ${baseUrl}`);
  
  const config = {
    google: {
      clientID: projectConfig.google?.clientID || 'demo_google_client_id',
      clientSecret: projectConfig.google?.clientSecret || 'demo_google_secret',
      callbackURL: `${baseUrl}/api/auth/google/callback`
    },
    github: {
      clientID: projectConfig.github?.clientID || 'demo_github_client_id',
      clientSecret: projectConfig.github?.clientSecret || 'demo_github_secret',
      callbackURL: `${baseUrl}/api/auth/github/callback`
    },
    microsoft: {
      clientID: projectConfig.microsoft?.clientID || 'demo_microsoft_client_id',
      clientSecret: projectConfig.microsoft?.clientSecret || 'demo_microsoft_secret',
      callbackURL: `${baseUrl}/api/auth/microsoft/callback`,
      scope: ['user.read']
    }
  };
  
  // Debug current provider status
  const providerStatus = {
    google: config.google.clientID !== 'demo_google_client_id' ? 'Configured' : 'Demo mode',
    github: config.github.clientID !== 'demo_github_client_id' ? 'Configured' : 'Demo mode', 
    microsoft: config.microsoft.clientID !== 'demo_microsoft_client_id' ? 'Configured' : 'Demo mode'
  };
  console.log(`[OAuth] Providers:`, providerStatus);
  
  return config;
})();

// Helper function to detect real client IP address
function getRealClientIP(req: any): string {
  // Enhanced IP detection for custom domain and proxy setups
  return req.get('CF-Connecting-IP') || // Cloudflare real IP
         req.get('X-Forwarded-For')?.split(',')[0]?.trim() || // Proxy forwarded
         req.get('X-Real-IP') || // Nginx proxy
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.ip || 
         'unknown';
}

// Helper function to create user from OAuth profile
async function createUserFromOAuthProfile(profile: any, provider: string) {
  const email = profile.emails?.[0]?.value || `${profile.id}@${provider}.oauth`;
  const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User';
  const lastName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '';
  
  // Check if user already exists
  let user = await storage.getUserByEmail(email);
  
  if (!user) {
    // Create new user
    user = await storage.createUser({
      firstName,
      lastName,
      email,
      keycloakId: `${provider}_${profile.id}`,
      tenant: 'oauth',
      roles: ['user']
    });
    console.log(`[OAuth] Created new user from ${provider}: ${email}`);
  } else {
    console.log(`[OAuth] Existing user logged in via ${provider}: ${email}`);
  }
  
  return user;
}

// Get OAuth configuration for specific domain/project
export function getOAuthConfigForProject(domain?: string): OAuthProject {
  return getOAuthConfigForDomain(domain);
}

// Add new OAuth project configuration
export function addOAuthProject(project: OAuthProject): void {
  const existingIndex = OAUTH_PROJECTS.findIndex(p => p.domain === project.domain);
  if (existingIndex >= 0) {
    OAUTH_PROJECTS[existingIndex] = project;
  } else {
    OAUTH_PROJECTS.push(project);
  }
}

export function setupOAuth(app: Express) {
  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Serialize/deserialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: OAUTH_CONFIG.google.clientID,
    clientSecret: OAUTH_CONFIG.google.clientSecret,
    callbackURL: OAUTH_CONFIG.google.callbackURL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await createUserFromOAuthProfile(profile, 'google');
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // GitHub OAuth Strategy
  passport.use(new GitHubStrategy({
    clientID: OAUTH_CONFIG.github.clientID,
    clientSecret: OAUTH_CONFIG.github.clientSecret,
    callbackURL: OAUTH_CONFIG.github.callbackURL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await createUserFromOAuthProfile(profile, 'github');
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // Microsoft OAuth Strategy
  passport.use(new MicrosoftStrategy({
    clientID: OAUTH_CONFIG.microsoft.clientID,
    clientSecret: OAUTH_CONFIG.microsoft.clientSecret,
    callbackURL: OAUTH_CONFIG.microsoft.callbackURL,
    scope: OAUTH_CONFIG.microsoft.scope
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await createUserFromOAuthProfile(profile, 'microsoft');
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // OAuth Routes
  
  // Google OAuth Routes
  app.get('/api/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed' }),
    async (req, res) => {
      try {
        // Successful authentication - create session
        const user = req.user as any;
        if (!user) {
          return res.redirect('/login?error=oauth_failed');
        }

        console.log(`[OAuth] Google login successful for: ${user.email}`);
        
        // Create session - CRITICAL: Use consistent session format
        const ipAddress = getRealClientIP(req);
        const userAgent = req.get('User-Agent') || 'unknown';
        
        console.log(`[OAuth] Google login IP detection: ${ipAddress} (headers: CF-Connecting-IP=${req.get('CF-Connecting-IP')}, X-Forwarded-For=${req.get('X-Forwarded-For')}, X-Real-IP=${req.get('X-Real-IP')})`);
        
        const sessionId = `oauth_google_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        
        const session = await storage.createSession({
          id: sessionId,
          userId: user.id,
          keycloakToken: null, // OAuth doesn't use Keycloak tokens
          refreshToken: null,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          ipAddress,
          userAgent,
          isActive: true
        });

        // Set session data for our middleware - CRITICAL: Match session middleware format
        req.session.userId = user.id;
        req.session.sessionId = sessionId;
        
        console.log(`[OAuth] Session created: ${session.id} for user: ${user.id}`);
        
        // CRITICAL FIX: Ensure session is saved before redirect
        await new Promise<void>((resolve, reject) => {
          req.session.save((saveErr) => {
            if (saveErr) {
              console.error('[OAuth] Session save error:', saveErr);
              reject(saveErr);
            } else {
              console.log(`[OAuth] Session saved successfully for user: ${user.id}`);
              resolve();
            }
          });
        });

        // Send login notification email
        try {
          await EmailService.sendLoginNotificationEmail({
            email: user.email,
            firstName: user.firstName || 'User',
            loginMethod: 'Google OAuth',
            ipAddress,
            deviceInfo: userAgent
          });
          console.log(`[OAuth] Login notification email sent to: ${user.email}`);
        } catch (emailError) {
          console.error('[OAuth] Failed to send login notification email:', emailError);
        }

        res.redirect('/dashboard');
      } catch (error) {
        console.error('[OAuth] Google callback error:', error);
        res.redirect('/login?error=session_failed');
      }
    }
  );

  // GitHub OAuth Routes
  app.get('/api/auth/github',
    passport.authenticate('github', { scope: ['user:email'] })
  );

  app.get('/api/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login?error=oauth_failed' }),
    async (req, res) => {
      try {
        // Successful authentication - create session
        const user = req.user as any;
        if (!user) {
          return res.redirect('/login?error=oauth_failed');
        }

        console.log(`[OAuth] GitHub login successful for: ${user.email}`);
        
        // Create session - CRITICAL: Use consistent session format
        const ipAddress = getRealClientIP(req);
        const userAgent = req.get('User-Agent') || 'unknown';
        
        console.log(`[OAuth] GitHub login IP detection: ${ipAddress} (headers: CF-Connecting-IP=${req.get('CF-Connecting-IP')}, X-Forwarded-For=${req.get('X-Forwarded-For')}, X-Real-IP=${req.get('X-Real-IP')})`);
        
        const sessionId = `oauth_github_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        
        const session = await storage.createSession({
          id: sessionId,
          userId: user.id,
          keycloakToken: null, // OAuth doesn't use Keycloak tokens
          refreshToken: null,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          ipAddress,
          userAgent,
          isActive: true
        });

        // Set session data for our middleware - CRITICAL: Match session middleware format
        req.session.userId = user.id;
        req.session.sessionId = sessionId;
        
        console.log(`[OAuth] Session created: ${session.id} for user: ${user.id}`);
        
        // CRITICAL FIX: Ensure session is saved before redirect
        await new Promise<void>((resolve, reject) => {
          req.session.save((saveErr) => {
            if (saveErr) {
              console.error('[OAuth] Session save error:', saveErr);
              reject(saveErr);
            } else {
              console.log(`[OAuth] Session saved successfully for user: ${user.id}`);
              resolve();
            }
          });
        });

        // Send login notification email
        try {
          await EmailService.sendLoginNotificationEmail({
            email: user.email,
            firstName: user.firstName || 'User',
            loginMethod: 'GitHub OAuth',
            ipAddress,
            deviceInfo: userAgent
          });
          console.log(`[OAuth] Login notification email sent to: ${user.email}`);
        } catch (emailError) {
          console.error('[OAuth] Failed to send login notification email:', emailError);
        }

        res.redirect('/dashboard');
      } catch (error) {
        console.error('[OAuth] GitHub callback error:', error);
        res.redirect('/login?error=session_failed');
      }
    }
  );

  // Microsoft OAuth Routes
  app.get('/api/auth/microsoft',
    passport.authenticate('microsoft')
  );

  app.get('/api/auth/microsoft/callback',
    passport.authenticate('microsoft', { failureRedirect: '/login?error=oauth_failed' }),
    async (req, res) => {
      try {
        // Successful authentication - create session
        const user = req.user as any;
        if (!user) {
          return res.redirect('/login?error=oauth_failed');
        }

        console.log(`[OAuth] Microsoft login successful for: ${user.email}`);
        
        // Create session - CRITICAL: Use consistent session format
        const ipAddress = getRealClientIP(req);
        const userAgent = req.get('User-Agent') || 'unknown';
        
        console.log(`[OAuth] Microsoft login IP detection: ${ipAddress} (headers: CF-Connecting-IP=${req.get('CF-Connecting-IP')}, X-Forwarded-For=${req.get('X-Forwarded-For')}, X-Real-IP=${req.get('X-Real-IP')})`)
        
        const sessionId = `oauth_microsoft_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        
        const session = await storage.createSession({
          id: sessionId,
          userId: user.id,
          keycloakToken: null, // OAuth doesn't use Keycloak tokens
          refreshToken: null,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          ipAddress,
          userAgent,
          isActive: true
        });

        // Set session data for our middleware - CRITICAL: Match session middleware format
        req.session.userId = user.id;
        req.session.sessionId = sessionId;
        
        console.log(`[OAuth] Session created: ${session.id} for user: ${user.id}`);
        
        // CRITICAL FIX: Ensure session is saved before redirect
        await new Promise<void>((resolve, reject) => {
          req.session.save((saveErr) => {
            if (saveErr) {
              console.error('[OAuth] Session save error:', saveErr);
              reject(saveErr);
            } else {
              console.log(`[OAuth] Session saved successfully for user: ${user.id}`);
              resolve();
            }
          });
        });

        // Send login notification email
        try {
          await EmailService.sendLoginNotificationEmail({
            email: user.email,
            firstName: user.firstName || 'User',
            loginMethod: 'Microsoft OAuth',
            ipAddress,
            deviceInfo: userAgent
          });
          console.log(`[OAuth] Login notification email sent to: ${user.email}`);
        } catch (emailError) {
          console.error('[OAuth] Failed to send login notification email:', emailError);
        }

        res.redirect('/dashboard');
      } catch (error) {
        console.error('[OAuth] Microsoft callback error:', error);
        res.redirect('/login?error=session_failed');
      }
    }
  );

  // OAuth Status endpoint
  app.get('/api/auth/oauth/status', (req, res) => {
    res.json({
      providers: {
        google: {
          enabled: !!process.env.GOOGLE_CLIENT_ID,
          configured: OAUTH_CONFIG.google.clientID !== 'demo_google_client_id'
        },
        github: {
          enabled: !!process.env.GITHUB_CLIENT_ID,
          configured: OAUTH_CONFIG.github.clientID !== 'demo_github_client_id'
        },
        microsoft: {
          enabled: !!process.env.MICROSOFT_CLIENT_ID,
          configured: OAUTH_CONFIG.microsoft.clientID !== 'demo_microsoft_client_id'
        }
      }
    });
  });

  console.log('[OAuth] Social authentication configured');
  console.log('[OAuth] Providers:', {
    google: OAUTH_CONFIG.google.clientID !== 'demo_google_client_id' ? 'Configured' : 'Demo mode',
    github: OAUTH_CONFIG.github.clientID !== 'demo_github_client_id' ? 'Configured' : 'Demo mode',
    microsoft: OAUTH_CONFIG.microsoft.clientID !== 'demo_microsoft_client_id' ? 'Configured' : 'Demo mode'
  });
}

export const oauthConfig = OAUTH_CONFIG;