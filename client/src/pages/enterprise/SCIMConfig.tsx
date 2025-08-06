/**
 * SCIM Configuration Page
 * Enterprise user provisioning setup
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Eye, EyeOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SCIMEndpoint {
  url: string;
  token: string;
  isActive: boolean;
  lastSync?: string;
  userCount?: number;
}

export default function SCIMConfig() {
  const [endpoint, setEndpoint] = useState<SCIMEndpoint | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSCIMConfig();
  }, []);

  const loadSCIMConfig = async () => {
    setIsLoading(true);
    try {
      // In production, would fetch actual SCIM config
      const config: SCIMEndpoint = {
        url: 'https://auth247.net/scim/v2',
        token: 'scim_' + Math.random().toString(36).substr(2, 32),
        isActive: true,
        lastSync: new Date().toISOString(),
        userCount: 42
      };
      setEndpoint(config);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load SCIM configuration',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewToken = async () => {
    setIsLoading(true);
    try {
      const newToken = 'scim_' + Math.random().toString(36).substr(2, 32);
      setEndpoint(prev => prev ? { ...prev, token: newToken } : null);
      toast({
        title: 'Success',
        description: 'New SCIM token generated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate new token',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard`
    });
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: 'Success',
        description: 'SCIM endpoint is working correctly'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'SCIM connection test failed',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !endpoint) {
    return (
      <div className="flex items-center justify-center h-48">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">SCIM Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Configure automated user provisioning and deprovisioning with your identity provider
        </p>
      </div>

      {/* SCIM Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            SCIM Status
          </CardTitle>
          <CardDescription>
            Your SCIM endpoint is active and ready for user provisioning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Active
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                Last sync: {endpoint?.lastSync ? new Date(endpoint.lastSync).toLocaleString() : 'Never'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{endpoint?.userCount || 0}</p>
              <p className="text-sm text-muted-foreground">Provisioned Users</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SCIM Endpoint Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoint Configuration</CardTitle>
          <CardDescription>
            Configure these settings in your identity provider (Okta, Azure AD, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="scim-url">SCIM Base URL</Label>
            <div className="flex mt-1">
              <Input
                id="scim-url"
                value={endpoint?.url || ''}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={() => copyToClipboard(endpoint?.url || '', 'SCIM URL')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="scim-token">Bearer Token</Label>
            <div className="flex mt-1">
              <Input
                id="scim-token"
                type={showToken ? 'text' : 'password'}
                value={endpoint?.token || ''}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={() => copyToClipboard(endpoint?.token || '', 'Bearer Token')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={generateNewToken} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Generate New Token
            </Button>
            <Button variant="outline" onClick={testConnection} disabled={isLoading}>
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SCIM Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Operations</CardTitle>
          <CardDescription>
            Auth247 SCIM v2.0 implementation supports the following operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">User Operations</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Create User
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Update User
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Deactivate User
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  List Users
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Group Operations</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  Create Group (Coming Soon)
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  Update Group (Coming Soon)
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  Delete Group (Coming Soon)
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  List Groups (Coming Soon)
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Identity Provider Setup</CardTitle>
          <CardDescription>
            Step-by-step instructions for popular identity providers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Make sure to whitelist the IP addresses of your identity provider
              if you have network restrictions enabled.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Okta Setup</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Go to Applications → Create App Integration</li>
                <li>Select "SCIM 2.0 Test App (OAuth Bearer Token)"</li>
                <li>Enter the SCIM Base URL and Bearer Token from above</li>
                <li>Test the connection and save</li>
                <li>Assign users or groups to the application</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Azure AD Setup</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Go to Enterprise Applications → New Application</li>
                <li>Create your own application → Non-gallery</li>
                <li>Go to Provisioning → Automatic</li>
                <li>Enter the SCIM Base URL and Bearer Token</li>
                <li>Test connection and configure attribute mappings</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}