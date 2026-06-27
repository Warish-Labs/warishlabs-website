'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { ROUTES } from '@/constants/routes';
import {
  Briefcase,
  FileText,
  FlaskConical,
  Mail,
  Home,
  LayoutDashboard,
  HelpCircle,
} from 'lucide-react';

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchPanel({ isOpen, onClose }: SearchPanelProps) {
  const router = useRouter();

  // Handle keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open via state mutation (parent handles this, but we cover it in case parent listens)
          const searchIconBtn = document.querySelector('button[title*="Search"]');
          if (searchIconBtn) {
            (searchIconBtn as HTMLButtonElement).click();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelect = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <CommandInput placeholder="Type a command or search path..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {/* Navigation Group */}
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => handleSelect(ROUTES.HOME)}>
            <Home className="mr-2 h-4 w-4" />
            <span>Homepage</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(ROUTES.PRODUCTS)}>
            <Briefcase className="mr-2 h-4 w-4" />
            <span>Explore Products</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(ROUTES.LABS)}>
            <FlaskConical className="mr-2 h-4 w-4" />
            <span>Labs Sandbox</span>
          </CommandItem>

          <CommandItem onSelect={() => handleSelect(ROUTES.BLOG)}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Blog Articles</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(ROUTES.CONTACT)}>
            <Mail className="mr-2 h-4 w-4" />
            <span>Contact Engineering</span>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        {/* Admin Console Group */}
        <CommandGroup heading="Administration">
          <CommandItem onSelect={() => handleSelect(ROUTES.ADMIN_DASHBOARD)}>
            <LayoutDashboard className="mr-2 h-4 w-4 text-accent" />
            <span>Console Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(ROUTES.ADMIN_LOGIN)}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Console Login</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
