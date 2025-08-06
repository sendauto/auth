import { randomBytes, createHash } from 'crypto';
// @ts-ignore - Brevo API types are implicitly any
import SibApiV3Sdk from 'sib-api-v3-sdk';

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface VerificationToken {
  token: string;
  email: string;
  type: 'email_verification' | 'password_reset' | 'mfa_setup';
  expiresAt: Date;
  attempts: number;
}

export class EmailService {
  private static readonly MAX_VERIFICATION_ATTEMPTS = 3;
  private static readonly VERIFICATION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly PASSWORD_RESET_EXPIRY = 60 * 60 * 1000; // 1 hour
  private static readonly BREVO_API_KEY = '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';
  
  // In-memory store for demonstration (use Redis in production)
  private static verificationTokens = new Map<string, VerificationToken>();
  
  // Initialize Brevo client
  private static brevoClient = (() => {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = EmailService.BREVO_API_KEY;
    return new SibApiV3Sdk.TransactionalEmailsApi();
  })();

  static generateVerificationToken(
    email: string, 
    type: 'email_verification' | 'password_reset' | 'mfa_setup'
  ): string {
    const token = randomBytes(32).toString('hex');
    const expiryTime = type === 'password_reset' ? this.PASSWORD_RESET_EXPIRY : this.VERIFICATION_EXPIRY;
    
    this.verificationTokens.set(token, {
      token,
      email,
      type,
      expiresAt: new Date(Date.now() + expiryTime),
      attempts: 0
    });

    return token;
  }

  static verifyToken(token: string, incrementAttempts: boolean = false): { valid: boolean; data?: VerificationToken; error?: string } {
    const tokenData = this.verificationTokens.get(token);
    
    if (!tokenData) {
      return { valid: false, error: 'Invalid verification token' };
    }

    if (new Date() > tokenData.expiresAt) {
      this.verificationTokens.delete(token);
      return { valid: false, error: 'Verification token has expired' };
    }

    if (tokenData.attempts >= this.MAX_VERIFICATION_ATTEMPTS) {
      this.verificationTokens.delete(token);
      return { valid: false, error: 'Too many verification attempts' };
    }

    // Only increment attempts when explicitly requested (for consumption, not validation)
    if (incrementAttempts) {
      tokenData.attempts++;
    }
    
    return { valid: true, data: tokenData };
  }

  static consumeToken(token: string): boolean {
    const result = this.verifyToken(token, true); // Increment attempts when consuming
    if (result.valid) {
      this.verificationTokens.delete(token);
      return true;
    }
    return false;
  }

  static getWelcomeEmailTemplate(firstName: string): EmailTemplate {
    return {
      subject: 'Welcome to Auth247 - Secure 24/7 Authentication',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Auth247</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0;">Secure 24/7 Authentication Platform</p>
          </div>
          
          <div style="padding: 40px 20px; background: white;">
            <h2 style="color: #374151; margin-bottom: 20px;">Hello ${firstName}!</h2>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
              Thank you for joining Auth247, the enterprise-grade authentication platform trusted by thousands of businesses worldwide.
            </p>
            
            <div style="background: #f8fafc; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">What's Next?</h3>
              <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
                <li>Complete your email verification</li>
                <li>Set up multi-factor authentication (recommended)</li>
                <li>Explore our comprehensive dashboard</li>
                <li>Configure your first application</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://auth247.net'}/dashboard" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Access Your Dashboard
              </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                Questions? Contact our support team at 
                <a href="mailto:support@auth247.net" style="color: #667eea;">support@auth247.net</a>
              </p>
            </div>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>© 2025 Auth247. All rights reserved.</p>
          </div>
        </div>
      `,
      textContent: `
Welcome to Auth247, ${firstName}!

Thank you for joining Auth247, the enterprise-grade authentication platform trusted by thousands of businesses worldwide.

What's Next?
- Complete your email verification
- Set up multi-factor authentication (recommended)
- Explore our comprehensive dashboard
- Configure your first application

Access your dashboard: ${process.env.FRONTEND_URL || 'https://auth247.net'}/dashboard

Questions? Contact our support team at support@auth247.net

© 2025 Auth247. All rights reserved.
      `
    };
  }

  static getEmailVerificationTemplate(firstName: string, verificationToken: string): EmailTemplate {
    const verificationUrl = `${process.env.FRONTEND_URL || 'https://auth247.net'}/verify-email?token=${verificationToken}`;
    
    return {
      subject: 'Verify Your Auth247 Email Address',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Verify Your Email</h1>
          </div>
          
          <div style="padding: 40px 20px; background: white;">
            <h2 style="color: #374151; margin-bottom: 20px;">Hello ${firstName},</h2>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 30px;">
              Please verify your email address to complete your Auth247 account setup and ensure secure access to your account.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #10b981; word-break: break-all;">${verificationUrl}</a>
            </p>
            
            <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>Security Note:</strong> This verification link expires in 24 hours. If you didn't create an Auth247 account, please ignore this email.
              </p>
            </div>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>© 2025 Auth247. All rights reserved.</p>
          </div>
        </div>
      `,
      textContent: `
Verify Your Auth247 Email Address

Hello ${firstName},

Please verify your email address to complete your Auth247 account setup and ensure secure access to your account.

Verification link: ${verificationUrl}

Security Note: This verification link expires in 24 hours. If you didn't create an Auth247 account, please ignore this email.

© 2025 Auth247. All rights reserved.
      `
    };
  }

