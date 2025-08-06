import React from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary via-primary to-secondary text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to revolutionize your authentication costs?
          </h2>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
            Join thousands of companies saving up to 70% on authentication while getting enterprise-grade security and features.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="flex items-center justify-center gap-3 text-lg">
              <CheckCircle className="h-6 w-6 text-green-300" />
              <span>15-minute setup</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-lg">
              <Shield className="h-6 w-6 text-green-300" />
              <span>Enterprise security</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-lg">
              <Zap className="h-6 w-6 text-green-300" />
              <span>Zero migration downtime</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto bg-white text-primary hover:bg-gray-100">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto border-white text-white hover:bg-white/10">
                See Live Demo
              </Button>
            </Link>
          </div>

          <div className="text-sm text-primary-foreground/80">
            14-day enterprise trial • No credit card required • Cancel anytime
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-lg font-semibold text-primary-foreground/90">
              Trusted by companies of all sizes
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-70">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">10,000+</div>
              <div className="text-sm">Active Companies</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">99.9%</div>
              <div className="text-sm">Uptime SLA</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">SOC 2</div>
              <div className="text-sm">Type II Certified</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm">Expert Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}