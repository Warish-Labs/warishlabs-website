'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Turnstile from '@/components/ui/Turnstile';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isPending, setIsPending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleError = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const handleExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    if (!turnstileToken) {
      toast.error('Security verification check incomplete.');
      return;
    }

    setIsPending(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, turnstileToken }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSent(true);
        toast.success('Your message was successfully transmitted.');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTurnstileToken(null);
      } else {
        toast.error(data.error || 'Failed to submit. Please try again.');
      }
    } catch (err) {
      console.error('[ContactPage] Submission error:', err);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="glass-panel border-border shadow-card premium-card-transition relative overflow-hidden">
      {/* Accent Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />

      {isSent ? (
        <div className="p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <CardTitle className="text-lg font-bold text-white">
            Transmission Successful
          </CardTitle>
          <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
            Thank you. Your message has been routed to our systems. An engineer will respond shortly.
          </p>
          <div className="pt-4">
            <Button
              onClick={() => setIsSent(false)}
              variant="outline"
              className="border-border bg-bg-card hover:border-accent text-white px-6 cursor-pointer"
            >
              Send Another Message
            </Button>
          </div>
        </div>
      ) : (
        <form 
          onSubmit={handleSubmit}
          onFocus={() => setHasInteracted(true)}
          onChange={() => setHasInteracted(true)}
          onMouseEnter={() => setHasInteracted(true)}
          onKeyDown={() => setHasInteracted(true)}
          onTouchStart={() => setHasInteracted(true)}
        >
          <CardContent className="space-y-4 pt-8">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-text-secondary text-[10px] font-bold uppercase tracking-wider">
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ada Lovelace"
                required
                disabled={isPending}
                className="bg-bg-primary border-border text-white text-xs focus:border-accent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-text-secondary text-[10px] font-bold uppercase tracking-wider">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ada@company.com"
                required
                disabled={isPending}
                className="bg-bg-primary border-border text-white text-xs focus:border-accent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-text-secondary text-[10px] font-bold uppercase tracking-wider">
                Subject (Optional)
              </Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Compute scaling inquiry"
                disabled={isPending}
                className="bg-bg-primary border-border text-white text-xs focus:border-accent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-text-secondary text-[10px] font-bold uppercase tracking-wider">
                Message Body
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write details of your scaling requirements..."
                required
                disabled={isPending}
                rows={5}
                className="bg-bg-primary border-border text-white text-xs focus:border-accent"
              />
            </div>

            {hasInteracted && (
              <Turnstile 
                onVerify={handleVerify} 
                onError={handleError}
                onExpire={handleExpire}
              />
            )}
          </CardContent>

          <CardFooter className="pb-8 pt-2 flex flex-col gap-2">
            <Button
              type="submit"
              disabled={isPending || !turnstileToken}
              className="w-full bg-accent hover:bg-accent-hover disabled:bg-accent/40 disabled:text-white/60 text-white py-5 font-semibold text-xs rounded-lg active:scale-[0.97] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-accent"
            >
              {isPending ? 'Routing Message...' : 'Send Message'}
              {!isPending && <ArrowRight className="w-4 h-4" />}
            </Button>
            <p className="text-[9px] text-text-tertiary text-center leading-relaxed">
              Protected by Cloudflare Turnstile. By submitting this form, you agree to our{' '}
              <a href="/privacy" className="hover:underline text-accent">Privacy Policy</a> and{' '}
              <a href="/terms" className="hover:underline text-accent">Terms & Conditions</a>.
            </p>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
