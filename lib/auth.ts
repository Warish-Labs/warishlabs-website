import { auth, currentUser } from '@clerk/nextjs/server';
import type { Admin } from '@prisma/client';

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
        // Construct and return a compatible Admin model
        return {
          id: clerkAuth.userId,
          email: email,
          name: `${user.firstName || 'WarishLabs'} ${user.lastName || 'Owner'}`.trim(),
          passwordHash: '',
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        };
      }
    }
  } catch (error) {
    console.error('[validateSession] Clerk session lookup failed:', error);
  }

  return null;
}
