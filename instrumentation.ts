import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Validate required env vars at startup — fails fast with a clear error
    // listing exactly which vars are missing instead of an opaque Prisma crash.
    // Root cause: Vercel injects env vars as process.env, NOT a .env file.
    // If DATABASE_URL is missing, check Vercel dashboard → Settings → Environment Variables
    // and ensure the var is scoped to the correct environment (Production/Preview/Development).
    const { validateEnv } = await import("./lib/env");
    validateEnv();

    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Automatically captures all unhandled server-side request errors
export const onRequestError = Sentry.captureRequestError;
