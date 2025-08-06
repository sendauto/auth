/**
 * Advanced Security Risk Engine for Auth247
 * Real-time threat detection and risk assessment
 */

interface SecurityEvent {
  userId?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  event: string;
  riskFactors: RiskFactor[];
  riskScore: number;
  action: SecurityAction;
  metadata?: Record<string, any>;
}

interface RiskFactor {
  type: 'geo_velocity' | 'device_change' | 'suspicious_pattern' | 'compromised_credential' | 'rate_limit' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  description: string;
  evidence: any;
}

interface UserSecurityProfile {
  userId: string;
  knownDevices: DeviceFingerprint[];
  commonLocations: GeoLocation[];
  behaviorPatterns: BehaviorPattern[];
  lastLogin: Date;
  riskHistory: SecurityEvent[];
  trustScore: number;
}

interface DeviceFingerprint {
  id: string;
  userAgent: string;
  screen: { width: number; height: number };
  timezone: string;
  language: string;
  platform: string;
  plugins: string[];
  firstSeen: Date;
  lastUsed: Date;
  verified: boolean;
}

interface GeoLocation {
  country: string;
  region: string;
  city: string;
  coordinates: { lat: number; lng: number };
  accuracy: number;
  firstSeen: Date;
  frequency: number;
}

interface BehaviorPattern {
  type: 'login_time' | 'session_duration' | 'api_usage' | 'navigation';
  pattern: any;
  confidence: number;
  baseline: any;
}

type SecurityAction = 'allow' | 'challenge_mfa' | 'require_verification' | 'block' | 'monitor';

export class SecurityRiskEngine {
  private userProfiles = new Map<string, UserSecurityProfile>();
  private compromisedCredentials = new Set<string>();
  private suspiciousIPs = new Map<string, { count: number; lastSeen: Date }>();
  private geoDatabase: any; // Would be MaxMind or similar in production
  
  constructor() {
    this.initializeSecurityDatabase();
    this.startBackgroundProcesses();
  }

  /**
   * Evaluate security risk for authentication attempt
   */
  async evaluateAuthenticationRisk(
    email: string,
    password: string,
    ipAddress: string,
    userAgent: string,
    deviceFingerprint?: any
  ): Promise<SecurityEvent> {
    const riskFactors: RiskFactor[] = [];
    let riskScore = 0;

    // Check compromised credentials
    const credentialRisk = await this.checkCompromisedCredentials(email, password);
    if (credentialRisk) {
      riskFactors.push(credentialRisk);
      riskScore += credentialRisk.score;
    }

    // Analyze IP reputation
    const ipRisk = this.analyzeIPReputation(ipAddress);
    if (ipRisk) {
      riskFactors.push(ipRisk);
      riskScore += ipRisk.score;
    }

    // Check geo-velocity anomalies
    const geoRisk = await this.checkGeoVelocity(email, ipAddress);
    if (geoRisk) {
      riskFactors.push(geoRisk);
      riskScore += geoRisk.score;
    }

    // Device fingerprint analysis
    if (deviceFingerprint) {
      const deviceRisk = this.analyzeDeviceFingerprint(email, deviceFingerprint);
      if (deviceRisk) {
        riskFactors.push(deviceRisk);
        riskScore += deviceRisk.score;
      }
    }

    // Rate limiting check
    const rateLimitRisk = this.checkRateLimit(ipAddress, email);
    if (rateLimitRisk) {
      riskFactors.push(rateLimitRisk);
      riskScore += rateLimitRisk.score;
    }

    // Determine security action
    const action = this.determineSecurityAction(riskScore, riskFactors);

    const securityEvent: SecurityEvent = {
      userId: email,
      ipAddress,
      userAgent,
      timestamp: new Date(),
      event: 'authentication_attempt',
      riskFactors,
      riskScore,
      action,
      metadata: { deviceFingerprint }
    };

    // Store event for learning
    this.recordSecurityEvent(securityEvent);

    return securityEvent;
  }

