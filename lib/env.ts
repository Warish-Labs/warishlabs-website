/**
 * lib/env.ts — Startup environment variable validation
 *
 * Called during Next.js instrumentation (Node.js runtime only) to fail fast
 * with a human-readable error listing exactly which required env vars are
 * absent, rather than surfacing an opaque Prisma config or runtime crash.
 *
 * Root-cause context: Vercel does NOT write a .env file at build time —
 * env vars are injected as true process.env variables. If DATABASE_URL is
 * missing it means the variable is not scoped to the target Vercel
 * environment (Production/Preview/Development) in the Vercel dashboard,
 * or is simply not set at all.
 */

import { z } from 'zod';

const envSchema = z.object({
  // Database — required for Prisma to function at all
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Central Analytics Database (optional with fallback)
  ANALYTICS_DATABASE_URL: z.string().optional(),

  // Clerk authentication keys
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),

  // Cloudinary media service
  CLOUDINARY_CLOUD_NAME: z
    .string()
    .min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z
    .string()
    .min(1, 'CLOUDINARY_API_SECRET is required'),

  // Resend email service
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
});

/**
 * Validates all required environment variables at server startup.
 * Throws a clear, formatted error on any missing vars so the deploy fails
 * immediately with a useful message instead of a cryptic runtime crash.
 *
 * Only call this inside the Node.js runtime path (instrumentation.ts).
 * Do NOT call it at the module level — it must run after process.env is populated.
 */
export function validateEnv(): void {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const missing = result.error.issues
      .map((e) => `  ✗ ${e.path.join('.')}: ${e.message}`)
      .join('\n');

    throw new Error(
      `\n\n🚨 WarishLabs — Missing required environment variables:\n${missing}\n\n` +
        `Check your .env file (local dev) or Vercel project settings (production).\n` +
        `Ensure each variable is scoped to the correct environment (Production / Preview / Development).\n`
    );
  }
}

/**
 * Type-safe accessor for validated env vars.
 * Use this instead of process.env directly in server-side code.
 */
export const env = {
  DATABASE_URL: process.env.DATABASE_URL as string,
  CLERK_PUBLISHABLE_KEY: process.env
    .NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY as string,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
  RESEND_API_KEY: process.env.RESEND_API_KEY as string,
} as const;
