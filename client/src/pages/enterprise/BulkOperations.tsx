/**
 * Bulk Operations Page
 * Enterprise bulk user management
 */

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, Download, Users, UserPlus, Settings, 
  CheckCircle, XCircle, Clock, AlertTriangle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BulkOperation {
  id: string;
  type: 'invite' | 'import' | 'update' | 'deactivate';
  status: 'processing' | 'completed' | 'failed' | 'partial';
  total: number;
  successful: number;
  failed: number;
  createdAt: string;
  completedAt?: string;
}

export default function BulkOperations() {
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'partial': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFileUpload = async (type: 'invite' | 'import') => {
    if (!fileInputRef.current?.files?.[0]) {
      toast({
        title: 'Error',
        description: 'Please select a CSV file',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    try {
      const file = fileInputRef.current.files[0];
      const formData = new FormData();
      formData.append('csvFile', file);

      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newOperation: BulkOperation = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        status: 'processing',
        total: Math.floor(Math.random() * 100) + 10,
        successful: 0,
        failed: 0,
        createdAt: new Date().toISOString()
      };

      setOperations(prev => [newOperation, ...prev]);

      // Simulate completion
      setTimeout(() => {
        setOperations(prev => prev.map(op => 
          op.id === newOperation.id 
            ? {
                ...op,
                status: 'completed',
                successful: op.total - 2,
                failed: 2,
                completedAt: new Date().toISOString()
              }
            : op
        ));
      }, 5000);

      toast({
        title: 'Success',
        description: `Bulk ${type} operation started successfully`
      });

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to start bulk ${type} operation`,
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = (type: 'invite' | 'import') => {
    let csvContent: string;
    let filename: string;

    if (type === 'invite') {
      csvContent = `email,firstName,lastName,role,department,jobTitle,customMessage
john.doe@company.com,John,Doe,user,Engineering,Software Engineer,Welcome to the team!
jane.smith@company.com,Jane,Smith,manager,Marketing,Marketing Manager,`;
      filename = 'invitation-template.csv';
    } else {
      csvContent = `email,firstName,lastName,username,role,department,jobTitle,phone
user1@company.com,User,One,user1,user,Sales,Sales Rep,+1234567890
user2@company.com,User,Two,user2,manager,Support,Support Manager,+1234567891`;
      filename = 'import-template.csv';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Template downloaded successfully'
    });
  };

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bulk Operations</h1>
        <p className="text-muted-foreground mt-2">
          Manage users in bulk with CSV imports and batch operations
        </p>
      </div>

      <Tabs defaultValue="invite" className="space-y-6">
        <TabsList>
          <TabsTrigger value="invite">Bulk Invite</TabsTrigger>
          <TabsTrigger value="import">Bulk Import</TabsTrigger>
          <TabsTrigger value="manage">Bulk Manage</TabsTrigger>
          <TabsTrigger value="history">Operation History</TabsTrigger>
        </TabsList>

        <TabsContent value="invite" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Bulk User Invitations
              </CardTitle>
              <CardDescription>
                Send invitations to multiple users at once using a CSV file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Users will receive invitation emails and need to complete registration.
                  Make sure email addresses are valid and belong to your organization's verified domains.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="invite-file">CSV File</Label>
                  <input
                    ref={fileInputRef}
                    id="invite-file"
                    type="file"
                    accept=".csv"
                    className="hidden"
                  />
                  <div className="flex gap-2 mt-1">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose CSV File
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => downloadTemplate('invite')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => handleFileUpload('invite')}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? 'Processing...' : 'Start Bulk Invitation'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Bulk User Import
              </CardTitle>
              <CardDescription>
                Import multiple users directly without sending invitations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Admin Only:</strong> This operation creates user accounts directly.
                  Users will be created in an unverified state and may need to verify their email addresses.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="import-file">CSV File</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose CSV File
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => downloadTemplate('import')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => handleFileUpload('import')}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? 'Processing...' : 'Start Bulk Import'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Bulk User Management
              </CardTitle>
              <CardDescription>
                Update roles, deactivate users, and perform other bulk operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Bulk Role Update</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Update roles for multiple users at once
                  </p>
                  <Button variant="outline" className="w-full">
                    Configure Role Updates
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Bulk Deactivation</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Deactivate multiple user accounts
                  </p>
                  <Button variant="outline" className="w-full">
                    Configure Deactivation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Operation History</CardTitle>
              <CardDescription>
                View the status and results of your bulk operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {operations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No bulk operations performed yet
                  </div>
                ) : (
                  operations.map((operation) => (
                    <div key={operation.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(operation.status)}
                          <span className="font-medium capitalize">
                            {operation.type} Operation
                          </span>
                          <Badge className={getStatusColor(operation.status)}>
                            {operation.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(operation.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>
                            {operation.successful + operation.failed} / {operation.total}
                          </span>
                        </div>
                        <Progress
                          value={((operation.successful + operation.failed) / operation.total) * 100}
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>✓ {operation.successful} successful</span>
                          <span>✗ {operation.failed} failed</span>
                        </div>
                      </div>

                      {operation.status === 'completed' && (
                        <div className="mt-4 flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Results
                          </Button>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}