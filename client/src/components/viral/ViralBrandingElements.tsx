/**
 * Viral Branding Elements
 * Authentication badges and branding that create viral exposure
 */

import React from 'react';
import { Shield, Lock, CheckCircle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ViralBrandingProps {
  variant?: 'login' | 'security' | 'developer' | 'minimal';
  domain?: string;
  customMessage?: string;
  showPoweredBy?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ViralLoginBadge({ 
  variant = 'login', 
  domain,
  customMessage,
  showPoweredBy = true,
  size = 'md' 
}: ViralBrandingProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const getMessage = () => {
    if (customMessage) return customMessage;
    
    switch (variant) {
      case 'login':
        return 'Secured by Auth247';
      case 'security':
        return 'Protected by Auth247';
      case 'developer':
        return 'Powered by Auth247';
      case 'minimal':
        return 'Auth247';
      default:
        return 'Secured by Auth247';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'login':
        return <Shield className="h-3 w-3" />;
      case 'security':
        return <Lock className="h-3 w-3" />;
      case 'developer':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Shield className="h-3 w-3" />;
    }
  };

  const handleClick = () => {
    // Track viral click
    fetch('/api/viral/track-impact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        event: 'viral_badge_clicked',
        data: { variant, domain, source: 'login_badge' }
      })
    }).catch(console.error);

    // Open Auth247 in new tab
    window.open('https://auth247.net', '_blank');
  };

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="outline" 
        className={`${sizeClasses[size]} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-green-200 text-green-700 dark:border-green-800 dark:text-green-300`}
        onClick={handleClick}
      >
        <div className="flex items-center gap-1">
          {getIcon()}
          {getMessage()}
        </div>
      </Badge>
      
      {showPoweredBy && variant !== 'minimal' && (
        <button
          onClick={handleClick}
          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          Learn more →
        </button>
      )}
    </div>
  );
}

export function ViralSecurityIndicator({ domain }: { domain?: string }) {
  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span className="text-sm font-medium text-green-800 dark:text-green-200">
          Secure Authentication
        </span>
      </div>
      <p className="text-xs text-green-600 dark:text-green-300 mt-1">
        This application is protected by Auth247 enterprise security
        {domain && ` for ${domain}`}
      </p>
    </div>
  );
}

export function ViralDeveloperAttribution({ 
  domain, 
  integrationTime = '5 minutes' 
}: { 
  domain?: string; 
  integrationTime?: string; 
}) {
  const handleLearnMore = () => {
    fetch('/api/viral/track-impact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        event: 'developer_attribution_clicked',
        data: { domain, source: 'footer_attribution' }
      })
    }).catch(console.error);

    window.open('https://auth247.net/docs', '_blank');
  };

  return (
    <div className="text-center py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span>Powered by</span>
        <button
          onClick={handleLearnMore}
          className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
        >
          Auth247
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Enterprise authentication integrated in {integrationTime}
      </p>
    </div>
  );
}

export function ViralInvitePrompt({ 
  organizationDomain, 
  currentUser 
}: { 
  organizationDomain: string; 
  currentUser?: any;
}) {
  const [inviteEmails, setInviteEmails] = React.useState('');
  const [sending, setSending] = React.useState(false);

  const sendInvites = async () => {
    if (!inviteEmails.trim()) return;

    setSending(true);
    try {
      const emails = inviteEmails.split(',').map(e => e.trim()).filter(Boolean);
      
      for (const email of emails) {
        await fetch('/api/viral/track-impact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            event: 'team_invitation_sent',
            data: {
              inviteeEmail: email,
              organizationDomain,
              source: 'viral_prompt'
            }
          })
        });
      }

      // Show success message
      alert(`Invited ${emails.length} team member${emails.length > 1 ? 's' : ''} to Auth247`);
      setInviteEmails('');
    } catch (error) {
      console.error('Failed to send invites:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="bg-blue-100 dark:bg-blue-800 rounded-full p-2">
          <Shield className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
            Secure your entire team
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-200 mb-3">
            Invite your teammates to Auth247 for unified security across {organizationDomain}
          </p>
          
          <div className="space-y-2">
            <input
              type="text"
              placeholder="colleague@company.com, team@company.com"
              className="w-full px-3 py-2 text-sm border border-blue-200 dark:border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-900/50"
              value={inviteEmails}
              onChange={(e) => setInviteEmails(e.target.value)}
            />
            
            <Button 
              size="sm" 
              onClick={sendInvites}
              disabled={!inviteEmails.trim() || sending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sending ? 'Sending...' : 'Send Invites'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ViralSSOSuccessMessage({ 
  provider, 
  setupTime, 
  organizationDomain 
}: { 
  provider: string; 
  setupTime: number; 
  organizationDomain: string; 
}) {
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const shareSuccess = () => {
    const message = `Just set up enterprise SSO with Auth247 in ${formatTime(setupTime)}! 🚀 No SSO tax, enterprise security included. https://auth247.net`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Auth247 SSO Setup Complete',
        text: message,
        url: 'https://auth247.net'
      });
    } else {
      navigator.clipboard.writeText(message);
      alert('Success message copied to clipboard!');
    }

    // Track viral sharing
    fetch('/api/viral/track-impact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        event: 'success_shared',
        data: { provider, setupTime, organizationDomain }
      })
    }).catch(console.error);
  };

  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
      <div className="mb-4">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
        <h2 className="text-xl font-bold text-green-900 dark:text-green-100">
          SSO Setup Complete!
        </h2>
      </div>
      
      <div className="space-y-2 mb-4">
        <p className="text-green-800 dark:text-green-200">
          {provider} SSO configured in {formatTime(setupTime)}
        </p>
        <p className="text-sm text-green-600 dark:text-green-300">
          Your team at {organizationDomain} now has enterprise-grade security
        </p>
      </div>

      <div className="flex gap-2 justify-center">
        <Button onClick={shareSuccess} variant="outline" size="sm">
          <ExternalLink className="h-4 w-4 mr-2" />
          Share Success
        </Button>
        <Button 
          onClick={() => window.open('https://auth247.net/docs/integration', '_blank')}
          size="sm"
        >
          Integration Guide
        </Button>
      </div>
    </div>
  );
}

// Viral tracking hook for other components
export function useViralTracking() {
  const trackViralEvent = React.useCallback((event: string, data: any) => {
    fetch('/api/viral/track-impact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ event, data })
    }).catch(console.error);
  }, []);

  return { trackViralEvent };
}