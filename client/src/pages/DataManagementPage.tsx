import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Database, 
  Download, 
  Upload,
  Trash2,
  Archive,
  RefreshCw,
  HardDrive,
  FileText,
  Shield,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

interface DataStats {
  totalRecords: number;
  totalStorage: string;
  backupCount: number;
  lastBackup: string;
  retentionPeriod: number;
  complianceLevel: string;
}

interface BackupJob {
  id: string;
  type: string;
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  startedAt: string;
  completedAt?: string;
  size: string;
  records: number;
}

export function DataManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);
  const [exportForm, setExportForm] = useState({
    format: "json",
    includeArchived: false,
    dateRange: "all"
  });

  // Fetch data statistics
  const { data: dataStats, isLoading: isLoadingStats } = useQuery<DataStats>({
    queryKey: ["/api/admin/data/stats"],
    staleTime: 60 * 1000, // 1 minute
  });

  // Fetch backup jobs
  const { data: backupJobs, isLoading: isLoadingBackups } = useQuery<BackupJob[]>({
    queryKey: ["/api/admin/data/backups"],
    staleTime: 30 * 1000, // 30 seconds
  });

  // Export data mutation
  const exportDataMutation = useMutation({
    mutationFn: async (data: { format: string; includeArchived: boolean; dateRange: string }) => {
      const response = await apiRequest("POST", "/api/admin/data/export", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start data export");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Export Started",
        description: "Your data export has been initiated. You'll receive an email when it's ready.",
      });
      setIsExportDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/data/backups"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create backup mutation
  const createBackupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/data/backup");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start backup");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Backup Started",
        description: "Database backup has been initiated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/data/backups"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Backup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleExportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    exportDataMutation.mutate(exportForm);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'scheduled': return <Calendar className="h-4 w-4 text-yellow-600" />;
      default: return <Database className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoadingStats) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Data Management</h1>
            <p className="text-muted-foreground">Manage data exports, backups, and retention policies</p>
          </div>
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Data Management</h1>
            <p className="text-muted-foreground">
              Manage data exports, backups, and retention policies
            </p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Organization Data</DialogTitle>
                  <DialogDescription>
                    Export your organization's data in various formats for backup or migration.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleExportSubmit}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="format">Export Format</Label>
                      <Select value={exportForm.format} onValueChange={(value) => setExportForm({ ...exportForm, format: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="xlsx">Excel</SelectItem>
                          <SelectItem value="sql">SQL Dump</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="dateRange">Date Range</Label>
                      <Select value={exportForm.dateRange} onValueChange={(value) => setExportForm({ ...exportForm, dateRange: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="30d">Last 30 Days</SelectItem>
                          <SelectItem value="90d">Last 90 Days</SelectItem>
                          <SelectItem value="1y">Last Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeArchived"
                        checked={exportForm.includeArchived}
                        onChange={(e) => setExportForm({ ...exportForm, includeArchived: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="includeArchived">Include archived records</Label>
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={exportDataMutation.isPending}>
                      {exportDataMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Start Export
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button onClick={() => createBackupMutation.mutate()} disabled={createBackupMutation.isPending}>
              {createBackupMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Archive className="h-4 w-4 mr-2" />
              )}
              Create Backup
            </Button>
          </div>
        </div>

        {/* Data Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Database className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                  <p className="text-2xl font-bold">{dataStats?.totalRecords?.toLocaleString() || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <HardDrive className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
                  <p className="text-2xl font-bold">{dataStats?.totalStorage || "0 GB"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Archive className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Backups</p>
                  <p className="text-2xl font-bold">{dataStats?.backupCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Compliance</p>
                  <p className="text-2xl font-bold">{dataStats?.complianceLevel || "GDPR"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Retention Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Data Retention Policy</span>
            </CardTitle>
            <CardDescription>
              Configure how long different types of data are retained
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>User Data Retention</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input value="7 years" readOnly />
                    <Badge variant="outline">GDPR Compliant</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">User profiles and authentication data</p>
                </div>

                <div>
                  <Label>Audit Logs Retention</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input value="3 years" readOnly />
                    <Badge variant="outline">SOX Compliant</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Security and access logs</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Session Data Retention</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input value="90 days" readOnly />
                    <Badge variant="outline">Security</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">User session and activity data</p>
                </div>

                <div>
                  <Label>Analytics Data Retention</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input value="2 years" readOnly />
                    <Badge variant="outline">Business</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Performance and usage analytics</p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Automatic Cleanup</h4>
                  <p className="text-sm text-muted-foreground">Automatically remove data that exceeds retention period</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">Enabled</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Data Anonymization</h4>
                  <p className="text-sm text-muted-foreground">Remove personally identifiable information from expired records</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">Enabled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backup History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Archive className="h-5 w-5" />
              <span>Backup History</span>
            </CardTitle>
            <CardDescription>
              Recent backup and export operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingBackups ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : !backupJobs || backupJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No backup jobs found.</p>
                </div>
              ) : (
                backupJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(job.status)}
                      <div>
                        <h3 className="font-medium capitalize">{job.type} Backup</h3>
                        <p className="text-sm text-muted-foreground">
                          {job.records.toLocaleString()} records • {job.size}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {job.completedAt 
                            ? formatDistanceToNow(new Date(job.completedAt), { addSuffix: true })
                            : formatDistanceToNow(new Date(job.startedAt), { addSuffix: true })
                          }
                        </p>
                      </div>
                      
                      {job.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}