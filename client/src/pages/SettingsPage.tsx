import React from "react";
import { useAuth } from "@/lib/auth";
import { TopNavigation } from "@/components/layout/TopNavigation";
import { SidebarNavigation } from "@/components/layout/SidebarNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bell, 
  Monitor, 
  Moon, 
  Sun, 
  Globe, 
  Shield, 
  Key, 
  Download,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [theme, setTheme] = React.useState("system");
  const [language, setLanguage] = React.useState("en");
  const [notifications, setNotifications] = React.useState({
    email: true,
    push: false,
    security: true,
    marketing: false
  });

  const handleNotificationChange = (type: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [type]: value }));
    toast({
      title: "Notification Settings Updated",
      description: `${type} notifications ${value ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast({
      title: "Theme Updated",
      description: `Theme changed to ${newTheme}.`,
    });
  };

  const handleExportData = () => {
    toast({
      title: "Data Export Requested",
      description: "Your data export will be sent to your email within 24 hours.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "Please contact support to delete your account.",
      variant: "destructive",
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      
      <div className="flex">
        <SidebarNavigation />
        
        <main className="flex-1 p-8">
          <div className="max-w-4xl space-y-8">
            
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Application Settings</h1>
              <p className="text-muted-foreground">
                Configure your application preferences and account settings
              </p>
            </div>

            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5" />
                  <span>Appearance</span>
                </CardTitle>
                <CardDescription>
                  Customize how the application looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Theme</Label>
                    <Select value={theme} onValueChange={handleThemeChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center space-x-2">
                            <Sun className="h-4 w-4" />
                            <span>Light</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center space-x-2">
                            <Moon className="h-4 w-4" />
                            <span>Dark</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center space-x-2">
                            <Monitor className="h-4 w-4" />
                            <span>System</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4" />
                            <span>English</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about account activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive important updates via email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Push Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Real-time notifications in your browser
                      </p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Security Alerts</Label>
                      <p className="text-xs text-muted-foreground">
                        Important security-related notifications
                      </p>
                    </div>
                    <Switch
                      checked={notifications.security}
                      onCheckedChange={(checked) => handleNotificationChange('security', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Marketing Updates</Label>
                      <p className="text-xs text-muted-foreground">
                        Product updates and promotional content
                      </p>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security</span>
                </CardTitle>
                <CardDescription>
                  Manage your account security and access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium">Multi-Factor Authentication</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Add an extra layer of security to your account
                      {(user as any)?.mfaEnabled && (
                        <span className="text-green-600 font-medium"> ✓ Currently enabled</span>
                      )}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = '/mfa-setup'}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      {(user as any)?.mfaEnabled ? 'Manage MFA' : 'Enable MFA'}
                    </Button>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Active Sessions</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Manage your active login sessions
                    </p>
                    <Button variant="outline" size="sm">
                      <Monitor className="h-4 w-4 mr-2" />
                      View Sessions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data & Privacy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>Data & Privacy</span>
                </CardTitle>
                <CardDescription>
                  Control your data and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Export Data</Label>
                      <p className="text-xs text-muted-foreground">
                        Download a copy of your account data
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExportData}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Danger Zone</span>
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-destructive">Delete Account</Label>
                    <p className="text-xs text-muted-foreground">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  );
}