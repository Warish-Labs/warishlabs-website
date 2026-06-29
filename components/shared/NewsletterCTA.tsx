'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Turnstile from '@/components/ui/Turnstile';

export default function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubscribed(true);
        toast.success(data.message || 'Thank you for subscribing to our technical bulletins!');
        setEmail('');
        setTurnstileToken(null);
      } else {
        toast.error(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('[NewsletterCTA] Subscription error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-md rounded-2xl p-8 md:p-12 relative overflow-hidden select-none">
      <div className="absolute inset-0 blueprint-grid opacity-[0.03] pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto text-center space-y-6 relative z-10">
        <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/15 flex items-center justify-center mx-auto text-accent mb-2">
          <Mail className="w-5 h-5" />
        </div>
        <h3 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">
          Subscribe to Technical Bulletins
        </h3>
        <p className="text-text-secondary text-xs md:text-sm leading-relaxed max-w-prose mx-auto">
          Get in-depth engineering updates, case studies on distributed platforms, and R3F optimization logs sent directly to your inbox. No spam.
        </p>

        {isSubscribed ? (
          <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs max-w-md mx-auto">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p className="font-semibold">Verification complete! Check your inbox for updates.</p>
          </div>
        ) : (
          <form 
            onSubmit={handleSubscribe} 
            className="flex flex-col gap-3 max-w-md mx-auto pt-2"
            onFocus={() => setHasInteracted(true)}
            onChange={() => setHasInteracted(true)}
            onMouseEnter={() => setHasInteracted(true)}
            onKeyDown={() => setHasInteracted(true)}
            onTouchStart={() => setHasInteracted(true)}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className="bg-black/60 border-white/10 text-white rounded-lg focus-visible:ring-accent"
              />
              <Button
                type="submit"
                disabled={isSubmitting || !turnstileToken}
                className="bg-accent hover:bg-accent-hover disabled:bg-accent/40 disabled:text-white/60 text-white font-semibold active:scale-[0.97] transition-all rounded-lg shrink-0 px-6 cursor-pointer shadow-accent"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Subscribing
                  </>
                ) : (
                  'Join List'
                )}
              </Button>
            </div>
            
            {hasInteracted && (
              <Turnstile 
                onVerify={(token) => setTurnstileToken(token)} 
                onError={() => setTurnstileToken(null)}
                onExpire={() => setTurnstileToken(null)}
              />
            )}
          </form>
        )}
      </div>
    </div>
  );
}
