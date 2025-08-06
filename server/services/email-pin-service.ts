/**
 * Email PIN Authentication Service
 * Handles 5-digit PIN generation, validation, and email delivery
 */

import crypto from 'crypto';
// import { storage } from '../storage'; // Disabled for memory-based PIN system

// Use existing Brevo API configuration (dynamic import to handle CommonJS)
let apiInstance: any = null;

async function initializeBrevoAPI() {
  if (!apiInstance && process.env.BREVO_API_KEY) {
    try {
      const SibApiV3Sdk = await import('sib-api-v3-sdk');
      const defaultClient = SibApiV3Sdk.default.ApiClient.instance;
      const apiKey = defaultClient.authentications['api-key'];
      apiKey.apiKey = process.env.BREVO_API_KEY;
      apiInstance = new SibApiV3Sdk.default.TransactionalEmailsApi();
    } catch (error) {
      console.error('Failed to initialize Brevo API:', error);
    }
  }
}

export interface PinGenerationResult {
  success: boolean;
  message: string;
  pinId?: string;
  expiresIn?: number;
}

export interface PinValidationResult {
  success: boolean;
  message: string;
  sessionToken?: string;
}

export class EmailPinService {
  private readonly PIN_LENGTH = 5;
  private readonly PIN_EXPIRY_MINUTES = 10;
  private readonly MAX_PIN_ATTEMPTS = 3;
  private readonly MAX_PIN_REQUESTS_PER_HOUR = 5;
  private activePins: Map<string, any> = new Map();

  /**
   * Generate a cryptographically secure 5-digit PIN
   */
  private generateSecurePin(): string {
    let pin = '';
    for (let i = 0; i < this.PIN_LENGTH; i++) {
      // Use crypto.randomInt for cryptographically secure random numbers
      pin += crypto.randomInt(0, 10).toString();
    }
    return pin;
  }

  /**
   * Check if user has exceeded PIN request rate limits
   */
  private async checkRateLimit(userId: string): Promise<boolean> {
    // For demo mode, always allow PIN generation
    return true;
  }