  static getPasswordResetTemplate(firstName: string, resetToken: string): EmailTemplate {
    const resetUrl = `${process.env.FRONTEND_URL || 'https://auth247.net'}/reset-password?token=${resetToken}`;
    
    return {
      subject: 'Reset Your Auth247 Password',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset</h1>
          </div>
          
          <div style="padding: 40px 20px; background: white;">
            <h2 style="color: #374151; margin-bottom: 20px;">Hello ${firstName},</h2>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 30px;">
              We received a request to reset your Auth247 account password. Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <div style="background: #fee2e2; border: 1px solid #fca5a5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #991b1b; margin: 0; font-size: 14px;">
                <strong>Security Alert:</strong> This password reset link expires in 1 hour. If you didn't request this reset, please contact our support team immediately.
              </p>
            </div>
            
            <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #ef4444; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>© 2025 Auth247. All rights reserved.</p>
          </div>
        </div>
      `,
      textContent: `
Reset Your Auth247 Password

Hello ${firstName},

We received a request to reset your Auth247 account password. Use the link below to create a new password.

Reset link: ${resetUrl}

Security Alert: This password reset link expires in 1 hour. If you didn't request this reset, please contact our support team immediately.

© 2025 Auth247. All rights reserved.
      `
    };
  }

  static getMFASetupTemplate(firstName: string, setupUrl: string): EmailTemplate {
    return {
      subject: 'Secure Your Auth247 Account with MFA',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Enable Multi-Factor Authentication</h1>
          </div>
          
          <div style="padding: 40px 20px; background: white;">
            <h2 style="color: #374151; margin-bottom: 20px;">Hello ${firstName},</h2>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
              Enhance your account security by enabling Multi-Factor Authentication (MFA). This adds an extra layer of protection to prevent unauthorized access.
            </p>
            
            <div style="background: #f3e8ff; border-left: 4px solid #8b5cf6; padding: 20px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Benefits of MFA:</h3>
              <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
                <li>99.9% reduction in account compromise risk</li>
                <li>Protection against password breaches</li>
                <li>Compliance with security standards</li>
                <li>Peace of mind for your data</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${setupUrl}" 
                 style="background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Set Up MFA Now
              </a>
            </div>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>© 2025 Auth247. All rights reserved.</p>
          </div>
        </div>
      `,
      textContent: `
Secure Your Auth247 Account with MFA

Hello ${firstName},

Enhance your account security by enabling Multi-Factor Authentication (MFA). This adds an extra layer of protection to prevent unauthorized access.

Benefits of MFA:
- 99.9% reduction in account compromise risk
- Protection against password breaches
- Compliance with security standards
- Peace of mind for your data

Set up MFA: ${setupUrl}

© 2025 Auth247. All rights reserved.
      `
    };
  }

  // Placeholder methods for actual email sending
  static async sendWelcomeEmail(user: { email: string; firstName: string }): Promise<boolean> {
    const template = this.getWelcomeEmailTemplate(user.firstName);
    return this.sendEmail(user.email, template);
  }

  static async sendVerificationEmail(user: { email: string; firstName: string }): Promise<string> {
    const token = this.generateVerificationToken(user.email, 'email_verification');
    const template = this.getEmailVerificationTemplate(user.firstName, token);
    await this.sendEmail(user.email, template);
    return token;
  }