  /**
   * Check if credentials are compromised using breach databases
   */
  private async checkCompromisedCredentials(email: string, password: string): Promise<RiskFactor | null> {
    // In production, this would check against HaveIBeenPwned API or similar
    const emailHash = this.hashEmail(email);
    const passwordHash = this.hashPassword(password);
    
    if (this.compromisedCredentials.has(emailHash)) {
      return {
        type: 'compromised_credential',
        severity: 'high',
        score: 70,
        description: 'Email found in known data breaches',
        evidence: { type: 'email_breach', source: 'breach_database' }
      };
    }

    // Check for common passwords
    if (this.isCommonPassword(password)) {
      return {
        type: 'compromised_credential',
        severity: 'medium',
        score: 40,
        description: 'Password found in common password lists',
        evidence: { type: 'weak_password', strength: 'low' }
      };
    }

    return null;
  }

  /**
   * Analyze IP reputation and detect suspicious patterns
   */
  private analyzeIPReputation(ipAddress: string): RiskFactor | null {
    // Check if IP is from suspicious sources
    const suspiciousData = this.suspiciousIPs.get(ipAddress);
    
    if (suspiciousData && suspiciousData.count > 10) {
      return {
        type: 'suspicious_pattern',
        severity: 'high',
        score: 60,
        description: 'IP address has high failure rate',
        evidence: { failureCount: suspiciousData.count, timeWindow: '24h' }
      };
    }

    // Check for VPN/Proxy (simplified)
    if (this.isVPNOrProxy(ipAddress)) {
      return {
        type: 'suspicious_pattern',
        severity: 'medium',
        score: 30,
        description: 'Login from VPN or proxy service',
        evidence: { type: 'vpn_proxy', provider: 'unknown' }
      };
    }

    return null;
  }

  /**
   * Check for impossible travel / geo-velocity anomalies
   */
  private async checkGeoVelocity(email: string, ipAddress: string): Promise<RiskFactor | null> {
    const userProfile = this.userProfiles.get(email);
    if (!userProfile || !userProfile.lastLogin) return null;

    const currentLocation = await this.getLocationFromIP(ipAddress);
    const lastKnownLocation = userProfile.commonLocations[0];

    if (lastKnownLocation && currentLocation) {
      const distance = this.calculateDistance(lastKnownLocation.coordinates, currentLocation.coordinates);
      const timeDiff = (Date.now() - userProfile.lastLogin.getTime()) / 1000 / 3600; // hours
      const maxSpeed = distance / timeDiff; // km/h

      // If travel speed exceeds 1000 km/h (impossible by car/train)
      if (maxSpeed > 1000) {
        return {
          type: 'geo_velocity',
          severity: 'high',
          score: 80,
          description: 'Impossible travel detected between login locations',
          evidence: {
            distance: distance,
            timeHours: timeDiff,
            speedKmH: maxSpeed,
            previousLocation: lastKnownLocation.city,
            currentLocation: currentLocation.city
          }
        };
      }
    }

    return null;
  }

  /**
   * Analyze device fingerprint for anomalies
   */
  private analyzeDeviceFingerprint(email: string, fingerprint: any): RiskFactor | null {
    const userProfile = this.userProfiles.get(email);
    if (!userProfile) return null;

    const knownDevice = userProfile.knownDevices.find(device => 
      this.compareFingerprints(device, fingerprint) > 0.8
    );

    if (!knownDevice) {
      return {
        type: 'device_change',
        severity: 'medium',
        score: 50,
        description: 'Login from unrecognized device',
        evidence: { 
          newDevice: true,
          knownDeviceCount: userProfile.knownDevices.length,
          fingerprint: this.sanitizeFingerprint(fingerprint)
        }
      };
    }

    return null;
  }

