import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { Admin } from '@prisma/client';
import prisma from '@/lib/prisma';

/**
 * Validates the current session using Clerk auth.
 * If the authenticated Clerk user's email matches process.env.ADMIN_EMAIL (defaulting to warishlabs@gmail.com),
 * they are treated as the owner and super admin of this site.
 */
export async function validateSession(): Promise<Admin | null> {
  try {
    const clerkAuth = await auth();
    if (clerkAuth && clerkAuth.userId) {
      const user = await currentUser();
      const email = user?.emailAddresses[0]?.emailAddress;
      const adminEmail = process.env.ADMIN_EMAIL || 'warishlabs@gmail.com';

      if (email && email.toLowerCase().trim() === adminEmail.toLowerCase().trim()) {
        // Lookup locally by email to get a database-backed Admin row (maintaining FK references)
        let dbAdmin = await prisma.admin.findUnique({
          where: { email: email.toLowerCase().trim() }
        });

        if (!dbAdmin) {
          dbAdmin = await prisma.admin.create({
            data: {
              id: clerkAuth.userId,
              email: email.toLowerCase().trim(),
              name: `${user.firstName || 'WarishLabs'} ${user.lastName || 'Owner'}`.trim(),
              passwordHash: '',
            }
          });
        }
        return dbAdmin;
      }
    }
  } catch (error) {
    console.error('[validateSession] Clerk session lookup failed:', error);
  }

  return null;
}

/**
 * Enforces admin authorization. If unauthorized or unauthenticated, redirects.
 * Revokes the session if user is logged into Clerk but lacks admin access.
 */
export async function requireAdmin(): Promise<Admin> {
  const clerkAuth = await auth();
  const { userId, sessionId } = clerkAuth;
  
  if (!userId) {
    redirect('/admin/login');
  }

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  const adminEmail = process.env.ADMIN_EMAIL || 'warishlabs@gmail.com';

  if (!email || email.toLowerCase().trim() !== adminEmail.toLowerCase().trim()) {
    console.warn('[requireAdmin] Access Denied: Unauthorized email:', email);
    try {
      const client = await clerkClient();
      if (sessionId) {
        await client.sessions.revokeSession(sessionId);
      }
    } catch (err) {
      console.error('[requireAdmin] Clerk revokeSession failed:', err);
    }
    redirect('/?error=access_denied');
  }

  let dbAdmin = await prisma.admin.findUnique({
    where: { email: email.toLowerCase().trim() }
  });

  if (!dbAdmin) {
    dbAdmin = await prisma.admin.create({
      data: {
        id: userId,
        email: email.toLowerCase().trim(),
        name: `${user.firstName || 'WarishLabs'} ${user.lastName || 'Owner'}`.trim(),
        passwordHash: '',
      }
    });
  }

  return dbAdmin;
}
