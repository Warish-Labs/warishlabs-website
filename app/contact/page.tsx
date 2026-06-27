'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Terminal, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isPending, setIsPending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsPending(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSent(true);
        toast.success('Your message was successfully transmitted.');
        setFormData({ name: '', email: '', subject: '', message: '' });
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
    <>
      <Navbar />
      <main className="flex-1 bg-black text-white pt-32 pb-24 relative select-none">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/3 blur-3xl -z-10 pointer-events-none" />

        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Info Text */}
            <div className="lg:col-span-5 space-y-6">
              <span className="inline-flex items-center gap-1.5 text-accent text-xs font-bold uppercase tracking-wider">
                <Mail className="w-3.5 h-3.5" />
                TRANSMISSION LINE
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
                Contact Us
              </h1>
              <p className="text-text-secondary text-sm leading-relaxed max-w-sm">
                Have a technical inquiry, feedback, or need collaboration? Get in touch with our engineering team directly.
              </p>
              <div className="space-y-4 pt-4 border-t border-border/40 text-xs text-text-tertiary">
                <p><strong>Response guarantee:</strong> Under 24 hours.</p>
                <p><strong>Secure routing:</strong> Messages are stored inside a TLS encrypted datastore and sent to resend relays.</p>
              </div>
            </div>

            {/* Right Card Form */}
            <div className="lg:col-span-7">
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
                        className="border-border bg-bg-card hover:border-accent text-white px-6"
                      >
                        Send Another Message
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
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
                    </CardContent>

                    <CardFooter className="pb-8 pt-4">
                      <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-accent hover:bg-accent-hover text-white py-5 font-semibold text-xs rounded-lg active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                      >
                        {isPending ? 'Routing Message...' : 'Send Message'}
                        {!isPending && <ArrowRight className="w-4 h-4" />}
                      </Button>
                    </CardFooter>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
