# Auth247 Application

## Overview
Auth247 is a full-stack, enterprise-grade authentication and user management system providing secure 24/7 authentication services via Auth247.net. It offers role-based access control, session management, and robust integration with Keycloak for enterprise SSO. The platform aims to be a cost-effective alternative to solutions like Auth0, Okta, and Azure AD, offering 70% cost savings through revolutionary active-user pricing. Key capabilities include multi-tenant support, advanced security features, comprehensive user and subscription management, and an intelligent MX (Maximum Excellence) system for autonomous optimization and business intelligence. The project's ambition is to become a market leader in developer-first enterprise authentication.

## User Preferences
Preferred communication style: Simple, everyday language.
Payment Method: Manual direct bank deposits (Stripe ready for future activation).
Pricing Strategy: 30% less than competitors (Auth0, Okta, Azure AD) with equivalent features and enterprise-grade security.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript.
- **Build Tool**: Vite.
- **UI Framework**: Shadcn/ui built on Radix UI primitives.
- **Styling**: TailwindCSS with custom properties for theming, responsive design.
- **State Management**: TanStack React Query for server state, React Context for authentication.
- **Routing**: Wouter.
- **Form Handling**: React Hook Form with Zod validation.
- **UI/UX Decisions**: Consistent component library, mobile-first, dark mode, ARIA compliant components.

### Backend
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **Session Management**: Express sessions with PostgreSQL store.
- **Authentication**: Keycloak integration (OAuth2/OIDC, SAML 2.0).
- **API Design**: RESTful endpoints with error handling and logging.
- **Core Features**: Role-Based Access Control (Super Admin, Admin, Manager, User), multi-tenant support, multi-factor authentication (MFA), webhook system, API key management, project-specific credential system.
- **Security**: Multi-layer rate limiting, security headers (CSP, HSTS, XSS), input validation (Zod), suspicious activity detection, IP-based access control.

### Database
- **Database**: PostgreSQL (configured for Neon serverless).
- **ORM**: Drizzle ORM with TypeScript schema definitions.
- **Migrations**: Drizzle Kit.
- **Schema**: User management with roles, sessions, tenants, subscription plans, usage metrics, audit logs, and more. Multi-tenant architecture with isolated data.

### Enterprise SSO
- **Providers**: Keycloak (primary), Google Workspace, Microsoft Azure AD, Okta.
- **Flows**: Silent authentication, automatic token refresh, SSO discovery by domain.
- **SAML 2.0**: Full SAML service layer for enterprise SSO.

### MX (Maximum Excellence) System
- **Capabilities**: Self-Healing Engine (auto-fixes errors, performance, security), Real-Time Optimizer (continuous performance monitoring), Advanced Automation (code generation), Business Intelligence (revenue optimization).
- **Integration**: XM Conversation Archive System for AI memory continuity, including activity logging, buffer management, and duplicate prevention.

### Disaster Recovery
- **Strategy**: Multi-region database replication (US East, EU West, Asia Pacific) with geographic data sharding and real-time synchronization. Automated failover (< 2 min RTO).

## External Dependencies

- **Database**: Neon (PostgreSQL serverless).
- **Frontend Libraries**:
    - `@tanstack/react-query`
    - `@radix-ui/*`
    - `wouter`
    - `zod`
    - `react-hook-form`
    - `date-fns`
- **Backend Libraries**:
    - `drizzle-orm`
    - `express-session`
    - `speakeasy` (for MFA TOTP)
    - `bcrypt` (for password hashing)
- **Email Service**: Brevo API.
- **Identity Provider**: Keycloak.
- **Deployment Platform**: Replit.
- **DNS/CDN**: Cloudflare.
- **Potential Future Integration**: Stripe (for billing).