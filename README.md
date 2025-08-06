# Auth247 - Enterprise Authentication Platform

## Overview
Auth247 is a comprehensive enterprise-grade authentication and user management system providing secure 24/7 authentication services. It offers role-based access control, session management, and robust integration capabilities as a cost-effective alternative to Auth0, Okta, and Azure AD.

## Key Features
- **Multi-Tenant Architecture**: Complete isolation and customization per organization
- **Enterprise SSO**: Google Workspace, Microsoft Azure AD, GitHub integration
- **White-Label Solution**: Full branding customization and custom domains
- **Role-Based Access Control**: Super Admin, Admin, Manager, User roles
- **Advanced Security**: MFA, rate limiting, security headers, audit logging
- **Real-time Analytics**: Usage metrics, performance monitoring
- **MX Intelligence System**: Self-healing and optimization capabilities

## Technology Stack
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + Shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT + OAuth2/OIDC + SAML 2.0
- **Email**: Brevo API integration
- **Security**: Multi-layer rate limiting, CSRF protection, security headers

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Environment variables (see .env.example)

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd auth247-deploy

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npm run db:push

# Start development server
npm run dev
```

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
SESSION_SECRET=your-session-secret-here
JWT_SECRET=your-jwt-secret-here

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Service
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=noreply@yourdomain.com

# Application
NODE_ENV=production
PORT=5000
DOMAIN=your-domain.com
```

## Deployment

### Production Deployment
1. **Railway/Render/Vercel**:
   ```bash
   # Build the application
   npm run build
   
   # Start production server
   npm start
   ```

2. **Docker**:
   ```bash
   docker build -t auth247 .
   docker run -p 5000:5000 auth247
   ```

3. **Fly.io** (fly.toml included):
   ```bash
   fly deploy
   ```

### Database Setup
```bash
# Push schema to database
npm run db:push

# Generate migration (if needed)
npm run db:generate

# View database
npm run db:studio
```

## Configuration

### White-Label Setup
1. Access admin dashboard at `/dashboard`
2. Navigate to Organization → White-Label Configuration
3. Configure branding, custom domain, and DNS settings
4. Follow DNS configuration instructions for custom domain

### SSO Configuration
1. Set up OAuth providers in respective developer consoles
2. Configure redirect URIs: `https://yourdomain.com/api/auth/callback/[provider]`
3. Add provider credentials to environment variables

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### OAuth Endpoints
- `GET /api/auth/[provider]` - Initiate OAuth flow
- `GET /api/auth/callback/[provider]` - OAuth callback

### Organization Endpoints
- `GET /api/organization` - Get organization details
- `PUT /api/organization` - Update organization
- `POST /api/organization/invite` - Invite user
- `DELETE /api/organization/users/:id` - Remove user

## Security Features
- CSRF protection
- Rate limiting (per IP and per user)
- SQL injection prevention
- XSS protection
- Security headers (HSTS, CSP, etc.)
- Session security
- Input validation and sanitization

## Monitoring & Analytics
- Real-time user analytics
- Performance monitoring
- Security event logging
- Error tracking
- Usage metrics

## Support
- Documentation: See `replit.md` for detailed architecture
- Issues: Create GitHub issue
- Enterprise Support: Available for production deployments

## License
Commercial license - See LICENSE file for details.

---

**Auth247** - Secure, Scalable, Enterprise-Ready Authentication