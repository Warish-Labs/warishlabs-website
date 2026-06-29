'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const isLoginPage = pathname === '/admin/login';
  const [showDeniedScreen, setShowDeniedScreen] = useState(false);

  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'warishlabs@gmail.com').toLowerCase().trim();

  useEffect(() => {
    if (isLoaded && user) {
      const email = user.primaryEmailAddress?.emailAddress?.toLowerCase().trim();
      if (email && email !== adminEmail) {
        console.warn('[AdminLayout] Access Denied: Unauthorized email:', email);
        setShowDeniedScreen(true);
        const timer = setTimeout(() => {
          signOut().then(() => {
            router.push('/?error=access_denied');
          });
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoaded, user, adminEmail, signOut, router]);

  // If user is loaded and unauthorized, block UI and show a premium access denied screen
  if (showDeniedScreen || (isLoaded && user && user.primaryEmailAddress?.emailAddress?.toLowerCase().trim() !== adminEmail)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black text-white p-6 select-none relative overflow-hidden">
        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.04] bg-black">
          <div className="scan-line" />
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-6 z-10"
        >
          <img
            src="/logo.gif"
            alt="WarishLabs Logo"
            className="w-20 h-20 mx-auto rounded-xl border border-white/10 shadow-[0_0_50px_rgba(239,68,68,0.2)]"
          />
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-red-500 tracking-tight uppercase">Access Denied</h1>
            <p className="text-sm text-zinc-400 max-w-xs mx-auto">
              Your account is not authorized to access the console. Terminating session...
            </p>
          </div>
          <div className="w-24 h-1 bg-red-950/40 mx-auto rounded-full overflow-hidden relative">
            <motion.div 
              initial={{ left: '-100%' }}
              animate={{ left: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="absolute top-0 bottom-0 w-1/2 bg-red-500 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-black text-white">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminTopbar />
          <main className="flex-1 overflow-y-auto bg-black p-8">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

