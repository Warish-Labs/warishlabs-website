'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export type LoginResult = 
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Server Action for admin login validation and session registration
 */
export async function loginAction(prevState: any, formData: FormData): Promise<LoginResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Validate inputs
  const validation = loginSchema.safeParse({ email, password });
  if (!validation.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    // 1. Find Admin
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin) {
      return { success: false, error: 'Invalid email or password' };
    }

    // 2. Validate Password
    const passwordMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatch) {
      return { success: false, error: 'Invalid email or password' };
    }

    // 3. Create database-backed session and cookies
    await createSession(admin.id);

    // 4. Log the login activity
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'ADMIN_LOGIN',
        details: `Admin user ${admin.email} successfully logged in.`,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('[loginAction] Login execution error:', error);
    return { success: false, error: 'An internal server error occurred.' };
  }
}
