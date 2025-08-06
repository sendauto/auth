import React, { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PublicNavigation } from "@/components/layout/PublicNavigation";

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message Sent",
        description: "Thank you for your message. We'll get back to you within 24 hours.",
      });
      
      setFormData({
        name: "",
        email: "",
        company: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "hello@auth247.net",
      description: "Send us an email anytime"
    },
    {
      icon: Phone,
      title: "Phone",
      content: "+1 (555) 247-AUTH",
      description: "Call us during business hours"
    },
    {
      icon: MapPin,
      title: "Office",
      content: "San Francisco, CA",
      description: "Our headquarters"
    },
    {
      icon: Clock,
      title: "Support Hours",
      content: "24/7",
      description: "Enterprise customers get round-the-clock support"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation currentPage="/contact" />

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Have questions about Auth247? We're here to help. Reach out to our team 
              and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="border-0 shadow-sm text-center">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <info.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{info.title}</h3>
                  <p className="text-lg font-medium mb-1">{info.content}</p>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Send us a Message</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Whether you have questions about pricing, features, or need technical support, 
                our team is ready to help. Fill out the form and we'll respond within 24 hours.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Sales Inquiries</h3>
                    <p className="text-muted-foreground">
                      Interested in Auth247 for your organization? Our sales team can provide 
                      custom demos and pricing information.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Technical Support</h3>
                    <p className="text-muted-foreground">
                      Need help with implementation or have technical questions? Our support 
                      engineers are here to assist.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Response Time</h3>
                    <p className="text-muted-foreground">
                      We typically respond to inquiries within 4 hours during business hours, 
                      and within 24 hours on weekends.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Contact Form</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="your.email@company.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Your company name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="How can we help?"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Tell us more about your needs..."
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Quick answers to common questions about Auth247.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">How quickly can we get started?</h3>
                <p className="text-muted-foreground">
                  Most customers are up and running within 24 hours. Our setup process 
                  typically takes 5-15 minutes depending on your requirements.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Do you offer custom integrations?</h3>
                <p className="text-muted-foreground">
                  Yes! Our Enterprise plan includes custom integrations and dedicated 
                  support for unique requirements.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">What about data security?</h3>
                <p className="text-muted-foreground">
                  We're SOC 2 Type II certified with enterprise-grade encryption, 
                  regular security audits, and compliance with major standards.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Can we migrate from our current solution?</h3>
                <p className="text-muted-foreground">
                  Absolutely! We provide migration assistance and tools to help you 
                  transition from existing authentication systems seamlessly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

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