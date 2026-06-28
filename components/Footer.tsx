'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubscribed(true);
        toast.success(data.message || 'Thank you for subscribing!');
        setEmail('');
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
    <footer className="bg-bg-secondary border-t border-border mt-auto select-none">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Logo & Tagline column */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <img 
                src="/logo.gif" 
                alt="WarishLabs Logo" 
                className="w-8 h-8 rounded-lg" 
              />
              <span className="font-extrabold text-white tracking-wide">
                WarishLabs
              </span>
            </Link>
            <p className="text-text-secondary text-sm max-w-xs leading-relaxed">
              Engineering-first laboratory building immersive 3D interfaces, high-performance distributed systems, and developer tools.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href={ROUTES.PRODUCTS} className="text-sm text-text-secondary hover:text-white transition-colors">
                  Products Spotlight
                </Link>
              </li>
              <li>
                <Link href={ROUTES.LABS} className="text-sm text-text-secondary hover:text-white transition-colors">
                  Labs Experiments
                </Link>
              </li>
              <li>
                <Link href={ROUTES.BLOG} className="text-sm text-text-secondary hover:text-white transition-colors">
                  Engineering Blog
                </Link>
              </li>
              <li>
                <Link href={ROUTES.ABOUT} className="text-sm text-text-secondary hover:text-white transition-colors">
                  About the Lab
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="md:col-span-5 space-y-4">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary">
              Newsletter Subscription
            </h4>
            <p className="text-text-secondary text-sm leading-relaxed">
              Subscribe to receive technical bulletins, product case studies, and releases.
            </p>
            
            {isSubscribed ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <p>Welcome to the bulletin list! Check your inbox shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="bg-bg-primary border-border text-white text-xs max-w-[260px] focus:border-accent"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-accent hover:bg-accent-hover text-white active:scale-[0.97] transition-all rounded-lg px-4"
                >
                  {isSubmitting ? '...' : <ArrowRight className="w-4 h-4" />}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Footer bottom */}
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-tertiary">
            © {currentYear} WarishLabs. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-text-tertiary">
              Constructed with Precision
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
