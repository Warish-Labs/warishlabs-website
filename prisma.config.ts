import 'dotenv/config';
import { defineConfig } from '@prisma/config';

/**
 * prisma.config.ts — Prisma configuration with defensive DATABASE_URL handling
 *
 * Root cause of Vercel build crash (PrismaConfigEnvError):
 * Vercel does NOT write a .env file at build time — env vars are injected as
 * true process.env variables. The @prisma/config `env()` helper was previously
 * used here, which can fail when the variable isn't found via dotenv resolution.
 *
 * Fix: Read DATABASE_URL directly from process.env and throw a clear, actionable
 * error if it's missing, instead of allowing the opaque Prisma internal error.
 *
 * IMPORTANT — Vercel dashboard action required:
 * If the build still fails after this change, go to:
 *   Vercel Dashboard → Your Project → Settings → Environment Variables
 * and ensure DATABASE_URL is set for the PRODUCTION environment
 * (not just Preview or Development).
 */

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    '\n\n🚨 prisma.config.ts: DATABASE_URL environment variable is not set.\n' +
      'On Vercel: go to Project → Settings → Environment Variables\n' +
      'and ensure DATABASE_URL is scoped to the Production environment.\n' +
      'Locally: ensure your .env file contains DATABASE_URL=postgresql://...\n'
  );
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: databaseUrl,
  },
});
