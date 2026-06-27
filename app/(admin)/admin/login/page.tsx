'use client';

import React, { useActionState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/features/auth/actions/login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Lock, Mail, Terminal, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { FADE_UP, SPRING_DEFAULT } from '@/constants/motion';
import { SignInButton } from '@clerk/nextjs';

export default function AdminLoginPage() {
  const router = useRouter();
  
  // Use React 19 useActionState
  const [state, formAction, isPending] = useActionState(loginAction, null);

  useEffect(() => {
    if (state?.success) {
      router.push('/admin/dashboard');
      router.refresh();
    }
  }, [state, router]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="bg-mesh-gradient blueprint-grid min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow ambient background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-glow/3 blur-3xl -z-10 pointer-events-none" />

      {/* Decorative Scan line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-5 opacity-40">
        <div className="scan-line" />
      </div>

      <motion.div
        initial="initial"
        animate="animate"
        variants={FADE_UP}
        transition={SPRING_DEFAULT}
        className="w-full max-w-md"
      >
        <Card className="glass-panel border-border shadow-modal premium-card-transition relative overflow-hidden">
          {/* Top border blue accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-accent glow-accent-element" />

          <CardHeader className="space-y-2 pt-8 pb-4 text-center">
            <div className="inline-flex items-center justify-center mb-2">
              <img src="/logo.gif" alt="WarishLabs Logo" className="w-12 h-12 rounded-lg" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              WarishLabs Admin
            </CardTitle>
            <CardDescription className="text-text-secondary text-sm">
              Enter your credentials to access the laboratory console.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-2">
              {state?.success === false && state.error && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{state.error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                  Secure Identity (Email)
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-text-tertiary" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@warishlabs.com"
                    required
                    disabled={isPending}
                    className="pl-10 bg-bg-secondary border-border focus:border-accent text-white"
                  />
                </div>
                {state?.success === false && state.fieldErrors?.email && (
                  <p className="text-destructive text-xs mt-1">{state.fieldErrors.email[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                    Console Key (Password)
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-text-tertiary" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={isPending}
                    className="pl-10 bg-bg-secondary border-border focus:border-accent text-white"
                  />
                </div>
                {state?.success === false && state.fieldErrors?.password && (
                  <p className="text-destructive text-xs mt-1">{state.fieldErrors.password[0]}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pb-8 pt-4">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-accent hover:bg-accent-hover text-white py-5 shadow-accent active:scale-[0.97] transition-all font-semibold text-xs"
              >
                {isPending ? 'Authenticating...' : 'Access Console'}
              </Button>

              <div className="flex items-center my-1 w-full">
                <div className="flex-1 h-px bg-border/40" />
                <span className="px-3 text-[10px] text-text-tertiary font-bold uppercase tracking-wider">Or</span>
                <div className="flex-1 h-px bg-border/40" />
              </div>

              <SignInButton mode="modal" fallbackRedirectUrl="/admin/dashboard">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-border bg-bg-card hover:border-accent text-white py-5 font-semibold text-xs active:scale-[0.97] transition-all cursor-pointer"
                >
                  Sign In with Clerk
                </Button>
              </SignInButton>

              <div className="text-center pt-2">
                <a href="/" className="text-text-tertiary hover:text-white text-xs transition-colors">
                  ← Return to WarishLabs Home
                </a>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
