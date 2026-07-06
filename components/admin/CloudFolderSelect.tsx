'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface MediaFolder {
  id: string;
  path: string;
  name: string;
}

interface CloudFolderSelectProps {
  value: string;
  onChange: (value: string) => void;
  defaultFolder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Dynamic cloud folder selector that reads from the MediaFolder DB table.
 * Invalidate query key ['media-folders'] after a Cloudinary sync to refresh.
 */
export function CloudFolderSelect({
  value,
  onChange,
  defaultFolder = 'warishlabs/blog',
  className = '',
  disabled = false,
}: CloudFolderSelectProps) {
  const { data, isLoading, isError } = useQuery<{ success: boolean; folders: MediaFolder[] }>({
    queryKey: ['media-folders'],
    queryFn: async () => {
      const res = await fetch('/api/admin/media?type=folders');
      if (!res.ok) throw new Error('Failed to fetch folders');
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minute cache
  });

  const folders = data?.folders ?? [];

  // Fallback static options when DB is empty or not yet synced
  const fallbackFolders: MediaFolder[] = [
    { id: 'fb1', path: 'warishlabs/blog', name: 'blog' },
    { id: 'fb2', path: 'warishlabs/products', name: 'products' },
    { id: 'fb3', path: 'warishlabs/labs', name: 'labs' },
    { id: 'fb4', path: 'warishlabs/general', name: 'general' },
  ];

  const displayFolders = folders.length > 0 ? folders : fallbackFolders;

  return (
    <select
      value={value || defaultFolder}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || isLoading}
      className={`w-full bg-bg-secondary border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent disabled:opacity-60 ${className}`}
    >
      {isLoading && (
        <option value="" disabled>
          Loading folders...
        </option>
      )}
      {isError && (
        <option value="" disabled>
          Error loading folders
        </option>
      )}
      {displayFolders.map((folder) => (
        <option key={folder.id} value={folder.path}>
          {folder.path}
        </option>
      ))}
    </select>
  );
}

export default CloudFolderSelect;
