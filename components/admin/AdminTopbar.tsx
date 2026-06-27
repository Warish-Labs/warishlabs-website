'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Activity } from 'lucide-react';

export default function AdminTopbar() {
  const pathname = usePathname();
  
  // Format page name from route (e.g. /admin/dashboard -> Dashboard)
  const getPageTitle = () => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length <= 1) return 'Console';
    const lastPart = parts[parts.length - 1];
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace('-', ' ');
  };

  return (
    <header className="h-16 border-b border-border bg-bg-secondary flex items-center justify-between px-8 sticky top-0 z-40 select-none">
      {/* Dynamic Page Title */}
      <h2 className="text-lg font-semibold text-white tracking-tight">
        {getPageTitle()}
      </h2>

      {/* Stats/Avatar info */}
      <div className="flex items-center gap-6">
        {/* Live indicator */}
        <div className="flex items-center gap-2 bg-accent-subtle/50 px-3 py-1.5 rounded-full border border-accent/10">
          <Activity className="w-3.5 h-3.5 text-accent animate-pulse" />
          <span className="text-xs text-text-secondary font-medium">Console Online</span>
        </div>

        {/* User profile */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-semibold text-white">Administrator</p>
            <p className="text-[10px] text-text-tertiary">WarishLabs Console</p>
          </div>
          <Avatar className="h-8 w-8 border border-border bg-bg-card text-white">
            <AvatarFallback className="bg-accent-subtle text-accent text-xs font-semibold">
              AD
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
