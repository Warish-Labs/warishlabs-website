'use client';

import { useEffect } from 'react';

export default function Clarity() {
  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_MICROSOFT_CLARITY_PROJECT_ID;
    const isProd = process.env.NODE_ENV === 'production';
    
    if (isProd && projectId) {
      // Dynamically import Clarity SDK client-side to prevent SSR window reference crashes
      import('@microsoft/clarity')
        .then((module) => {
          const Clarity = module.default;
          try {
            Clarity.init(projectId);
          } catch (err) {
            console.error('[Clarity] Initialization failed:', err);
          }
        })
        .catch((err) => {
          console.error('[Clarity] Failed to load Clarity package:', err);
        });
    }
  }, []);

  return null;
}