  /**
   * Check rate limiting violations
   */
  private checkRateLimit(ipAddress: string, email: string): RiskFactor | null {
    // This would integrate with existing rate limiting system
    const ipAttempts = this.getAttemptCount(ipAddress, '1h');
    const emailAttempts = this.getAttemptCount(email, '1h');

    if (ipAttempts > 20) {
      return {
        type: 'rate_limit',
        severity: 'high',
        score: 90,
        description: 'Excessive login attempts from IP address',
        evidence: { attempts: ipAttempts, timeWindow: '1h', type: 'ip' }
      };
    }

    if (emailAttempts > 10) {
      return {
        type: 'rate_limit',
        severity: 'medium',
        score: 60,
        description: 'Multiple failed attempts for user account',
        evidence: { attempts: emailAttempts, timeWindow: '1h', type: 'user' }
      };
    }

    return null;
  }

  /**
   * Determine security action based on risk assessment
   */
  private determineSecurityAction(riskScore: number, riskFactors: RiskFactor[]): SecurityAction {
    // Critical risk - block immediately
    if (riskScore >= 90 || riskFactors.some(f => f.severity === 'critical')) {
      return 'block';
    }

    // High risk - require additional verification
    if (riskScore >= 70) {
      return 'require_verification';
    }

    // Medium risk - challenge with MFA
    if (riskScore >= 40) {
      return 'challenge_mfa';
    }

    // Low risk - monitor but allow
    if (riskScore >= 20) {
      return 'monitor';
    }

    return 'allow';
  }

  /**
   * Update user security profile with new information
   */
  updateUserProfile(email: string, securityEvent: SecurityEvent, deviceFingerprint?: any): void {
    let profile = this.userProfiles.get(email);
    
    if (!profile) {
      profile = {
        userId: email,
        knownDevices: [],
        commonLocations: [],
        behaviorPatterns: [],
        lastLogin: new Date(),
        riskHistory: [],
        trustScore: 50
      };
    }

    // Add new device if successful login
    if (securityEvent.action === 'allow' && deviceFingerprint) {
      const existingDevice = profile.knownDevices.find(d => 
        this.compareFingerprints(d, deviceFingerprint) > 0.8
      );
      
      if (!existingDevice) {
        profile.knownDevices.push({
          id: this.generateDeviceId(deviceFingerprint),
          userAgent: securityEvent.userAgent,
          screen: deviceFingerprint.screen || { width: 0, height: 0 },
          timezone: deviceFingerprint.timezone || 'unknown',
          language: deviceFingerprint.language || 'en',
          platform: deviceFingerprint.platform || 'unknown',
          plugins: deviceFingerprint.plugins || [],
          firstSeen: new Date(),
          lastUsed: new Date(),
          verified: false
        });
      }
    }

    // Update location data
    this.getLocationFromIP(securityEvent.ipAddress).then(location => {
      if (location) {
        const existingLocation = profile!.commonLocations.find(loc => 
          loc.city === location.city && loc.country === location.country
        );
        
        if (existingLocation) {
          existingLocation.frequency++;
          existingLocation.lastUsed = new Date();
        } else {
          profile!.commonLocations.push({
            country: location.country,
            region: location.region,
            city: location.city,
            coordinates: location.coordinates,
            accuracy: location.accuracy,
            firstSeen: new Date(),
            frequency: 1
          });
        }
      }
    });

    // Update trust score
    profile.trustScore = this.calculateTrustScore(profile, securityEvent);
    profile.lastLogin = new Date();
    profile.riskHistory.push(securityEvent);

    // Keep only last 100 events
    if (profile.riskHistory.length > 100) {
      profile.riskHistory = profile.riskHistory.slice(-100);
    }

    this.userProfiles.set(email, profile);
  }

