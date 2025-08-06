/**
 * White-Label Branding System - Complete brand transformation platform
 * Custom domains, themes, and partner marketplace capabilities
 */

import React, { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { PublicNavigation } from '@/components/layout/PublicNavigation';
import { Logo } from '@/components/ui/logo';
import { 
  Palette, 
  Globe, 
  Upload, 
  Eye, 
  Download,
  Copy,
  Settings,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle,
  Code,
  Zap,
  Star,
  Building2,
  Link as LinkIcon,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  logoUrl: string;
  faviconUrl: string;
  companyName: string;
  tagline: string;
  customDomain: string;
  sslEnabled: boolean;
  customCSS: string;
  footerText: string;
}

const defaultConfig: BrandingConfig = {
  primaryColor: '#2563eb',
  secondaryColor: '#3b82f6',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  logoUrl: '',
  faviconUrl: '',
  companyName: 'Your Company',
  tagline: 'Secure Authentication Platform',
  customDomain: '',
  sslEnabled: true,
  customCSS: '',
  footerText: '© 2025 Your Company. All rights reserved.'
};

const presetThemes = [
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937'
  },
  {
    id: 'modern-purple',
    name: 'Modern Purple',
    primaryColor: '#7c3aed',
    secondaryColor: '#a855f7',
    backgroundColor: '#ffffff',
    textColor: '#1f2937'
  },
  {
    id: 'tech-green',
    name: 'Tech Green',
    primaryColor: '#059669',
    secondaryColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#1f2937'
  },
  {
    id: 'dark-mode',
    name: 'Dark Professional',
    primaryColor: '#3b82f6',
    secondaryColor: '#60a5fa',
    backgroundColor: '#111827',
    textColor: '#f9fafb'
  }
];

