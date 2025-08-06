# Custom Domain Setup for Auth247

## Quick Switch to Custom Domain

To use `auth247.net` instead of the Replit domain for OAuth callbacks:

### Step 1: Add Environment Variable
1. Go to your Replit project
2. Click "Secrets" (lock icon) in the left sidebar
3. Add new secret:
   - **Key**: `USE_CUSTOM_DOMAIN`
   - **Value**: `true`

### Step 2: Configure Google OAuth
Add this redirect URI to your Google Cloud Console:
```
https://auth247.net/api/auth/google/callback
```

### Step 3: Restart Application
The system will automatically detect the environment variable and use `auth247.net` for all OAuth callbacks.

## Domain Configuration Options

### Option A: Use Custom Domain (Recommended)
- Set `USE_CUSTOM_DOMAIN=true`
- Uses: `https://auth247.net/api/auth/google/callback`
- Requires: Domain pointing to your Replit app

### Option B: Use Replit Domain (Current)
- Don't set the environment variable (or set to `false`)
- Uses: `https://your-replit-domain.replit.dev/api/auth/google/callback`
- Works immediately with current setup

### Option C: Custom Domain Override
- Set `CUSTOM_DOMAIN=yourdomain.com`
- Set `USE_CUSTOM_DOMAIN=true`
- Uses: `https://yourdomain.com/api/auth/google/callback`

## DNS Configuration for Custom Domain

If using `auth247.net`, you'll need to:
1. Point your domain to the Replit app
2. Configure Replit's custom domain feature
3. Ensure SSL is properly configured

## Verification

After setting up, check the console logs to see:
```
[OAuth] Using domain: auth247.net
[OAuth] Full base URL: https://auth247.net
```

This confirms the system is using your custom domain for OAuth callbacks.