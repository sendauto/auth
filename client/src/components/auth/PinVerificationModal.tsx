/**
 * PIN Verification Modal Component
 * Handles 5-digit PIN entry for email verification
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, Mail, Shield, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PinVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sessionData: any) => void;
  userId: string;
  email: string;
  expiresIn?: number;
}

export function PinVerificationModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
  email,
  expiresIn = 600 // 10 minutes default
}: PinVerificationModalProps) {
  const [pin, setPin] = useState(['', '', '', '', '']);
  const [isValidating, setIsValidating] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(expiresIn);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  // Timer for PIN expiration
  useEffect(() => {
    if (!isOpen || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setError('Verification code has expired. Please request a new one.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeRemaining]);

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle PIN input changes
  const handlePinChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return; // Only allow single digits

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(''); // Clear error when user types

    // Auto-focus next input
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newPin.every(digit => digit !== '') && !isValidating) {
      handleValidatePin(newPin.join(''));
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Validate PIN with backend
  const handleValidatePin = async (pinCode: string) => {
    if (pinCode.length !== 5) {
      setError('Please enter the complete 5-digit verification code');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const response = await fetch('/api/auth/validate-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          pin: pinCode
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Verification Successful',
          description: 'You have been successfully signed in.',
        });
        onSuccess(result.user);
        onClose();
      } else {
        setError(result.message || 'Invalid verification code');
        // Clear PIN for retry
        setPin(['', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsValidating(false);
    }
  };

  // Resend PIN
  const handleResendPin = async () => {
    setIsResending(true);
    setError('');

    try {
      const response = await fetch('/api/auth/resend-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const result = await response.json();

      if (result.success) {
        setTimeRemaining(result.expiresIn || 600);
        setPin(['', '', '', '', '']);
        inputRefs.current[0]?.focus();
        toast({
          title: 'Code Resent',
          description: 'A new verification code has been sent to your email.',
        });
      } else {
        setError(result.message || 'Failed to resend code');
      }
    } catch (error) {
      setError('Failed to resend verification code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
      setPin(['', '', '', '', '']);
      setError('');
      setTimeRemaining(expiresIn);
    }
  }, [isOpen, expiresIn]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Email Verification
          </DialogTitle>
          <DialogDescription>
            We've sent a 5-digit verification code to your email address.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Display */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Mail className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {email}
            </span>
          </div>

          {/* Timer */}
          {timeRemaining > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span>Code expires in {formatTime(timeRemaining)}</span>
            </div>
          )}

          {/* PIN Input */}
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {pin.map((digit, index) => (
                <Input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handlePinChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-mono"
                  disabled={isValidating || timeRemaining <= 0}
                />
              ))}
            </div>

            {/* Loading State */}
            {isValidating && (
              <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying code...</span>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Resend Button */}
            <Button
              variant="outline"
              onClick={handleResendPin}
              disabled={isResending || timeRemaining > 540} // Disable for first 60 seconds
              className="w-full"
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend Code
                </>
              )}
            </Button>

            {/* Manual Submit Button (if needed) */}
            {pin.every(digit => digit !== '') && !isValidating && (
              <Button
                onClick={() => handleValidatePin(pin.join(''))}
                className="w-full"
                disabled={timeRemaining <= 0}
              >
                Verify Code
              </Button>
            )}

            {/* Cancel Button */}
            <Button variant="ghost" onClick={onClose} className="w-full">
              Cancel
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            <p>Didn't receive the email? Check your spam folder or try resending.</p>
            <p className="mt-1">
              Need help? Contact{' '}
              <a href="mailto:support@auth247.net" className="text-blue-600 hover:underline">
                support@auth247.net
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}