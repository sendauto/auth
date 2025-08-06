/**
 * Enhanced Domain Verification Service
 * Smart domain verification with automatic DNS record verification and subdomain support
 */

import dns from 'dns/promises';
import crypto from 'crypto';

export interface VerifiedDomain {
  id: string;
  organizationId: number;
  domain: string;
  subdomain?: string;
  verificationStatus: 'pending' | 'verified' | 'failed' | 'expired';
  verificationMethod: 'dns_txt' | 'dns_cname' | 'file_upload' | 'meta_tag';
  verificationToken: string;
  verificationValue: string;
  autoEnrollment: boolean;
  allowSubdomains: boolean;
  createdAt: string;
  verifiedAt?: string;
  expiresAt?: string;
  metadata: {
    recordType?: string;
    recordName?: string;
    recordValue?: string;
    lastChecked?: string;
    checkCount?: number;
    errorMessage?: string;
  };
}

export interface DomainMatch {
  domain: string;
  organizationId: number;
  autoEnrollment: boolean;
  exact: boolean; // true if exact match, false if subdomain match
}

class DomainVerificationService {
  private domains: Map<string, VerifiedDomain> = new Map();
  private verificationChecks: Map<string, NodeJS.Timeout> = new Map();

  // Add domain for verification
  async addDomain(data: {
    organizationId: number;
    domain: string;
    autoEnrollment?: boolean;
    allowSubdomains?: boolean;
    verificationMethod?: 'dns_txt' | 'dns_cname' | 'file_upload' | 'meta_tag';
  }): Promise<VerifiedDomain> {
    const domainKey = `${data.organizationId}:${data.domain}`;
    
    // Check if domain already exists
    if (this.domains.has(domainKey)) {
      throw new Error('Domain already added for this organization');
    }

    // Validate domain format
    if (!this.isValidDomain(data.domain)) {
      throw new Error('Invalid domain format');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationMethod = data.verificationMethod || 'dns_txt';
    
    const verifiedDomain: VerifiedDomain = {
      id: crypto.randomUUID(),
      organizationId: data.organizationId,
      domain: data.domain,
      verificationStatus: 'pending',
      verificationMethod,
      verificationToken,
      verificationValue: this.generateVerificationValue(verificationMethod, verificationToken),
      autoEnrollment: data.autoEnrollment || false,
      allowSubdomains: data.allowSubdomains || false,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      metadata: this.generateVerificationInstructions(data.domain, verificationMethod, verificationToken)
    };

    this.domains.set(domainKey, verifiedDomain);
    
    // Start automatic verification checks
    this.startVerificationChecks(verifiedDomain);

    console.log(`[Domain] Added domain ${data.domain} for organization ${data.organizationId}`);
    return verifiedDomain;
  }

  // Verify domain manually
  async verifyDomain(organizationId: number, domain: string): Promise<{
    success: boolean;
    status: 'verified' | 'failed' | 'pending';
    error?: string;
  }> {
    const domainKey = `${organizationId}:${domain}`;
    const verifiedDomain = this.domains.get(domainKey);

    if (!verifiedDomain) {
      return { success: false, status: 'failed', error: 'Domain not found' };
    }

    try {
      const result = await this.checkVerification(verifiedDomain);
      
      if (result.verified) {
        verifiedDomain.verificationStatus = 'verified';
        verifiedDomain.verifiedAt = new Date().toISOString();
        verifiedDomain.metadata.lastChecked = new Date().toISOString();
        
        // Stop verification checks
        this.stopVerificationChecks(verifiedDomain.id);
        
        console.log(`[Domain] Verified domain ${domain} for organization ${organizationId}`);
        return { success: true, status: 'verified' };
      } else {
        verifiedDomain.metadata.errorMessage = result.error;
        verifiedDomain.metadata.lastChecked = new Date().toISOString();
        verifiedDomain.metadata.checkCount = (verifiedDomain.metadata.checkCount || 0) + 1;
        
        return { success: false, status: 'failed', error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      verifiedDomain.metadata.errorMessage = errorMessage;
      verifiedDomain.metadata.lastChecked = new Date().toISOString();
      
      return { success: false, status: 'failed', error: errorMessage };
    }
  }

  // Check if email domain matches any verified domain
  findMatchingDomain(email: string): DomainMatch | null {
    const emailDomain = email.toLowerCase().split('@')[1];
    if (!emailDomain) return null;

    // First check for exact matches
    for (const verifiedDomain of this.domains.values()) {
      if (verifiedDomain.verificationStatus !== 'verified') continue;
      
      if (verifiedDomain.domain.toLowerCase() === emailDomain) {
        return {
          domain: verifiedDomain.domain,
          organizationId: verifiedDomain.organizationId,
          autoEnrollment: verifiedDomain.autoEnrollment,
          exact: true
        };
      }
    }

    // Then check for subdomain matches if allowed
    for (const verifiedDomain of this.domains.values()) {
      if (verifiedDomain.verificationStatus !== 'verified') continue;
      if (!verifiedDomain.allowSubdomains) continue;
      
      if (emailDomain.endsWith(`.${verifiedDomain.domain.toLowerCase()}`)) {
        return {
          domain: verifiedDomain.domain,
          organizationId: verifiedDomain.organizationId,
          autoEnrollment: verifiedDomain.autoEnrollment,
          exact: false
        };
      }
    }

    return null;
  }

  // Get verified domains for organization
  getOrganizationDomains(organizationId: number): VerifiedDomain[] {
    return Array.from(this.domains.values())
      .filter(domain => domain.organizationId === organizationId);
  }

  // Remove domain
  async removeDomain(organizationId: number, domain: string): Promise<boolean> {
    const domainKey = `${organizationId}:${domain}`;
    const verifiedDomain = this.domains.get(domainKey);

    if (!verifiedDomain) {
      return false;
    }

    // Stop verification checks
    this.stopVerificationChecks(verifiedDomain.id);
    
    // Remove from storage
    this.domains.delete(domainKey);
    
    console.log(`[Domain] Removed domain ${domain} for organization ${organizationId}`);
    return true;
  }

  // Bulk upload domains from CSV
  async bulkUploadDomains(organizationId: number, csvContent: string): Promise<{
    success: number;
    failed: number;
    errors: Array<{ domain: string; error: string }>;
  }> {
    const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
    const header = lines[0]?.toLowerCase();
    
    if (!header?.includes('domain')) {
      throw new Error('CSV must contain a "domain" column');
    }

    const results = { success: 0, failed: 0, errors: [] as Array<{ domain: string; error: string }> };
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      
      try {
        // Simple CSV parsing - in production would use proper CSV parser
        const parts = line.split(',').map(p => p.trim().replace(/"/g, ''));
        const domain = parts[0];
        
        if (!domain) continue;
        
        await this.addDomain({
          organizationId,
          domain,
          autoEnrollment: true,
          allowSubdomains: true
        });
        
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          domain: lines[i].split(',')[0] || 'unknown',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  // Get domain verification instructions
  getVerificationInstructions(organizationId: number, domain: string): {
    method: string;
    instructions: string;
    record: { type: string; name: string; value: string };
  } | null {
    const domainKey = `${organizationId}:${domain}`;
    const verifiedDomain = this.domains.get(domainKey);

    if (!verifiedDomain) return null;

    const instructions = this.generateInstructionsText(verifiedDomain);
    
    return {
      method: verifiedDomain.verificationMethod,
      instructions,
      record: {
        type: verifiedDomain.metadata.recordType || 'TXT',
        name: verifiedDomain.metadata.recordName || `_auth247-challenge.${domain}`,
        value: verifiedDomain.metadata.recordValue || verifiedDomain.verificationValue
      }
    };
  }

  // Private helper methods
  private isValidDomain(domain: string): boolean {
    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.([a-zA-Z]{2,}\.)*[a-zA-Z]{2,}$/;
    return domainRegex.test(domain) && domain.length <= 253;
  }

  private generateVerificationValue(method: string, token: string): string {
    switch (method) {
      case 'dns_txt':
        return `auth247-domain-verification=${token}`;
      case 'dns_cname':
        return `_auth247-challenge.auth247.net`;
      case 'file_upload':
        return `${token}.txt`;
      case 'meta_tag':
        return `<meta name="auth247-domain-verification" content="${token}" />`;
      default:
        return token;
    }
  }

  private generateVerificationInstructions(domain: string, method: string, token: string): VerifiedDomain['metadata'] {
    switch (method) {
      case 'dns_txt':
        return {
          recordType: 'TXT',
          recordName: `_auth247-challenge.${domain}`,
          recordValue: `auth247-domain-verification=${token}`
        };
      case 'dns_cname':
        return {
          recordType: 'CNAME',
          recordName: `_auth247-challenge.${domain}`,
          recordValue: `_auth247-challenge.auth247.net`
        };
      case 'file_upload':
        return {
          recordType: 'FILE',
          recordName: `/.well-known/auth247-domain-verification.txt`,
          recordValue: token
        };
      case 'meta_tag':
        return {
          recordType: 'META',
          recordName: 'auth247-domain-verification',
          recordValue: token
        };
      default:
        return {};
    }
  }

  private generateInstructionsText(verifiedDomain: VerifiedDomain): string {
    const { domain, verificationMethod, metadata } = verifiedDomain;
    
    switch (verificationMethod) {
      case 'dns_txt':
        return `Add the following TXT record to your DNS:
Name: ${metadata.recordName}
Value: ${metadata.recordValue}

This record may take up to 24 hours to propagate.`;

      case 'dns_cname':
        return `Add the following CNAME record to your DNS:
Name: ${metadata.recordName}
Value: ${metadata.recordValue}

This record may take up to 24 hours to propagate.`;

      case 'file_upload':
        return `Upload a file with the following content to your website:
URL: https://${domain}${metadata.recordName}
Content: ${metadata.recordValue}`;

      case 'meta_tag':
        return `Add the following meta tag to your website's <head> section:
${this.generateVerificationValue('meta_tag', metadata.recordValue || '')}`;

      default:
        return 'Unknown verification method';
    }
  }

  private async checkVerification(verifiedDomain: VerifiedDomain): Promise<{
    verified: boolean;
    error?: string;
  }> {
    try {
      switch (verifiedDomain.verificationMethod) {
        case 'dns_txt':
          return await this.checkDNSTXT(verifiedDomain);
        case 'dns_cname':
          return await this.checkDNSCNAME(verifiedDomain);
        case 'file_upload':
          return await this.checkFileUpload(verifiedDomain);
        case 'meta_tag':
          return await this.checkMetaTag(verifiedDomain);
        default:
          return { verified: false, error: 'Unknown verification method' };
      }
    } catch (error) {
      return {
        verified: false,
        error: error instanceof Error ? error.message : 'Verification check failed'
      };
    }
  }

  private async checkDNSTXT(verifiedDomain: VerifiedDomain): Promise<{ verified: boolean; error?: string }> {
    try {
      const recordName = verifiedDomain.metadata.recordName!;
      const expectedValue = verifiedDomain.metadata.recordValue!;
      
      const records = await dns.resolveTxt(recordName);
      const flatRecords = records.flat();
      
      const found = flatRecords.some(record => record === expectedValue);
      
      if (found) {
        return { verified: true };
      } else {
        return {
          verified: false,
          error: `TXT record not found. Expected: ${expectedValue}`
        };
      }
    } catch (error) {
      return {
        verified: false,
        error: `DNS lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async checkDNSCNAME(verifiedDomain: VerifiedDomain): Promise<{ verified: boolean; error?: string }> {
    try {
      const recordName = verifiedDomain.metadata.recordName!;
      const expectedValue = verifiedDomain.metadata.recordValue!;
      
      const records = await dns.resolveCname(recordName);
      
      const found = records.some(record => record === expectedValue);
      
      if (found) {
        return { verified: true };
      } else {
        return {
          verified: false,
          error: `CNAME record not found. Expected: ${expectedValue}`
        };
      }
    } catch (error) {
      return {
        verified: false,
        error: `DNS lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async checkFileUpload(verifiedDomain: VerifiedDomain): Promise<{ verified: boolean; error?: string }> {
    try {
      const url = `https://${verifiedDomain.domain}${verifiedDomain.metadata.recordName}`;
      const expectedContent = verifiedDomain.metadata.recordValue!;
      
      const response = await fetch(url);
      if (!response.ok) {
        return {
          verified: false,
          error: `File not accessible: HTTP ${response.status}`
        };
      }
      
      const content = await response.text();
      
      if (content.trim() === expectedContent) {
        return { verified: true };
      } else {
        return {
          verified: false,
          error: `File content mismatch. Expected: ${expectedContent}`
        };
      }
    } catch (error) {
      return {
        verified: false,
        error: `File check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async checkMetaTag(verifiedDomain: VerifiedDomain): Promise<{ verified: boolean; error?: string }> {
    try {
      const url = `https://${verifiedDomain.domain}`;
      const expectedContent = verifiedDomain.verificationToken;
      
      const response = await fetch(url);
      if (!response.ok) {
        return {
          verified: false,
          error: `Website not accessible: HTTP ${response.status}`
        };
      }
      
      const html = await response.text();
      const metaTagPattern = new RegExp(`<meta[^>]+name="auth247-domain-verification"[^>]+content="${expectedContent}"[^>]*>`, 'i');
      
      if (metaTagPattern.test(html)) {
        return { verified: true };
      } else {
        return {
          verified: false,
          error: 'Meta tag not found in website HTML'
        };
      }
    } catch (error) {
      return {
        verified: false,
        error: `Website check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private startVerificationChecks(verifiedDomain: VerifiedDomain): void {
    // Check every 5 minutes for the first hour, then every hour
    let checkCount = 0;
    const maxChecks = 720; // 30 days worth of hourly checks
    
    const checkInterval = () => {
      if (checkCount >= maxChecks || verifiedDomain.verificationStatus === 'verified') {
        this.stopVerificationChecks(verifiedDomain.id);
        return;
      }
      
      this.checkVerification(verifiedDomain).then(result => {
        if (result.verified) {
          verifiedDomain.verificationStatus = 'verified';
          verifiedDomain.verifiedAt = new Date().toISOString();
          this.stopVerificationChecks(verifiedDomain.id);
          console.log(`[Domain] Auto-verified domain ${verifiedDomain.domain}`);
        } else {
          verifiedDomain.metadata.lastChecked = new Date().toISOString();
          verifiedDomain.metadata.errorMessage = result.error;
        }
      });
      
      checkCount++;
      const nextInterval = checkCount < 12 ? 5 * 60 * 1000 : 60 * 60 * 1000; // 5 min then 1 hour
      this.verificationChecks.set(verifiedDomain.id, setTimeout(checkInterval, nextInterval));
    };
    
    // Start first check after 1 minute
    this.verificationChecks.set(verifiedDomain.id, setTimeout(checkInterval, 60 * 1000));
  }

  private stopVerificationChecks(domainId: string): void {
    const timeout = this.verificationChecks.get(domainId);
    if (timeout) {
      clearTimeout(timeout);
      this.verificationChecks.delete(domainId);
    }
  }
}

export const domainVerificationService = new DomainVerificationService();