export function WhiteLabelBrandingPage() {
  const [config, setConfig] = useState<BrandingConfig>(defaultConfig);
  const [activeDevice, setActiveDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewMode, setPreviewMode] = useState<'login' | 'dashboard' | 'signup'>('login');
  const { toast } = useToast();

  const handleConfigChange = (key: keyof BrandingConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const applyPresetTheme = (theme: typeof presetThemes[0]) => {
    setConfig(prev => ({
      ...prev,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      backgroundColor: theme.backgroundColor,
      textColor: theme.textColor
    }));
  };

  const handleSave = () => {
    toast({
      title: 'Branding Saved',
      description: 'Your white-label configuration has been saved successfully.',
    });
  };

  const generateEmbedCode = () => {
    const embedCode = `<!-- Auth247 White-Label Widget -->
<script src="https://cdn.auth247.net/widget.js"></script>
<div id="auth247-widget" 
     data-domain="${config.customDomain || 'your-domain.com'}"
     data-theme="custom"
     data-primary-color="${config.primaryColor}"
     data-company-name="${config.companyName}">
</div>
<script>
  Auth247Widget.init({
    domain: '${config.customDomain || 'your-domain.com'}',
    theme: {
      primaryColor: '${config.primaryColor}',
      backgroundColor: '${config.backgroundColor}',
      textColor: '${config.textColor}'
    }
  });
</script>`;
    
    navigator.clipboard.writeText(embedCode);
    toast({
      title: 'Embed Code Copied',
      description: 'The widget embed code has been copied to your clipboard.',
    });
  };

  const getDevicePreviewStyle = () => {
    switch (activeDevice) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '100%', height: '600px' };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation currentPage="/white-label" />
      
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              White-Label Branding
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Transform Auth247 into your own branded authentication platform. Custom domains, 
            themes, and complete brand control for your business.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Tabs defaultValue="branding" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="branding">Branding</TabsTrigger>
                <TabsTrigger value="domain">Domain</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              {/* Branding Tab */}
              <TabsContent value="branding" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Color Theme
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Preset Themes */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Preset Themes</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {presetThemes.map((theme) => (
                          <Button
                            key={theme.id}
                            variant="outline"
                            className="h-auto p-3 flex flex-col items-center gap-2"
                            onClick={() => applyPresetTheme(theme)}
                          >
                            <div className="flex gap-1">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: theme.primaryColor }}
                              />
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: theme.secondaryColor }}
                              />
                            </div>
                            <span className="text-xs">{theme.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Colors */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primary-color">Primary Color</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="primary-color"
                            type="color"
                            value={config.primaryColor}
                            onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={config.primaryColor}
                            onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="secondary-color">Secondary Color</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="secondary-color"
                            type="color"
                            value={config.secondaryColor}
                            onChange={(e) => handleConfigChange('secondaryColor', e.target.value)}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={config.secondaryColor}
                            onChange={(e) => handleConfigChange('secondaryColor', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Company Information */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="company-name">Company Name</Label>
                        <Input
                          id="company-name"
                          value={config.companyName}
                          onChange={(e) => handleConfigChange('companyName', e.target.value)}
                          placeholder="Your Company Name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input
                          id="tagline"
                          value={config.tagline}
                          onChange={(e) => handleConfigChange('tagline', e.target.value)}
                          placeholder="Your company tagline"
                        />
                      </div>
                    </div>

                    {/* Logo Upload */}
                    <div>
                      <Label>Logo & Favicon</Label>
                      <div className="space-y-2 mt-2">
                        <Button variant="outline" className="w-full">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Logo
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Favicon
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Domain Tab */}
              <TabsContent value="domain" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Custom Domain
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="custom-domain">Domain Name</Label>
                      <Input
                        id="custom-domain"
                        value={config.customDomain}
                        onChange={(e) => handleConfigChange('customDomain', e.target.value)}
                        placeholder="auth.yourcompany.com"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Configure your CNAME record to point to auth247.net
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>SSL Certificate</Label>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Automatic SSL certificate generation
                        </p>
                      </div>
                      <Switch
                        checked={config.sslEnabled}
                        onCheckedChange={(checked) => handleConfigChange('sslEnabled', checked)}
                      />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        DNS Configuration
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">CNAME</code>
                        </div>
                        <div className="flex justify-between">
                          <span>Host:</span>
                          <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">auth</code>
                        </div>
                        <div className="flex justify-between">
                          <span>Value:</span>
                          <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">auth247.net</code>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify Domain
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Custom CSS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={config.customCSS}
                      onChange={(e) => handleConfigChange('customCSS', e.target.value)}
                      placeholder="/* Custom CSS styles */"
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Embed Widget
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Add this code to your website to embed the Auth247 widget with your branding.
                    </p>
                    <Button onClick={generateEmbedCode} className="w-full">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Embed Code
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Save Button */}
            <Button onClick={handleSave} className="w-full" size="lg">
              <Settings className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Live Preview
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Preview Mode Selector */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant={previewMode === 'login' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewMode('login')}
                      >
                        Login
                      </Button>
                      <Button
                        variant={previewMode === 'signup' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewMode('signup')}
                      >
                        Signup
                      </Button>
                      <Button
                        variant={previewMode === 'dashboard' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewMode('dashboard')}
                      >
                        Dashboard
                      </Button>
                    </div>

                    {/* Device Selector */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant={activeDevice === 'desktop' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveDevice('desktop')}
                      >
                        <Monitor className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={activeDevice === 'tablet' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveDevice('tablet')}
                      >
                        <Tablet className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={activeDevice === 'mobile' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveDevice('mobile')}
                      >
                        <Smartphone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div 
                    className="border rounded-lg overflow-hidden shadow-lg"
                    style={getDevicePreviewStyle()}
                  >
                    <div 
                      className="h-full p-8 flex items-center justify-center"
                      style={{ 
                        backgroundColor: config.backgroundColor,
                        color: config.textColor 
                      }}
                    >
                      <div className="text-center max-w-md w-full">
                        <div 
                          className="text-2xl font-bold mb-2"
                          style={{ color: config.primaryColor }}
                        >
                          {config.companyName}
                        </div>
                        <p className="text-sm mb-8 opacity-80">{config.tagline}</p>
                        
                        {previewMode === 'login' && (
                          <div className="space-y-4">
                            <div className="text-lg font-medium">Sign In</div>
                            <div className="space-y-3">
                              <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded border"></div>
                              <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded border"></div>
                              <button 
                                className="w-full h-10 rounded text-white font-medium"
                                style={{ backgroundColor: config.primaryColor }}
                              >
                                Sign In
                              </button>
                            </div>
                          </div>
                        )}

                        {previewMode === 'signup' && (
                          <div className="space-y-4">
                            <div className="text-lg font-medium">Create Account</div>
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded border"></div>
                                <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded border"></div>
                              </div>
                              <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded border"></div>
                              <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded border"></div>
                              <button 
                                className="w-full h-10 rounded text-white font-medium"
                                style={{ backgroundColor: config.primaryColor }}
                              >
                                Create Account
                              </button>
                            </div>
                          </div>
                        )}

                        {previewMode === 'dashboard' && (
                          <div className="space-y-4">
                            <div className="text-lg font-medium">Dashboard</div>
                            <div className="grid grid-cols-2 gap-3">
                              <div 
                                className="h-16 rounded-lg flex items-center justify-center text-white"
                                style={{ backgroundColor: config.primaryColor }}
                              >
                                <div className="text-center">
                                  <div className="text-lg font-bold">24</div>
                                  <div className="text-xs">Users</div>
                                </div>
                              </div>
                              <div 
                                className="h-16 rounded-lg flex items-center justify-center text-white"
                                style={{ backgroundColor: config.secondaryColor }}
                              >
                                <div className="text-center">
                                  <div className="text-lg font-bold">98%</div>
                                  <div className="text-xs">Uptime</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* White-Label Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Complete Branding</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your logo, colors, and domain across all authentication flows
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <LinkIcon className="h-8 w-8 text-green-600 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Custom Domain</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use your own domain with automatic SSL certificate management
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Shield className="h-8 w-8 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Partner Revenue</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Earn revenue sharing from customers you bring to the platform
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
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
    </div>
  );
}