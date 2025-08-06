import { useState } from 'react';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Mail, Github, Users, Building2 } from 'lucide-react';

interface ProviderSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signup' | 'signin';
}

export function ProviderSelectionModal({ isOpen, onClose, mode }: ProviderSelectionModalProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const handleProviderSelect = async (provider: string) => {
    setIsLoading(provider);
    
    try {
      if (provider === 'email') {
        // Navigate to signup/login page for email/password
        onClose();
        if (mode === 'signup') {
          setLocation('/signup');
        } else {
          setLocation('/login');
        }
      } else {
        // Redirect to the appropriate OAuth provider
        window.location.href = `/api/auth/${provider}`;
      }
    } catch (error) {
      console.error('Error initiating authentication:', error);
      setIsLoading(null);
    }
  };

  const providers = [
    {
      id: 'email',
      name: 'Email',
      icon: <Mail className="h-5 w-5" />,
      description: mode === 'signup' ? 'Create account with email and password' : 'Sign in with your email and password',
      available: true,
      primary: true
    },
    {
      id: 'google',
      name: 'Google',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      ),
      description: 'Continue with your Google account',
      available: true
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: <Github className="h-5 w-5" />,
      description: 'Continue with your GitHub account',
      available: true
    },
    {
      id: 'microsoft',
      name: 'Microsoft',
      icon: <Building2 className="h-5 w-5" />,
      description: 'Continue with your Microsoft account',
      available: true
    }
  ];

  const title = mode === 'signup' ? 'Create Your Account' : 'Sign In to Your Account';
  const subtitle = mode === 'signup' 
    ? 'Choose your preferred authentication method to get started'
    : 'Choose your preferred authentication method to continue';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {providers.filter(p => p.available).map((provider) => (
            <Button
              key={provider.id}
              variant={provider.primary ? "default" : "outline"}
              className={`w-full justify-start h-12 text-left ${
                provider.primary ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
              }`}
              onClick={() => handleProviderSelect(provider.id)}
              disabled={isLoading === provider.id}
            >
              <div className="flex items-center space-x-3">
                {isLoading === provider.id ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                ) : (
                  provider.icon
                )}
                <div>
                  <div className="font-medium">{provider.name}</div>
                  <div className={`text-sm ${provider.primary ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {provider.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}

          <Separator />
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Or continue with social accounts:</p>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              By continuing, you agree to our{' '}
              <a href="/terms" className="underline hover:text-foreground">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="underline hover:text-foreground">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}