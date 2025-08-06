# Cloudflare DNS Import Guide for auth247.net

## Manual DNS Record Setup

### Method 1: Individual Record Creation
Add these records one by one in Cloudflare DNS dashboard:

#### Essential Records (Required)
```
Type: A
Name: @
Content: 34.111.179.208
Proxy: ✅ (Orange cloud - Proxied)
TTL: Auto

Type: A  
Name: www
Content: 34.111.179.208
Proxy: ✅ (Orange cloud - Proxied)
TTL: Auto

Type: TXT
Name: @
Content: replit-verify=ecc86f3a-9f2b-4340-9dab-a944e53efd6d
Proxy: ❌ (Gray cloud - DNS only)
TTL: Auto
```

#### Optional Enhancement Records
```
Type: CNAME
Name: api
Content: auth247.net
Proxy: ✅ (Orange cloud - Proxied)
TTL: Auto

Type: CNAME
Name: app  
Content: auth247.net
Proxy: ✅ (Orange cloud - Proxied)
TTL: Auto

Type: MX
Name: @
Content: mx1.hostinger.com
Priority: 5
Proxy: ❌ (Gray cloud - DNS only)
TTL: Auto

Type: MX
Name: @
Content: mx2.hostinger.com
Priority: 10
Proxy: ❌ (Gray cloud - DNS only)
TTL: Auto

Type: CNAME
Name: mail
Content: mail.hostinger.com
Proxy: ❌ (Gray cloud - DNS only)
TTL: Auto

Type: CNAME
Name: webmail
Content: webmail.hostinger.com
Proxy: ❌ (Gray cloud - DNS only)
TTL: Auto

Type: CNAME
Name: autoconfig
Content: autoconfig.hostinger.com
Proxy: ❌ (Gray cloud - DNS only)
TTL: Auto

Type: CNAME
Name: autodiscover
Content: autodiscover.hostinger.com
Proxy: ❌ (Gray cloud - DNS only)
TTL: Auto

Type: TXT
Name: @
Content: v=spf1 include:_spf.hostinger.com ~all
Proxy: ❌ (Gray cloud - DNS only)
TTL: Auto
```

### Method 2: Bulk Import File
Use the `auth247-cloudflare-dns-records.txt` file for bulk import if Cloudflare supports it.

## Step-by-Step Instructions

1. **Login to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Select your auth247.net domain

2. **Navigate to DNS Settings**
   - Click "DNS" in the left sidebar
   - Click "Records" tab

3. **Add Each Record**
   - Click "Add record" button
   - Select record type (A, CNAME, TXT, etc.)
   - Enter name and content as shown above
   - Set proxy status (orange = proxied, gray = DNS only)
   - Click "Save"

4. **Verify Records**
   - Ensure all records show "Active" status
   - Test domain resolution: https://auth247.net

## OAuth Callback URLs
After DNS is active, update your OAuth providers:

**Google OAuth Console:**
- Authorized redirect URI: https://auth247.net/api/auth/google/callback

**GitHub OAuth App:**
- Authorization callback URL: https://auth247.net/api/auth/github/callback

**Microsoft OAuth App:**
- Redirect URI: https://auth247.net/api/auth/microsoft/callback

## Verification
Test these URLs after DNS propagation (5-10 minutes):
- https://auth247.net (should load your app)
- https://www.auth247.net (should redirect to main domain)
- OAuth login flows should work with custom domain

## Troubleshooting
- **DNS not resolving**: Wait 10-15 minutes for propagation
- **SSL errors**: Cloudflare auto-generates SSL certificates (may take a few minutes)
- **OAuth failures**: Update callback URLs in provider consoles
- **502 errors**: Verify A record points to correct IP (34.111.179.208)