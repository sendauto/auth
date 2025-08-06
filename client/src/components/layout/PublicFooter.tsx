import React from "react";
import { Link } from "wouter";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export function PublicFooter() {
  const footerLinks = {
    Product: [
      { href: "/", label: "Home" },
      { href: "/pricing", label: "Pricing" },
      { href: "/enterprise", label: "Enterprise" },
      { href: "/demo", label: "Demo" }
    ],
    Developers: [
      { href: "/developer-portal", label: "Developer Portal" },
      { href: "/integrations", label: "Integrations" },
      { href: "/api-docs", label: "API Documentation" },
      { href: "/webhooks", label: "Webhooks" }
    ],
    Company: [
      { href: "/about", label: "About Us" },
      { href: "/blog", label: "Blog" },
      { href: "/careers", label: "Careers" },
      { href: "/contact", label: "Contact" }
    ],
    Legal: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/security", label: "Security" },
      { href: "/compliance", label: "Compliance" }
    ]
  };

  const socialLinks = [
    { href: "https://github.com/auth247", icon: Github, label: "GitHub" },
    { href: "https://twitter.com/auth247", icon: Twitter, label: "Twitter" },
    { href: "https://linkedin.com/company/auth247", icon: Linkedin, label: "LinkedIn" },
    { href: "mailto:hello@auth247.net", icon: Mail, label: "Email" }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/">
              <Logo size="lg" variant="white" />
            </Link>
            <p className="text-gray-400 mt-4 max-w-sm">
              Revolutionary enterprise authentication with 70% cost savings. Pay only for active users with Auth247.
            </p>
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <span className="text-gray-400 hover:text-white transition-colors cursor-pointer text-sm">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 Auth247. All rights reserved. Built with ❤️ for developers.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-gray-400">
                🔒 SOC 2 Type II Certified
              </div>
              <div className="text-gray-400">
                🌍 99.9% Uptime SLA
              </div>
              <div className="text-gray-400">
                ⚡ Sub-100ms Response Times
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gray-800/50 rounded-lg p-6 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="font-semibold mb-2">Stay Updated</h3>
              <p className="text-gray-400 text-sm">
                Get the latest updates on Auth247 features, security insights, and industry news.
              </p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-700 border border-gray-600 rounded-l-md px-4 py-2 text-white placeholder-gray-400 flex-1 md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button className="rounded-l-none">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}