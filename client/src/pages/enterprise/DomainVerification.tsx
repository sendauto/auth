/**
 * Domain Verification Page
 * Smart domain verification and auto-enrollment management
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, Globe, CheckCircle, XCircle, Clock, 
  Upload, Download, Copy, RefreshCw, Info 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VerifiedDomain {
  id: string;
  domain: string;
  status: 'pending' | 'verified' | 'failed';
  autoEnrollment: boolean;
  allowSubdomains: boolean;
  verificationMethod: 'dns_txt' | 'dns_cname' | 'file_upload' | 'meta_tag';
  verificationToken: string;
  createdAt: string;
  verifiedAt?: string;
}

export default function DomainVerification() {
  const [domains, setDomains] = useState<VerifiedDomain[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [autoEnrollment, setAutoEnrollment] = useState(true);
  const [allowSubdomains, setAllowSubdomains] = useState(true);
  const [verificationMethod, setVerificationMethod] = useState<'dns_txt' | 'dns_cname' | 'file_upload' | 'meta_tag'>('dns_txt');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    setIsLoading(true);
    try {
      // Generate sample domains
      const sampleDomains: VerifiedDomain[] = [
        {
          id: '1',
          domain: 'company.com',
          status: 'verified',
          autoEnrollment: true,
          allowSubdomains: true,
          verificationMethod: 'dns_txt',
          verificationToken: 'auth247-verification-abc123',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          verifiedAt: new Date(Date.now() - 82800000).toISOString()
        },
        {
          id: '2',
          domain: 'subsidiary.org',
          status: 'pending',
          autoEnrollment: false,
          allowSubdomains: false,
          verificationMethod: 'dns_txt',
          verificationToken: 'auth247-verification-def456',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      setDomains(sampleDomains);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load domains',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addDomain = async () => {
    if (!newDomain.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a domain name',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const domain: VerifiedDomain = {
        id: Math.random().toString(36).substr(2, 9),
        domain: newDomain.trim(),
        status: 'pending',
        autoEnrollment,
        allowSubdomains,
        verificationMethod,
        verificationToken: `auth247-verification-${Math.random().toString(36).substr(2, 8)}`,
        createdAt: new Date().toISOString()
      };

      setDomains(prev => [domain, ...prev]);
      setNewDomain('');

      toast({
        title: 'Success',
        description: 'Domain added for verification'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add domain',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyDomain = async (domain: VerifiedDomain) => {
    setIsLoading(true);
    try {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setDomains(prev => prev.map(d => 
        d.id === domain.id 
          ? { ...d, status: 'verified', verifiedAt: new Date().toISOString() }
          : d
      ));

      toast({
        title: 'Success',
        description: `Domain ${domain.domain} verified successfully`
      });
    } catch (error) {
      setDomains(prev => prev.map(d => 
        d.id === domain.id 
          ? { ...d, status: 'failed' }
          : d
      ));

      toast({
        title: 'Error',
        description: 'Domain verification failed',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard`
    });
  };

  const getVerificationInstructions = (domain: VerifiedDomain) => {
    switch (domain.verificationMethod) {
      case 'dns_txt':
        return {
          title: 'DNS TXT Record',
          instructions: `Add the following TXT record to your DNS:`,
          record: {
            type: 'TXT',
            name: `_auth247-challenge.${domain.domain}`,
            value: `auth247-domain-verification=${domain.verificationToken}`
          }
        };
      case 'dns_cname':
        return {
          title: 'DNS CNAME Record',
          instructions: `Add the following CNAME record to your DNS:`,
          record: {
            type: 'CNAME',
            name: `_auth247-challenge.${domain.domain}`,
            value: '_auth247-challenge.auth247.net'
          }
        };
      case 'file_upload':
        return {
          title: 'File Upload',
          instructions: `Upload a file to your website:`,
          record: {
            type: 'FILE',
            name: `https://${domain.domain}/.well-known/auth247-domain-verification.txt`,
            value: domain.verificationToken
          }
        };
      case 'meta_tag':
        return {
          title: 'HTML Meta Tag',
          instructions: `Add the following meta tag to your website's <head> section:`,
          record: {
            type: 'META',
            name: 'HTML Tag',
            value: `<meta name="auth247-domain-verification" content="${domain.verificationToken}" />`
          }
        };
      default:
        return null;
    }
  };

  const bulkUploadDomains = async (file: File) => {
    setIsLoading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').slice(1); // Skip header
      const newDomains: VerifiedDomain[] = [];

      for (const line of lines) {
        const [domain, autoEnroll, allowSubs] = line.split(',').map(s => s.trim());
        if (domain) {
          newDomains.push({
            id: Math.random().toString(36).substr(2, 9),
            domain,
            status: 'pending',
            autoEnrollment: autoEnroll === 'true',
            allowSubdomains: allowSubs === 'true',
            verificationMethod: 'dns_txt',
            verificationToken: `auth247-verification-${Math.random().toString(36).substr(2, 8)}`,
            createdAt: new Date().toISOString()
          });
        }
      }

      setDomains(prev => [...newDomains, ...prev]);

      toast({
        title: 'Success',
        description: `${newDomains.length} domains added for verification`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload domains',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Domain Verification</h1>
        <p className="text-muted-foreground mt-2">
          Verify domain ownership to enable automatic user enrollment and organization detection
        </p>
      </div>

      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList>
          <TabsTrigger value="manage">Manage Domains</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          <TabsTrigger value="settings">Auto-Enrollment Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          {/* Add New Domain */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Domain
              </CardTitle>
              <CardDescription>
                Add a domain to verify ownership and enable auto-enrollment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="domain">Domain Name</Label>
                  <Input
                    id="domain"
                    placeholder="company.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Verification Method</Label>
                  <Select 
                    value={verificationMethod} 
                    onValueChange={(value: any) => setVerificationMethod(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dns_txt">DNS TXT Record</SelectItem>
                      <SelectItem value="dns_cname">DNS CNAME Record</SelectItem>
                      <SelectItem value="file_upload">File Upload</SelectItem>
                      <SelectItem value="meta_tag">HTML Meta Tag</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-enrollment"
                    checked={autoEnrollment}
                    onCheckedChange={setAutoEnrollment}
                  />
                  <Label htmlFor="auto-enrollment">Enable auto-enrollment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow-subdomains"
                    checked={allowSubdomains}
                    onCheckedChange={setAllowSubdomains}
                  />
                  <Label htmlFor="allow-subdomains">Allow subdomains</Label>
                </div>
              </div>

              <Button onClick={addDomain} disabled={isLoading} className="w-full">
                Add Domain
              </Button>
            </CardContent>
          </Card>

          {/* Domains List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Verified Domains
              </CardTitle>
              <CardDescription>
                {domains.length} domains configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {domains.map((domain) => (
                  <div key={domain.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(domain.status)}
                        <div>
                          <div className="font-medium">{domain.domain}</div>
                          <div className="text-sm text-muted-foreground">
                            Added {new Date(domain.createdAt).toLocaleDateString()}
                            {domain.verifiedAt && (
                              <span> • Verified {new Date(domain.verifiedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(domain.status)}>
                          {domain.status}
                        </Badge>
                        {domain.autoEnrollment && (
                          <Badge variant="outline">Auto-enroll</Badge>
                        )}
                        {domain.allowSubdomains && (
                          <Badge variant="outline">Subdomains</Badge>
                        )}
                      </div>
                    </div>

                    {domain.status === 'pending' && (
                      <div className="space-y-3">
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Complete the verification steps below to verify domain ownership
                          </AlertDescription>
                        </Alert>

                        {(() => {
                          const instructions = getVerificationInstructions(domain);
                          if (!instructions) return null;

                          return (
                            <div className="space-y-2">
                              <h4 className="font-medium">{instructions.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {instructions.instructions}
                              </p>
                              <div className="bg-muted p-3 rounded-md font-mono text-sm">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-semibold">Type:</span>
                                  <span>{instructions.record.type}</span>
                                </div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-semibold">Name:</span>
                                  <div className="flex items-center gap-2">
                                    <span className="break-all">{instructions.record.name}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(instructions.record.name, 'Record name')}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold">Value:</span>
                                  <div className="flex items-center gap-2">
                                    <span className="break-all">{instructions.record.value}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(instructions.record.value, 'Record value')}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        <Button 
                          onClick={() => verifyDomain(domain)} 
                          disabled={isLoading}
                          size="sm"
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                          Verify Domain
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {domains.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No domains configured yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Bulk Domain Upload
              </CardTitle>
              <CardDescription>
                Upload multiple domains at once using a CSV file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bulk-file">CSV File</Label>
                  <input
                    id="bulk-file"
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) bulkUploadDomains(file);
                    }}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    const csvContent = 'domain,autoEnrollment,allowSubdomains\nexample.com,true,true\ncompany.org,false,false';
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'domain-template.csv';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Enrollment Settings</CardTitle>
              <CardDescription>
                Configure how users are automatically enrolled when they sign up with verified domains
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  When auto-enrollment is enabled, users signing up with verified domain email addresses
                  will automatically be added to your organization without requiring manual approval.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Default Auto-Enrollment</h4>
                    <p className="text-sm text-muted-foreground">
                      Enable auto-enrollment by default for new domains
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Subdomain Matching</h4>
                    <p className="text-sm text-muted-foreground">
                      Allow subdomains by default (e.g., if company.com is verified, allow dev.company.com)
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Send notifications when new users are auto-enrolled
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}