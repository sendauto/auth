import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Badge } from '@/components/ui/badge';
import { Shield, Smartphone, Copy, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface MFASetupData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

function MFASetupPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'start' | 'setup' | 'verify' | 'complete'>('start');
  const [setupData, setSetupData] = useState<MFASetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backupCodesShown, setBackupCodesShown] = useState(false);

  useEffect(() => {
    if (user?.mfaEnabled) {
      setStep('complete');
    }
  }, [user]);

  const startMFASetup = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('/api/auth/mfa/setup', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setSetupData(data);
        setStep('setup');
        toast({
          title: "MFA Setup Started",
          description: "Scan the QR code with your authenticator app",
        });
      } else {
        throw new Error('Failed to start MFA setup');
      }
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "Unable to start MFA setup. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndComplete = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('/api/auth/mfa/verify-setup', {
        method: 'POST',
        body: JSON.stringify({ code: verificationCode })
      });

      if (response.ok) {
        await refreshUser();
        setStep('complete');
        toast({
          title: "MFA Enabled Successfully",
          description: "Your account is now protected with multi-factor authentication",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Verification failed');
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Invalid verification code",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCodes = () => {
    if (setupData?.backupCodes) {
      navigator.clipboard.writeText(setupData.backupCodes.join('\n'));
      toast({
        title: "Backup Codes Copied",
        description: "Store these codes in a safe place",
      });
    }
  };

  const disableMFA = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('/api/auth/mfa/disable', {
        method: 'POST'
      });

      if (response.ok) {
        await refreshUser();
        setStep('start');
        setSetupData(null);
        toast({
          title: "MFA Disabled",
          description: "Multi-factor authentication has been disabled",
        });
      } else {
        throw new Error('Failed to disable MFA');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to disable MFA. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'complete') {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">MFA is Active</CardTitle>
            <CardDescription>
              Your account is protected with multi-factor authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your account security has been enhanced. You'll need your authenticator app to sign in.
              </AlertDescription>
            </Alert>

            <div className="text-center space-y-4">
              <Button
                variant="outline"
                onClick={() => setBackupCodesShown(!backupCodesShown)}
              >
                {backupCodesShown ? 'Hide' : 'Show'} Backup Codes
              </Button>

              {backupCodesShown && setupData?.backupCodes && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Recovery Codes:</p>
                      <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                        {setupData.backupCodes.map((code, index) => (
                          <Badge key={index} variant="secondary" className="justify-center">
                            {code}
                          </Badge>
                        ))}
                      </div>
                      <Button size="sm" variant="outline" onClick={copyBackupCodes}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy All Codes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={disableMFA}
                  disabled={isLoading}
                >
                  Disable MFA
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Multi-Factor Authentication</h1>
        <p className="text-muted-foreground mt-2">
          Add an extra layer of security to your account
        </p>
      </div>

      {step === 'start' && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle>Secure Your Account</CardTitle>
            <CardDescription>
              Enable MFA to protect your account with an authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                <div>
                  <p className="font-medium">Enhanced Security</p>
                  <p className="text-sm text-muted-foreground">
                    99.9% reduction in account compromise risk
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Smartphone className="w-5 h-5 text-blue-500 mt-1" />
                <div>
                  <p className="font-medium">Authenticator App Required</p>
                  <p className="text-sm text-muted-foreground">
                    Works with Google Authenticator, Authy, or similar apps
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Copy className="w-5 h-5 text-purple-500 mt-1" />
                <div>
                  <p className="font-medium">Backup Codes</p>
                  <p className="text-sm text-muted-foreground">
                    Recovery codes in case you lose access to your device
                  </p>
                </div>
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={startMFASetup}
              disabled={isLoading}
            >
              {isLoading ? 'Setting up...' : 'Enable MFA'}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'setup' && setupData && (
        <Card>
          <CardHeader>
            <CardTitle>Scan QR Code</CardTitle>
            <CardDescription>
              Use your authenticator app to scan this QR code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupData.qrCodeUrl)}`}
                  alt="MFA QR Code"
                  className="w-48 h-48"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manual-key">Manual Entry Key:</Label>
              <div className="flex space-x-2">
                <Input
                  id="manual-key"
                  value={setupData.secret}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(setupData.secret);
                    toast({ title: "Key copied to clipboard" });
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Enter verification code from your app:</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={verificationCode}
                  onChange={setVerificationCode}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setStep('start')}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={verifyAndComplete}
                disabled={isLoading || verificationCode.length !== 6}
                className="flex-1"
              >
                {isLoading ? 'Verifying...' : 'Verify & Enable'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {setupData?.backupCodes && step === 'verify' && (
        <Card className="mt-6 bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span>Save Your Backup Codes</span>
            </CardTitle>
            <CardDescription>
              Store these codes safely. You can use them to access your account if you lose your device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 font-mono text-sm mb-4">
              {setupData.backupCodes.map((code, index) => (
                <Badge key={index} variant="secondary" className="justify-center">
                  {code}
                </Badge>
              ))}
            </div>
            <Button variant="outline" onClick={copyBackupCodes} className="w-full">
              <Copy className="w-4 h-4 mr-2" />
              Copy All Backup Codes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MFASetupPage;