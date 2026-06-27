'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ANALYTICS_EVENTS } from '@/constants/events';

interface AnalyticsContextType {
  track: (eventName: string, eventData?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathRef = useRef<string | null>(null);

  // Custom event tracking helper
  const track = (eventName: string, eventData?: Record<string, any>) => {
    // Send event asynchronously to not block UI rendering
    if (typeof window === 'undefined') return;

    const body = {
      eventName,
      eventData,
      url: window.location.href,
      referrer: document.referrer || null,
    };

    fetch('/api/analytics/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).catch((err) => {
      // Quietly log analytics failure in dev, no-op in production
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Analytics] Failed to dispatch tracking event:', err);
      }
    });
  };

  // Track Page Views automatically on route change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    // Prevent double tracking of identical paths on mount
    if (prevPathRef.current === currentPath) return;
    prevPathRef.current = currentPath;

    // Dispatch page view tracking
    track(ANALYTICS_EVENTS.PAGE_VIEW, {
      path: pathname,
      search: searchParams?.toString() || '',
    });
  }, [pathname, searchParams]);

  return (
    <AnalyticsContext.Provider value={{ track }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
