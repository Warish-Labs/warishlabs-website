'use client';

import { useEffect } from 'react';

interface ProductTrackerProps {
  slug: string;
}

export default function ProductTracker({ slug }: ProductTrackerProps) {
  useEffect(() => {
    // Increment view count on mount
    fetch(`/api/products/${slug}/view`, { method: 'POST' })
      .catch((err) => console.error('Failed to increment view count:', err));

    // Listen for launch button click
    const handleLaunchClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const launchBtn = target.closest('[data-launch-button]');
      if (launchBtn) {
        fetch(`/api/products/${slug}/click`, { method: 'POST' })
          .catch((err) => console.error('Failed to increment click count:', err));
      }
    };

    document.addEventListener('click', handleLaunchClick);
    return () => {
      document.removeEventListener('click', handleLaunchClick);
    };
  }, [slug]);

  return null;
}
