import React, { useState } from "react";
import { Link } from "wouter";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { ProviderSelectionModal } from "@/components/auth/ProviderSelectionModal";

interface PublicNavigationProps {
  currentPage?: string;
}

export function PublicNavigation({ currentPage }: PublicNavigationProps) {
  const [showProviderModal, setShowProviderModal] = useState(false);
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/pricing", label: "Pricing" },
    { href: "/developer-portal", label: "Developers" },
    { href: "/integrations", label: "Integrations" },
    { href: "/white-label", label: "White-Label" },
    { href: "/dlogin", label: "Demo" }
  ];

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <Logo size="md" />
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span 
                  className={`transition-colors cursor-pointer ${
                    currentPage === item.href 
                      ? "text-primary font-medium" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Button 
              size="sm"
              onClick={() => setShowProviderModal(true)}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile menu button - could be expanded later */}
          <div className="md:hidden">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
      
      <ProviderSelectionModal
        isOpen={showProviderModal}
        onClose={() => setShowProviderModal(false)}
        mode="signup"
      />
    </nav>
  );
}