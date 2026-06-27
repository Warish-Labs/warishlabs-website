'use server';

import { logout } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * Server Action for admin logout, clearing DB session and cookies
 */
export async function logoutAction(): Promise<void> {
  await logout();
  redirect('/admin/login');
}
