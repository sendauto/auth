/**
 * SEO Head Component - Dynamic meta tags and structured data
 * Optimizes each page for search engines and social sharing
 */

import React from 'react';
import { useLocation } from 'wouter';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  canonical?: string;
  noindex?: boolean;
  structuredData?: any;
}

export function SEOHead({
  title,
  description,
  keywords,
  image,
  canonical,
  noindex = false,
  structuredData
}: SEOHeadProps) {
  const [location] = useLocation();
  
  // Default SEO data based on current route
  const getDefaultSEOData = () => {
    const baseUrl = 'https://auth247.net';
    const currentUrl = `${baseUrl}${location}`;
    
    const defaults = {
      '/': {
        title: 'Auth247 - Secure 24/7 Authentication Platform | No SSO Tax',
        description: 'Enterprise authentication platform with no SSO tax. Save 67% vs Auth0, Okta. 5-minute SSO setup, enterprise security included. Start free trial today.',
        keywords: ['authentication platform', 'enterprise SSO', 'no SSO tax', 'Auth0 alternative', 'Okta alternative'],
        image: `${baseUrl}/images/auth247-social-share.png`
      },
      '/pricing': {
        title: 'Auth247 Pricing - No SSO Tax | Save 67% vs Competitors',
        description: 'Transparent pricing with no SSO upcharges. Enterprise SSO included in all plans. Compare Auth247 vs Auth0, Okta pricing. Free 14-day trial.',
        keywords: ['auth247 pricing', 'SSO pricing comparison', 'Auth0 vs Auth247', 'no SSO tax'],
        image: `${baseUrl}/images/pricing-comparison.png`
      },
      '/docs': {
        title: 'Auth247 Documentation - Integration Guides & API Reference',
        description: 'Complete Auth247 documentation. SSO integration guides, API reference, SDK documentation. React, Node.js, Python examples included.',
        keywords: ['auth247 documentation', 'SSO integration guide', 'authentication API'],
        image: `${baseUrl}/images/documentation-preview.png`
      },
      '/demo': {
        title: 'Auth247 Demo - Live Authentication Platform Demo',
        description: 'See Auth247 in action. Interactive demo of enterprise SSO, multi-factor authentication, and self-service setup. No registration required.',
        keywords: ['auth247 demo', 'authentication demo', 'SSO demo', 'enterprise security demo'],
        image: `${baseUrl}/images/demo-preview.png`
      },
      '/signup': {
        title: 'Sign Up for Auth247 - Free 14-Day Trial | No SSO Tax',
        description: 'Start your free Auth247 trial today. Enterprise authentication with no SSO tax. Set up SSO in 5 minutes. Full features included.',
        keywords: ['auth247 signup', 'free trial', 'enterprise authentication trial'],
        image: `${baseUrl}/images/signup-hero.png`
      },
      '/about': {
        title: 'About Auth247 - Enterprise Authentication Without the Tax',
        description: 'Learn about Auth247\'s mission to eliminate the SSO tax. Founded to provide enterprise authentication without hidden costs or complexity.',
        keywords: ['about auth247', 'authentication company', 'SSO tax elimination'],
        image: `${baseUrl}/images/about-team.png`
      },
      '/contact': {
        title: 'Contact Auth247 - Enterprise Authentication Support',
        description: 'Get in touch with Auth247 for enterprise authentication solutions. Sales inquiries, technical support, and partnership opportunities.',
        keywords: ['contact auth247', 'enterprise sales', 'authentication support'],
        image: `${baseUrl}/images/contact-hero.png`
      }
    };

    return defaults[location as keyof typeof defaults] || {
      title: 'Auth247 - Secure Enterprise Authentication Platform',
      description: 'Enterprise authentication platform with no SSO tax. Secure, fast, and affordable authentication for your business.',
      keywords: ['authentication', 'SSO', 'enterprise security', 'Auth247'],
      image: `${baseUrl}/images/auth247-social-share.png`
    };
  };

  const defaultData = getDefaultSEOData();
  const seoTitle = title || defaultData.title;
  const seoDescription = description || defaultData.description;
  const seoKeywords = keywords || defaultData.keywords;
  const seoImage = image || defaultData.image;
  const seoCanonical = canonical || `https://auth247.net${location}`;

  React.useEffect(() => {
    // Update document title
    document.title = seoTitle;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', seoDescription);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = seoDescription;
      document.head.appendChild(meta);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', seoKeywords.join(', '));
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = seoKeywords.join(', ');
      document.head.appendChild(meta);
    }

    // Update Open Graph tags
    updateMetaProperty('og:title', seoTitle);
    updateMetaProperty('og:description', seoDescription);
    updateMetaProperty('og:image', seoImage);
    updateMetaProperty('og:url', seoCanonical);
    updateMetaProperty('og:type', 'website');
    updateMetaProperty('og:site_name', 'Auth247');

    // Update Twitter Card tags
    updateMetaProperty('twitter:card', 'summary_large_image');
    updateMetaProperty('twitter:title', seoTitle);
    updateMetaProperty('twitter:description', seoDescription);
    updateMetaProperty('twitter:image', seoImage);
    updateMetaProperty('twitter:site', '@auth247net');

    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', seoCanonical);
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = seoCanonical;
      document.head.appendChild(link);
    }

    // Add robots meta tag
    updateMetaName('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // Add structured data
    if (structuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [location, seoTitle, seoDescription, seoKeywords, seoImage, seoCanonical, noindex, structuredData]);

  return null; // This component only manages document head
}

function updateMetaProperty(property: string, content: string) {
  const meta = document.querySelector(`meta[property="${property}"]`);
  if (meta) {
    meta.setAttribute('content', content);
  } else {
    const newMeta = document.createElement('meta');
    newMeta.setAttribute('property', property);
    newMeta.setAttribute('content', content);
    document.head.appendChild(newMeta);
  }
}

function updateMetaName(name: string, content: string) {
  const meta = document.querySelector(`meta[name="${name}"]`);
  if (meta) {
    meta.setAttribute('content', content);
  } else {
    const newMeta = document.createElement('meta');
    newMeta.setAttribute('name', name);
    newMeta.setAttribute('content', content);
    document.head.appendChild(newMeta);
  }
}

// Pre-defined structured data for common pages
export const commonStructuredData = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Auth247",
    "url": "https://auth247.net",
    "logo": "https://auth247.net/images/auth247-logo.png",
    "description": "Enterprise authentication platform providing secure 24/7 access management without SSO tax",
    "sameAs": [
      "https://twitter.com/auth247net",
      "https://linkedin.com/company/auth247",
      "https://github.com/auth247"
    ]
  },

  software: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Auth247",
    "description": "Enterprise authentication platform with no SSO tax",
    "url": "https://auth247.net",
    "applicationCategory": "SecurityApplication",
    "operatingSystem": "Web-based",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150",
      "bestRating": "5"
    },
    "featureList": [
      "Enterprise SSO (no extra cost)",
      "SAML 2.0 authentication",
      "OAuth2 integration",
      "Multi-factor authentication",
      "Self-service setup"
    ]
  },

  faq: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the SSO tax?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The SSO tax is when authentication providers charge 2-4x extra for enterprise SSO features. Auth247 includes all SSO providers in every plan at no additional cost."
        }
      },
      {
        "@type": "Question",
        "name": "How long does SSO setup take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Auth247's self-service SSO setup takes 2-15 minutes depending on the provider, with most automated steps."
        }
      }
    ]
  }
};

// Hook for tracking SEO events
export function useSEOTracking() {
  const trackSEOEvent = React.useCallback((event: string, data: any) => {
    fetch('/api/seo/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        path: window.location.pathname,
        event,
        data: {
          ...data,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer
        }
      })
    }).catch(console.error);
  }, []);

  return { trackSEOEvent };
}