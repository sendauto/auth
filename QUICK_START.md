# Auth247 Quick Start Guide

Get Auth247 running in minutes with this streamlined setup guide.

## ⚡ 5-Minute Setup

### Prerequisites
- Node.js 18+ ([Download here](https://nodejs.org/))
- PostgreSQL database (we recommend [Neon](https://neon.tech) - free tier available)
- Git

### 1. Clone and Install
```bash
git clone <repository-url>
cd auth247-complete-deployment
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```bash
# Required: Database
DATABASE_URL=postgresql://username:password@host:5432/database

# Required: Session Security
SESSION_SECRET=your-super-secure-random-string-here

# Required: At least one OAuth provider
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional: Email service (for notifications)
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=noreply@yourdomain.com
```

### 3. Database Setup
```bash
npm run db:push
```

### 4. Start Development Server
```bash
npm run dev
```

🎉 **Visit http://localhost:5000** - Auth247 is now running!

## 🔐 OAuth Provider Setup

### Google OAuth (Recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

### GitHub OAuth
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Set Authorization callback URL: `http://localhost:5000/api/auth/github/callback`
4. Copy Client ID and Client Secret to `.env`

### Microsoft OAuth
1. Go to [Azure Portal](https://portal.azure.com/)
2. Register new application
3. Add redirect URI: `http://localhost:5000/api/auth/microsoft/callback`
4. Copy Application (client) ID and Client Secret to `.env`

## 🚀 Production Deployment

### Vercel (1-Click Deploy)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy automatically on Git push

### Railway
1. Connect GitHub repository at [Railway](https://railway.app/)
2. Add environment variables
3. Deploy automatically

### Docker
```bash
docker build -t auth247 .
docker run -p 5000:5000 auth247
```

## 📊 Features Overview

### ✅ Included Out of the Box
- **Multi-Provider Authentication**: Google, GitHub, Microsoft, and more
- **Enterprise SSO**: SAML 2.0 support for enterprise customers
- **Multi-Factor Authentication**: TOTP and backup codes
- **Role-Based Access Control**: Admin, Manager, User roles
- **User Management**: Registration, profile management, password reset
- **Analytics Dashboard**: User activity and system metrics
- **API Management**: Developer portal with API keys
- **White Label Branding**: Custom domains and branding
- **Integration Marketplace**: Pre-built integrations for major platforms

### 🎯 Enterprise Features
- **SCIM 2.0 Provisioning**: Automated user lifecycle management
- **Domain Verification**: DNS-based domain validation
- **Bulk Operations**: CSV import/export for users
- **Advanced Analytics**: Detailed usage reports and insights
- **Compliance Logging**: Comprehensive audit trails
- **Custom Branding**: Full white-label customization

## 🔧 Configuration Options

### User Roles
```javascript
// Built-in roles with increasing permissions
'user'        // Basic authenticated user
'manager'     // Team management capabilities  
'admin'       // Organization administration
'superadmin'  // Platform-wide administration
```

### Multi-Tenant Support
Auth247 supports multiple organizations/tenants:
- Isolated user data per tenant
- Custom branding per tenant
- Separate billing and analytics

### Pricing Configuration
Revolutionary active-user-only pricing:
```javascript
pricePerUser: "0.89"           // $0.89 per active user/month
platformMaintenanceFee: "1.99" // $1.99 base platform fee/month
billingModel: "mau"            // Monthly Active Users only
```

## 🛠️ Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production  
npm run start    # Start production server
npm run db:push  # Push database schema changes
npm run db:studio # Open database admin UI
```

### Project Structure
```
├── client/          # React frontend application
├── server/          # Express.js backend API
├── shared/          # Shared types and schemas
├── public/          # Static assets
└── docs/           # Documentation files
```

### API Endpoints
```bash
# Authentication
POST /api/auth/register
POST /api/auth/login  
GET  /api/auth/session
POST /api/auth/logout

# User Management
GET  /api/users
PUT  /api/users/:id
DELETE /api/users/:id

# Organization Management
GET  /api/organizations
POST /api/organizations
PUT  /api/organizations/:id
```

## 🔍 Testing

### Test User Accounts
Development mode includes test accounts:
- **Admin**: admin@auth247.net (password: admin123)
- **Manager**: manager@auth247.net (password: manager123)
- **User**: user@auth247.net (password: user123)

### API Testing
Use the built-in API playground at `/developer-portal` to test all endpoints interactively.

## 📈 Monitoring & Analytics

### Built-in Analytics
Access real-time analytics at `/analytics`:
- User registrations and activity
- Authentication method usage
- API endpoint performance
- Security events and alerts

### Health Monitoring
- **Health Check**: `GET /api/health`
- **System Status**: `GET /api/status`
- **Metrics**: `GET /api/metrics`

## 🆘 Troubleshooting

### Common Issues

**Port 5000 already in use**
```bash
# Use different port
PORT=3000 npm run dev
```

**Database connection failed**
- Verify DATABASE_URL format
- Check database server is running
- Ensure IP allowlisting for cloud databases

**OAuth callback errors**
- Verify redirect URIs match exactly
- Use `http://localhost:5000` for development
- Use `https://yourdomain.com` for production

**Session not persisting**
- Verify SESSION_SECRET is set in .env
- Check browser cookie settings
- Clear browser data for testing

### Getting Help
- **Documentation**: Comprehensive guides in `/docs`
- **GitHub Issues**: Report bugs and request features
- **Email Support**: Contact support for enterprise customers
- **Community**: Join our developer Discord

## 🚀 What's Next?

1. **Customize Branding**: Update colors, logo, and company information
2. **Configure Integrations**: Connect to Slack, Salesforce, and other platforms
3. **Set Up Monitoring**: Add error tracking and performance monitoring
4. **Enable Enterprise Features**: SCIM provisioning, advanced analytics
5. **Go Live**: Deploy to production with custom domain

## 💡 Pro Tips

- **Security**: Always use HTTPS in production
- **Performance**: Enable caching for static assets
- **Monitoring**: Set up uptime monitoring and alerts
- **Backup**: Configure automated database backups
- **Updates**: Keep dependencies updated for security

---

**Need help?** Check our comprehensive documentation or contact our support team. Auth247 is designed to be developer-friendly with extensive documentation and examples.

**Ready to scale?** Auth247 handles everything from startups to enterprise customers with the same codebase and 70% cost savings compared to competitors.