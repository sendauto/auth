# OAuth Setup Guide for Auth247

## Step 1: Google OAuth Setup

### 1.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API and Google OAuth2 API

### 1.2 Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in application details:
   - App name: Auth247
   - User support email: admin@auth247.net
   - Developer contact: admin@auth247.net
   - App domain: auth247.net
4. Add scopes: email, profile, openid

### 1.3 Create OAuth Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Application type: Web application
4. Name: Auth247 OAuth Client
5. Authorized redirect URIs:
   - http://localhost:5000/api/auth/google/callback (development)
   - https://auth247.net/api/auth/google/callback (production)
6. Copy Client ID and Client Secret

### 1.4 Environment Variables
```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## Step 2: Microsoft OAuth Setup

### 2.1 Azure App Registration
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Name: Auth247
5. Supported account types: Accounts in any organizational directory and personal Microsoft accounts
6. Redirect URI: Web - http://localhost:5000/api/auth/microsoft/callback

### 2.2 Configure Authentication
1. In your app registration, go to "Authentication"
2. Add redirect URIs:
   - http://localhost:5000/api/auth/microsoft/callback
   - https://auth247.net/api/auth/microsoft/callback
3. Enable "Access tokens" and "ID tokens"

### 2.3 Get Credentials
1. Go to "Overview" and copy "Application (client) ID"
2. Go to "Certificates & secrets" > "New client secret"
3. Copy the secret value immediately

### 2.4 Environment Variables
```
MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here
```

## Step 3: GitHub OAuth Setup

### 3.1 Create GitHub OAuth App
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Application name: Auth247
4. Homepage URL: https://auth247.net
5. Authorization callback URL: http://localhost:5000/api/auth/github/callback

### 3.2 Get Credentials
1. Copy Client ID
2. Generate and copy Client Secret

### 3.3 Environment Variables
```
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

## Step 4: Testing OAuth Integration

### 4.1 Local Testing
1. Add environment variables to your .env file
2. Restart the application
3. Test each OAuth provider:
   - Visit http://localhost:5000/signup
   - Click each social login button
   - Verify successful authentication

### 4.2 Production Testing
1. Deploy to production with environment variables
2. Update OAuth redirect URIs to production URLs
3. Test complete authentication flow

## Next Steps
Once OAuth credentials are configured, the Auth247 social login system will be fully functional with:
- Automatic user creation from OAuth profiles
- Session management and persistence
- Secure token handling
- Error handling and user feedback