/**
 * Project-Specific Configuration System
 * Supports different credentials for different projects/domains
 */

export interface ProjectConfig {
  name: string;
  domain: string;
  // OAuth Providers
  google?: {
    clientID: string;
    clientSecret: string;
  };
  github?: {
    clientID: string;
    clientSecret: string;
  };
  microsoft?: {
    clientID: string;
    clientSecret: string;
  };
  // Email Services
  brevo?: {
    apiKey: string;
    senderEmail: string;
    senderName: string;
  };
  sendgrid?: {
    apiKey: string;
    senderEmail: string;
    senderName: string;
  };
  // Payment Services
  stripe?: {
    secretKey: string;
    publicKey: string;
    webhookSecret: string;
  };
  // Database
  database?: {
    url: string;
  };
  // Session
  session?: {
    secret: string;
  };
  // Keycloak
  keycloak?: {
    url: string;
    realm: string;
    clientId: string;
    clientSecret: string;
  };
}

// Project configurations
const PROJECT_CONFIGS: ProjectConfig[] = [
  {
    name: 'Auth247-Main',
    domain: 'auth247.net',
    google: {
      clientID: process.env.GOOGLE_CLIENT_ID_AUTH247 || process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET_AUTH247 || process.env.GOOGLE_CLIENT_SECRET || ''
    },
    github: {
      clientID: process.env.GITHUB_CLIENT_ID_AUTH247 || process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET_AUTH247 || process.env.GITHUB_CLIENT_SECRET || ''
    },
    microsoft: {
      clientID: process.env.MICROSOFT_CLIENT_ID_AUTH247 || process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET_AUTH247 || process.env.MICROSOFT_CLIENT_SECRET || ''
    },
    brevo: {
      apiKey: process.env.BREVO_API_KEY_AUTH247 || process.env.BREVO_API_KEY || '',
      senderEmail: process.env.BREVO_SENDER_EMAIL_AUTH247 || process.env.BREVO_SENDER_EMAIL || 'noreply@auth247.net',
      senderName: process.env.BREVO_SENDER_NAME_AUTH247 || process.env.BREVO_SENDER_NAME || 'Auth247'
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY_AUTH247 || process.env.SENDGRID_API_KEY || '',
      senderEmail: process.env.SENDGRID_SENDER_EMAIL_AUTH247 || process.env.SENDGRID_SENDER_EMAIL || 'noreply@auth247.net',
      senderName: process.env.SENDGRID_SENDER_NAME_AUTH247 || process.env.SENDGRID_SENDER_NAME || 'Auth247'
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY_AUTH247 || process.env.STRIPE_SECRET_KEY || '',
      publicKey: process.env.STRIPE_PUBLIC_KEY_AUTH247 || process.env.STRIPE_PUBLIC_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET_AUTH247 || process.env.STRIPE_WEBHOOK_SECRET || ''
    },
    database: {
      url: process.env.DATABASE_URL_AUTH247 || process.env.DATABASE_URL || ''
    },
    session: {
      secret: process.env.SESSION_SECRET_AUTH247 || process.env.SESSION_SECRET || ''
    },
    keycloak: {
      url: process.env.KEYCLOAK_URL_AUTH247 || process.env.KEYCLOAK_URL || '',
      realm: process.env.KEYCLOAK_REALM_AUTH247 || process.env.KEYCLOAK_REALM || '',
      clientId: process.env.KEYCLOAK_CLIENT_ID_AUTH247 || process.env.KEYCLOAK_CLIENT_ID || '',
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET_AUTH247 || process.env.KEYCLOAK_CLIENT_SECRET || ''
    }
  }
  // Add more projects here:
  // {
  //   name: 'MyCompany-Auth',
  //   domain: 'mycompany.com',
  //   google: {
  //     clientID: process.env.GOOGLE_CLIENT_ID_MYCOMPANY,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET_MYCOMPANY
  //   },
  //   brevo: {
  //     apiKey: process.env.BREVO_API_KEY_MYCOMPANY,
  //     senderEmail: 'noreply@mycompany.com',
  //     senderName: 'MyCompany Auth'
  //   }
  // }
];

/**
 * Get project configuration for current domain
 */
export function getProjectConfig(domain?: string): ProjectConfig {
  const currentDomain = domain || 
    process.env.REPLIT_DOMAINS?.split(',')[0] || 
    process.env.REPL_SLUG || 
    'auth247.net';
  
  // Find matching project by domain
  const project = PROJECT_CONFIGS.find(p => 
    currentDomain.includes(p.domain) || 
    p.domain.includes(currentDomain) ||
    currentDomain.includes(p.name.toLowerCase())
  );
  
  return project || PROJECT_CONFIGS[0];
}

/**
 * Add new project configuration
 */
export function addProjectConfig(config: ProjectConfig): void {
  const existingIndex = PROJECT_CONFIGS.findIndex(p => p.domain === config.domain);
  if (existingIndex >= 0) {
    PROJECT_CONFIGS[existingIndex] = config;
  } else {
    PROJECT_CONFIGS.push(config);
  }
}

/**
 * Get environment variable names for a project
 */
export function getProjectEnvironmentVariables(projectName: string): string[] {
  const prefix = projectName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
  
  return [
    // OAuth
    `GOOGLE_CLIENT_ID_${prefix}`,
    `GOOGLE_CLIENT_SECRET_${prefix}`,
    `GITHUB_CLIENT_ID_${prefix}`,
    `GITHUB_CLIENT_SECRET_${prefix}`,
    `MICROSOFT_CLIENT_ID_${prefix}`,
    `MICROSOFT_CLIENT_SECRET_${prefix}`,
    
    // Email
    `BREVO_API_KEY_${prefix}`,
    `BREVO_SENDER_EMAIL_${prefix}`,
    `BREVO_SENDER_NAME_${prefix}`,
    `SENDGRID_API_KEY_${prefix}`,
    `SENDGRID_SENDER_EMAIL_${prefix}`,
    `SENDGRID_SENDER_NAME_${prefix}`,
    
    // Payment
    `STRIPE_SECRET_KEY_${prefix}`,
    `STRIPE_PUBLIC_KEY_${prefix}`,
    `STRIPE_WEBHOOK_SECRET_${prefix}`,
    
    // Database
    `DATABASE_URL_${prefix}`,
    
    // Session
    `SESSION_SECRET_${prefix}`,
    
    // Keycloak
    `KEYCLOAK_URL_${prefix}`,
    `KEYCLOAK_REALM_${prefix}`,
    `KEYCLOAK_CLIENT_ID_${prefix}`,
    `KEYCLOAK_CLIENT_SECRET_${prefix}`
  ];
}

/**
 * Get fallback environment variable names
 */
export function getFallbackEnvironmentVariables(): string[] {
  return [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'MICROSOFT_CLIENT_ID',
    'MICROSOFT_CLIENT_SECRET',
    'BREVO_API_KEY',
    'SENDGRID_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLIC_KEY',
    'DATABASE_URL',
    'SESSION_SECRET',
    'KEYCLOAK_URL',
    'KEYCLOAK_REALM',
    'KEYCLOAK_CLIENT_ID',
    'KEYCLOAK_CLIENT_SECRET'
  ];
}

export default getProjectConfig;