import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Auth247Provider } from "@/components/auth/Auth247Provider";
import { withAuthRoute } from "@/components/auth/withAuthRoute";
import { useSessionMonitor } from "@/hooks/useSessionMonitor";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { Suspense, lazy } from "react";

// Loading component for lazy-loaded pages
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Critical pages loaded immediately (always needed)
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";

// Lazy load non-critical pages for performance optimization
const AboutPage = lazy(() => import("@/pages/AboutPage").then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import("@/pages/ContactPage").then(m => ({ default: m.ContactPage })));
const DocsPage = lazy(() => import("@/pages/DocsPage").then(m => ({ default: m.DocsPage })));
const PricingPage = lazy(() => import("@/pages/PricingPage").then(m => ({ default: m.PricingPage })));
const DemoPage = lazy(() => import("@/pages/DemoPage").then(m => ({ default: m.DemoPage })));

const MigrationAssistantPage = lazy(() => import("@/pages/MigrationAssistantPage"));
const DeveloperHubPage = lazy(() => import("@/pages/DeveloperHubPage"));

const DemoLoginPage = lazy(() => import("@/pages/DemoLoginPage"));
const SignupPage = lazy(() => import("@/pages/SignupPage").then(m => ({ default: m.SignupPage })));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage").then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage").then(m => ({ default: m.ResetPasswordPage })));
const TermsPage = lazy(() => import("@/pages/TermsPage").then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage").then(m => ({ default: m.PrivacyPage })));
const DashboardPage = lazy(() => import("@/pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const AdminPage = lazy(() => import("@/pages/AdminPage").then(m => ({ default: m.AdminPage })));
const ManagerPage = lazy(() => import("@/pages/ManagerPage").then(m => ({ default: m.ManagerPage })));
const ProfilePage = lazy(() => import("@/pages/ProfilePage").then(m => ({ default: m.ProfilePage })));
const SubscriptionPage = lazy(() => import("@/pages/SubscriptionPage").then(m => ({ default: m.SubscriptionPage })));
const SettingsPage = lazy(() => import("@/pages/SettingsPage").then(m => ({ default: m.SettingsPage })));
const TeamPage = lazy(() => import("@/pages/TeamPage").then(m => ({ default: m.TeamPage })));
const OrganizationPage = lazy(() => import("@/pages/OrganizationPage").then(m => ({ default: m.OrganizationPage })));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage").then(m => ({ default: m.AnalyticsPage })));
const MXMonitoringPage = lazy(() => import("@/pages/MXMonitoringPage"));
const ViralGrowthDashboard = lazy(() => import("@/pages/ViralGrowthDashboard").then(m => ({ default: m.ViralGrowthDashboard })));
const ResourceHubPage = lazy(() => import("@/pages/ResourceHubPage").then(m => ({ default: m.ResourceHubPage })));
const DeveloperPortalPage = lazy(() => import("@/pages/DeveloperPortalPage").then(m => ({ default: m.DeveloperPortalPage })));
const IntegrationMarketplacePage = lazy(() => import("@/pages/IntegrationMarketplacePage").then(m => ({ default: m.IntegrationMarketplacePage })));
const AdvancedAnalyticsPage = lazy(() => import("@/pages/AdvancedAnalyticsPage").then(m => ({ default: m.AdvancedAnalyticsPage })));
const WhiteLabelBrandingPage = lazy(() => import("@/pages/WhiteLabelBrandingPage").then(m => ({ default: m.WhiteLabelBrandingPage })));
const MFASetupPage = lazy(() => import("@/pages/MFASetupPage"));
const ErrorPage = lazy(() => import("@/pages/ErrorPage").then(m => ({ default: m.ErrorPage })));
const NotFound = lazy(() => import("@/pages/not-found"));

// Base44 Integration Pages
const Base44LoginPage = lazy(() => import("@/pages/Base44LoginPage"));
const Base44RegisterPage = lazy(() => import("@/pages/Base44RegisterPage"));
const Base44Dashboard = lazy(() => import("@/pages/Base44Dashboard"));

// Create protected route components
const ProtectedDashboard = withAuthRoute(DashboardPage);
const ProtectedProfile = withAuthRoute(ProfilePage);
const ProtectedSubscription = withAuthRoute(SubscriptionPage);
const ProtectedSettings = withAuthRoute(SettingsPage);
const ProtectedTeam = withAuthRoute(TeamPage, { 
  requiredRoles: ["manager", "admin", "super_admin"] 
});
const ProtectedOrganization = withAuthRoute(OrganizationPage, { 
  requiredRoles: ["manager", "admin", "super_admin"] 
});
const ProtectedAnalytics = withAuthRoute(AnalyticsPage, { 
  requiredRoles: ["manager", "admin", "super_admin"] 
});
const ProtectedMXMonitoring = withAuthRoute(MXMonitoringPage, { 
  requiredRoles: ["admin", "super_admin"] 
});
const ProtectedViralGrowth = withAuthRoute(ViralGrowthDashboard, { 
  requiredRoles: ["admin", "super_admin"] 
});
const ProtectedManager = withAuthRoute(ManagerPage, { 
  requiredRoles: ["manager", "admin", "super_admin"] 
});
const ProtectedAdmin = withAuthRoute(AdminPage, { 
  requiredRoles: ["admin", "super_admin"] 
});

// Create protected admin pages
const SecuritySettingsPage = lazy(() => import("@/pages/SecuritySettingsPage").then(m => ({ default: m.SecuritySettingsPage })));
const APIKeysPage = lazy(() => import("@/pages/APIKeysPage").then(m => ({ default: m.APIKeysPage })));
const DataManagementPage = lazy(() => import("@/pages/DataManagementPage").then(m => ({ default: m.DataManagementPage })));
const TenantManagementPage = lazy(() => import("@/pages/TenantManagementPage").then(m => ({ default: m.TenantManagementPage })));
const GlobalPermissionsPage = lazy(() => import("@/pages/GlobalPermissionsPage").then(m => ({ default: m.GlobalPermissionsPage })));

const ProtectedSecuritySettings = withAuthRoute(SecuritySettingsPage, { 
  requiredRoles: ["admin", "super_admin"] 
});
const ProtectedAPIKeys = withAuthRoute(APIKeysPage, { 
  requiredRoles: ["admin", "super_admin"] 
});
const ProtectedDataManagement = withAuthRoute(DataManagementPage, { 
  requiredRoles: ["admin", "super_admin"] 
});
const ProtectedTenantManagement = withAuthRoute(TenantManagementPage, { 
  requiredRoles: ["admin", "super_admin"] 
});
const ProtectedGlobalPermissions = withAuthRoute(GlobalPermissionsPage, { 
  requiredRoles: ["admin", "super_admin"] 
});
const ProtectedMFASetup = withAuthRoute(MFASetupPage);

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Public Marketing Pages */}
        <Route path="/" component={HomePage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/docs" component={DocsPage} />

        <Route path="/pricing" component={PricingPage} />
        <Route path="/demo" component={DemoPage} />

        <Route path="/migration-assistant" component={MigrationAssistantPage} />
        <Route path="/developer-hub" component={DeveloperHubPage} />
        <Route path="/resources" component={ResourceHubPage} />
        <Route path="/developer-portal" component={DeveloperPortalPage} />
        <Route path="/integrations" component={IntegrationMarketplacePage} />
        <Route path="/advanced-analytics" component={AdvancedAnalyticsPage} />
        <Route path="/white-label" component={WhiteLabelBrandingPage} />
        
        {/* Authentication Pages */}
        <Route path="/login" component={LoginPage} />
        <Route path="/dlogin" component={DemoLoginPage} />
        <Route path="/signup" component={SignupPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/reset-password" component={ResetPasswordPage} />
        <Route path="/reset-password/*" component={ResetPasswordPage} />
        
        {/* Base44 Integration Pages */}
        <Route path="/base44/login" component={Base44LoginPage} />
        <Route path="/base44/register" component={Base44RegisterPage} />
        <Route path="/base44/dashboard" component={Base44Dashboard} />
        
        <Route path="/terms" component={TermsPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/error">
          {() => <ErrorPage />}
        </Route>
        
        {/* Protected Routes */}
        <Route path="/dashboard" component={ProtectedDashboard} />
        <Route path="/profile" component={ProtectedProfile} />
        <Route path="/subscription" component={ProtectedSubscription} />
        <Route path="/settings" component={ProtectedSettings} />
        <Route path="/mfa-setup" component={ProtectedMFASetup} />
        
        {/* Manager Level Routes */}
        <Route path="/team" component={ProtectedTeam} />
        <Route path="/organization" component={ProtectedOrganization} />
        <Route path="/analytics" component={ProtectedAnalytics} />
        
        {/* Admin Level Routes */}
        <Route path="/admin" component={ProtectedAdmin} />
        <Route path="/admin/security" component={ProtectedSecuritySettings} />
        <Route path="/admin/api-keys" component={ProtectedAPIKeys} />
        <Route path="/admin/data" component={ProtectedDataManagement} />
        <Route path="/admin/tenants" component={ProtectedTenantManagement} />
        <Route path="/admin/permissions" component={ProtectedGlobalPermissions} />
        <Route path="/system/:section?" component={ProtectedAdmin} />
        <Route path="/mx-monitoring" component={ProtectedMXMonitoring} />
        <Route path="/viral-growth" component={ProtectedViralGrowth} />
        
        {/* Enterprise B2B Features */}
        <Route path="/enterprise" component={() => {
          const EnterpriseIndex = lazy(() => import('./pages/enterprise/index'));
          return <Suspense fallback={<div>Loading...</div>}><EnterpriseIndex /></Suspense>;
        }} />
        <Route path="/enterprise/scim" component={() => {
          const SCIMConfig = lazy(() => import('./pages/enterprise/SCIMConfig'));
          return <Suspense fallback={<div>Loading...</div>}><SCIMConfig /></Suspense>;
        }} />
        <Route path="/enterprise/audit-logs" component={() => {
          const AuditLogs = lazy(() => import('./pages/enterprise/AuditLogs'));
          return <Suspense fallback={<div>Loading...</div>}><AuditLogs /></Suspense>;
        }} />
        <Route path="/enterprise/bulk-operations" component={() => {
          const BulkOperations = lazy(() => import('./pages/enterprise/BulkOperations'));
          return <Suspense fallback={<div>Loading...</div>}><BulkOperations /></Suspense>;
        }} />
        <Route path="/enterprise/domains" component={() => {
          const DomainVerification = lazy(() => import('./pages/enterprise/DomainVerification'));
          return <Suspense fallback={<div>Loading...</div>}><DomainVerification /></Suspense>;
        }} />
        <Route path="/enterprise/billing" component={() => {
          const ActiveUserBilling = lazy(() => import('./pages/enterprise/ActiveUserBilling'));
          return <Suspense fallback={<div>Loading...</div>}><ActiveUserBilling /></Suspense>;
        }} />
        <Route path="/enterprise/migration" component={() => {
          const MigrationAssistant = lazy(() => import('./pages/enterprise/MigrationAssistant'));
          return <Suspense fallback={<div>Loading...</div>}><MigrationAssistant /></Suspense>;
        }} />
        <Route path="/enterprise/comparison" component={() => {
          const CompetitorComparison = lazy(() => import('./pages/enterprise/CompetitorComparison'));
          return <Suspense fallback={<div>Loading...</div>}><CompetitorComparison /></Suspense>;
        }} />
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  // Initialize XM conversation archiving system
  useSessionMonitor();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <Auth247Provider>
            <Toaster />
            <Router />
          </Auth247Provider>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
