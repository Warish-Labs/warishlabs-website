'use client';

import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Twitter, Linkedin, Youtube } from '@/components/icons/SocialIcons';
import GithubIcon from '@/components/icons/GithubIcon';

interface SocialLinkItem {
  platform: string;
  url: string;
}

interface SocialLinksProps {
  /** Extra CSS classes for the container */
  className?: string;
  /** Icon size class, e.g. "w-4 h-4" */
  iconSize?: string;
  /** Color class for the icon, e.g. "text-text-tertiary" */
  iconClass?: string;
}

/** Platform → display label mapping */
const PLATFORM_LABELS: Record<string, string> = {
  twitter: 'Twitter / X',
  x: 'X (Twitter)',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  instagram: 'Instagram',
  github: 'GitHub',
};

function getPlatformLabel(platform: string): string {
  return PLATFORM_LABELS[platform.toLowerCase()] ?? platform.charAt(0).toUpperCase() + platform.slice(1);
}

/** Platform → icon component mapping (uses existing SVG icons or Lucide fallback) */
function PlatformIcon({
  platform,
  className,
}: {
  platform: string;
  className?: string;
}) {
  const p = platform.toLowerCase();
  if (p === 'twitter' || p === 'x') return <Twitter className={className} aria-hidden="true" />;
  if (p === 'linkedin') return <Linkedin className={className} aria-hidden="true" />;
  if (p === 'youtube') return <Youtube className={className} aria-hidden="true" />;
  if (p === 'github') return <GithubIcon className={className} aria-hidden="true" />;
  // Generic fallback for custom platforms
  return <ExternalLink className={className} aria-hidden="true" />;
}

/**
 * SocialLinks — fetches visible social links from /api/settings and renders them.
 * Renders nothing if there are no visible/configured links.
 */
export default function SocialLinks({
  className = 'flex items-center gap-4',
  iconSize = 'w-4 h-4',
  iconClass = 'text-text-tertiary hover:text-white transition-colors',
}: SocialLinksProps) {
  const [links, setLinks] = useState<SocialLinkItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchLinks() {
      try {
        const res = await fetch('/api/settings');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.links)) {
          setLinks(data.links as SocialLinkItem[]);
        }
      } catch (err) {
        console.error('[SocialLinks] Failed to load social links:', err);
      } finally {
        setLoaded(true);
      }
    }
    fetchLinks();
  }, []);

  // Don't render until loaded to avoid layout shift; after loading, render nothing if empty
  if (!loaded || links.length === 0) return null;

  return (
    <div className={className} role="list" aria-label="Social media links">
      {links.map(({ platform, url }) => (
        <a
          key={platform}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit WarishLabs on ${getPlatformLabel(platform)}`}
          title={getPlatformLabel(platform)}
          className={iconClass}
          role="listitem"
        >
          <PlatformIcon platform={platform} className={iconSize} />
        </a>
      ))}
    </div>
  );
}
