import { randomBytes, createHash, timingSafeEqual } from 'crypto';
import speakeasy from 'speakeasy';

export interface MFASetupResult {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface MFAVerificationResult {
  isValid: boolean;
  remainingAttempts?: number;
  lockedUntil?: Date;
}

export class MFAService {
  private static readonly BACKUP_CODE_COUNT = 8;
  private static readonly BACKUP_CODE_LENGTH = 8;
  private static readonly MAX_ATTEMPTS = 3;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  static generateSecret(userEmail: string): MFASetupResult {
    const secret = speakeasy.generateSecret({
      name: `Auth247 (${userEmail})`,
      issuer: 'Auth247',
      length: 32
    });

    const backupCodes = this.generateBackupCodes();

    return {
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url!,
      backupCodes
    };
  }

  static verifyTOTP(token: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret,
      token,
      window: 2, // Allow 2 time steps (60 seconds) tolerance
      encoding: 'base32'
    });
  }

  static verifyBackupCode(inputCode: string, storedCodes: string[]): { valid: boolean; remainingCodes: string[] } {
    const hashedInput = this.hashBackupCode(inputCode);
    const codeIndex = storedCodes.findIndex(code => 
      timingSafeEqual(Buffer.from(code, 'hex'), Buffer.from(hashedInput, 'hex'))
    );

    if (codeIndex === -1) {
      return { valid: false, remainingCodes: storedCodes };
    }

    // Remove used backup code
    const remainingCodes = storedCodes.filter((_, index) => index !== codeIndex);
    return { valid: true, remainingCodes };
  }

  static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < this.BACKUP_CODE_COUNT; i++) {
      codes.push(this.generateBackupCode());
    }
    return codes;
  }

  private static generateBackupCode(): string {
    const code = randomBytes(this.BACKUP_CODE_LENGTH / 2).toString('hex').toUpperCase();
    return code.match(/.{1,4}/g)?.join('-') || code;
  }

  private static hashBackupCode(code: string): string {
    return createHash('sha256').update(code.replace(/-/g, '')).digest('hex');
  }

  static generateRecoveryCodes(): string[] {
    return this.generateBackupCodes().map(code => this.hashBackupCode(code));
  }

  // SMS/Email OTP for users without authenticator apps
  static generateOTP(): { code: string; expiresAt: Date } {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    return { code, expiresAt };
  }

  static verifyOTP(inputCode: string, storedCode: string, expiresAt: Date): boolean {
    if (new Date() > expiresAt) {
      return false;
    }
    
    return timingSafeEqual(
      Buffer.from(inputCode),
      Buffer.from(storedCode)
    );
  }

  // Rate limiting for MFA attempts
  static checkRateLimit(attempts: number, lastAttempt?: Date): MFAVerificationResult {
    if (attempts >= this.MAX_ATTEMPTS && lastAttempt) {
      const lockoutEnd = new Date(lastAttempt.getTime() + this.LOCKOUT_DURATION);
      if (new Date() < lockoutEnd) {
        return {
          isValid: false,
          lockedUntil: lockoutEnd
        };
      }
    }

    return {
      isValid: true,
      remainingAttempts: Math.max(0, this.MAX_ATTEMPTS - attempts)
    };
  }
}