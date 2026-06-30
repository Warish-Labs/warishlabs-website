'use client';

import React, { useEffect, useRef } from 'react';

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: (error: unknown) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
}

declare global {
  interface Window {
    onloadTurnstileCallback?: () => void;
    turnstile?: {
      render: (
        element: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: (error: unknown) => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export default function Turnstile({
  onVerify,
  onError,
  onExpire,
  theme = 'dark',
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbacksRef = useRef({ onVerify, onError, onExpire });

  // Always keep callback references up to date
  useEffect(() => {
    callbacksRef.current = { onVerify, onError, onExpire };
  }, [onVerify, onError, onExpire]);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) {
      console.warn('NEXT_PUBLIC_TURNSTILE_SITE_KEY is not configured');
      return;
    }

    let isMounted = true;

    const initTurnstile = () => {
      if (!isMounted) return;
      if (containerRef.current && window.turnstile && !widgetIdRef.current) {
        try {
          const id = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token) => {
              if (isMounted) callbacksRef.current.onVerify(token);
            },
            'error-callback': (err) => {
              if (isMounted) callbacksRef.current.onError?.(err);
            },
            'expired-callback': () => {
              if (isMounted) callbacksRef.current.onExpire?.();
            },
            theme,
          });
          widgetIdRef.current = id;
        } catch (err) {
          console.error('[Turnstile] Render error:', err);
        }
      }
    };

    // Define the global callback in case it is loaded asynchronously
    window.onloadTurnstileCallback = () => {
      initTurnstile();
    };

    // Load Turnstile script if not already loaded
    if (!document.querySelector('script[src*="turnstile/v0/api.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    } else if (window.turnstile) {
      // If script is already fully loaded, initialize immediately
      initTurnstile();
    }

    return () => {
      isMounted = false;
      // Clean up callback reference
      if (window.onloadTurnstileCallback) {
        delete window.onloadTurnstileCallback;
      }
      // Remove widget from Cloudflare Turnstile if initialized
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (err) {
          console.error('[Turnstile] Cleanup error:', err);
        }
        widgetIdRef.current = null;
      }
    };
  }, [theme]); // Only recreate widget if theme changes

  return (
    <div 
      ref={containerRef} 
      className="turnstile-container my-4 flex justify-center min-h-[65px]" 
      data-testid="turnstile-widget"
    />
  );
}
