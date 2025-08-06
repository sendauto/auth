# Testing Google SSO with Auth247

## Quick Setup Summary

1. **Get Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create project → Enable APIs → Create OAuth 2.0 Client
   - Add redirect URI: `https://your-domain.replit.app/api/auth/google/callback`

2. **Add to Your Replit Project:**
   ```
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```

3. **Restart Your Auth247 App**

## Testing Steps

### Test 1: Domain Detection
1. Go to your login page
2. Enter a Gmail address: `test@gmail.com`
3. Should see "Enterprise SSO Available" box appear
4. This confirms the domain detection is working

### Test 2: Google SSO Flow
1. Click "Sign in with Enterprise SSO" 
2. Should redirect to Google login
3. Complete Google authentication
4. Should redirect back to Auth247
5. New user account gets created automatically

### Test 3: User Creation
After successful Google login, check that:
- User account created with Google email
- Proper name extraction from Google profile
- Default "user" role assigned
- Session created and working

## Current Auth247 Google Integration

Your system already has Google SSO built-in at these endpoints:

- **Login**: `/api/auth/google`
- **Callback**: `/api/auth/google/callback`
- **User Creation**: Automatic from Google profile

## Demo vs Production Mode

**Currently (Demo Mode):**
- Shows SSO options but uses placeholder authentication
- Domain detection works
- UI flows are complete

**After Adding Real Credentials:**
- Full Google OAuth integration
- Real user account creation
- Secure session management
- Production-ready authentication

## Quick Test Commands

Test the Google OAuth endpoints:

```bash
# Test Google SSO initiation
curl -i http://localhost:5000/api/auth/google

# Check OAuth configuration
curl -i http://localhost:5000/api/auth/discover/gmail.com
```

The first command should redirect to Google (or show demo mode message).
The second should return SSO configuration for Gmail domain.

## Expected Results

✅ **Working Setup:**
- Domain detection shows SSO options
- Google redirect works properly  
- User accounts created automatically
- Sessions persist correctly

❌ **Common Issues:**
- "redirect_uri_mismatch" → Check redirect URI in Google Console
- "invalid_client" → Verify Client ID/Secret are correct
- No SSO options shown → Check domain detection logic

Your Auth247 platform has all the Google SSO infrastructure ready - you just need to connect it with real Google OAuth credentials.