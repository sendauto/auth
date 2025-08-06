# Auth247 Deployment Guide

## Overview

This guide covers deploying Auth247 to production environments. Auth247 is designed to be deployment-agnostic and can be deployed to various platforms.

## Supported Deployment Platforms

### 1. Vercel (Recommended)
- Automatic builds and deployments
- Global CDN and edge functions
- Built-in SSL and custom domains
- Serverless scaling

### 2. Railway
- Simple Git-based deployments
- Automatic environment variables
- Integrated PostgreSQL
- Container-based deployment

### 3. Render
- Docker and native builds
- Auto-deploy from Git
- Managed databases
- Global CDN

### 4. Docker/Self-Hosted
- Full control over infrastructure
- Kubernetes-ready
- Custom scaling policies
- On-premises deployment

## Pre-Deployment Checklist

### Required Environment Variables
```bash
# Database (Required)
DATABASE_URL=postgresql://username:password@host:5432/database

# Session Security (Required)
SESSION_SECRET=your-super-secure-secret-key-here

# OAuth Providers (At least one required)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# Email Service (Required for notifications)
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=Your App Name

# Optional: Payment Processing
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional: Custom Domain
CUSTOM_DOMAIN=yourdomain.com
```

### Database Setup
1. **Create PostgreSQL Database**
   - Recommended: Neon, Supabase, or Railway PostgreSQL
   - Minimum PostgreSQL version: 13+
   - Required extensions: none (pure SQL)

2. **Run Database Migrations**
   ```bash
   npm run db:push
   ```

3. **Verify Database Connection**
   ```bash
   npm run db:studio
   ```

### OAuth Configuration
For each OAuth provider, configure redirect URIs:

**Google OAuth Console**
- Authorized redirect URIs: `https://yourdomain.com/api/auth/google/callback`

**GitHub OAuth App**
- Authorization callback URL: `https://yourdomain.com/api/auth/github/callback`

**Microsoft Azure AD**
- Redirect URIs: `https://yourdomain.com/api/auth/microsoft/callback`

## Deployment Methods

### Method 1: Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add SESSION_SECRET
   # Add all required environment variables
   ```

5. **Set Custom Domain (Optional)**
   ```bash
   vercel domains add yourdomain.com
   ```

### Method 2: Railway Deployment

1. **Connect GitHub Repository**
   - Go to Railway dashboard
   - Connect your GitHub repository
   - Railway will auto-detect Node.js project

2. **Add Environment Variables**
   - Go to project settings
   - Add all required environment variables
   - Railway provides PostgreSQL addon

3. **Deploy**
   - Railway automatically deploys on Git push
   - Custom domains available in settings

### Method 3: Render Deployment

1. **Create Web Service**
   - Connect GitHub repository
   - Runtime: Node.js
   - Build Command: `npm run build`
   - Start Command: `npm start`

2. **Add Environment Variables**
   - Add all required variables in Render dashboard
   - Render provides PostgreSQL addon

3. **Custom Domain**
   - Add custom domain in service settings
   - Configure DNS records as instructed

### Method 4: Docker Deployment

1. **Build Docker Image**
   ```bash
   docker build -t auth247 .
   ```

2. **Run Container**
   ```bash
   docker run -p 5000:5000 \
     -e DATABASE_URL="your-database-url" \
     -e SESSION_SECRET="your-session-secret" \
     auth247
   ```

3. **Docker Compose (Recommended)**
   ```yaml
   version: '3.8'
   services:
     auth247:
       build: .
       ports:
         - "5000:5000"
       environment:
         - DATABASE_URL=postgresql://postgres:password@db:5432/auth247
         - SESSION_SECRET=your-session-secret
       depends_on:
         - db
     
     db:
       image: postgres:15
       environment:
         - POSTGRES_DB=auth247
         - POSTGRES_PASSWORD=password
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

## Post-Deployment Configuration

### 1. SSL Certificate
- Most platforms provide automatic SSL
- For self-hosted: Use Let's Encrypt or commercial certificates
- Ensure HTTPS redirect is configured

### 2. Custom Domain Setup
1. **DNS Configuration**
   - Point A record to deployment IP/CNAME
   - Configure www subdomain if needed

2. **SSL Certificate**
   - Most platforms handle this automatically
   - Verify certificate installation

3. **Update OAuth Providers**
   - Update redirect URIs to use custom domain
   - Test all OAuth flows

### 3. Monitoring Setup

1. **Health Check Endpoint**
   ```
   GET /api/health
   ```

2. **Performance Monitoring**
   - Configure APM tools (New Relic, DataDog)
   - Set up error tracking (Sentry)
   - Monitor database performance

3. **Uptime Monitoring**
   - Set up external monitoring (Pingdom, StatusPage)
   - Configure alerts for downtime

### 4. Security Hardening

1. **Environment Variables**
   - Use platform-specific secret management
   - Never commit secrets to Git
   - Rotate secrets regularly

2. **Security Headers**
   - Auth247 includes security headers by default
   - Verify CSP and HSTS are working

3. **Rate Limiting**
   - Auth247 includes built-in rate limiting
   - Consider additional CDN-level protection

## Scaling Considerations

### Horizontal Scaling
- Auth247 is stateless and scales horizontally
- Use load balancers for multiple instances
- Session data is stored in database

### Database Scaling
- PostgreSQL supports read replicas
- Consider connection pooling (PgBouncer)
- Monitor query performance

### CDN Configuration
- Serve static assets via CDN
- Configure proper cache headers
- Use edge locations for global performance

## Backup & Recovery

### Database Backups
- Configure automated backups
- Test restore procedures regularly
- Consider point-in-time recovery

### Application Backups
- Version control handles code backups
- Document environment variables
- Backup uploaded assets if applicable

### Disaster Recovery
- Multi-region deployment for critical applications
- Document recovery procedures
- Test failover scenarios

## Maintenance

### Updates
1. **Update Dependencies**
   ```bash
   npm update
   npm audit fix
   ```

2. **Database Migrations**
   ```bash
   npm run db:push
   ```

3. **Deploy Updates**
   - Test in staging environment first
   - Deploy during low-traffic periods
   - Monitor for errors after deployment

### Monitoring
- Monitor application logs
- Track key metrics (response time, error rates)
- Set up alerting for critical issues

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using port 5000
   lsof -i :5000
   # Kill the process or use different port
   PORT=3000 npm run dev
   ```

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check database server status
   - Ensure IP allowlisting for hosted databases

3. **OAuth Callback Errors**
   - Verify redirect URIs match exactly
   - Check OAuth provider configuration
   - Ensure HTTPS for production callbacks

4. **Session Issues**
   - Verify SESSION_SECRET is set
   - Check session store configuration
   - Clear browser cookies for testing

### Performance Issues

1. **Slow Database Queries**
   - Enable query logging
   - Review database indexes
   - Consider query optimization

2. **Memory Leaks**
   - Monitor memory usage
   - Check for unclosed connections
   - Review event listener cleanup

## Support

### Getting Help
- Check the troubleshooting section first
- Review application logs for errors
- Contact support with detailed error information

### Reporting Issues
Include the following information:
- Deployment platform
- Environment variables (without sensitive values)
- Error logs and stack traces
- Steps to reproduce the issue

---

This deployment guide ensures successful production deployment of Auth247 across various platforms while maintaining security, performance, and reliability.