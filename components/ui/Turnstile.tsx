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

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) {
      console.warn('NEXT_PUBLIC_TURNSTILE_SITE_KEY is not configured');
      return;
    }

    const initTurnstile = () => {
      if (containerRef.current && window.turnstile) {
        try {
          // If a widget was already rendered, reset it first
          if (widgetIdRef.current) {
            window.turnstile.reset(widgetIdRef.current);
          }
          const id = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: onVerify,
            'error-callback': onError,
            'expired-callback': onExpire,
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
      // Clean up callback reference
      if (window.onloadTurnstileCallback) {
        delete window.onloadTurnstileCallback;
      }
    };
  }, [onVerify, onError, onExpire, theme]);

  return (
    <div 
      ref={containerRef} 
      className="turnstile-container my-4 flex justify-center min-h-[65px]" 
      data-testid="turnstile-widget"
    />
  );
}
