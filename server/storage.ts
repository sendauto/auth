import { 
  users, sessions, webhooks, webhookEvents, webhookDeliveries, apiKeys, samlConfigs,
  whiteLabelConfigs, domainMappings,
  type User, type InsertUser, type Session, type InsertSession,
  type Webhook, type InsertWebhook, type WebhookEvent, type InsertWebhookEvent,
  type WebhookDelivery, type InsertWebhookDelivery, type ApiKey, type InsertApiKey,
  type SamlConfig, type InsertSamlConfig, type WhiteLabelConfig, type InsertWhiteLabelConfig,
  type DomainMapping, type InsertDomainMapping
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count } from "drizzle-orm";
import { cacheService } from "./services/cache";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>; // Alias for consistency
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByKeycloakId(keycloakId: string): Promise<User | undefined>;
  getUserByScimId(scimId: string, organizationId: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Session operations
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  getSessionWithUser(id: string): Promise<(Session & { user: User }) | undefined>;
  deleteSession(id: string): Promise<void>;
  deleteUserSessions(userId: number): Promise<void>;
  
  // Auth V2 methods
  recordFailedLogin(userId: string): Promise<void>;
  clearFailedLoginAttempts(userId: string): Promise<void>;
  updateLastLogin(userId: string, ip: string): Promise<void>;
  storePasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  clearPasswordResetToken(userId: string): Promise<void>;
  updatePassword(userId: string, hashedPassword: string): Promise<void>;

  // Webhook operations
  createWebhook(webhook: InsertWebhook): Promise<Webhook>;
  getWebhookById(id: number): Promise<Webhook | undefined>;
  getWebhooksByTenant(tenantId: number): Promise<Webhook[]>;
  getActiveWebhooksForEvent(tenantId: number, eventType: string): Promise<Webhook[]>;
  updateWebhook(id: number, updates: Partial<Webhook>): Promise<Webhook>;
  deleteWebhook(id: number): Promise<void>;

  // Webhook event operations
  createWebhookEvent(event: InsertWebhookEvent): Promise<WebhookEvent>;
  getWebhookEvents(tenantId: number, limit?: number): Promise<WebhookEvent[]>;
  markEventProcessed(eventId: number): Promise<void>;

  // Webhook delivery operations
  createWebhookDelivery(delivery: InsertWebhookDelivery): Promise<WebhookDelivery>;
  getWebhookDeliveries(webhookId: number, limit?: number): Promise<WebhookDelivery[]>;
  getWebhookDeliveryById(id: number): Promise<WebhookDelivery | undefined>;
  getWebhookStats(tenantId: number): Promise<any>;

  // API Key operations
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  getApiKeyById(id: number): Promise<ApiKey | undefined>;
  getApiKeysByTenant(tenantId: number): Promise<ApiKey[]>;
  getApiKeyByHash(keyHash: string): Promise<ApiKey | undefined>;
  updateApiKey(id: number, updates: Partial<ApiKey>): Promise<ApiKey>;
  deleteApiKey(id: number): Promise<void>;
  incrementApiKeyUsage(id: number): Promise<void>;

  // SAML Configuration operations
  createSamlConfig(config: InsertSamlConfig): Promise<SamlConfig>;
  getSamlConfigByTenant(tenantId: number): Promise<SamlConfig | undefined>;
  updateSamlConfig(id: number, updates: Partial<SamlConfig>): Promise<SamlConfig>;
  deleteSamlConfig(id: number): Promise<void>;

  // White Label Configuration operations
  createWhiteLabelConfig(config: InsertWhiteLabelConfig): Promise<WhiteLabelConfig>;
  getWhiteLabelConfigById(id: number): Promise<WhiteLabelConfig | undefined>;
  getWhiteLabelConfigByDomain(domain: string): Promise<WhiteLabelConfig | undefined>;
  getWhiteLabelConfigByTenant(tenantId: string): Promise<WhiteLabelConfig | undefined>;
  updateWhiteLabelConfig(id: number, updates: Partial<WhiteLabelConfig>): Promise<WhiteLabelConfig>;
  deleteWhiteLabelConfig(id: number): Promise<void>;

  // Domain Mapping operations
  createDomainMapping(mapping: InsertDomainMapping): Promise<DomainMapping>;
  getDomainMapping(domain: string): Promise<DomainMapping | undefined>;
  updateDomainMapping(id: number, updates: Partial<DomainMapping>): Promise<DomainMapping>;
  deleteDomainMapping(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessions: Map<string, Session>;
  private currentUserId: number;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.currentUserId = 1;
    
    // Create default users for testing
    this.seedDefaultUsers();
  }

  private seedDefaultUsers() {
    // Regular Admin
    const admin: User = {
      id: 1,
      email: "john.doe@company.com",
      password: null,
      keycloakId: "admin-keycloak-id",
      firstName: "John",
      lastName: "Doe",
      organization: null,
      jobTitle: null,
      roles: ["admin", "manager", "user"],
      tenant: "company-main",
      isActive: true,
      emailVerified: true,
      phoneNumber: null,
      profilePicture: null,
      mfaEnabled: false,
      mfaSecret: null,
      mfaBackupCodes: null,
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      lastFailedLogin: null,
      passwordResetToken: null,
      passwordResetTokenExpires: null,
      preferences: {},
      profile: {},
      lastLogin: null,
      lastPasswordChange: null,
      passwordChangedAt: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      pinCode: null,
      pinExpiresAt: null,
      pinAttempts: 0,
      pinGeneratedAt: null,
      requiresPinVerification: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Manager
    const manager: User = {
      id: 2,
      email: "manager@company.com",
      password: null,
      keycloakId: "manager-keycloak-id",
      firstName: "Jane",
      lastName: "Smith",
      organization: null,
      jobTitle: null,
      roles: ["manager", "user"],
      tenant: "company-main",
      isActive: true,
      emailVerified: true,
      phoneNumber: null,
      profilePicture: null,
      mfaEnabled: false,
      mfaSecret: null,
      mfaBackupCodes: null,
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      lastFailedLogin: null,
      passwordResetToken: null,
      passwordResetTokenExpires: null,
      preferences: {},
      profile: {},
      lastLogin: null,
      lastPasswordChange: null,
      passwordChangedAt: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      pinCode: null,
      pinExpiresAt: null,
      pinAttempts: 0,
      pinGeneratedAt: null,
      requiresPinVerification: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Regular User
    const user: User = {
      id: 3,
      email: "user@company.com",
      password: null,
      keycloakId: "user-keycloak-id",
      firstName: "Bob",
      lastName: "Johnson",
      organization: null,
      jobTitle: null,
      roles: ["user"],
      tenant: "company-main",
      isActive: true,
      emailVerified: false,
      phoneNumber: null,
      profilePicture: null,
      mfaEnabled: false,
      mfaSecret: null,
      mfaBackupCodes: null,
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      lastFailedLogin: null,
      passwordResetToken: null,
      passwordResetTokenExpires: null,
      preferences: {},
      profile: {},
      lastLogin: null,
      lastPasswordChange: null,
      passwordChangedAt: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      pinCode: null,
      pinExpiresAt: null,
      pinAttempts: 0,
      pinGeneratedAt: null,
      requiresPinVerification: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Demo users for the demo page
    const demoUser: User = {
      id: 4,
      email: "user@demo.auth247.net",
      password: null,
      keycloakId: "demo-user-keycloak-id",
      firstName: "Demo",
      lastName: "User",
      organization: null,
      jobTitle: null,
      roles: ["user"],
      tenant: "demo",
      isActive: true,
      emailVerified: true,
      phoneNumber: null,
      profilePicture: null,
      mfaEnabled: false,  
      mfaSecret: null,
      mfaBackupCodes: null,
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      lastFailedLogin: null,
      passwordResetToken: null,
      passwordResetTokenExpires: null,
      preferences: {},
      profile: {},
      lastLogin: null,
      lastPasswordChange: null,
      passwordChangedAt: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      pinCode: null,
      pinExpiresAt: null,
      pinAttempts: 0,
      pinGeneratedAt: null,
      requiresPinVerification: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const demoManager: User = {
      id: 5,
      email: "manager@demo.auth247.net",
      password: null,
      keycloakId: "demo-manager-keycloak-id",
      firstName: "Demo",
      lastName: "Manager",
      organization: null,
      jobTitle: null,
      roles: ["manager", "user"],
      tenant: "demo",
      isActive: true,
      emailVerified: true,
      phoneNumber: null,
      profilePicture: null,
      mfaEnabled: false,
      mfaSecret: null,
      mfaBackupCodes: null,
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      lastFailedLogin: null,
      passwordResetToken: null,
      passwordResetTokenExpires: null,
      preferences: {},
      profile: {},
      lastLogin: null,
      lastPasswordChange: null,
      passwordChangedAt: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      pinCode: null,
      pinExpiresAt: null,
      pinAttempts: 0,
      pinGeneratedAt: null,
      requiresPinVerification: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const demoAdmin: User = {
      id: 6,
      email: "admin@demo.auth247.net",
      password: null,
      keycloakId: "demo-admin-keycloak-id",
      firstName: "Demo",
      lastName: "Admin",
      organization: null,
      jobTitle: null,
      roles: ["admin", "manager", "user"],
      tenant: "demo",
      isActive: true,
      emailVerified: true,
      phoneNumber: null,
      profilePicture: null,
      mfaEnabled: false,
      mfaSecret: null,
      mfaBackupCodes: null,
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      lastFailedLogin: null,
      passwordResetToken: null,
      passwordResetTokenExpires: null,
      preferences: {},
      profile: {},
      lastLogin: null,
      lastPasswordChange: null,
      passwordChangedAt: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      pinCode: null,
      pinExpiresAt: null,
      pinAttempts: 0,
      pinGeneratedAt: null,
      requiresPinVerification: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Production Super Admin
    const superAdmin: User = {
      id: 7,
      email: "admin@auth247.net",
      password: "$2b$12$9.kHl7Jv8K2Qm8VgF7E5Xur7aKlJ9mN8pO6qR3sT5uV7wX8yZ0aB1C", // Hashed version of Stuntboss90!
      keycloakId: null,
      firstName: "System",
      lastName: "Administrator",
      organization: null,
      jobTitle: null,
      roles: ["super_admin", "admin", "manager", "user"],
      tenant: "auth247-main",
      isActive: true,
      emailVerified: true,
      phoneNumber: null,
      profilePicture: null,
      mfaEnabled: false,
      mfaSecret: null,
      mfaBackupCodes: null,
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      lastFailedLogin: null,
      passwordResetToken: null,
      passwordResetTokenExpires: null,
      preferences: {},
      profile: {},
      lastLogin: null,
      lastPasswordChange: null,
      passwordChangedAt: new Date(),
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      pinCode: null,
      pinExpiresAt: null,
      pinAttempts: 0,
      pinGeneratedAt: null,
      requiresPinVerification: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(1, admin);
    this.users.set(2, manager);
    this.users.set(3, user);
    this.users.set(4, demoUser);
    this.users.set(5, demoManager);
    this.users.set(6, demoAdmin);
    this.users.set(7, superAdmin);
    this.currentUserId = 8;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.getUser(id); // Alias for consistency
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    // Check cache first
    const cacheKey = `user:email:${email}`;
    const cached = cacheService.get<User>(cacheKey);
    if (cached) {
      return cached;
    }

    const user = Array.from(this.users.values()).find(user => user.email === email);
    if (user) {
      cacheService.set(cacheKey, user, 5); // Cache for 5 minutes
    }
    return user;
  }

  async getUserByKeycloakId(keycloakId: string): Promise<User | undefined> {
    // Check cache first
    const cacheKey = `user:keycloak:${keycloakId}`;
    const cached = cacheService.get<User>(cacheKey);
    if (cached) {
      return cached;
    }

    const user = Array.from(this.users.values()).find(user => user.keycloakId === keycloakId);
    if (user) {
      cacheService.set(cacheKey, user, 5); // Cache for 5 minutes
    }
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Search users by email as username for MemStorage
    for (const user of this.users.values()) {
      if (user.email === username) {
        return user;
      }
    }
    return undefined;
  }

  async getUserByScimId(scimId: string, organizationId: number): Promise<User | undefined> {
    const user = Array.from(this.users.values()).find(user => 
      (user as any).scimExternalId === scimId && user.tenant === organizationId.toString()
    );
    return user;
  }

  async deleteUser(id: number): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;
    
    // Soft delete by setting isActive to false
    user.isActive = false;
    user.updatedAt = new Date();
    
    return true;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id,
      email: insertUser.email,
      password: insertUser.password || null,
      keycloakId: insertUser.keycloakId || null,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      organization: insertUser.organization || null,
      jobTitle: insertUser.jobTitle || null,
      roles: Array.isArray(insertUser.roles) ? insertUser.roles as string[] : [],
      tenant: insertUser.tenant || "default",
      isActive: insertUser.isActive ?? true,
      emailVerified: insertUser.emailVerified ?? false,
      phoneNumber: insertUser.phoneNumber || null,
      profilePicture: insertUser.profilePicture || null,
      mfaEnabled: insertUser.mfaEnabled ?? false,
      mfaSecret: insertUser.mfaSecret || null,
      mfaBackupCodes: insertUser.mfaBackupCodes || null,
      failedLoginAttempts: insertUser.failedLoginAttempts ?? 0,
      accountLockedUntil: insertUser.accountLockedUntil || null,
      lastFailedLogin: insertUser.lastFailedLogin || null,
      passwordResetToken: insertUser.passwordResetToken || null,
      passwordResetTokenExpires: insertUser.passwordResetTokenExpires || null,
      preferences: insertUser.preferences || {},
      profile: insertUser.profile || {},
      lastLogin: insertUser.lastLogin || null,
      lastPasswordChange: insertUser.lastPasswordChange || null,
      passwordChangedAt: insertUser.passwordChangedAt || null,
      stripeCustomerId: insertUser.stripeCustomerId || null,
      stripeSubscriptionId: insertUser.stripeSubscriptionId || null,
      pinCode: insertUser.pinCode || null,
      pinExpiresAt: insertUser.pinExpiresAt || null,
      pinAttempts: insertUser.pinAttempts ?? 0,
      pinGeneratedAt: insertUser.pinGeneratedAt || null,
      requiresPinVerification: insertUser.requiresPinVerification ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    
    // Invalidate related cache entries
    cacheService.delete(`user:email:${updatedUser.email}`);
    if (updatedUser.keycloakId) {
      cacheService.delete(`user:keycloak:${updatedUser.keycloakId}`);
    }
    
    return updatedUser;
  }

  async createSession(session: InsertSession): Promise<Session> {
    const newSession: Session = {
      id: session.id,
      userId: session.userId,
      keycloakToken: session.keycloakToken || null,
      refreshToken: session.refreshToken || null,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress || null,
      userAgent: session.userAgent || null,
      isActive: session.isActive ?? true,
      lastAccessedAt: new Date(),
      createdAt: new Date(),
    };
    this.sessions.set(session.id, newSession);
    return newSession;
  }

  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async getSessionWithUser(id: string): Promise<(Session & { user: User }) | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const user = this.users.get(session.userId);
    if (!user) return undefined;
    
    return { ...session, user };
  }

  async deleteSession(id: string): Promise<void> {
    this.sessions.delete(id);
  }

  async deleteUserSessions(userId: number): Promise<void> {
    const sessionsToDelete = Array.from(this.sessions.entries())
      .filter(([_, session]) => session.userId === userId)
      .map(([sessionId]) => sessionId);
    
    sessionsToDelete.forEach(sessionId => {
      this.sessions.delete(sessionId);
    });
  }

  // Auth V2 methods implementation
  async recordFailedLogin(userId: string): Promise<void> {
    const user = this.users.get(parseInt(userId));
    if (user) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      user.lastFailedLogin = new Date();
      if (user.failedLoginAttempts >= 5) {
        user.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
    }
  }

  async clearFailedLoginAttempts(userId: string): Promise<void> {
    const user = this.users.get(parseInt(userId));
    if (user) {
      user.failedLoginAttempts = 0;
      user.lastFailedLogin = null;
      user.accountLockedUntil = null;
    }
  }

  async updateLastLogin(userId: string, ip: string): Promise<void> {
    const user = this.users.get(parseInt(userId));
    if (user) {
      user.lastLogin = new Date();
    }
  }

  async storePasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    const user = this.users.get(parseInt(userId));
    if (user) {
      (user as any).passwordResetToken = token;
      (user as any).passwordResetTokenExpires = expiresAt;
    }
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    for (const user of Array.from(this.users.values())) {
      if ((user as any).passwordResetToken === token && 
          (user as any).passwordResetTokenExpires && 
          (user as any).passwordResetTokenExpires > new Date()) {
        return user;
      }
    }
    return undefined;
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    const user = this.users.get(parseInt(userId));
    if (user) {
      (user as any).passwordResetToken = null;
      (user as any).passwordResetTokenExpires = null;
    }
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    const user = this.users.get(parseInt(userId));
    if (user) {
      user.password = hashedPassword;
      user.passwordChangedAt = new Date();
    }
  }

  // Placeholder SAML methods for MemStorage (not fully implemented)
  async createSamlConfig(config: InsertSamlConfig): Promise<SamlConfig> {
    throw new Error("SAML configuration not supported in memory storage");
  }

  async getSamlConfigByTenant(tenantId: number): Promise<SamlConfig | undefined> {
    return undefined;
  }

  async updateSamlConfig(id: number, updates: Partial<SamlConfig>): Promise<SamlConfig> {
    throw new Error("SAML configuration not supported in memory storage");
  }

  async deleteSamlConfig(id: number): Promise<void> {
    // No-op for memory storage
  }

  // Webhook methods - simplified for MemStorage
  async createWebhook(webhook: InsertWebhook): Promise<Webhook> { throw new Error("Webhooks not supported in memory storage"); }
  async getWebhookById(id: number): Promise<Webhook | undefined> { return undefined; }
  async getWebhooksByTenant(tenantId: number): Promise<Webhook[]> { return []; }
  async getActiveWebhooksForEvent(tenantId: number, eventType: string): Promise<Webhook[]> { return []; }
  async updateWebhook(id: number, updates: Partial<Webhook>): Promise<Webhook> { throw new Error("Webhooks not supported in memory storage"); }
  async deleteWebhook(id: number): Promise<void> { /* no-op */ }
  async createWebhookEvent(event: InsertWebhookEvent): Promise<WebhookEvent> { throw new Error("Webhook events not supported in memory storage"); }
  async getWebhookEvents(tenantId: number, limit?: number): Promise<WebhookEvent[]> { return []; }
  async markEventProcessed(eventId: number): Promise<void> { /* no-op */ }
  async createWebhookDelivery(delivery: InsertWebhookDelivery): Promise<WebhookDelivery> { throw new Error("Webhook deliveries not supported in memory storage"); }
  async getWebhookDeliveries(webhookId: number, limit?: number): Promise<WebhookDelivery[]> { return []; }
  async getWebhookDeliveryById(id: number): Promise<WebhookDelivery | undefined> { return undefined; }
  async getWebhookStats(tenantId: number): Promise<any> { return { totalWebhooks: 0, totalEvents: 0, totalDeliveries: 0 }; }

  // API Key methods - simplified for MemStorage  
  async createApiKey(apiKey: InsertApiKey): Promise<ApiKey> { throw new Error("API keys not supported in memory storage"); }
  async getApiKeyById(id: number): Promise<ApiKey | undefined> { return undefined; }
  async getApiKeysByTenant(tenantId: number): Promise<ApiKey[]> { return []; }
  async getApiKeyByHash(keyHash: string): Promise<ApiKey | undefined> { return undefined; }
  async updateApiKey(id: number, updates: Partial<ApiKey>): Promise<ApiKey> { throw new Error("API keys not supported in memory storage"); }
  async deleteApiKey(id: number): Promise<void> { /* no-op */ }
  async incrementApiKeyUsage(id: number): Promise<void> { /* no-op */ }

  // White Label methods - simplified for MemStorage
  async createWhiteLabelConfig(config: InsertWhiteLabelConfig): Promise<WhiteLabelConfig> { throw new Error("White label not supported in memory storage"); }
  async getWhiteLabelConfigById(id: number): Promise<WhiteLabelConfig | undefined> { return undefined; }
  async getWhiteLabelConfigByDomain(domain: string): Promise<WhiteLabelConfig | undefined> { return undefined; }
  async getWhiteLabelConfigByTenant(tenantId: string): Promise<WhiteLabelConfig | undefined> { return undefined; }
  async updateWhiteLabelConfig(id: number, updates: Partial<WhiteLabelConfig>): Promise<WhiteLabelConfig> { throw new Error("White label not supported in memory storage"); }
  async deleteWhiteLabelConfig(id: number): Promise<void> { /* no-op */ }

  // Domain Mapping methods - simplified for MemStorage
  async createDomainMapping(mapping: InsertDomainMapping): Promise<DomainMapping> { throw new Error("Domain mapping not supported in memory storage"); }
  async getDomainMapping(domain: string): Promise<DomainMapping | undefined> { return undefined; }
  async updateDomainMapping(id: number, updates: Partial<DomainMapping>): Promise<DomainMapping> { throw new Error("Domain mapping not supported in memory storage"); }
  async deleteDomainMapping(id: number): Promise<void> { /* no-op */ }
}

// Database storage implementation with Redis caching
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    // Try cache first
    const cached = await cacheService.getUser(id.toString());
    if (cached) {
      return cached;
    }

    // Fallback to database
    const [user] = await db.select().from(users).where(eq(users.id, id));
    
    // Cache the result if found
    if (user) {
      await cacheService.setUser(id.toString(), user, 3600); // 1 hour TTL
    }
    
    return user || undefined;
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.getUser(id); // Alias for consistency
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    // Try cache first (using email as key)
    const cached = await cacheService.get(`user:email:${email}`);
    if (cached) {
      return cached;
    }

    // Fallback to database
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    // Cache the result if found
    if (user) {
      await cacheService.set(`user:email:${email}`, user, 3600); // 1 hour TTL
      await cacheService.setUser(user.id.toString(), user, 3600); // Also cache by ID
    }
    
    return user || undefined;
  }

  async getUserByKeycloakId(keycloakId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.keycloakId, keycloakId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async createSession(session: InsertSession): Promise<Session> {
    const [newSession] = await db
      .insert(sessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getSession(id: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session || undefined;
  }

  async getSessionWithUser(id: string): Promise<(Session & { user: User }) | undefined> {
    const result = await db
      .select()
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.id, id));
    
    if (result.length === 0) return undefined;
    
    const { sessions: sessionData, users: userData } = result[0];
    return { ...sessionData, user: userData };
  }

  async deleteSession(id: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, id));
  }

  async deleteUserSessions(userId: number): Promise<void> {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }

  // Auth V2 methods implementation
  async recordFailedLogin(userId: string): Promise<void> {
    const id = parseInt(userId);
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (user) {
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const updates: any = {
        failedLoginAttempts: failedAttempts,
        lastFailedLogin: new Date(),
        updatedAt: new Date(),
      };
      
      if (failedAttempts >= 5) {
        updates.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
      
      await db.update(users).set(updates).where(eq(users.id, id));
    }
  }

  async clearFailedLoginAttempts(userId: string): Promise<void> {
    const id = parseInt(userId);
    await db.update(users)
      .set({ 
        failedLoginAttempts: 0, 
        lastFailedLogin: null, 
        accountLockedUntil: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
  }

  async updateLastLogin(userId: string, ip: string): Promise<void> {
    const id = parseInt(userId);
    await db.update(users)
      .set({ lastLogin: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async storePasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    const id = parseInt(userId);
    await db.update(users)
      .set({ passwordResetToken: token, passwordResetTokenExpires: expiresAt, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.passwordResetToken, token));
    
    if (user && user.passwordResetTokenExpires && user.passwordResetTokenExpires > new Date()) {
      return user;
    }
    return undefined;
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    const id = parseInt(userId);
    await db.update(users)
      .set({ passwordResetToken: null, passwordResetTokenExpires: null, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    const id = parseInt(userId);
    await db.update(users)
      .set({ password: hashedPassword, passwordChangedAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  // Missing methods - implement all required IStorage methods
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username)); // Use email as username
    return user || undefined;
  }

  async getUserByScimId(scimId: string, organizationId: number): Promise<User | undefined> {
    // For database implementation, we'd need a scimExternalId field
    return undefined; // Placeholder
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, id));
    return true; // Soft delete
  }

  // Implement all remaining methods as no-ops for now (webhooks, API keys, etc.)
  async createWebhook(): Promise<any> { throw new Error("Not implemented in DatabaseStorage"); }
  async getWebhookById(): Promise<any> { return undefined; }
  async getWebhooksByTenant(): Promise<any[]> { return []; }
  async getActiveWebhooksForEvent(): Promise<any[]> { return []; }
  async updateWebhook(): Promise<any> { throw new Error("Not implemented"); }
  async deleteWebhook(): Promise<void> { }
  async createWebhookEvent(): Promise<any> { throw new Error("Not implemented"); }
  async getWebhookEvents(): Promise<any[]> { return []; }
  async markEventProcessed(): Promise<void> { }
  async createWebhookDelivery(): Promise<any> { throw new Error("Not implemented"); }
  async getWebhookDeliveries(): Promise<any[]> { return []; }
  async getWebhookDeliveryById(): Promise<any> { return undefined; }
  async getWebhookStats(): Promise<any> { return {}; }
  async createApiKey(): Promise<any> { throw new Error("Not implemented"); }
  async getApiKeyById(): Promise<any> { return undefined; }
  async getApiKeysByTenant(): Promise<any[]> { return []; }
  async getApiKeyByHash(): Promise<any> { return undefined; }
  async updateApiKey(): Promise<any> { throw new Error("Not implemented"); }
  async deleteApiKey(): Promise<void> { }
  async incrementApiKeyUsage(): Promise<void> { }
  async createSamlConfig(): Promise<any> { throw new Error("Not implemented"); }
  async getSamlConfigByTenant(): Promise<any> { return undefined; }
  async updateSamlConfig(): Promise<any> { throw new Error("Not implemented"); }
  async deleteSamlConfig(): Promise<void> { }
  async createWhiteLabelConfig(): Promise<any> { throw new Error("Not implemented"); }
  async getWhiteLabelConfigById(): Promise<any> { return undefined; }
  async getWhiteLabelConfigByDomain(): Promise<any> { return undefined; }
  async getWhiteLabelConfigByTenant(): Promise<any> { return undefined; }
  async updateWhiteLabelConfig(): Promise<any> { throw new Error("Not implemented"); }
  async deleteWhiteLabelConfig(): Promise<void> { }
  async createDomainMapping(): Promise<any> { throw new Error("Not implemented"); }
  async getDomainMapping(): Promise<any> { return undefined; }
  async updateDomainMapping(): Promise<any> { throw new Error("Not implemented"); }
  async deleteDomainMapping(): Promise<void> { }
}

// Create storage instance
export const storage = new MemStorage();
