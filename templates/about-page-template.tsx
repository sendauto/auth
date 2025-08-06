import React from "react";
import { Link } from "wouter";
import { Shield, Users, Award, Globe, Heart, Zap } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicNavigation } from "@/components/layout/PublicNavigation";

export function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: "Security First",
      description: "We prioritize security in every decision, ensuring your data is protected with industry-leading encryption and compliance standards."
    },
    {
      icon: Users,
      title: "Customer Focus",
      description: "Our customers' success drives everything we do. We build solutions that solve real problems for real businesses."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We strive for excellence in our products, our service, and our relationships with customers and partners."
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "We're building authentication infrastructure that empowers organizations worldwide to operate securely and efficiently."
    },
    {
      icon: Heart,
      title: "Integrity",
      description: "We operate with transparency, honesty, and ethical practices in all our business relationships."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We continuously push the boundaries of what's possible in authentication and access management."
    }
  ];

  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "CEO & Co-Founder",
      bio: "Former VP of Security at Auth0. 15+ years in enterprise security and authentication.",
      image: "/api/placeholder/150/150"
    },
    {
      name: "Sarah Chen",
      role: "CTO & Co-Founder", 
      bio: "Ex-Google engineer. Led authentication infrastructure for 100M+ user applications.",
      image: "/api/placeholder/150/150"
    },
    {
      name: "Marcus Rodriguez",
      role: "VP of Engineering",
      bio: "Former Microsoft Azure AD team lead. Expert in distributed systems and security.",
      image: "/api/placeholder/150/150"
    },
    {
      name: "Emily Watson",
      role: "Head of Customer Success",
      bio: "Previously at Okta and Ping Identity. Passionate about customer experience.",
      image: "/api/placeholder/150/150"
    }
  ];

  const milestones = [
    {
      year: "2023",
      title: "Company Founded",
      description: "Started with a mission to make enterprise authentication accessible to all organizations."
    },
    {
      year: "2024",
      title: "First 1,000 Customers",
      description: "Reached our first major milestone with customers across 50+ countries."
    },
    {
      year: "2024",
      title: "Series A Funding",
      description: "Raised $15M to accelerate product development and global expansion."
    },
    {
      year: "2025",
      title: "10,000+ Organizations",
      description: "Now serving enterprises, startups, and everything in between worldwide."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation currentPage="/about" />

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Building the future of
              <span className="text-primary block">secure authentication</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to make enterprise-grade authentication accessible, 
              affordable, and easy to implement for organizations of all sizes.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                We believe that robust security shouldn't be a luxury available only to the largest 
                enterprises. Every organization deserves access to world-class authentication 
                infrastructure that protects their users and data.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                That's why we built YourBrand - to democratize enterprise security by offering 
                the same capabilities as Auth0, Okta, and Azure AD at a fraction of the cost, 
                with better developer experience and faster implementation.
              </p>
              <Link href="/contact">
                <Button size="lg" className="px-8">
                  Get in Touch
                </Button>
              </Link>
            </div>
            <div className="lg:order-first">
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 text-center">
                <div className="text-6xl font-bold text-primary mb-4">10,000+</div>
                <div className="text-xl font-semibold text-foreground mb-2">Organizations Trust Us</div>
                <div className="text-muted-foreground">
                  From startups to Fortune 500 companies
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do and every decision we make.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <value.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're a team of security experts, engineers, and customer advocates 
              passionate about building the future of authentication.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="border-0 shadow-sm text-center">
                <CardContent className="p-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {member.name}
                  </h3>
                  <div className="text-sm text-primary font-medium mb-3">
                    {member.role}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From startup to trusted authentication platform serving thousands of organizations.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>
              
              {milestones.map((milestone, index) => (
                <div key={index} className="relative flex items-center mb-12 last:mb-0">
                  <div className="absolute left-6 w-4 h-4 bg-primary rounded-full border-4 border-background"></div>
                  <div className="ml-16">
                    <div className="text-sm font-semibold text-primary mb-1">
                      {milestone.year}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Join us in securing the future
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Whether you're a developer, security professional, or business leader, 
              we'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/careers">
                <Button size="lg" className="px-8">
                  View Open Positions
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="px-8">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}