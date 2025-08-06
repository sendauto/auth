# Google SSO Setup Guide for Auth247

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `Auth247-SSO`
4. Click "Create"

## Step 2: Enable Google+ API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"
4. Also enable "Gmail API" (optional but recommended)

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" (unless you have Google Workspace)
3. Fill out the required fields:
   - **App name**: Auth247
   - **User support email**: your-email@domain.com
   - **Developer contact**: your-email@domain.com
4. Click "Save and Continue"
5. Skip "Scopes" for now (click "Save and Continue")
6. Add test users if needed
7. Click "Back to Dashboard"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Enter name: `Auth247 Web Client`
5. **CRITICAL**: Add authorized redirect URIs using your actual domain:

### For Replit Deployment:
   - Find your Replit domain (in the webview URL bar, e.g., `abc123.replit.dev`)
   - Add: `https://YOUR-REPLIT-DOMAIN.replit.dev/api/auth/google/callback`
   - Example: `https://abc123.replit.dev/api/auth/google/callback`

### For Custom Domain:
   - Add: `https://auth247.net/api/auth/google/callback` (if using auth247.net)
   - Add: `https://YOUR-CUSTOM-DOMAIN.com/api/auth/google/callback`

### For Development:
   - Add: `http://localhost:5000/api/auth/google/callback`

⚠️ **The redirect URI must EXACTLY match your application's domain!**

6. Click "Create"

## Step 5: Copy Your Credentials

After creating, you'll see a popup with:
- **Client ID**: Something like `123456789-abcdef.apps.googleusercontent.com`
- **Client Secret**: Something like `GOCSPX-abcdef123456`

**Save these values immediately!**

## Step 6: Add to Auth247 Environment

Add these environment variables to your Auth247 deployment:

```bash
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### For Replit:
1. Go to your Replit project
2. Click "Secrets" tab (lock icon)
3. Add new secrets:
   - Key: `GOOGLE_CLIENT_ID`, Value: your client ID
   - Key: `GOOGLE_CLIENT_SECRET`, Value: your client secret

## Step 7: Test Google SSO

1. Restart your Auth247 application
2. Go to login page
3. Enter a Gmail address (e.g., `user@gmail.com`)
4. You should see "Enterprise SSO Available" with Google option

## Troubleshooting

### Error: "redirect_uri_mismatch"
This means your Google OAuth redirect URI doesn't match your application's domain.

**Solution:**
1. Check your current domain by visiting: `/api/auth/oauth-projects` (admin access required)
2. Go to Google Cloud Console → Credentials → Your OAuth Client
3. Add the EXACT redirect URI shown in the error or system info
4. Make sure there are no typos or missing/extra characters

### Error: "Access blocked: This app's request is invalid"
Your application domain doesn't match the authorized redirect URIs.

**Quick Fix:**
1. Get your current Replit domain from the URL bar
2. Add `https://YOUR-DOMAIN.replit.dev/api/auth/google/callback` to Google OAuth
3. Restart your application

### Still Having Issues?
Visit the admin endpoint `/api/auth/oauth-projects` to see:
- Current domain being used
- Expected redirect URIs for all providers
- Configuration status
5. Click "Sign in with Google"
6. Complete Google authentication
7. You'll be redirected back to Auth247 with a new account created

## Step 8: Configure Domain Restrictions (Optional)

To restrict to specific Google Workspace domains:

1. In Google Cloud Console, go to OAuth consent screen
2. Add your organization's domain to "Authorized domains"
3. This ensures only users from your domain can sign in

## Troubleshooting

### Common Issues:

**"redirect_uri_mismatch" error:**
- Check that your redirect URI exactly matches what you entered in Google Console
- Make sure it includes the correct protocol (http/https)

**"access_blocked" error:**
- Your OAuth consent screen needs review
- Add your email as a test user during development

**"invalid_client" error:**
- Double-check your Client ID and Secret
- Make sure there are no extra spaces when copying

### Testing Checklist:

- ✅ Google Cloud project created
- ✅ OAuth consent screen configured  
- ✅ Redirect URIs added correctly
- ✅ Client ID and Secret copied to Auth247
- ✅ Application restarted
- ✅ Test login with Gmail account

## Production Considerations

1. **Verify Domain Ownership**: Add your domain to Google Search Console
2. **Review OAuth Consent**: Submit for Google review if you need more than 100 users
3. **Monitor Usage**: Check Google Cloud quotas and usage
4. **Security**: Regularly rotate client secrets

## Next Steps

Once Google SSO is working:
- Set up Microsoft Azure AD SSO
- Configure domain-to-tenant mapping
- Add role-based access control rules
- Test with your organization's accounts

Your Auth247 platform will automatically detect Google Workspace domains and show SSO options to users from those organizations.