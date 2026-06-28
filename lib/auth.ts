import { auth, currentUser } from '@clerk/nextjs/server';
import type { Admin } from '@prisma/client';
import prisma from '@/lib/prisma';

/**
 * Validates the current session using ONLY Clerk auth.
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
