/**
 * Resource Hub Page - SEO-optimized viral content hub
 * Interactive tools and calculators designed for sharing and backlinks
 */

import React from 'react';
import { Link } from 'wouter';
import { PublicNavigation } from '@/components/layout/PublicNavigation';
import { ViralContentHub } from '@/components/seo/ViralContentHub';
import { SEOHead, commonStructuredData } from '@/components/seo/SEOHead';

export function ResourceHubPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Auth247 Resource Hub",
    "description": "Interactive tools and resources for enterprise authentication. SSO cost calculator, security checklists, migration guides.",
    "url": "https://auth247.net/resources",
    "mainEntity": [
      {
        "@type": "WebApplication",
        "name": "SSO Cost Calculator",
        "description": "Calculate savings by switching to Auth247 from other authentication providers",
        "applicationCategory": "UtilityApplication",
        "operatingSystem": "Web-based"
      },
      {
        "@type": "DigitalDocument",
        "name": "Enterprise Security Checklist",
        "description": "Comprehensive security checklist for enterprise authentication",
        "fileFormat": "text/plain"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <SEOHead
        title="Auth247 Resource Hub - Interactive Tools & Calculators"
        description="Free interactive tools for enterprise authentication. SSO cost calculator, security checklists, migration guides. Calculate your savings vs Auth0, Okta."
        keywords={[
          'SSO cost calculator',
          'authentication resources',
          'enterprise security checklist',
          'Auth0 alternative calculator',
          'Okta pricing comparison',
          'SSO migration guide',
          'authentication ROI calculator',
          'enterprise security tools'
        ]}
        structuredData={structuredData}
      />
      
      <PublicNavigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ViralContentHub />
      </div>
      
      {/* Standard Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Product</h3>
              <div className="space-y-2">
                <Link href="/pricing" className="block text-gray-300 hover:text-white transition-colors">Pricing</Link>
                <Link href="/demo" className="block text-gray-300 hover:text-white transition-colors">Live Demo</Link>
                <Link href="/docs" className="block text-gray-300 hover:text-white transition-colors">Documentation</Link>
                <Link href="/developer-portal" className="block text-gray-300 hover:text-white transition-colors">Developer Portal</Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Company</h3>
              <div className="space-y-2">
                <Link href="/about" className="block text-gray-300 hover:text-white transition-colors">About</Link>
                <Link href="/contact" className="block text-gray-300 hover:text-white transition-colors">Contact</Link>
                <Link href="/migration-assistant" className="block text-gray-300 hover:text-white transition-colors">Migration</Link>
                <Link href="/white-label" className="block text-gray-300 hover:text-white transition-colors">White Label</Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Legal</h3>
              <div className="space-y-2">
                <Link href="/terms" className="block text-gray-300 hover:text-white transition-colors">Terms of Service</Link>
                <Link href="/privacy" className="block text-gray-300 hover:text-white transition-colors">Privacy Policy</Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Auth247</h3>
              <p className="text-gray-300 text-sm">Secure 24/7 authentication platform for modern enterprises.</p>
              <p className="text-gray-400 text-xs">© 2025 Auth247 Technologies LLC. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}