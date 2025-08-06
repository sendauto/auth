import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AccessibilityHelperProps {
  children: React.ReactNode;
  enableSkipLink?: boolean;
  enableFocusVisible?: boolean;
  className?: string;
}

export function AccessibilityHelper({
  children,
  enableSkipLink = true,
  enableFocusVisible = true,
  className
}: AccessibilityHelperProps) {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  useEffect(() => {
    // Add keyboard user class to body
    if (isKeyboardUser) {
      document.body.classList.add('keyboard-user');
    } else {
      document.body.classList.remove('keyboard-user');
    }
  }, [isKeyboardUser]);

  const skipToMain = () => {
    const main = document.querySelector('main');
    if (main) {
      main.focus();
      main.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={cn('accessibility-wrapper', className)}>
      {enableSkipLink && (
        <button
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md"
          onClick={skipToMain}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              skipToMain();
            }
          }}
        >
          Skip to main content
        </button>
      )}
      
      {children}
      
      {/* Screen reader announcements */}
      <div 
        id="sr-announcements" 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      />
    </div>
  );
}

// Hook for making screen reader announcements
export function useScreenReaderAnnouncement() {
  const announce = (message: string) => {
    const announcer = document.getElementById('sr-announcements');
    if (announcer) {
      announcer.textContent = message;
      // Clear after a delay
      setTimeout(() => {
        announcer.textContent = '';
      }, 1000);
    }
  };

  return announce;
}

// Custom focus management hook
export function useFocusManagement() {
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);

  const updateFocusableElements = () => {
    const selectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ];
    
    const elements = Array.from(
      document.querySelectorAll(selectors.join(', '))
    ) as HTMLElement[];
    
    setFocusableElements(elements);
  };

  const trapFocus = (container: HTMLElement) => {
    const focusable = container.querySelectorAll(
      'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  };

  return {
    focusableElements,
    updateFocusableElements,
    trapFocus
  };
}