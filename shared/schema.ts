import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password"), // For local authentication
  keycloakId: text("keycloak_id").unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  organization: text("organization"),
  jobTitle: text("job_title"),
  roles: jsonb("roles").$type<string[]>().notNull().default([]),
  tenant: text("tenant").notNull().default("default"),
  isActive: boolean("is_active").notNull().default(true),
  emailVerified: boolean("email_verified").notNull().default(false),
  phoneNumber: text("phone_number"),
  profilePicture: text("profile_picture"),
  
  // MFA fields for enterprise security
  mfaEnabled: boolean("mfa_enabled").notNull().default(false),
  mfaSecret: text("mfa_secret"),
  mfaBackupCodes: jsonb("mfa_backup_codes").$type<string[]>(),
  
  // Security tracking
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  accountLockedUntil: timestamp("account_locked_until"),
  lastFailedLogin: timestamp("last_failed_login"),
  
  // Password reset fields
  passwordResetToken: text("password_reset_token"),
  passwordResetTokenExpires: timestamp("password_reset_token_expires"),
  
  // User preferences and profile
  preferences: jsonb("preferences").$type<Record<string, any>>().default({}),
  profile: jsonb("profile").$type<Record<string, any>>().default({}),
  lastLogin: timestamp("last_login"),
  lastPasswordChange: timestamp("last_password_change"),
  passwordChangedAt: timestamp("password_changed_at"),
  
  // Subscription integration
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  
  // Email PIN verification fields
  pinCode: text("pin_code"),
  pinExpiresAt: timestamp("pin_expires_at"),
  pinAttempts: integer("pin_attempts").default(0),
  pinGeneratedAt: timestamp("pin_generated_at"),
  requiresPinVerification: boolean("requires_pin_verification").default(false),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  tenantIdx: index("users_tenant_idx").on(table.tenant),
  keycloakIdx: index("users_keycloak_idx").on(table.keycloakId),
  // Composite indexes for common query patterns
  emailTenantIdx: index("users_email_tenant_idx").on(table.email, table.tenant),
  activeUsersIdx: index("users_active_idx").on(table.isActive, table.tenant),
  lastLoginIdx: index("users_last_login_idx").on(table.lastLogin),
  failedAttemptsIdx: index("users_failed_attempts_idx").on(table.failedLoginAttempts, table.accountLockedUntil),
  rolesTenantIdx: index("users_roles_tenant_idx").on(table.tenant, table.isActive),
}));

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  keycloakToken: text("keycloak_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastAccessedAt: timestamp("last_accessed_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("sessions_user_id_idx").on(table.userId),
  expiresAtIdx: index("sessions_expires_at_idx").on(table.expiresAt),
  // Composite indexes for session optimization
  activeSessionsIdx: index("sessions_active_idx").on(table.isActive, table.expiresAt),
  userActiveSessionsIdx: index("sessions_user_active_idx").on(table.userId, table.isActive, table.expiresAt),
  lastAccessedIdx: index("sessions_last_accessed_idx").on(table.lastAccessedAt),
}));

// Tenants/Organizations table
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  domain: text("domain").unique(),
  subdomain: text("subdomain").unique(),
  settings: jsonb("settings").$type<Record<string, any>>().default({}),
  subscriptionId: integer("subscription_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  domainIdx: index("tenants_domain_idx").on(table.domain),
  subdomainIdx: index("tenants_subdomain_idx").on(table.subdomain),
}));

