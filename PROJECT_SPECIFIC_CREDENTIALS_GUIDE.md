# Project-Specific Credentials Setup Guide

## Overview
All credentials in Auth247 are now project-specific to avoid conflicts between different Replit projects. Each service supports both project-specific and fallback credential naming.

## Environment Variable Naming Convention

### Format
```
[SERVICE]_[CREDENTIAL]_[PROJECT_NAME]
```

### Examples for Auth247 Project
```bash
# Google OAuth
GOOGLE_CLIENT_ID_AUTH247_MAIN=your_auth247_google_client_id
GOOGLE_CLIENT_SECRET_AUTH247_MAIN=your_auth247_google_secret

# GitHub OAuth  
GITHUB_CLIENT_ID_AUTH247_MAIN=your_auth247_github_client_id
GITHUB_CLIENT_SECRET_AUTH247_MAIN=your_auth247_github_secret

# Microsoft OAuth
MICROSOFT_CLIENT_ID_AUTH247_MAIN=your_auth247_microsoft_client_id
MICROSOFT_CLIENT_SECRET_AUTH247_MAIN=your_auth247_microsoft_secret

# Brevo Email Service
BREVO_API_KEY_AUTH247_MAIN=your_auth247_brevo_api_key
BREVO_SENDER_EMAIL_AUTH247_MAIN=noreply@auth247.net
BREVO_SENDER_NAME_AUTH247_MAIN=Auth247

# SendGrid Email Service
SENDGRID_API_KEY_AUTH247_MAIN=your_auth247_sendgrid_api_key
SENDGRID_SENDER_EMAIL_AUTH247_MAIN=noreply@auth247.net
SENDGRID_SENDER_NAME_AUTH247_MAIN=Auth247

# Stripe Payment Service
STRIPE_SECRET_KEY_AUTH247_MAIN=your_auth247_stripe_secret
STRIPE_PUBLIC_KEY_AUTH247_MAIN=your_auth247_stripe_public
STRIPE_WEBHOOK_SECRET_AUTH247_MAIN=your_auth247_stripe_webhook

# Database
DATABASE_URL_AUTH247_MAIN=your_auth247_database_url

# Session Security
SESSION_SECRET_AUTH247_MAIN=your_auth247_session_secret

# Keycloak SSO
KEYCLOAK_URL_AUTH247_MAIN=your_auth247_keycloak_url
KEYCLOAK_REALM_AUTH247_MAIN=your_auth247_realm
KEYCLOAK_CLIENT_ID_AUTH247_MAIN=your_auth247_keycloak_client
KEYCLOAK_CLIENT_SECRET_AUTH247_MAIN=your_auth247_keycloak_secret
```

## Fallback System

If project-specific credentials aren't found, the system falls back to generic names:

```bash
# Fallback credentials (used if project-specific not found)
GOOGLE_CLIENT_ID=fallback_google_client_id
GOOGLE_CLIENT_SECRET=fallback_google_secret
BREVO_API_KEY=fallback_brevo_key
STRIPE_SECRET_KEY=fallback_stripe_key
# ... etc
```

## Setting Up Multiple Projects

### Example: Adding a Second Project

```bash
# Project 1: Auth247 Main
GOOGLE_CLIENT_ID_AUTH247_MAIN=client_id_for_auth247
GOOGLE_CLIENT_SECRET_AUTH247_MAIN=secret_for_auth247

# Project 2: Company Auth System
GOOGLE_CLIENT_ID_MYCOMPANY_AUTH=client_id_for_mycompany
GOOGLE_CLIENT_SECRET_MYCOMPANY_AUTH=secret_for_mycompany

# Project 3: Personal Project
GOOGLE_CLIENT_ID_PERSONAL_PROJECT=client_id_for_personal
GOOGLE_CLIENT_SECRET_PERSONAL_PROJECT=secret_for_personal
```

## How It Works

1. **Domain Detection**: System detects current domain/project from:
   - `REPLIT_DOMAINS` environment variable
   - `REPL_SLUG` environment variable  
   - Manually configured project domain

2. **Credential Resolution**: For each service, system looks for:
   - Project-specific credentials first
   - Falls back to generic credentials
   - Uses demo/placeholder if neither found

3. **Project Matching**: System matches projects by:
   - Domain name match
   - Project name match
   - Subdomain patterns

## Adding New Projects

### Step 1: Update Project Configuration
Edit `server/project-config.ts` and add your new project:

```typescript
{
  name: 'MyCompany-Auth',
  domain: 'mycompany.com',
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID_MYCOMPANY,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET_MYCOMPANY
  },
  brevo: {
    apiKey: process.env.BREVO_API_KEY_MYCOMPANY,
    senderEmail: 'noreply@mycompany.com',
    senderName: 'MyCompany Auth'
  }
}
```

### Step 2: Set Environment Variables
In your Replit secrets, add project-specific credentials:

```
GOOGLE_CLIENT_ID_MYCOMPANY=your_google_client_id
GOOGLE_CLIENT_SECRET_MYCOMPANY=your_google_secret
BREVO_API_KEY_MYCOMPANY=your_brevo_api_key
```

### Step 3: Test Configuration
Use the admin endpoint to verify your setup:
```
GET /api/auth/oauth-projects
```

## Services Supporting Project-Specific Credentials

✅ **OAuth Providers**
- Google OAuth (Client ID, Secret)
- GitHub OAuth (Client ID, Secret)  
- Microsoft OAuth (Client ID, Secret)

✅ **Email Services**
- Brevo (API Key, Sender Email, Sender Name)
- SendGrid (API Key, Sender Email, Sender Name)

✅ **Payment Services**
- Stripe (Secret Key, Public Key, Webhook Secret)

✅ **Infrastructure**
- Database URL
- Session Secret
- Keycloak (URL, Realm, Client ID, Secret)

## Benefits

1. **No Conflicts**: Each Replit project uses its own credentials
2. **Easy Management**: Clear naming convention for all services
3. **Fallback Support**: Graceful degradation to generic credentials
4. **Scalable**: Easy to add new projects and services
5. **Secure**: Project isolation prevents credential mix-ups

## Troubleshooting

### Check Current Configuration
```bash
# Admin endpoint shows current project config
curl -H "Authorization: Bearer admin_token" \
  http://localhost:5000/api/auth/oauth-projects
```

### Verify Environment Variables
```bash
# Check if project-specific credentials exist
echo $GOOGLE_CLIENT_ID_AUTH247_MAIN
echo $BREVO_API_KEY_AUTH247_MAIN
```

### Common Issues
1. **Wrong naming**: Ensure project name matches exactly
2. **Missing fallbacks**: Add generic credentials as backup
3. **Domain mismatch**: Verify domain detection is working correctly

This system ensures your Auth247 platform can run multiple instances with different credentials without any conflicts.