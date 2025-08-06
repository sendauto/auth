/**
 * Auth247 V2 Authentication Routes
 * Modern, clean authentication API with enhanced security
 */

import express from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { storage } from "./storage";
import { EmailService } from "./services/email";

const router = express.Router();

// Validation schemas
const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

const SignUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  organization: z.string().optional(),
  jobTitle: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms and conditions"),
});

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Helper function to validate password strength
function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Helper function to generate session
function generateSession(user: any, rememberMe: boolean = false) {
  const sessionDuration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days or 24 hours
  const expiresAt = new Date(Date.now() + sessionDuration);
  
  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles || ["user"],
      profileImageUrl: user.profileImageUrl,
      isEmailVerified: user.isEmailVerified,
    },
    expiresAt: expiresAt.toISOString(),
    rememberMe,
  };
}

// Sign In Endpoint
router.post("/signin", async (req, res) => {
  try {
    const { email, password, rememberMe } = SignInSchema.parse(req.body);
    
    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }
    
    // Check if account is locked
    if (user.accountLocked && user.accountLockedUntil && new Date() < user.accountLockedUntil) {
      return res.status(423).json({
        success: false,
        error: "Account is temporarily locked due to multiple failed login attempts",
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password || "");
    if (!isPasswordValid) {
      // Track failed login attempts
      await storage.recordFailedLogin(user.id);
      
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }
    
    // Clear failed login attempts on successful login
    await storage.clearFailedLoginAttempts(user.id);
    
    // Update last login
    await storage.updateLastLogin(user.id, req.ip || "unknown");
    
    // Generate session
    const sessionData = generateSession(user, rememberMe);
    
    // Store session
    req.session.user = sessionData.user;
    req.session.expiresAt = sessionData.expiresAt;
    req.session.rememberMe = sessionData.rememberMe;
    
    // Log successful login
    console.log(`[Auth V2] Successful login: ${email} from ${req.ip}`);
    
    res.json({
      success: true,
      user: sessionData.user,
      message: "Successfully signed in",
    });
    
  } catch (error) {
    console.error("[Auth V2] Sign in error:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid input data",
        details: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Sign Up Endpoint
router.post("/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName, organization, jobTitle, agreeToTerms } = SignUpSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      // Check if account is already activated
      if (existingUser.emailVerified) {
        return res.status(409).json({
          success: false,
          error: "An account with this email already exists and is activated",
          accountStatus: "activated",
          action: "redirect_to_login"
        });
      } else {
        // Account exists but not activated - offer to resend activation
        return res.status(409).json({
          success: false,
          error: "An account with this email exists but is not yet activated",
          accountStatus: "unactivated",
          action: "resend_activation",
          firstName: existingUser.firstName || existingUser.first_name
        });
      }
    }
    
    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: "Password does not meet security requirements",
        details: passwordValidation.errors,
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const newUser = await storage.createUser({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      organization: organization || '',
      jobTitle: jobTitle || '',
      roles: ["user"],
      emailVerified: false,
      createdAt: new Date(),
    });
    
    // Generate activation token
    const activationToken = EmailService.generateVerificationToken(email.toLowerCase(), 'email_verification');
    
    // Send activation email with Brevo API
    try {
      console.log(`[Auth V2] Attempting to send activation email to ${email}`);
      const emailResult = await EmailService.sendVerificationEmail({
        email: email.toLowerCase(),
        firstName: firstName
      });
      console.log(`[Auth V2] Email service result:`, emailResult);
      console.log(`[Auth V2] Activation email sent to ${email}`);
    } catch (emailError) {
      console.error(`[Auth V2] Failed to send activation email to ${email}:`, emailError);
      // Continue with registration even if email fails
    }
    
    // Log successful registration
    console.log(`[Auth V2] New user registered: ${email} from ${req.ip}`);
    
    res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email to activate your account.",
      email: email.toLowerCase(),
      requiresVerification: true
    });
    
  } catch (error) {
    console.error("[Auth V2] Sign up error:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid input data",
        details: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Sign Out Endpoint
router.post("/signout", (req, res) => {
  try {
    const userEmail = req.session.user?.email || "unknown";
    
    req.session.destroy((err) => {
      if (err) {
        console.error("[Auth V2] Sign out error:", err);
        return res.status(500).json({
          success: false,
          error: "Failed to sign out",
        });
      }
      
      console.log(`[Auth V2] User signed out: ${userEmail}`);
      
      res.json({
        success: true,
        message: "Successfully signed out",
      });
    });
    
  } catch (error) {
    console.error("[Auth V2] Sign out error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Get Current User Endpoint
router.get("/me", (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }
    
    // Check if session is expired
    if (req.session.expiresAt && new Date() > new Date(req.session.expiresAt)) {
      return res.status(401).json({
        success: false,
        error: "Session expired",
      });
    }
    
    res.json({
      success: true,
      user: req.session.user,
    });
    
  } catch (error) {
    console.error("[Auth V2] Get user error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Get Current Session Endpoint (compatible with Auth247Provider)
router.get("/session", (req, res) => {
  try {
    console.log("[Auth V2] Session check - Session ID:", req.sessionID);
    console.log("[Auth V2] Session check - Session data:", JSON.stringify(req.session, null, 2));
    
    if (!req.session.user) {
      console.log("[Auth V2] No user in session, returning 401");
      return res.status(401).json({
        error: "Authentication required",
      });
    }
    
    // Check if session is expired
    if (req.session.expiresAt && new Date() > new Date(req.session.expiresAt)) {
      console.log("[Auth V2] Session expired, returning 401");
      return res.status(401).json({
        error: "Session expired",
      });
    }
    
    console.log("[Auth V2] Session valid, returning user data");
    
    // Return session data in the format expected by Auth247Provider
    res.json({
      user: req.session.user,
      session: {
        id: req.sessionID, // Add session ID for compatibility
        expiresAt: req.session.expiresAt,
        rememberMe: req.session.rememberMe,
      },
    });
    
  } catch (error) {
    console.error("[Auth V2] Get session error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Forgot Password Endpoint
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = ForgotPasswordSchema.parse(req.body);
    
    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({
        success: true,
        message: "If an account with this email exists, you will receive a password reset link",
      });
    }
    
    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Store reset token
    await storage.storePasswordResetToken(user.id, resetToken, resetTokenExpires);
    
    // TODO: Send email with reset link
    // For now, log the reset token for testing
    console.log(`[Auth V2] Password reset token for ${email}: ${resetToken}`);
    
    res.json({
      success: true,
      message: "If an account with this email exists, you will receive a password reset link",
    });
    
  } catch (error) {
    console.error("[Auth V2] Forgot password error:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid input data",
        details: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Reset Password Endpoint
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = ResetPasswordSchema.parse(req.body);
    
    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: "Password does not meet security requirements",
        details: passwordValidation.errors,
      });
    }
    
    // Verify reset token
    const user = await storage.getUserByResetToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired reset token",
      });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Update password and clear reset token
    await storage.updatePassword(user.id, hashedPassword);
    await storage.clearPasswordResetToken(user.id);
    
    console.log(`[Auth V2] Password reset successful for user: ${user.email}`);
    
    res.json({
      success: true,
      message: "Password reset successfully",
    });
    
  } catch (error) {
    console.error("[Auth V2] Reset password error:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid input data",
        details: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// OAuth Routes
router.get("/oauth/:provider", (req, res) => {
  const { provider } = req.params;
  
  const supportedProviders = ["google", "github", "microsoft"];
  if (!supportedProviders.includes(provider)) {
    return res.status(400).json({
      success: false,
      error: "Unsupported OAuth provider",
    });
  }
  
  // Redirect to the appropriate OAuth provider
  const redirectUrl = `/api/auth/${provider}`;
  res.redirect(redirectUrl);
});

// Resend activation endpoint
router.post('/resend-activation', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required"
      });
    }
    
    // Check if user exists
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "No account found with this email"
      });
    }
    
    // Check if already activated
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        error: "Account is already activated",
        action: "redirect_to_login"
      });
    }
    
    // Generate fresh activation token and send email
    try {
      const { EmailService } = await import('./services/email');
      const activationToken = EmailService.generateVerificationToken(email, 'email_verification');
      
      await EmailService.sendVerificationEmail({
        email: email,
        firstName: user.firstName
      });
      
      console.log(`[Auth V2] Fresh activation email sent for: ${email}`);
      
      res.json({
        success: true,
        message: "A fresh activation email has been sent. Please check your inbox.",
        email: email
      });
      
    } catch (emailError) {
      console.error(`[Auth V2] Failed to send activation email to ${email}:`, emailError);
      res.status(500).json({
        success: false,
        error: "Failed to send activation email. Please try again."
      });
    }
    
  } catch (error) {
    console.error("[Auth V2] Resend activation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to resend activation email"
    });
  }
});

export { router as authV2Router };