// MAU-based pricing configuration
export const pricingConfig = pgTable("pricing_config", {
  id: serial("id").primaryKey(),
  pricePerUser: decimal("price_per_user", { precision: 10, scale: 2 }).notNull().default("0.89"),
  platformMaintenanceFee: decimal("platform_maintenance_fee", { precision: 10, scale: 2 }).notNull().default("1.99"),
  currency: text("currency").notNull().default("USD"),
  billingModel: text("billing_model").notNull().default("mau"), // mau (Monthly Active Users) or total
  mauThresholdDays: integer("mau_threshold_days").notNull().default(30), // Days to consider for MAU calculation
  trialDays: integer("trial_days").notNull().default(14),
  annualDiscountPercent: integer("annual_discount_percent").notNull().default(15),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// MAU-based subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tenantId: integer("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("active"), // active, canceled, expired, trial
  lastMauCount: integer("last_mau_count").notNull().default(0), // Last calculated MAU
  pricePerUser: decimal("price_per_user", { precision: 10, scale: 2 }).notNull().default("0.89"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  billingInterval: text("billing_interval").notNull().default("monthly"), // monthly, yearly
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  trialEnd: timestamp("trial_end"),
  trialUsed: boolean("trial_used").notNull().default(false),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripeCustomerId: text("stripe_customer_id"),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("subscriptions_user_id_idx").on(table.userId),
  tenantIdIdx: index("subscriptions_tenant_id_idx").on(table.tenantId),
  statusIdx: index("subscriptions_status_idx").on(table.status),
  stripeSubIdx: index("subscriptions_stripe_sub_idx").on(table.stripeSubscriptionId),
}));

// MAU (Monthly Active Users) tracking
export const userActivity = pgTable("user_activity", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  activityType: text("activity_type").notNull(), // login, api_call, session_renewal, etc.
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
}, (table) => ({
  userIdIdx: index("user_activity_user_id_idx").on(table.userId),
  tenantIdIdx: index("user_activity_tenant_id_idx").on(table.tenantId),
  timestampIdx: index("user_activity_timestamp_idx").on(table.timestamp),
  userTenantTimeIdx: index("user_activity_user_tenant_time_idx").on(table.userId, table.tenantId, table.timestamp),
}));

// MAU calculation snapshots
export const mauSnapshots = pgTable("mau_snapshots", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  mauCount: integer("mau_count").notNull(),
  calculationPeriodStart: timestamp("calculation_period_start").notNull(),
  calculationPeriodEnd: timestamp("calculation_period_end").notNull(),
  billingPeriod: text("billing_period").notNull(), // YYYY-MM format
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index("mau_snapshots_tenant_idx").on(table.tenantId),
  billingPeriodIdx: index("mau_snapshots_billing_period_idx").on(table.billingPeriod),
  tenantBillingIdx: index("mau_snapshots_tenant_billing_idx").on(table.tenantId, table.billingPeriod),
}));

// Usage tracking (legacy - keeping for other metrics)
export const usageMetrics = pgTable("usage_metrics", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  metricType: text("metric_type").notNull(), // api_calls, storage, etc. (excluding users - now tracked separately)
  value: integer("value").notNull().default(0),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  tenantMetricIdx: index("usage_metrics_tenant_metric_idx").on(table.tenantId, table.metricType),
  periodIdx: index("usage_metrics_period_idx").on(table.periodStart, table.periodEnd),
}));

// Audit logs
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: text("resource_id"),
  details: jsonb("details").$type<Record<string, any>>().default({}),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("audit_logs_user_id_idx").on(table.userId),
  tenantIdIdx: index("audit_logs_tenant_id_idx").on(table.tenantId),
  actionIdx: index("audit_logs_action_idx").on(table.action),
  createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
}));

// Enhanced subscription system tables
export const emailNotifications = pgTable("email_notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  subject: text("subject").notNull(),
  templateData: jsonb("template_data").$type<Record<string, any>>().default({}),
  sentAt: timestamp("sent_at"),
  status: text("status").notNull().default("pending"), // pending, sent, failed, delivered
  brevoMessageId: text("brevo_message_id"),
  error: text("error"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("email_notifications_user_id_idx").on(table.userId),
  statusIdx: index("email_notifications_status_idx").on(table.status),
  typeIdx: index("email_notifications_type_idx").on(table.type),
}));

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message"),
  actionUrl: text("action_url"),
  isRead: boolean("is_read").notNull().default(false),
  priority: text("priority").notNull().default("normal"), // low, normal, high, urgent
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("notifications_user_id_idx").on(table.userId),
  isReadIdx: index("notifications_is_read_idx").on(table.isRead),
  priorityIdx: index("notifications_priority_idx").on(table.priority),
}));

export const aiUsageLogs = pgTable("ai_usage_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  serviceType: text("service_type").notNull(),
  requestType: text("request_type"),
  tokensUsed: integer("tokens_used").notNull().default(0),
  cost: decimal("cost", { precision: 10, scale: 4 }).notNull().default("0.0000"),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("ai_usage_logs_user_id_idx").on(table.userId),
  tenantIdIdx: index("ai_usage_logs_tenant_id_idx").on(table.tenantId),
  serviceTypeIdx: index("ai_usage_logs_service_type_idx").on(table.serviceType),
  createdAtIdx: index("ai_usage_logs_created_at_idx").on(table.createdAt),
}));