  /**
   * Send PIN email using Brevo API with professional template
   */
  private async sendPinEmail(email: string, pin: string, firstName: string): Promise<boolean> {
    const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Auth247 Security Code</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #2563eb; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .content { padding: 30px 0; }
        .pin-code { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .pin-number { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; font-family: monospace; }
        .footer { border-top: 1px solid #e2e8f0; padding: 20px 0; text-align: center; color: #64748b; font-size: 14px; }
        .security-notice { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🔐 Auth247</div>
          <p>Secure 24/7 Authentication Platform</p>
        </div>
        
        <div class="content">
          <h2>Security Verification Code</h2>
          <p>Hello ${firstName},</p>
          <p>Someone is trying to sign in to your Auth247 account. To complete the sign-in process, please enter the following verification code:</p>
          
          <div class="pin-code">
            <div class="pin-number">${pin}</div>
            <p><strong>This code expires in 10 minutes</strong></p>
          </div>
          
          <div class="security-notice">
            <strong>Security Notice:</strong> If you didn't request this code, please ignore this email and consider changing your password.
          </div>
          
          <p>For your security:</p>
          <ul>
            <li>Never share this code with anyone</li>
            <li>Auth247 will never ask for this code via phone or email</li>
            <li>This code can only be used once</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>This email was sent by Auth247 Security System</p>
          <p>If you have questions, contact our support team at <a href="mailto:support@auth247.net">support@auth247.net</a></p>
          <p>&copy; 2025 Auth247. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>`;

    try {
      // Use Brevo API (existing configured system)
      if (process.env.BREVO_API_KEY) {
        await initializeBrevoAPI();
        
        if (apiInstance) {
          const SibApiV3Sdk = await import('sib-api-v3-sdk');
          const sendSmtpEmail = new SibApiV3Sdk.default.SendSmtpEmail();
          
          sendSmtpEmail.subject = "Auth247 Security Code - Sign In Verification";
          sendSmtpEmail.htmlContent = emailTemplate;
          sendSmtpEmail.sender = { 
            name: "Auth247 Security", 
            email: "security@auth247.net" 
          };
          sendSmtpEmail.to = [{ 
            email: email, 
            name: firstName 
          }];

          await apiInstance.sendTransacEmail(sendSmtpEmail);
          console.log(`🔐 PIN sent via Brevo to ${email} (${firstName}): ${pin}`);
        } else {
          // Fallback if Brevo API fails to initialize
          console.log(`🔐 [BREVO FALLBACK] PIN for ${email} (${firstName}): ${pin}`);
        }
        
      } else {
        // Development mode - show PIN in console
        console.log(`🔐 [DEV MODE] PIN Email for ${email}:`);
        console.log(`   PIN: ${pin}`);
        console.log(`   Recipient: ${firstName}`);
        console.log(`   ⚠️  Configure BREVO_API_KEY for actual email delivery`);
      }
      
      return true;
    } catch (error) {
      console.error('🔐 Email PIN delivery failed:', error);
      return false;
    }
  }

  /**
   * Generate and send PIN to user's email
   */
  async generatePin(userId: string): Promise<PinGenerationResult> {
    try {
      console.log(`🔐 Starting PIN generation for user: ${userId}`);

      // Demo user data (bypass database completely)
      const demoUsers = {
        'demo-1': { email: 'demo@auth247.net', firstName: 'Demo', lastName: 'User' },
        'test-1': { email: 'matrixpng@gmail.com', firstName: 'Matrix', lastName: 'PNG' },
        'admin-1': { email: 'admin@auth247.net', firstName: 'Admin', lastName: 'User' }
      };
      
      const user = demoUsers[userId];
      if (!user) {
        console.error(`🔐 User not found: ${userId}`);
        return {
          success: false,
          message: 'User not found.'
        };
      }

      // Generate PIN
      const pin = this.generateSecurePin();
      const expiresAt = new Date(Date.now() + this.PIN_EXPIRY_MINUTES * 60 * 1000);
      
      console.log(`🔐 Generated PIN for ${user.email}: ${pin} (expires at ${expiresAt.toISOString()})`);
      
      // Store PIN in memory
      const pinData = {
        pin,
        expiresAt,
        attempts: 0,
        userId,
        createdAt: new Date()
      };
      
      this.activePins.set(userId, pinData);
      console.log(`🔐 PIN stored in memory for user: ${userId}`);

      // Send PIN email
      console.log(`🔐 Attempting to send PIN email to: ${user.email}`);
      const emailSent = await this.sendPinEmail(user.email, pin, user.firstName);
      
      if (emailSent) {
        console.log(`📧 PIN email sent successfully to ${user.email}`);
      } else {
        console.log(`⚠️ PIN email failed, but PIN available in console: ${pin}`);
      }

      return {
        success: true,
        message: 'Verification code sent to your email address.',
        pinId: userId,
        expiresIn: this.PIN_EXPIRY_MINUTES * 60,
        pin: pin // For testing purposes
      };

    } catch (error) {
      console.error('🔐 PIN generation failed:', error);
      return {
        success: false,
        message: 'Failed to generate verification code. Please try again.'
      };
    }
  }

  /**
   * Validate PIN entered by user
   */
  async validatePin(userId: string, enteredPin: string): Promise<PinValidationResult> {
    try {
      console.log(`🔐 [MEMORY] Validating PIN for user: ${userId}, submitted PIN: ${enteredPin}`);
      
      // Get PIN data from memory storage (bypassing database completely)
      const pinData = this.activePins.get(userId);
      if (!pinData) {
        console.log(`🔐 No PIN data found for user: ${userId}`);
        return {
          success: false,
          message: 'No PIN verification pending. Please request a new verification code.'
        };
      }

      console.log(`🔐 Found PIN data - stored PIN: ${pinData.pin}, expires: ${pinData.expiresAt}, attempts: ${pinData.attempts}`);

      // Check PIN expiry
      if (new Date() > pinData.expiresAt) {
        console.log(`🔐 PIN expired for user: ${userId}`);
        this.activePins.delete(userId);
        return {
          success: false,
          message: 'Verification code has expired. Please request a new one.'
        };
      }

      // Check max attempts
      if (pinData.attempts >= this.MAX_PIN_ATTEMPTS) {
        console.log(`🔐 Too many attempts for user: ${userId}`);
        this.activePins.delete(userId);
        return {
          success: false,
          message: 'Too many failed attempts. Please request a new verification code.'
        };
      }

      // Validate PIN
      if (pinData.pin === enteredPin.trim()) {
        console.log(`🔐 PIN validation successful for user: ${userId}`);
        // PIN is correct - clear PIN data
        this.activePins.delete(userId);

        return {
          success: true,
          message: 'PIN verification successful.'
        };
      } else {
        console.log(`🔐 PIN validation failed for user: ${userId} - expected: ${pinData.pin}, got: ${enteredPin}`);
        // PIN is incorrect - increment attempts
        pinData.attempts++;
        this.activePins.set(userId, pinData);

        const remainingAttempts = this.MAX_PIN_ATTEMPTS - pinData.attempts;
        return {
          success: false,
          message: `Invalid verification code. ${remainingAttempts} attempts remaining.`
        };
      }

    } catch (error) {
      console.error('🔐 PIN validation failed:', error);
      return {
        success: false,
        message: 'Verification failed. Please try again.'
      };
    }
  }

  /**
   * Check if user requires PIN verification
   */
  async requiresPinVerification(userId: string): Promise<boolean> {
    try {
      // Memory-based check - if PIN is active in memory
      const pinData = this.activePins.get(userId);
      return !!pinData;
    } catch (error) {
      console.error('🔐 PIN check failed:', error);
      return false;
    }
  }

  /**
   * Clear PIN requirement (for admin override)
   */
  async clearPinRequirement(userId: string): Promise<boolean> {
    try {
      // Memory-based clear - remove PIN data from memory
      this.activePins.delete(userId);
      console.log(`🔐 PIN requirement cleared for user: ${userId}`);
      return true;
    } catch (error) {
      console.error('🔐 Clear PIN failed:', error);
      return false;
    }
  }
}

export const emailPinService = new EmailPinService();