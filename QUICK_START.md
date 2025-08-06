# Auth247 Quick Start Guide

## 🚀 Deploy in 5 Minutes

### 1. Download & Extract
```bash
# Extract the deployment package
tar -xzf auth247-complete-deployment.tar.gz
cd auth247-deploy
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit with your configuration
nano .env  # or use your preferred editor
```

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Random secret for sessions
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - OAuth credentials
- `BREVO_API_KEY` - Email service API key

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup
```bash
# Push database schema
npm run db:push
```

### 5. Build & Deploy

#### Railway (Recommended)
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

#### Render
1. Connect GitHub repository
2. Build command: `npm run build`
3. Start command: `npm start`

#### Vercel
```bash
npm install -g vercel
vercel
```

#### Docker
```bash
docker build -t auth247 .
docker run -p 5000:5000 auth247
```

### 6. Access Application
- **Dashboard**: `https://yourdomain.com/dashboard`
- **Health Check**: `https://yourdomain.com/health`
- **API Status**: `https://yourdomain.com/api/status`

## 🔧 Configuration

### OAuth Setup
1. **Google OAuth**: [Google Cloud Console](https://console.cloud.google.com)
2. **GitHub OAuth**: [GitHub Developer Settings](https://github.com/settings/developers)
3. **Microsoft OAuth**: [Azure Portal](https://portal.azure.com)

### Custom Domain
1. Set DNS records as shown in Organization → White-Label
2. Configure SSL certificate (automatic on most platforms)
3. Update `DOMAIN` environment variable

## 📋 Post-Deployment Checklist
- [ ] Environment variables configured
- [ ] Database schema applied
- [ ] OAuth providers working
- [ ] Email service operational
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Admin user created
- [ ] Health checks passing

## 🆘 Need Help?
- Check `DEPLOYMENT.md` for detailed instructions
- Review `README.md` for comprehensive documentation
- Verify environment variables match `.env.example`
- Test database connection: `npm run db:studio`

---
**Auth247** - Enterprise Authentication Made Simple