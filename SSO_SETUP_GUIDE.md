# Auth247 SSO Setup Guide

## Overview
Auth247 supports enterprise-grade SSO through multiple providers. This guide shows you how to configure each provider.

## 🔧 Provider Setup

### 1. Google Workspace SSO

#### Step 1: Create Google OAuth Application
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add authorized redirect URI: `https://your-domain.com/api/auth/google/callback`

#### Step 2: Configure Environment Variables
```bash
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 2. Microsoft Azure AD SSO

#### Step 1: Register Application in Azure
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Set redirect URI: `https://your-domain.com/api/auth/microsoft/callback`
5. Note the Application (client) ID and create a client secret

#### Step 2: Configure Environment Variables
```bash
MICROSOFT_CLIENT_ID=your_azure_app_id_here
MICROSOFT_CLIENT_SECRET=your_azure_client_secret_here
```

### 3. GitHub SSO (for Developer Teams)

#### Step 1: Create GitHub OAuth App
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Set Authorization callback URL: `https://your-domain.com/api/auth/github/callback`

#### Step 2: Configure Environment Variables
```bash
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

## 🏢 Enterprise Keycloak Setup

For large organizations, Auth247 supports Keycloak federation:

### Environment Variables
```bash
KEYCLOAK_URL=https://your-keycloak.company.com
KEYCLOAK_REALM=your-realm
KEYCLOAK_CLIENT_ID=auth247-client
KEYCLOAK_CLIENT_SECRET=your_keycloak_secret
```

## 🚀 Testing SSO

### Demo Mode (Current)
Your Auth247 instance is running in demo mode. To test:

1. Go to login page: `/login`
2. Enter an enterprise email (e.g., `user@company.com`)
3. System will show "Enterprise SSO Available" if domain is recognized
4. Click "Sign in with Enterprise SSO"

### Production Mode
Once you add real OAuth credentials:

1. Users with enterprise emails automatically see SSO options
2. First-time users are created automatically with appropriate roles
3. Existing users are matched by email address
4. All authentication flows through your configured providers

## 🔐 Security Features

- **Domain Whitelisting**: Only allow specific domains for SSO
- **Role Mapping**: Automatically assign roles based on SSO provider
- **Session Security**: Secure session management with automatic refresh
- **Audit Logging**: Complete audit trail of all SSO authentication events

## 📋 Next Steps

1. Choose your SSO provider(s)
2. Configure the OAuth applications
3. Add environment variables to your Auth247 deployment
4. Test with your organization's accounts
5. Configure domain restrictions and role mappings as needed

Need help with specific provider setup? Each major SSO provider has detailed documentation for OAuth configuration.