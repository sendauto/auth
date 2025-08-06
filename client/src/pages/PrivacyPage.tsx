import React from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicNavigation } from "@/components/layout/PublicNavigation";

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation currentPage="/privacy" />

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Auth247.net</p>
            <p className="text-muted-foreground">Last updated: June 30, 2025</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            
            <section>
              <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground mb-4">
                Auth247 ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. 
                This privacy policy explains how we collect, use, and safeguard your information when you use our 
                enterprise authentication platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
              
              <h3 className="text-lg font-medium mb-3">Personal Information</h3>
              <p className="text-muted-foreground mb-4">
                We collect information you provide directly to us, such as:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Account information (name, email address, username)</li>
                <li>Profile information (job title, department, organization)</li>
                <li>Authentication credentials (securely hashed passwords, 2FA settings)</li>
                <li>Communication preferences and settings</li>
              </ul>

              <h3 className="text-lg font-medium mb-3">Automatically Collected Information</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Log data (IP addresses, browser type, access times)</li>
                <li>Device information (operating system, device identifiers)</li>
                <li>Usage analytics (features used, session duration)</li>
                <li>Security events (login attempts, authentication failures)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We use the collected information for:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Providing and maintaining our authentication services</li>
                <li>User account management and access control</li>
                <li>Security monitoring and fraud prevention</li>
                <li>Service improvement and analytics</li>
                <li>Customer support and communication</li>
                <li>Compliance with legal obligations</li>
                <li>Enforcing our terms of service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">4. Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground mb-4">
                We do not sell, trade, or rent your personal information. We may share your information in these situations:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>With your organization:</strong> If you're part of an enterprise account, your organization administrator may access certain account information</li>
                <li><strong>Service providers:</strong> Trusted third parties who assist in operating our service</li>
                <li><strong>Legal requirements:</strong> When required by law, regulation, or legal process</li>
                <li><strong>Security purposes:</strong> To protect rights, property, or safety of AuthMesh, users, or others</li>
                <li><strong>Business transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">5. Data Security</h2>
              <p className="text-muted-foreground mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Encryption in transit and at rest using AES-256</li>
                <li>Multi-factor authentication for all accounts</li>
                <li>Regular security audits and penetration testing</li>
                <li>Access controls and principle of least privilege</li>
                <li>Secure data centers with 24/7 monitoring</li>
                <li>Regular backup and disaster recovery procedures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">6. Data Retention</h2>
              <p className="text-muted-foreground mb-4">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide our services to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Maintain security and prevent fraud</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Account data is typically retained for 7 years after account closure for compliance purposes, 
                unless a longer retention period is required by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">7. Your Rights and Choices</h2>
              <p className="text-muted-foreground mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Access:</strong> Request copies of your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate personal data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Restriction:</strong> Request restriction of processing your personal data</li>
                <li><strong>Objection:</strong> Object to processing of your personal data</li>
                <li><strong>Withdraw consent:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">8. International Data Transfers</h2>
              <p className="text-muted-foreground mb-4">
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place for international transfers, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Standard Contractual Clauses approved by the European Commission</li>
                <li>Adequacy decisions by relevant data protection authorities</li>
                <li>Certification schemes and codes of conduct</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">9. Cookies and Tracking</h2>
              <p className="text-muted-foreground mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Maintain user sessions and authentication state</li>
                <li>Remember user preferences and settings</li>
                <li>Analyze usage patterns and improve our service</li>
                <li>Provide security features and fraud prevention</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                You can control cookie preferences through your browser settings, though some features may not function properly if cookies are disabled.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">10. Children's Privacy</h2>
              <p className="text-muted-foreground mb-4">
                Our service is not intended for use by children under 18. We do not knowingly collect personal 
                information from children under 18. If we become aware that we have collected personal information 
                from a child under 18, we will take steps to remove that information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground mb-4">
                We may update this privacy policy from time to time. We will notify you of any changes by:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Posting the new privacy policy on this page</li>
                <li>Updating the "Last updated" date</li>
                <li>Sending email notifications for material changes</li>
                <li>Displaying prominent notices in our service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">12. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Data Protection Officer:</strong> privacy@auth247.net<br />
                  <strong>General Inquiries:</strong> support@auth247.net<br />
                  <strong>Address:</strong> Auth247 Privacy Team<br />
                  123 Enterprise Way, Suite 500<br />
                  San Francisco, CA 94105<br />
                  United States
                </p>
              </div>
            </section>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                This privacy policy is designed to help you understand how we collect, use, and safeguard your 
                information. We are committed to transparency and protecting your privacy rights.
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