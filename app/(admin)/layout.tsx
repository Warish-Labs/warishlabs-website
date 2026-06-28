'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { TooltipProvider } from '@/components/ui/tooltip';

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

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'warishlabs@gmail.com';

  React.useEffect(() => {
    if (isLoaded && user) {
      const email = user.primaryEmailAddress?.emailAddress;
      if (email && email.toLowerCase().trim() !== adminEmail.toLowerCase().trim()) {
        console.warn('[AdminLayout] Access Denied: Unauthorized email:', email);
        signOut().then(() => {
          router.replace('/');
        });
      }
    }
  }, [isLoaded, user, adminEmail, signOut, router]);

  // If user is loaded and unauthorized, block UI and show access denied screen
  if (isLoaded && user) {
    const email = user.primaryEmailAddress?.emailAddress;
    if (email && email.toLowerCase().trim() !== adminEmail.toLowerCase().trim()) {
      return (
        <div className="flex h-screen items-center justify-center bg-black text-white p-6">
          <div className="text-center space-y-4">
            <h1 className="text-xl font-bold text-red-500">Access Denied</h1>
            <p className="text-sm text-text-secondary">Unauthorized account. Terminating session...</p>
          </div>
        </div>
      );
    }
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