  static async sendPasswordResetEmail(user: { email: string; firstName: string }): Promise<string> {
    const token = this.generateVerificationToken(user.email, 'password_reset');
    const template = this.getPasswordResetTemplate(user.firstName, token);
    await this.sendEmail(user.email, template);
    return token;
  }

  private static async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      
      sendSmtpEmail.subject = template.subject;
      sendSmtpEmail.htmlContent = template.htmlContent;
      sendSmtpEmail.textContent = template.textContent;
      sendSmtpEmail.sender = {
        name: 'Auth247 Security Team',
        email: 'security@auth247.net'
      };
      sendSmtpEmail.to = [{ email: to }];
      sendSmtpEmail.replyTo = {
        name: 'Auth247 Support',
        email: 'support@auth247.net'
      };

      const result = await this.brevoClient.sendTransacEmail(sendSmtpEmail);
      console.log(`[EMAIL] Successfully sent "${template.subject}" to ${to} - Message ID: ${result.body?.messageId}`);
      return true;
    } catch (error: any) {
      console.error(`[EMAIL] Failed to send "${template.subject}" to ${to}:`, error.response?.body || error.message);
      return false;
    }
  }

  // Login notification email
  static async sendLoginNotificationEmail(params: { 
    email: string; 
    firstName: string; 
    loginMethod: string;
    ipAddress?: string;
    location?: string;
    deviceInfo?: string;
  }): Promise<boolean> {
    const { email, firstName, loginMethod, ipAddress = 'Unknown', location = 'Unknown location', deviceInfo = 'Unknown device' } = params;
    
    const template = this.createLoginNotificationTemplate(firstName, loginMethod, ipAddress, location, deviceInfo);
    return await this.sendEmail(email, template);
  }

  private static createLoginNotificationTemplate(
    firstName: string, 
    loginMethod: string,
    ipAddress: string,
    location: string,
    deviceInfo: string
  ): EmailTemplate {
    const loginTime = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    return {
      subject: `Auth247 Security Alert: New ${loginMethod} Login`,
      htmlContent: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <div style="background: white; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 24px; color: #667eea;">🔐</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Security Alert</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px;">New login detected to your Auth247 account</p>
          </div>
          
          <div style="background: white; padding: 40px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hello ${firstName},
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              We detected a new login to your Auth247 account. If this was you, no action is needed. 
              If you don't recognize this activity, please secure your account immediately.
            </p>
            
            <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin: 30px 0;">
              <h3 style="color: #374151; margin: 0 0 16px; font-size: 18px;">Login Details</h3>
              <div style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                <div style="margin: 8px 0;"><strong>Method:</strong> ${loginMethod}</div>
                <div style="margin: 8px 0;"><strong>Time:</strong> ${loginTime}</div>
                <div style="margin: 8px 0;"><strong>IP Address:</strong> ${ipAddress}</div>
                <div style="margin: 8px 0;"><strong>Location:</strong> ${location}</div>
                <div style="margin: 8px 0;"><strong>Device:</strong> ${deviceInfo}</div>
              </div>
            </div>
            
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h4 style="color: #dc2626; margin: 0 0 12px;">Wasn't you?</h4>
              <p style="color: #7f1d1d; margin: 0 0 16px; font-size: 14px;">
                If you didn't sign in, your account may be compromised. Take action immediately:
              </p>
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'https://auth247.net'}/forgot-password" 
                   style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Secure My Account
                </a>
              </div>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                Questions? Contact our security team at 
                <a href="mailto:security@auth247.net" style="color: #667eea;">security@auth247.net</a>
              </p>
            </div>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>© 2025 Auth247. All rights reserved.</p>
          </div>
        </div>
      `,
      textContent: `
Security Alert: New ${loginMethod} Login

Hello ${firstName},

We detected a new login to your Auth247 account:

Login Details:
- Method: ${loginMethod}
- Time: ${loginTime}
- IP Address: ${ipAddress}
- Location: ${location}
- Device: ${deviceInfo}

If this was you, no action is needed. If you don't recognize this activity, please secure your account immediately by visiting:
${process.env.FRONTEND_URL || 'https://auth247.net'}/forgot-password

Questions? Contact our security team at security@auth247.net

© 2025 Auth247. All rights reserved.
      `
    };
  }

  // Additional utility methods
  static async getUserNotifications(userId: number): Promise<any[]> {
    // Placeholder for notification system
    return [];
  }

  static async markNotificationRead(notificationId: number): Promise<void> {
    // Placeholder for notification system
  }
}

// Export an instance for convenience
export const emailService = EmailService;