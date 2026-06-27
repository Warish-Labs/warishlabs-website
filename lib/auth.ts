import { cookies } from 'next/headers';
import crypto from 'crypto';
import prisma from './prisma';
import { CONFIG } from '@/constants/config';
import type { Admin } from '@prisma/client';

/**
 * Generates a secure random session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Creates a database session for an admin and sets the cookie
 */
export async function createSession(adminId: string): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + CONFIG.SESSION_EXPIRY_DAYS);

  // Save session in database
  await prisma.session.create({
    data: {
      adminId,
      token,
      expiresAt,
    },
  });

  // Set the cookie (Await cookies() in Next.js 16)
  const cookieStore = await cookies();
  cookieStore.set(CONFIG.COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return token;
}

import { auth, currentUser } from '@clerk/nextjs/server';

/**
 * Validates the current session using the database or Clerk auth
 */
export async function validateSession(): Promise<Admin | null> {
  // 1. Try Custom DB Session
  const cookieStore = await cookies();
  const token = cookieStore.get(CONFIG.COOKIE_NAME)?.value;

  if (token) {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { admin: true },
    });

    if (session) {
      // Check if session has expired
      if (new Date() > session.expiresAt) {
        await prisma.session.delete({ where: { token } }).catch(() => {});
        cookieStore.delete(CONFIG.COOKIE_NAME);
      } else {
        return session.admin;
      }
    } else {
      cookieStore.delete(CONFIG.COOKIE_NAME);
    }
  }

  // 2. Try Clerk Auth
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

/**
 * Revokes the current session on the database and clears the cookie
 */
export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CONFIG.COOKIE_NAME)?.value;

  if (token) {
    // Delete session from DB
    await prisma.session.delete({ where: { token } }).catch(() => {
      // Ignore if session already deleted
    });
  }

  // Clear cookie
  cookieStore.delete(CONFIG.COOKIE_NAME);
}
