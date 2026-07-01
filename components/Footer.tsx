'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/constants/routes';
import { ExternalLink } from 'lucide-react';
import SocialLinks from '@/components/shared/SocialLinks';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-secondary border-t border-border mt-auto select-none relative overflow-hidden">
      {/* Decorative Grid Backdrop */}
      <div className="absolute inset-0 blueprint-grid opacity-[0.01] pointer-events-none" />

      <div className="container mx-auto px-6 py-16 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          {/* Logo & Description (6 cols) */}
          <div className="md:col-span-6 space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <Image 
                src="/logo.gif" 
                alt="WarishLabs Logo" 
                width={32}
                height={32}
                className="rounded-lg group-hover:scale-105 transition-transform duration-300 border border-border/40" 
              />
              <span className="font-extrabold text-white tracking-wide text-lg group-hover:text-accent transition-colors duration-300">
                WarishLabs
              </span>
            </Link>
            <p className="text-text-secondary text-xs leading-relaxed max-w-sm">
              Engineering-first laboratory building immersive 3D interfaces, high-performance distributed systems, and developer tools built with precision.
            </p>
          </div>

          {/* Products (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary">
              Products
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products/warishlabs-cloud" className="text-xs text-text-secondary hover:text-white transition-colors flex items-center gap-1 group">
                  Cloud Platform <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/products/antigravity-engine" className="text-xs text-text-secondary hover:text-white transition-colors flex items-center gap-1 group">
                  Antigravity Engine <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Company (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href={ROUTES.ABOUT} className="text-xs text-text-secondary hover:text-white transition-colors">
                  About Lab
                </Link>
              </li>
              <li>
                <Link href={ROUTES.CONTACT} className="text-xs text-text-secondary hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href={ROUTES.BLOG} className="text-xs text-text-secondary hover:text-white transition-colors">
                  Engineering Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary">
              Legal Compliance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="text-text-secondary hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-text-secondary hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-text-secondary hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-text-secondary hover:text-white transition-colors">
                  General Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-text-tertiary">
            © {currentYear} WarishLabs. All rights reserved. Built with precision.
          </p>
          <div className="flex items-center gap-4 md:gap-5">
            {/* Dynamic social links — renders nothing if all are empty/hidden */}
            <SocialLinks
              iconSize="w-4 h-4"
              iconClass="text-text-tertiary hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            />
            <span className="text-[10px] text-text-tertiary border-l border-white/10 pl-4">
              Canonical: warishlabs.in
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