export const billingTransactions = pgTable("billing_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("usd"),
  status: text("status").notNull(),
  description: text("description"),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("billing_transactions_user_id_idx").on(table.userId),
  tenantIdIdx: index("billing_transactions_tenant_id_idx").on(table.tenantId),
  statusIdx: index("billing_transactions_status_idx").on(table.status),
  stripePaymentIntentIdx: index("billing_transactions_stripe_payment_intent_idx").on(table.stripePaymentIntentId),
}));

export const commissionTracking = pgTable("commission_tracking", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => users.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  bookingId: integer("booking_id"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, cancelled
  paidAt: timestamp("paid_at"),
  stripeTransferId: text("stripe_transfer_id"),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  providerIdIdx: index("commission_tracking_provider_id_idx").on(table.providerId),
  tenantIdIdx: index("commission_tracking_tenant_id_idx").on(table.tenantId),
  statusIdx: index("commission_tracking_status_idx").on(table.status),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  createdAt: true,
  lastAccessedAt: true,
});

export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPricingConfigSchema = createInsertSchema(pricingConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUsageMetricSchema = createInsertSchema(usageMetrics).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertEmailNotificationSchema = createInsertSchema(emailNotifications).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertAiUsageLogSchema = createInsertSchema(aiUsageLogs).omit({
  id: true,
  createdAt: true,
});

export const insertBillingTransactionSchema = createInsertSchema(billingTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertCommissionTrackingSchema = createInsertSchema(commissionTracking).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenants.$inferSelect;
export type InsertPricingConfig = z.infer<typeof insertPricingConfigSchema>;
export type PricingConfig = typeof pricingConfig.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertUsageMetric = z.infer<typeof insertUsageMetricSchema>;
export type UsageMetric = typeof usageMetrics.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertEmailNotification = z.infer<typeof insertEmailNotificationSchema>;
export type EmailNotification = typeof emailNotifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertAiUsageLog = z.infer<typeof insertAiUsageLogSchema>;
export type AiUsageLog = typeof aiUsageLogs.$inferSelect;
export type InsertBillingTransaction = z.infer<typeof insertBillingTransactionSchema>;
export type BillingTransaction = typeof billingTransactions.$inferSelect;
export type InsertCommissionTracking = z.infer<typeof insertCommissionTrackingSchema>;
export type CommissionTracking = typeof commissionTracking.$inferSelect;

// Webhook Tables
export const webhooks = pgTable("webhooks", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  events: text("events").array().notNull().default([]),
  secret: text("secret").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  retryCount: integer("retry_count").notNull().default(3),
  headers: jsonb("headers").$type<Record<string, string>>().default({}),
  lastTriggeredAt: timestamp("last_triggered_at"),
  lastSuccessAt: timestamp("last_success_at"),
  lastFailureAt: timestamp("last_failure_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const webhookDeliveries = pgTable("webhook_deliveries", {
  id: serial("id").primaryKey(),
  webhookId: integer("webhook_id").notNull().references(() => webhooks.id, { onDelete: "cascade" }),
  eventId: text("event_id").notNull(),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  responseStatus: integer("response_status"),
  responseBody: text("response_body"),
  attempts: integer("attempts").notNull().default(1),
  success: boolean("success").notNull().default(false),
  nextRetryAt: timestamp("next_retry_at"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const webhookEvents = pgTable("webhook_events", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  resourceId: text("resource_id").notNull(),
  resourceType: text("resource_type").notNull(),
  data: jsonb("data").notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  processed: boolean("processed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// SAML Configuration Table
export const samlConfigs = pgTable("saml_configs", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  entityId: text("entity_id").notNull(),
  ssoUrl: text("sso_url").notNull(),
  sloUrl: text("slo_url"),
  certificate: text("certificate").notNull(),
  privateKey: text("private_key"),
  nameIdFormat: text("name_id_format").notNull().default("urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"),
  attributeMapping: jsonb("attribute_mapping").$type<Record<string, string>>().default({}),
  isActive: boolean("is_active").notNull().default(true),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// API Keys Table for SDK Authentication
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(),
  keyPrefix: text("key_prefix").notNull(),
  permissions: text("permissions").array().notNull().default([]),
  environment: text("environment").notNull().default("production"), // production, development
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  requestCount: integer("request_count").notNull().default(0),
  rateLimitPerHour: integer("rate_limit_per_hour").notNull().default(1000),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert Schemas
export const insertWebhookSchema = createInsertSchema(webhooks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWebhookDeliverySchema = createInsertSchema(webhookDeliveries).omit({
  id: true,
  createdAt: true,
});

export const insertWebhookEventSchema = createInsertSchema(webhookEvents).omit({
  id: true,
  createdAt: true,
});

export const insertSamlConfigSchema = createInsertSchema(samlConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertWebhook = z.infer<typeof insertWebhookSchema>;
export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhookDelivery = z.infer<typeof insertWebhookDeliverySchema>;
export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;
export type InsertWebhookEvent = z.infer<typeof insertWebhookEventSchema>;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertSamlConfig = z.infer<typeof insertSamlConfigSchema>;
export type SamlConfig = typeof samlConfigs.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;

// White Label Configuration Tables
export const whiteLabelConfigs = pgTable("white_label_configs", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  domain: text("domain").notNull().unique(),
  
  // Branding settings
  primaryColor: text("primary_color").notNull().default("#2563eb"),
  secondaryColor: text("secondary_color").notNull().default("#3b82f6"),
  backgroundColor: text("background_color").notNull().default("#ffffff"),
  textColor: text("text_color").notNull().default("#1f2937"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  companyName: text("company_name").notNull(),
  tagline: text("tagline"),
  footerText: text("footer_text"),
  
  // Domain settings
  customDomain: text("custom_domain").notNull(),
  sslEnabled: boolean("ssl_enabled").notNull().default(true),
  domainVerified: boolean("domain_verified").notNull().default(false),
  verificationToken: text("verification_token"),
  
  // Advanced customization
  customCSS: text("custom_css"),
  customJS: text("custom_js"),
  emailTemplates: jsonb("email_templates").$type<Record<string, any>>().default({}),
  
  // Revenue sharing
  revenueShareEnabled: boolean("revenue_share_enabled").notNull().default(false),
  revenueSharePercentage: decimal("revenue_share_percentage", { precision: 5, scale: 2 }).default("0.00"),
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  domainIdx: index("white_label_domain_idx").on(table.domain),
  tenantIdx: index("white_label_tenant_idx").on(table.tenantId),
  customDomainIdx: index("white_label_custom_domain_idx").on(table.customDomain),
}));

export const domainMappings = pgTable("domain_mappings", {
  id: serial("id").primaryKey(),
  domain: text("domain").notNull().unique(),
  tenantId: text("tenant_id").notNull(),
  whiteLabelConfigId: integer("white_label_config_id").references(() => whiteLabelConfigs.id, { onDelete: "cascade" }),
  
  // DNS configuration
  dnsRecords: jsonb("dns_records").$type<Record<string, any>>().default({}),
  sslCertificate: text("ssl_certificate"),
  sslStatus: text("ssl_status").notNull().default("pending"), // pending, active, expired, error
  
  // Verification
  verificationStatus: text("verification_status").notNull().default("pending"), // pending, verified, failed
  lastVerificationAttempt: timestamp("last_verification_attempt"),
  verificationToken: text("verification_token"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  domainIdx: index("domain_mappings_domain_idx").on(table.domain),
  tenantIdx: index("domain_mappings_tenant_idx").on(table.tenantId),
}));

// Schemas for white label
export const insertWhiteLabelConfigSchema = createInsertSchema(whiteLabelConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDomainMappingSchema = createInsertSchema(domainMappings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for white label
export type InsertWhiteLabelConfig = z.infer<typeof insertWhiteLabelConfigSchema>;
export type WhiteLabelConfig = typeof whiteLabelConfigs.$inferSelect;
export type InsertDomainMapping = z.infer<typeof insertDomainMappingSchema>;
export type DomainMapping = typeof domainMappings.$inferSelect;
