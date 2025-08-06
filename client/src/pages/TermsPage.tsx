import React from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicNavigation } from "@/components/layout/PublicNavigation";

export function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation currentPage="/terms" />

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-muted-foreground">Auth247.net</p>
            <p className="text-muted-foreground">Last updated: June 30, 2025</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            
            <section>
              <h2 className="text-xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="text-muted-foreground mb-4">
                By accessing and using Auth247 ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
                If you disagree with any part of these terms, you may not access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground mb-4">
                Auth247 is an enterprise-grade authentication and access management platform that provides:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Single Sign-On (SSO) authentication services</li>
                <li>Role-based access control (RBAC)</li>
                <li>Multi-tenant user management</li>
                <li>Security monitoring and compliance tools</li>
                <li>Integration with third-party identity providers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground mb-4">
                When you create an account with us, you must provide accurate, complete, and current information. 
                You are responsible for safeguarding your account credentials and for all activities under your account.
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>You must be at least 18 years old to use this Service</li>
                <li>You are responsible for maintaining account security</li>
                <li>You must notify us immediately of any unauthorized use</li>
                <li>We reserve the right to terminate accounts that violate these terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">4. Acceptable Use</h2>
              <p className="text-muted-foreground mb-4">
                You agree not to use the Service:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>For any unlawful purpose or to solicit unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations or laws</li>
                <li>To infringe upon or violate our intellectual property rights or others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">5. Enterprise Services</h2>
              <p className="text-muted-foreground mb-4">
                For enterprise customers, additional terms may apply:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Service Level Agreements (SLAs) as specified in your contract</li>
                <li>Data processing agreements for GDPR compliance</li>
                <li>Custom security and compliance requirements</li>
                <li>Professional services and support terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">6. Data Protection and Privacy</h2>
              <p className="text-muted-foreground mb-4">
                Your privacy is important to us. Our data handling practices are detailed in our Privacy Policy. 
                By using the Service, you agree to the collection and use of information in accordance with our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">7. Service Availability</h2>
              <p className="text-muted-foreground mb-4">
                We strive to maintain high service availability but cannot guarantee uninterrupted service. 
                We may temporarily suspend the Service for maintenance, updates, or other operational reasons.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">8. Intellectual Property</h2>
              <p className="text-muted-foreground mb-4">
                The Service and its original content, features, and functionality are owned by AuthMesh and are 
                protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                In no event shall Auth247, its directors, employees, partners, agents, suppliers, or affiliates be 
                liable for any indirect, incidental, special, consequential, or punitive damages, including loss of 
                profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">10. Termination</h2>
              <p className="text-muted-foreground mb-4">
                We may terminate or suspend your account immediately, without prior notice or liability, for any 
                reason whatsoever, including breach of the Terms. Upon termination, your right to use the Service 
                will cease immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">11. Changes to Terms</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, 
                we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">12. Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Email:</strong> legal@auth247.net<br />
                  <strong>Address:</strong> Auth247 Legal Department<br />
                  123 Enterprise Way, Suite 500<br />
                  San Francisco, CA 94105<br />
                  United States
                </p>
              </div>
            </section>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                By using Auth247, you acknowledge that you have read and understood these Terms of Service 
                and agree to be bound by them.
              </p>
            </div>

          </CardContent>
        </Card>
      </main>

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