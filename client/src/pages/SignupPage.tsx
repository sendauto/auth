import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ChevronRight, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';
import { PublicNavigation } from '@/components/layout/PublicNavigation';

// Signup form validation schema
const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  organization: z.string().optional(),
  jobTitle: z.string().optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupPage() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [emailStatus, setEmailStatus] = useState<'checking' | 'available' | 'taken' | 'invalid' | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    trigger,
    getValues,
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      organization: '',
      jobTitle: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const agreeToTerms = watch('agreeToTerms');
  const firstName = watch('firstName');
  const lastName = watch('lastName');
  const email = watch('email');
  const organization = watch('organization');
  const jobTitle = watch('jobTitle');

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    const checks = [
      { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
      { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
      { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
      { label: 'Number', test: (p: string) => /[0-9]/.test(p) },
      { label: 'Special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
    ];
    
    return checks.map(check => ({
      ...check,
      passed: check.test(password || ''),
    }));
  };

  const passwordChecks = getPasswordStrength(password);
  const passwordStrength = passwordChecks.filter(check => check.passed).length;

  // Email availability checker with debouncing
  const checkEmailAvailability = useCallback(async (email: string) => {
    if (!email || email.length < 3) {
      setEmailStatus(null);
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailStatus('invalid');
      return;
    }

    setEmailStatus('checking');
    
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      
      if (result.available) {
        setEmailStatus('available');
      } else {
        setEmailStatus('taken');
      }
    } catch (error) {
      console.error('Email check failed:', error);
      setEmailStatus(null);
    }
  }, []);

  // Debounced email checking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkEmailAvailability(email);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [email, checkEmailAvailability]);

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormData) => {
      const response = await fetch('/api/v2/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          organization: data.organization || '',
          jobTitle: data.jobTitle || '',
          agreeToTerms: data.agreeToTerms,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(JSON.stringify(error));
      }

      return response.json();
    },
    onSuccess: (response) => {
      if (response.requiresVerification) {
        toast({
          title: 'Account Created Successfully!',
          description: 'Please check your email to activate your account before signing in.',
        });
      } else {
        toast({
          title: 'Account Created Successfully!',
          description: 'Welcome to Auth247. You can now sign in with your credentials.',
        });
      }
      setLocation('/login');
    },
    onError: (error: any) => {
      let errorData;
      try {
        errorData = JSON.parse(error.message);
      } catch {
        errorData = { error: error.message };
      }

      // Handle different account status scenarios
      if (errorData.accountStatus === 'activated') {
        toast({
          title: 'Account Already Exists',
          description: 'This email is already registered and activated. Please sign in instead.',
          variant: 'destructive',
          action: (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLocation('/login')}
            >
              Go to Login
            </Button>
          ),
        });
      } else if (errorData.accountStatus === 'unactivated') {
        toast({
          title: 'Account Not Activated',
          description: `Hi ${errorData.firstName || 'there'}! Your account exists but needs activation. Would you like us to resend the activation email?`,
          variant: 'default',
          className: 'border-blue-200 bg-blue-50 text-blue-900',
          action: (
            <Button 
              variant="outline" 
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
              onClick={() => handleResendActivation(getValues('email'))}
            >
              Resend Email
            </Button>
          ),
        });
      } else {
        toast({
          title: 'Signup Failed',
          description: errorData.error || 'Failed to create account. Please try again.',
          variant: 'destructive',
        });
      }
    },
  });

  const handleResendActivation = async (email: string) => {
    try {
      const response = await fetch('/api/v2/auth/resend-activation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Fresh Activation Email Sent',
          description: 'A fresh activation email has been sent. Please check your inbox.',
          className: 'border-blue-200 bg-blue-50 text-blue-900',
        });
      } else {
        if (result.action === 'redirect_to_login') {
          toast({
            title: 'Account Already Activated',
            description: 'Your account is already activated. Please sign in.',
            action: (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLocation('/login')}
              >
                Go to Login
              </Button>
            ),
          });
        } else {
          toast({
            title: 'Failed to Resend',
            description: result.error || 'Failed to resend activation email.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend activation email. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = (data: SignupFormData) => {
    signupMutation.mutate(data);
  };

  const handleNextStep = async () => {
    const isStep1Valid = await trigger(['firstName', 'lastName', 'email']);
    if (isStep1Valid) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  // Check if current step is valid
  const isCurrentStepValid = () => {
    if (currentStep === 1) {
      // Step 1: Only require firstName, lastName, and email
      const hasRequiredFields = firstName && lastName && email;
      const hasNoErrors = !errors.firstName && !errors.lastName && !errors.email;
      const emailIsAvailable = emailStatus === 'available';
      
      console.log('Step 1 validation:', {
        firstName: firstName,
        lastName: lastName,
        email: email,
        hasRequiredFields,
        hasNoErrors,
        emailIsAvailable,
        emailStatus: emailStatus,
        errors: errors
      });
      
      return hasRequiredFields && hasNoErrors && emailIsAvailable;
    } else if (currentStep === 2) {
      // Step 2: Password validation and terms agreement
      const passwordsMatch = password === confirmPassword;
      const hasValidPassword = password && password.length >= 8;
      const hasConfirmPassword = confirmPassword && confirmPassword.length > 0;
      const hasAgreedToTerms = agreeToTerms === true;
      const hasNoPasswordErrors = !errors.password && !errors.confirmPassword && !errors.agreeToTerms;
      
      console.log('Step 2 validation:', {
        password: password ? '***' : 'empty',
        confirmPassword: confirmPassword ? '***' : 'empty',
        passwordsMatch,
        hasValidPassword,
        hasConfirmPassword,
        hasAgreedToTerms,
        hasNoPasswordErrors,
        agreeToTermsValue: agreeToTerms,
        errors: errors
      });
      
      return hasValidPassword && hasConfirmPassword && hasAgreedToTerms &&
             passwordsMatch && hasNoPasswordErrors;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation currentPage="/signup" />
      
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-blue-600 text-white rounded-full p-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Join Auth247 - Secure 24/7 Authentication Platform
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Personal Info</span>
          </div>
          <div className={`h-1 w-12 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Security</span>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardContent className="space-y-6 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 1 && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Personal Information
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Tell us about yourself and your organization
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>✨ Automatic Admin Access:</strong> You'll get full organization admin privileges upon signup - no waiting for approval!
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Enter your first name"
                        {...register('firstName')}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Enter your last name"
                        {...register('lastName')}
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        {...register('email')}
                        className={`pr-10 ${
                          errors.email ? 'border-red-500' : 
                          emailStatus === 'taken' ? 'border-red-500' :
                          emailStatus === 'available' ? 'border-green-500' : ''
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {emailStatus === 'checking' && (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        )}
                        {emailStatus === 'available' && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                        {emailStatus === 'taken' && (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        {emailStatus === 'invalid' && (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                    {emailStatus === 'taken' && !errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        This email is already registered. Please use a different email or{' '}
                        <Link href="/login" className="text-blue-600 hover:text-blue-800 underline">
                          sign in instead
                        </Link>
                        .
                      </p>
                    )}
                    {emailStatus === 'available' && !errors.email && (
                      <p className="text-green-600 text-sm mt-1">Email is available</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="organization">Organization</Label>
                      <Input
                        id="organization"
                        type="text"
                        placeholder="Your organization name"
                        {...register('organization')}
                        className={errors.organization ? 'border-red-500' : ''}
                      />
                      {errors.organization && (
                        <p className="text-red-500 text-sm mt-1">{errors.organization.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        type="text"
                        placeholder="Your job title"
                        {...register('jobTitle')}
                        className={errors.jobTitle ? 'border-red-500' : ''}
                      />
                      {errors.jobTitle && (
                        <p className="text-red-500 text-sm mt-1">{errors.jobTitle.message}</p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!isCurrentStepValid()}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Next Step
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Security Setup
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Create a strong password to secure your account
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        {...register('password')}
                        className={errors.password ? 'border-red-500' : ''}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Password Strength:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              passwordStrength <= 1 ? 'bg-red-500' :
                              passwordStrength <= 2 ? 'bg-yellow-500' :
                              passwordStrength <= 3 ? 'bg-orange-500' :
                              passwordStrength <= 4 ? 'bg-blue-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {passwordChecks.map((check, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            {check.passed ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <X className="h-3 w-3 text-gray-400" />
                            )}
                            <span className={`text-xs ${check.passed ? 'text-green-600' : 'text-gray-500'}`}>
                              {check.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        {...register('confirmPassword')}
                        className={errors.confirmPassword ? 'border-red-500' : ''}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agreeToTerms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => {
                        setValue('agreeToTerms', checked as boolean, { shouldValidate: true });
                      }}
                    />
                    <Label 
                      htmlFor="agreeToTerms" 
                      className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                    >
                      I agree to the{' '}
                      <Link href="/terms" className="text-blue-600 hover:text-blue-800 underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="text-red-500 text-sm">{errors.agreeToTerms.message}</p>
                  )}

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevStep}
                      className="flex-1"
                    >
                      Previous
                    </Button>
                    <Button
                      type="submit"
                      disabled={signupMutation.isPending || !isCurrentStepValid()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {signupMutation.isPending ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
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
  );
}