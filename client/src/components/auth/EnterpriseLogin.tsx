import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Eye, EyeOff, Shield, Lock, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SecurityStatus {
  level: 'high' | 'medium' | 'low';
  factors: string[];
  score: number;
}

interface LoginAttempt {
  email: string;
  password: string;
  rememberMe: boolean;
  deviceFingerprint: string;
}

export function EnterpriseLogin() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    level: 'medium',
    factors: ['Device Recognition', 'IP Monitoring'],
    score: 75
  });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Generate device fingerprint for security tracking
  const [deviceFingerprint] = useState(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('Enterprise Auth247', 0, 0);
    const fingerprint = btoa(
      navigator.userAgent + 
      screen.width + screen.height + 
      new Date().getTimezoneOffset() +
      (ctx?.getImageData(0, 0, 1, 1).data.join('') || '')
    );
    return fingerprint.substring(0, 32);
  });

  // Real-time password strength analysis
  useEffect(() => {
    if (formData.password) {
      const calculateStrength = () => {
        let strength = 0;
        if (formData.password.length >= 8) strength += 20;
        if (formData.password.length >= 12) strength += 20;
        if (/[A-Z]/.test(formData.password)) strength += 20;
        if (/[a-z]/.test(formData.password)) strength += 20;
        if (/\d/.test(formData.password)) strength += 10;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) strength += 10;
        setPasswordStrength(Math.min(strength, 100));
      };
      calculateStrength();
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  // Update security status based on various factors
  useEffect(() => {
    const updateSecurityStatus = () => {
      const factors = ['Device Recognition', 'IP Monitoring'];
      let score = 75;

      // Check connection security
      if (location.protocol === 'https:') {
        factors.push('TLS Encryption');
        score += 10;
      }

      // Check if email looks enterprise
      if (formData.email && (
        formData.email.includes('@company.com') || 
        formData.email.includes('@auth247.net')
      )) {
        factors.push('Enterprise Domain');
        score += 10;
      }

      // Password strength factor
      if (passwordStrength >= 80) {
        factors.push('Strong Password');
        score += 5;
      }

      const level = score >= 90 ? 'high' : score >= 70 ? 'medium' : 'low';
      setSecurityStatus({ level, factors, score: Math.min(score, 100) });
    };

    updateSecurityStatus();
  }, [formData.email, passwordStrength]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEnterpriseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loginData: LoginAttempt = {
        ...formData,
        deviceFingerprint
      };

      const response = await apiRequest("POST", "/api/auth/enterprise/login", loginData);
      
      if (response.success) {
        toast({
          title: "Authentication Successful",
          description: `Welcome back, ${response.user.firstName}!`,
          variant: "default",
        });

        // Show security summary
        setTimeout(() => {
          toast({
            title: "Security Status",
            description: `Session secured with ${securityStatus.factors.length} security factors`,
            variant: "default",
          });
        }, 1000);

        window.location.href = "/dashboard";
      } else if (response.requiresMFA) {
        // Handle MFA requirement
        window.location.href = `/mfa-verify?token=${response.mfaToken}`;
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Authentication failed";
      const errorCode = error.response?.data?.errorCode;

      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      });

      // Handle specific error codes
      if (errorCode === "ACCOUNT_LOCKED") {
        toast({
          title: "Account Security",
          description: "Your account has been temporarily locked for security. Please try again later.",
          variant: "destructive",
        });
      } else if (errorCode === "INVALID_CREDENTIALS") {
        const attemptsRemaining = error.response?.data?.attemptsRemaining;
        if (attemptsRemaining !== undefined) {
          toast({
            title: "Security Alert",
            description: `${attemptsRemaining} attempts remaining before account lockout`,
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getSecurityColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSecurityIcon = (level: string) => {
    switch (level) {
      case 'high': return <CheckCircle2 className="w-4 h-4" />;
      case 'medium': return <Shield className="w-4 h-4" />;
      case 'low': return <AlertTriangle className="w-4 h-4" />;
      default: return <Lock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Logo className="h-12 w-auto mx-auto" />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Enterprise Authentication
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Secure 24/7 access to your Auth247 account
          </p>
        </div>

        {/* Security Status Badge */}
        <div className={`p-3 rounded-lg border ${getSecurityColor(securityStatus.level)} flex items-center justify-between`}>
          <div className="flex items-center space-x-2">
            {getSecurityIcon(securityStatus.level)}
            <span className="text-sm font-medium">
              Security Level: {securityStatus.level.toUpperCase()}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {securityStatus.score}%
          </Badge>
        </div>

        {/* Login Form */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center">Sign In</CardTitle>
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Protected by enterprise-grade security
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleEnterpriseLogin} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                  className="h-11"
                />
              </div>

              {/* Password Field with Strength Indicator */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-1">
                    <Progress value={passwordStrength} className="h-2" />
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Password strength: {passwordStrength < 30 ? 'Weak' : passwordStrength < 70 ? 'Medium' : 'Strong'}
                    </div>
                  </div>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
                  }
                />
                <Label htmlFor="rememberMe" className="text-sm text-gray-600 dark:text-gray-400">
                  Keep me signed in for 30 days
                </Label>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Sign In Securely
                  </>
                )}
              </Button>
            </form>

            {/* Security Features */}
            <div className="border-t pt-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div className="font-medium mb-2">Active Security Features:</div>
                <div className="grid grid-cols-2 gap-1">
                  {securityStatus.factors.map((factor, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-3 text-center">
              <Link href="/forgot-password">
                <span className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  Forgot your password?
                </span>
              </Link>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link href="/signup">
                  <span className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                    Sign up now
                  </span>
                </Link>
              </div>
            </div>

            {/* Device Info */}
            <div className="text-center">
              <div className="text-xs text-gray-400 dark:text-gray-500">
                Device ID: {deviceFingerprint.substring(0, 8)}...
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Access */}
        <Card className="border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Demo Access Available
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-300">
                Try: john.doe@company.com, manager@company.com, or user@company.com
              </div>
              <Link href="/login">
                <Button variant="outline" size="sm" className="text-amber-700 border-amber-300 hover:bg-amber-100">
                  Use Demo Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}