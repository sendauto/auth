import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
  preventPasswordReuse: number; // Number of previous passwords to check
}

export interface PasswordStrengthResult {
  isValid: boolean;
  score: number; // 0-100
  feedback: string[];
  estimatedCrackTime: string;
}

export class PasswordService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly COMMON_PASSWORDS = new Set([
    'password', '123456', 'password123', 'admin', 'qwerty', 'letmein',
    'welcome', 'monkey', '1234567890', 'abc123', 'Password1', 'password1'
  ]);

  private static readonly DEFAULT_POLICY: PasswordPolicy = {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventCommonPasswords: true,
    preventPasswordReuse: 5
  };

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static validatePasswordStrength(
    password: string, 
    policy: PasswordPolicy = this.DEFAULT_POLICY,
    userInfo?: { email?: string; firstName?: string; lastName?: string }
  ): PasswordStrengthResult {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length < policy.minLength) {
      feedback.push(`Password must be at least ${policy.minLength} characters long`);
    } else {
      score += 20;
    }

    // Character requirements
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      feedback.push('Password must contain at least one uppercase letter');
    } else if (policy.requireUppercase) {
      score += 15;
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      feedback.push('Password must contain at least one lowercase letter');
    } else if (policy.requireLowercase) {
      score += 15;
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      feedback.push('Password must contain at least one number');
    } else if (policy.requireNumbers) {
      score += 15;
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('Password must contain at least one special character');
    } else if (policy.requireSpecialChars) {
      score += 15;
    }

    // Common password check
    if (policy.preventCommonPasswords && this.COMMON_PASSWORDS.has(password.toLowerCase())) {
      feedback.push('Password is too common, please choose a more unique password');
      score -= 30;
    }

    // Personal information check
    if (userInfo) {
      const personalInfo = [
        userInfo.email?.split('@')[0],
        userInfo.firstName?.toLowerCase(),
        userInfo.lastName?.toLowerCase()
      ].filter(Boolean);

      for (const info of personalInfo) {
        if (info && password.toLowerCase().includes(info)) {
          feedback.push('Password should not contain personal information');
          score -= 20;
          break;
        }
      }
    }

    // Advanced patterns
    if (password.length >= 16) score += 10;
    if (/[^\w\s!@#$%^&*(),.?":{}|<>]/.test(password)) score += 5; // Uncommon special chars
    if (!/(.)\1{2,}/.test(password)) score += 5; // No repeated characters

    score = Math.max(0, Math.min(100, score));

    // Estimate crack time
    let estimatedCrackTime = "Less than 1 minute";
    if (score >= 80) estimatedCrackTime = "Several centuries";
    else if (score >= 60) estimatedCrackTime = "Several years";
    else if (score >= 40) estimatedCrackTime = "Several months";
    else if (score >= 20) estimatedCrackTime = "Several days";

    return {
      isValid: feedback.length === 0 && score >= 60,
      score,
      feedback,
      estimatedCrackTime
    };
  }

  static generateSecurePassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*(),.?":{}|<>';
    
    let password = '';
    
    // Ensure at least one character from each required set
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Fill the rest randomly
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  static generatePasswordResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  static isTokenExpired(createdAt: Date, expiryHours: number = 1): boolean {
    const now = new Date();
    const expiry = new Date(createdAt.getTime() + (expiryHours * 60 * 60 * 1000));
    return now > expiry;
  }

  static async calculateStrength(password: string): Promise<{
    score: number;
    feedback: string[];
    entropy: number;
    isStrong: boolean;
  }> {
    const result = this.validatePasswordStrength(password);
    
    // Calculate entropy
    const charsets = {
      lowercase: /[a-z]/.test(password) ? 26 : 0,
      uppercase: /[A-Z]/.test(password) ? 26 : 0,
      digits: /\d/.test(password) ? 10 : 0,
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password) ? 32 : 0
    };

    const totalCharset = Object.values(charsets).reduce((sum, count) => sum + count, 0);
    const entropy = password.length * Math.log2(Math.max(1, totalCharset));

    return {
      score: result.score,
      feedback: result.feedback,
      entropy,
      isStrong: result.isValid
    };
  }

  static async checkBreachedPassword(password: string): Promise<boolean> {
    // Check against known common passwords
    if (this.COMMON_PASSWORDS.has(password.toLowerCase())) {
      return true;
    }

    // In production, check against HaveIBeenPwned API
    // const sha1Hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    // const prefix = sha1Hash.substring(0, 5);
    // const suffix = sha1Hash.substring(5);
    // 
    // try {
    //   const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    //   const data = await response.text();
    //   return data.includes(suffix);
    // } catch (error) {
    //   console.error('Failed to check password breach:', error);
    //   return false;
    // }

    return false;
  }
}