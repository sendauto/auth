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
    const admin: User = { // @ts-ignore - TODO: Add missing passwordResetToken fields
      id: 1,
      email: "john.doe@company.com",
      password: null,
      keycloakId: "admin-keycloak-id",
      firstName: "John",
      lastName: "Doe",
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Manager
    const manager: User = { // @ts-ignore - TODO: Add missing passwordResetToken fields
      id: 2,
      email: "manager@company.com",
      password: null,
      keycloakId: "manager-keycloak-id",
      firstName: "Jane",
      lastName: "Smith",
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
      preferences: {},
      profile: {},
      lastLogin: null,
      lastPasswordChange: null,
      passwordChangedAt: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Regular User
    const user: User = { // @ts-ignore - TODO: Add missing passwordResetToken fields
      id: 3,
      email: "user@company.com",
      password: null,
      keycloakId: "user-keycloak-id",
      firstName: "Bob",
      lastName: "Johnson",
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
      preferences: {},
      profile: {},
      lastLogin: null,
      lastPasswordChange: null,
      passwordChangedAt: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
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
      preferences: {},
      profile: {},
      lastLogin: null,
      lastPasswordChange: null,
      passwordChangedAt: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
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
      preferences: {},
      profile: {},
      lastLogin: null,
      lastPasswordChange: null,
      passwordChangedAt: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
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
      preferences: {},
      profile: {},
      lastLogin: null,
      lastPasswordChange: null,
      passwordChangedAt: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
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
      preferences: {},
      profile: {},
      lastLogin: null,
      lastPasswordChange: null,
      passwordChangedAt: new Date(),
      stripeCustomerId: null,
      stripeSubscriptionId: null,
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
    const user = Array.from(this.users.values()).find(user => (user as any).username === username);
    return user;
  }

  async getUserByScimId(scimId: string, organizationId: number): Promise<User | undefined> {
    const user = Array.from(this.users.values()).find(user => 
      (user as any).scimExternalId === scimId && user.tenant === organizationId
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
      preferences: insertUser.preferences || {},
      profile: insertUser.profile || {},
      lastLogin: insertUser.lastLogin || null,
      lastPasswordChange: insertUser.lastPasswordChange || null,
      passwordChangedAt: insertUser.passwordChangedAt || null,
      stripeCustomerId: insertUser.stripeCustomerId || null,
      stripeSubscriptionId: insertUser.stripeSubscriptionId || null,
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
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  async updateLastLogin(userId: string, ip: string): Promise<void> {
    const id = parseInt(userId);
    await db.update(users)
      .set({
        lastLogin: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  async storePasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    const id = parseInt(userId);
    await db.update(users)
      .set({
        passwordResetToken: token,
        passwordResetTokenExpires: expiresAt,
        updatedAt: new Date(),
      })
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
      .set({
        passwordResetToken: null,
        passwordResetTokenExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    const id = parseInt(userId);
    await db.update(users)
      .set({
        password: hashedPassword,
        passwordChangedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  // Webhook operations
  async createWebhook(webhook: InsertWebhook): Promise<Webhook> {
    const [result] = await db.insert(webhooks).values(webhook).returning();
    return result;
  }

  async getWebhookById(id: number): Promise<Webhook | undefined> {
    const [webhook] = await db.select().from(webhooks).where(eq(webhooks.id, id));
    return webhook;
  }

  async getWebhooksByTenant(tenantId: number): Promise<Webhook[]> {
    return await db.select().from(webhooks).where(eq(webhooks.tenantId, tenantId));
  }

  async getActiveWebhooksForEvent(tenantId: number, eventType: string): Promise<Webhook[]> {
    return await db.select()
      .from(webhooks)
      .where(and(
        eq(webhooks.tenantId, tenantId),
        eq(webhooks.isActive, true)
      ));
  }

  async updateWebhook(id: number, updates: Partial<Webhook>): Promise<Webhook> {
    const [result] = await db.update(webhooks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(webhooks.id, id))
      .returning();
    return result;
  }

  async deleteWebhook(id: number): Promise<void> {
    await db.delete(webhooks).where(eq(webhooks.id, id));
  }

  // Webhook event operations
  async createWebhookEvent(event: InsertWebhookEvent): Promise<WebhookEvent> {
    const [result] = await db.insert(webhookEvents).values(event).returning();
    return result;
  }

  async getWebhookEvents(tenantId: number, limit: number = 50): Promise<WebhookEvent[]> {
    return await db.select()
      .from(webhookEvents)
      .where(eq(webhookEvents.tenantId, tenantId))
      .orderBy(desc(webhookEvents.createdAt))
      .limit(limit);
  }

  async markEventProcessed(eventId: number): Promise<void> {
    await db.update(webhookEvents)
      .set({ processed: true })
      .where(eq(webhookEvents.id, eventId));
  }

  // Webhook delivery operations
  async createWebhookDelivery(delivery: InsertWebhookDelivery): Promise<WebhookDelivery> {
    const [result] = await db.insert(webhookDeliveries).values(delivery).returning();
    return result;
  }

  async getWebhookDeliveries(webhookId: number, limit: number = 50): Promise<WebhookDelivery[]> {
    return await db.select()
      .from(webhookDeliveries)
      .where(eq(webhookDeliveries.webhookId, webhookId))
      .orderBy(desc(webhookDeliveries.createdAt))
      .limit(limit);
  }

  async getWebhookDeliveryById(id: number): Promise<WebhookDelivery | undefined> {
    const [delivery] = await db.select().from(webhookDeliveries).where(eq(webhookDeliveries.id, id));
    return delivery;
  }

  async getWebhookStats(tenantId: number): Promise<any> {
    const totalWebhooksQuery = db.select({ count: count() })
      .from(webhooks)
      .where(eq(webhooks.tenantId, tenantId));

    const activeWebhooksQuery = db.select({ count: count() })
      .from(webhooks)
      .where(and(eq(webhooks.tenantId, tenantId), eq(webhooks.isActive, true)));

    const totalDeliveriesQuery = db.select({ count: count() })
      .from(webhookDeliveries)
      .innerJoin(webhooks, eq(webhookDeliveries.webhookId, webhooks.id))
      .where(eq(webhooks.tenantId, tenantId));

    const successfulDeliveriesQuery = db.select({ count: count() })
      .from(webhookDeliveries)
      .innerJoin(webhooks, eq(webhookDeliveries.webhookId, webhooks.id))
      .where(and(eq(webhooks.tenantId, tenantId), eq(webhookDeliveries.success, true)));

    const [totalWebhooks, activeWebhooks, totalDeliveries, successfulDeliveries] = await Promise.all([
      totalWebhooksQuery,
      activeWebhooksQuery,
      totalDeliveriesQuery,
      successfulDeliveriesQuery
    ]);

    return {
      totalWebhooks: totalWebhooks[0]?.count || 0,
      activeWebhooks: activeWebhooks[0]?.count || 0,
      totalDeliveries: totalDeliveries[0]?.count || 0,
      successfulDeliveries: successfulDeliveries[0]?.count || 0,
      failedDeliveries: (totalDeliveries[0]?.count || 0) - (successfulDeliveries[0]?.count || 0)
    };
  }

  // API Key operations
  async createApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const [result] = await db.insert(apiKeys).values(apiKey).returning();
    return result;
  }

  async getApiKeyById(id: number): Promise<ApiKey | undefined> {
    const [key] = await db.select().from(apiKeys).where(eq(apiKeys.id, id));
    return key;
  }

  async getApiKeysByTenant(tenantId: number): Promise<ApiKey[]> {
    return await db.select().from(apiKeys).where(eq(apiKeys.tenantId, tenantId));
  }

  async getApiKeyByHash(keyHash: string): Promise<ApiKey | undefined> {
    const [key] = await db.select().from(apiKeys).where(eq(apiKeys.keyHash, keyHash));
    return key;
  }

  async updateApiKey(id: number, updates: Partial<ApiKey>): Promise<ApiKey> {
    const [result] = await db.update(apiKeys)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(apiKeys.id, id))
      .returning();
    return result;
  }

  async deleteApiKey(id: number): Promise<void> {
    await db.delete(apiKeys).where(eq(apiKeys.id, id));
  }

  async incrementApiKeyUsage(id: number): Promise<void> {
    await db.update(apiKeys)
      .set({ 
        requestCount: db.select({ count: apiKeys.requestCount }).from(apiKeys).where(eq(apiKeys.id, id)).then(r => (r[0]?.count || 0) + 1),
        lastUsedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(apiKeys.id, id));
  }

  // SAML Configuration operations
  async createSamlConfig(config: InsertSamlConfig): Promise<SamlConfig> {
    const [result] = await db.insert(samlConfigs).values(config).returning();
    return result;
  }

  async getSamlConfigByTenant(tenantId: number): Promise<SamlConfig | undefined> {
    const [config] = await db.select()
      .from(samlConfigs)
      .where(and(eq(samlConfigs.tenantId, tenantId), eq(samlConfigs.isActive, true)));
    return config;
  }

  async updateSamlConfig(id: number, updates: Partial<SamlConfig>): Promise<SamlConfig> {
    const [result] = await db.update(samlConfigs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(samlConfigs.id, id))
      .returning();
    return result;
  }

  async deleteSamlConfig(id: number): Promise<void> {
    await db.delete(samlConfigs).where(eq(samlConfigs.id, id));
  }

  // White Label Configuration operations
  async createWhiteLabelConfig(config: InsertWhiteLabelConfig): Promise<WhiteLabelConfig> {
    const [result] = await db.insert(whiteLabelConfigs).values(config).returning();
    return result;
  }

  async getWhiteLabelConfigById(id: number): Promise<WhiteLabelConfig | undefined> {
    const [config] = await db.select()
      .from(whiteLabelConfigs)
      .where(eq(whiteLabelConfigs.id, id));
    return config;
  }

  async getWhiteLabelConfigByDomain(domain: string): Promise<WhiteLabelConfig | undefined> {
    const [config] = await db.select()
      .from(whiteLabelConfigs)
      .where(and(
        eq(whiteLabelConfigs.domain, domain),
        eq(whiteLabelConfigs.isActive, true)
      ));
    return config;
  }

  async getWhiteLabelConfigByTenant(tenantId: string): Promise<WhiteLabelConfig | undefined> {
    const [config] = await db.select()
      .from(whiteLabelConfigs)
      .where(and(
        eq(whiteLabelConfigs.tenantId, tenantId),
        eq(whiteLabelConfigs.isActive, true)
      ));
    return config;
  }

  async updateWhiteLabelConfig(id: number, updates: Partial<WhiteLabelConfig>): Promise<WhiteLabelConfig> {
    const [result] = await db.update(whiteLabelConfigs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(whiteLabelConfigs.id, id))
      .returning();
    return result;
  }

  async deleteWhiteLabelConfig(id: number): Promise<void> {
    await db.delete(whiteLabelConfigs).where(eq(whiteLabelConfigs.id, id));
  }

  // Domain Mapping operations
  async createDomainMapping(mapping: InsertDomainMapping): Promise<DomainMapping> {
    const [result] = await db.insert(domainMappings).values(mapping).returning();
    return result;
  }

  async getDomainMapping(domain: string): Promise<DomainMapping | undefined> {
    const [mapping] = await db.select()
      .from(domainMappings)
      .where(eq(domainMappings.domain, domain));
    return mapping;
  }

  async updateDomainMapping(id: number, updates: Partial<DomainMapping>): Promise<DomainMapping> {
    const [result] = await db.update(domainMappings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(domainMappings.id, id))
      .returning();
    return result;
  }

  async deleteDomainMapping(id: number): Promise<void> {
    await db.delete(domainMappings).where(eq(domainMappings.id, id));
  }
}

// Use database storage in production, memory storage for development
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
