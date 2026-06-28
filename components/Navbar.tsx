'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';
import { Search, Menu, X } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import SearchPanel from './SearchPanel';
import { useUser } from '@clerk/nextjs';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'warishlabs@gmail.com').toLowerCase().trim();
  const isAdmin = !!(
    isLoaded &&
    user &&
    (user.publicMetadata?.role === 'admin' ||
      user.primaryEmailAddress?.emailAddress?.toLowerCase().trim() === adminEmail)
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Monitor scroll height to apply glass background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Products', path: ROUTES.PRODUCTS },
    { label: 'Labs', path: ROUTES.LABS },
    { label: 'Blog', path: ROUTES.BLOG },
    { label: 'About', path: ROUTES.ABOUT },
    { label: 'Contact', path: ROUTES.CONTACT },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 h-16 z-50 transition-all duration-300 select-none",
          isScrolled
            ? "nav-glass shadow-card"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="container mx-auto px-6 h-full max-w-7xl flex items-center justify-between">
          {/* Logo Brand using logo.gif */}
          <Link href="/" className="flex items-center gap-2 group">
            <img 
              src="/logo.gif" 
              alt="WarishLabs Logo" 
              className="w-8 h-8 rounded-lg group-hover:scale-105 transition-all duration-200" 
            />
            <span className="font-extrabold text-white tracking-wide">
              WarishLabs
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link, idx) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={idx}
                  href={link.path}
                  className={cn(
                    "text-sm font-medium relative py-1 transition-colors duration-150",
                    isActive ? "text-white" : "text-text-secondary hover:text-white"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent rounded-full glow-accent-element" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Items */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-text-secondary hover:text-white hover:bg-bg-card rounded-lg border border-transparent hover:border-border transition-all"
              title="Search (Cmd+K)"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            {/* Console Link */}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "border-border hover:border-accent hover:bg-accent-subtle text-white font-semibold text-xs rounded-lg px-4 bg-bg-card flex items-center justify-center"
                )}
              >
                Console
              </Link>
            )}
          </div>

          {/* Mobile Actions Menu Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-text-secondary hover:text-white"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-text-secondary hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-16 bg-black border-b border-border shadow-modal flex flex-col p-6 space-y-4 z-45 animate-fade-in">
            {navLinks.map((link, idx) => (
              <Link
                key={idx}
                href={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "text-base font-semibold py-2 border-b border-border-subtle",
                  pathname === link.path ? "text-accent" : "text-text-secondary"
                )}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "w-full bg-accent hover:bg-accent-hover text-white py-6 flex items-center justify-center font-semibold text-sm"
                )}
              >
                Console Access
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Global Command Search Panel */}
      <SearchPanel isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
