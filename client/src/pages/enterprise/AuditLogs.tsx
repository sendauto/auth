/**
 * Audit Logs Page
 * Enterprise audit trail and compliance reporting
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Download, Filter, Calendar, Shield, 
  AlertTriangle, CheckCircle, XCircle, Clock 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: string;
  category: string;
  action: string;
  outcome: 'success' | 'failure' | 'pending';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: number;
  email?: string;
  ipAddress: string;
  description: string;
  riskScore: number;
}

export default function AuditLogs() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [outcomeFilter, setOutcomeFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadAuditEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, categoryFilter, severityFilter, outcomeFilter]);

  const loadAuditEvents = async () => {
    setIsLoading(true);
    try {
      // Generate sample audit events
      const sampleEvents: AuditEvent[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          eventType: 'auth.login',
          category: 'authentication',
          action: 'login',
          outcome: 'success',
          severity: 'low',
          userId: 1,
          email: 'admin@auth247.net',
          ipAddress: '192.168.1.100',
          description: 'User login successful for admin@auth247.net',
          riskScore: 15
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          eventType: 'user.user_created',
          category: 'user_management',
          action: 'user_created',
          outcome: 'success',
          severity: 'medium',
          userId: 2,
          email: 'newuser@company.com',
          ipAddress: '192.168.1.101',
          description: 'New user account created: newuser@company.com',
          riskScore: 25
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          eventType: 'security.rate_limit_exceeded',
          category: 'security',
          action: 'rate_limit_exceeded',
          outcome: 'failure',
          severity: 'high',
          ipAddress: '10.0.0.50',
          description: 'Rate limit exceeded from suspicious IP',
          riskScore: 75
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          eventType: 'org.sso_configured',
          category: 'organization',
          action: 'sso_configured',
          outcome: 'success',
          severity: 'high',
          userId: 1,
          email: 'admin@auth247.net',
          ipAddress: '192.168.1.100',
          description: 'SSO configuration updated for organization',
          riskScore: 35
        }
      ];
      setEvents(sampleEvents);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load audit events',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.description.toLowerCase().includes(query) ||
        event.email?.toLowerCase().includes(query) ||
        event.ipAddress.includes(query) ||
        event.eventType.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(event => event.severity === severityFilter);
    }

    if (outcomeFilter !== 'all') {
      filtered = filtered.filter(event => event.outcome === outcomeFilter);
    }

    setFilteredEvents(filtered);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failure': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return null;
    }
  };

  const exportLogs = async () => {
    try {
      const csvContent = [
        ['Timestamp', 'Event Type', 'Category', 'Outcome', 'Severity', 'User', 'IP Address', 'Description', 'Risk Score'],
        ...filteredEvents.map(event => [
          event.timestamp,
          event.eventType,
          event.category,
          event.outcome,
          event.severity,
          event.email || '',
          event.ipAddress,
          event.description,
          event.riskScore.toString()
        ])
      ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Audit logs exported successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export audit logs',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and analyze security events across your organization
        </p>
      </div>

      <Tabs defaultValue="events" className="space-y-6">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="authentication">Authentication</SelectItem>
                      <SelectItem value="authorization">Authorization</SelectItem>
                      <SelectItem value="user_management">User Management</SelectItem>
                      <SelectItem value="organization">Organization</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Severity</Label>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Outcome</Label>
                  <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Outcomes</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failure">Failure</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button onClick={exportLogs} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>
                {filteredEvents.length} events found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getOutcomeIcon(event.outcome)}
                        <span className="font-medium">{event.eventType}</span>
                        <Badge variant="outline">{event.category}</Badge>
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>
                    
                    <p className="text-sm">{event.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        {event.email && <span>User: {event.email}</span>}
                        <span>IP: {event.ipAddress}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-3 w-3" />
                        Risk Score: {event.riskScore}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredEvents.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    No events found matching your criteria
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Analytics</CardTitle>
              <CardDescription>
                Overview of security events and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">98.5%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">3</div>
                  <div className="text-sm text-muted-foreground">High Risk Events</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{events.length}</div>
                  <div className="text-sm text-muted-foreground">Total Events</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
              <CardDescription>
                Generate compliance reports for various regulations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">GDPR Compliance</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate a GDPR compliance report for data processing activities
                  </p>
                  <Button variant="outline" className="w-full">
                    Generate GDPR Report
                  </Button>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">SOX Compliance</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate a SOX compliance report for financial controls
                  </p>
                  <Button variant="outline" className="w-full">
                    Generate SOX Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}