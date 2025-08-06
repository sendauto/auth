# Auth247 Deployment Guide

## Deployment Options

### 1. Railway Deployment (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Set environment variables
railway variables set DATABASE_URL=postgresql://...
railway variables set SESSION_SECRET=your-secret
railway variables set GOOGLE_CLIENT_ID=your-client-id
# ... (add all required environment variables)

# Deploy
railway up
```

### 2. Render Deployment
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables in Render dashboard

### 3. Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add SESSION_SECRET
# ... (add all required environment variables)
```

### 4. Fly.io Deployment
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Launch app
fly launch

# Set secrets
fly secrets set DATABASE_URL=postgresql://...
fly secrets set SESSION_SECRET=your-secret

# Deploy
fly deploy
```

### 5. Docker Deployment
```bash
# Build image
docker build -t auth247 .

# Run container
docker run -d \
  -p 5000:5000 \
  -e DATABASE_URL=postgresql://... \
  -e SESSION_SECRET=your-secret \
  --name auth247 \
  auth247
```

## Environment Configuration

### Required Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Application
NODE_ENV=production
PORT=5000
SESSION_SECRET=your-super-secret-session-key
JWT_SECRET=your-jwt-secret-key
DOMAIN=yourdomain.com

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Email Service (Brevo)
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME="Auth247"

# Security (Optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Optional Environment Variables
```env
# GitHub OAuth (if using)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Microsoft OAuth (if using)
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# Redis (for session storage)
REDIS_URL=redis://user:password@host:port

# Monitoring
MONITORING_ENABLED=true
ANALYTICS_ENABLED=true
```

## Database Setup

### PostgreSQL Setup
1. Create a PostgreSQL database
2. Get the connection string
3. Set `DATABASE_URL` environment variable
4. Run migrations:
   ```bash
   npm run db:push
   ```

### Popular PostgreSQL Providers
- **Neon** (Recommended): https://neon.tech
- **Supabase**: https://supabase.com
- **Railway**: https://railway.app
- **PlanetScale**: https://planetscale.com

## DNS Configuration

### Custom Domain Setup
1. Purchase a domain from any registrar
2. Point DNS to your deployment platform:
   - **Railway**: Follow Railway custom domain guide
   - **Render**: Add CNAME record pointing to `your-app.onrender.com`
   - **Vercel**: Add CNAME record pointing to `cname.vercel-dns.com`
   - **Fly.io**: Follow Fly.io custom domain guide

### SSL/TLS Certificates
Most platforms provide automatic SSL certificates:
- Railway: Automatic SSL
- Render: Automatic SSL
- Vercel: Automatic SSL
- Fly.io: Automatic SSL with Let's Encrypt

## Production Optimizations

### 1. Database Optimizations
```sql
-- Add indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
```

### 2. Security Headers
The application includes security middleware, but ensure your reverse proxy adds:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

### 3. Monitoring Setup
- Enable application monitoring
- Set up error tracking
- Configure performance monitoring
- Set up uptime monitoring

## OAuth Provider Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`

### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `https://yourdomain.com/api/auth/callback/github`

### Microsoft OAuth
1. Go to [Azure Portal](https://portal.azure.com)
2. Register a new application
3. Add redirect URI: `https://yourdomain.com/api/auth/callback/microsoft`

## Email Service Setup (Brevo)

1. Sign up at [Brevo](https://www.brevo.com)
2. Get your API key from account settings
3. Set up sender domain verification
4. Configure SMTP settings if needed

## Health Checks

The application provides health check endpoints:
- `GET /health` - Basic health check
- `GET /api/health` - Detailed health status
- `GET /api/status` - System status

## Backup Strategy

### Database Backups
1. Set up automated daily backups
2. Test backup restoration process
3. Store backups in secure location

### Application Backups
1. Source code in Git repository
2. Environment variables documented
3. Database schema versioned

## Scaling Considerations

### Horizontal Scaling
- Use load balancer
- Implement session store (Redis)
- Database read replicas
- CDN for static assets

### Vertical Scaling
- Monitor resource usage
- Scale database instance
- Increase application memory
- Optimize database queries

## Troubleshooting

### Common Issues
1. **Database Connection**: Check DATABASE_URL format
2. **OAuth Redirect**: Verify redirect URIs match exactly
3. **Email Issues**: Check Brevo API key and sender verification
4. **Session Issues**: Verify SESSION_SECRET is set

### Logs and Debugging
```bash
# View application logs
npm run logs

# Database connection test
npm run db:test

# Health check
curl https://yourdomain.com/health
```

## Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] OAuth providers configured
- [ ] Email service working
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Health checks passing
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Admin user created

---

For additional support, refer to the platform-specific documentation or create an issue in the repository.