  /**
   * Get security recommendations for improving account security
   */
  getSecurityRecommendations(email: string): string[] {
    const profile = this.userProfiles.get(email);
    const recommendations: string[] = [];

    if (!profile) return recommendations;

    if (profile.trustScore < 60) {
      recommendations.push('Enable multi-factor authentication for enhanced security');
    }

    if (profile.knownDevices.length > 5) {
      recommendations.push('Review and remove unused devices from your account');
    }

    if (profile.riskHistory.some(e => e.riskScore > 50)) {
      recommendations.push('Recent suspicious activity detected - review your account activity');
    }

    if (profile.commonLocations.length > 10) {
      recommendations.push('Consider enabling location-based access restrictions');
    }

    return recommendations;
  }

  // Utility methods
  private initializeSecurityDatabase(): void {
    // Load compromised credentials database
    // Load geo IP database
    // Initialize threat intelligence feeds
  }

  private startBackgroundProcesses(): void {
    // Start cleanup processes for old data
    setInterval(() => this.cleanupOldData(), 60 * 60 * 1000); // hourly
    
    // Update threat intelligence
    setInterval(() => this.updateThreatIntelligence(), 24 * 60 * 60 * 1000); // daily
  }

  private cleanupOldData(): void {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
    
    for (const [email, profile] of this.userProfiles.entries()) {
      profile.riskHistory = profile.riskHistory.filter(event => event.timestamp > cutoff);
      if (profile.riskHistory.length === 0 && profile.lastLogin < cutoff) {
        this.userProfiles.delete(email);
      }
    }
  }

  private updateThreatIntelligence(): void {
    // Update compromised credentials database
    // Update malicious IP lists
    // Update device fingerprint patterns
  }

  private recordSecurityEvent(event: SecurityEvent): void {
    // Store in audit logs
    // Send to SIEM if configured
    // Update machine learning models
  }

  private hashEmail(email: string): string {
    // Use crypto.createHash in production
    return Buffer.from(email).toString('base64');
  }

  private hashPassword(password: string): string {
    // Use proper hashing in production
    return Buffer.from(password).toString('base64');
  }

  private isCommonPassword(password: string): boolean {
    const commonPasswords = ['password', '123456', 'password123', 'admin', 'qwerty'];
    return commonPasswords.includes(password.toLowerCase());
  }

  private isVPNOrProxy(ipAddress: string): boolean {
    // Simplified check - in production would use IP intelligence service
    return false;
  }

  private async getLocationFromIP(ipAddress: string): Promise<GeoLocation | null> {
    // Mock implementation - would use MaxMind or similar
    return {
      country: 'US',
      region: 'California',
      city: 'San Francisco',
      coordinates: { lat: 37.7749, lng: -122.4194 },
      accuracy: 100
    };
  }

  private calculateDistance(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
    // Haversine formula for calculating distance between coordinates
    const R = 6371; // Earth's radius in km
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private compareFingerprints(device1: any, device2: any): number {
    // Calculate similarity score between device fingerprints
    let matches = 0;
    let total = 0;

    const fields = ['userAgent', 'timezone', 'language', 'platform'];
    for (const field of fields) {
      total++;
      if (device1[field] === device2[field]) matches++;
    }

    return matches / total;
  }

  private sanitizeFingerprint(fingerprint: any): any {
    // Remove sensitive information for logging
    return {
      platform: fingerprint.platform,
      timezone: fingerprint.timezone,
      language: fingerprint.language
    };
  }

  private generateDeviceId(fingerprint: any): string {
    // Generate stable device ID from fingerprint
    return Buffer.from(JSON.stringify(fingerprint)).toString('base64').slice(0, 16);
  }

  private calculateTrustScore(profile: UserSecurityProfile, event: SecurityEvent): number {
    let score = profile.trustScore;

    // Adjust based on recent security events
    if (event.action === 'allow' && event.riskScore < 20) {
      score = Math.min(100, score + 2);
    } else if (event.riskScore > 60) {
      score = Math.max(0, score - 10);
    }

    return score;
  }

  private getAttemptCount(identifier: string, timeWindow: string): number {
    // Mock implementation - would query actual rate limiting store
    return Math.floor(Math.random() * 5);
  }
}

export const securityRiskEngine = new SecurityRiskEngine();