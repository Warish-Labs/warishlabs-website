'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';
import {
  Terminal,
  LayoutDashboard,
  Home,
  Briefcase,
  FolderTree,
  FileText,
  Image as ImageIcon,
  Mail,
  MailQuestion,
  HelpCircle,
  Settings,
  History,
  LineChart,
  ArrowLeft,
} from 'lucide-react';

const menuItems = [
  { group: 'Overview', items: [
    { label: 'Dashboard', path: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
  ]},
  { group: 'Content Management', items: [
    { label: 'Products', path: ROUTES.ADMIN_PRODUCTS, icon: Briefcase },
    { label: 'Categories', path: ROUTES.ADMIN_CATEGORIES, icon: FolderTree },
    { label: 'Blog Articles', path: ROUTES.ADMIN_BLOG, icon: FileText },
  ]},
  { group: 'Growth & Inbound', items: [
    { label: 'Media Library', path: ROUTES.ADMIN_MEDIA, icon: ImageIcon },
    { label: 'Newsletter', path: ROUTES.ADMIN_NEWSLETTER, icon: Mail },
    { label: 'Messages', path: ROUTES.ADMIN_MESSAGES, icon: MailQuestion },
    { label: 'FAQs', path: ROUTES.ADMIN_FAQS, icon: HelpCircle },
  ]},
  { group: 'Analytics & Security', items: [
    { label: 'Analytics', path: ROUTES.ADMIN_ANALYTICS, icon: LineChart },
    { label: 'Activity Logs', path: ROUTES.ADMIN_ACTIVITY_LOGS, icon: History },
    { label: 'System Settings', path: ROUTES.ADMIN_SETTINGS, icon: Settings },
  ]}
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-bg-secondary border-r border-border flex flex-col h-screen sticky top-0 text-text-secondary select-none">
      {/* Brand Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/logo.gif" 
            alt="WarishLabs Logo" 
            className="w-7 h-7 rounded-lg" 
          />
          <div className="font-bold text-white tracking-wide text-sm">
            Console
          </div>
        </div>

        {/* Top Back to Home Button */}
        <Link
          href="/"
          className="text-xs text-text-tertiary hover:text-white flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-1 rounded border border-white/10 transition-colors"
          title="Back to warishlabs.in"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="text-[10px]">Site</span>
        </Link>
      </div>

      {/* Nav Link Groups */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {menuItems.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary px-3 mb-2">
              {group.group}
            </h4>
            {group.items.map((item, iIdx) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={iIdx}
                  href={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-accent-subtle border-l-2 border-accent text-white"
                      : "hover:bg-bg-card hover:text-white"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-accent" : "text-text-tertiary")} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Back to Home Button */}
      <div className="p-4 border-t border-border">
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-bg-card hover:border-accent hover:text-white text-xs font-semibold text-text-secondary transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-accent" />
          Back to WarishLabs Site
        </Link>
      </div>
    </aside>
  );
}
