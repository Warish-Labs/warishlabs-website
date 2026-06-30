'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/constants/routes';
import { ArrowRight, CheckCircle2, ExternalLink } from 'lucide-react';
import { Twitter, Linkedin, Youtube } from '@/components/icons/SocialIcons';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Turnstile from '@/components/ui/Turnstile';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [socialLinks, setSocialLinks] = useState<{
    githubUrl: string;
    twitterUrl: string;
    linkedinUrl: string;
    youtubeUrl: string;
  } | null>(null);

  const handleVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleError = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const handleExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  useEffect(() => {
    async function loadSocial() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.social) {
          setSocialLinks(data.social);
        }
      } catch (err) {
        console.error('[Footer] Failed to load social settings:', err);
      }
    }
    loadSocial();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (!turnstileToken) {
      toast.error('Security verification check incomplete.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, turnstileToken }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubscribed(true);
        toast.success(data.message || 'Thank you for subscribing!');
        setEmail('');
        setTurnstileToken(null);
      } else {
        toast.error(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('[Footer] Newsletter subscription error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-secondary border-t border-border mt-auto select-none relative overflow-hidden">
      {/* Decorative Grid Backdrop */}
      <div className="absolute inset-0 blueprint-grid opacity-[0.01] pointer-events-none" />

      <div className="container mx-auto px-6 py-16 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          {/* Logo & Description (4 cols) */}
          <div className="md:col-span-4 space-y-4">
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
            <p className="text-text-secondary text-xs leading-relaxed max-w-xs">
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

          {/* Newsletter Column (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary">
              Bulletins
            </h4>
            
            {isSubscribed ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] leading-relaxed">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <p>Mailing list active. Check inbox.</p>
              </div>
            ) : (
              <form 
                onSubmit={handleSubscribe} 
                className="space-y-3"
                onFocus={() => setHasInteracted(true)}
                onChange={() => setHasInteracted(true)}
                onMouseEnter={() => setHasInteracted(true)}
                onKeyDown={() => setHasInteracted(true)}
                onTouchStart={() => setHasInteracted(true)}
              >
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="bg-bg-primary border-border text-white text-[10px] max-w-[160px] focus:border-accent h-8"
                  />
                  <Button
                    type="submit"
                    disabled={isSubmitting || !turnstileToken}
                    className="bg-accent hover:bg-accent-hover text-white active:scale-[0.97] transition-all rounded-lg px-3 h-8 cursor-pointer shadow-accent"
                  >
                    {isSubmitting ? '...' : <ArrowRight className="w-3.5 h-3.5" />}
                  </Button>
                </div>
                
                {hasInteracted && (
                  <Turnstile 
                    onVerify={handleVerify} 
                    onError={handleError}
                    onExpire={handleExpire}
                  />
                )}
              </form>
            )}
          </div>
        </div>

        {/* Footer bottom */}
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-text-tertiary">
            © {currentYear} WarishLabs. All rights reserved. Built with precision.
          </p>
          <div className="flex items-center gap-4 md:gap-5">

            {socialLinks?.twitterUrl && (
              <a href={socialLinks.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-text-tertiary hover:text-white transition-colors" title="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {socialLinks?.linkedinUrl && (
              <a href={socialLinks.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-text-tertiary hover:text-white transition-colors" title="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {socialLinks?.youtubeUrl && (
              <a href={socialLinks.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-text-tertiary hover:text-white transition-colors" title="YouTube">
                <Youtube className="w-4 h-4" />
              </a>
            )}
            <span className="text-[10px] text-text-tertiary border-l border-white/10 pl-4">
              Canonical: warishlabs.in
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
