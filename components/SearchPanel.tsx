'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Command,
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
  Folder,
} from 'lucide-react';

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResults {
  products: Array<{ id: string; name: string; slug: string; tagline: string }>;
  categories: Array<{ id: string; name: string; slug: string }>;
  labs: Array<{ id: string; name: string; slug: string }>;
  blogs: Array<{ id: string; title: string; slug: string }>;
}

export default function SearchPanel({ isOpen, onClose }: SearchPanelProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({
    products: [],
    categories: [],
    labs: [],
    blogs: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search query
  useEffect(() => {
    if (!isOpen) return;
    if (!searchQuery.trim()) {
      const t = setTimeout(() => {
        setResults({ products: [], categories: [], labs: [], blogs: [] });
      }, 0);
      return () => clearTimeout(t);
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.success) {
          setResults({
            products: data.products || [],
            categories: data.categories || [],
            labs: data.labs || [],
            blogs: data.blogs || [],
          });

          // Track analytics search event
          fetch('/api/analytics/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventName: 'search',
              eventData: { query: searchQuery },
              url: window.location.href,
              referrer: document.referrer || null,
            }),
          }).catch((err) => console.error('Failed to log search event:', err));
        }
      } catch (err) {
        console.error('Failed to perform search:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  // Handle keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
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
    setSearchQuery('');
  };

  const hasResults =
    results.products.length > 0 ||
    results.categories.length > 0 ||
    results.labs.length > 0 ||
    results.blogs.length > 0;

  return (
    <CommandDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <CommandInput 
        placeholder="Type a command or search path..." 
        value={searchQuery}
        onValueChange={setSearchQuery}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && searchQuery.trim()) {
            e.preventDefault();
            handleSelect(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
          }
        }}
      />
      <CommandList>
        {isLoading && <div className="p-4 text-center text-xs text-text-tertiary">Searching database...</div>}
        
        {!isLoading && searchQuery.trim() && (
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => handleSelect(`/products?search=${encodeURIComponent(searchQuery.trim())}`)}>
              <span className="font-semibold text-accent">Search products for &quot;{searchQuery}&quot;</span>
            </CommandItem>
          </CommandGroup>
        )}

        {!isLoading && !searchQuery.trim() && (
          <>
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
          </>
        )}

        {!isLoading && searchQuery.trim() && !hasResults && (
          <CommandEmpty>No results found for &quot;{searchQuery}&quot;. Try &quot;Festoryx&quot; or &quot;development&quot;.</CommandEmpty>
        )}

        {!isLoading && searchQuery.trim() && hasResults && (
          <>
            {results.products.length > 0 && (
              <CommandGroup heading="Products">
                {results.products.map((p) => (
                  <CommandItem key={p.id} onSelect={() => handleSelect(`/products/${p.slug}`)}>
                    <Briefcase className="mr-2 h-4 w-4 text-accent" />
                    <div className="flex flex-col">
                      <span className="font-semibold">{p.name}</span>
                      <span className="text-[10px] text-text-tertiary">{p.tagline}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.categories.length > 0 && (
              <CommandGroup heading="Categories">
                {results.categories.map((c) => (
                  <CommandItem key={c.id} onSelect={() => handleSelect(`/products?category=${c.slug}`)}>
                    <Folder className="mr-2 h-4 w-4 text-accent" />
                    <span>{c.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.labs.length > 0 && (
              <CommandGroup heading="Labs Sandbox">
                {results.labs.map((l) => (
                  <CommandItem key={l.id} onSelect={() => handleSelect(ROUTES.LABS)}>
                    <FlaskConical className="mr-2 h-4 w-4 text-accent" />
                    <span>{l.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.blogs.length > 0 && (
              <CommandGroup heading="Engineering Blog">
                {results.blogs.map((b) => (
                  <CommandItem key={b.id} onSelect={() => handleSelect(`/blog/${b.slug}`)}>
                    <FileText className="mr-2 h-4 w-4 text-accent" />
                    <span>{b.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
