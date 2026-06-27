import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateSession } from '@/lib/auth';
import { CONFIG } from '@/constants/config';
import crypto from 'crypto';

import type { NextFetchEvent } from 'next/server';

const clerk = clerkMiddleware();

// In-memory token bucket rate limiter for development/fallback
const rateLimitCache = new Map<string, { tokens: number; lastRefill: number }>();

function devRateLimit(ip: string, limit: number, windowSec: number): boolean {
  const now = Date.now();
  const key = `${ip}:${limit}:${windowSec}`;
  const bucket = rateLimitCache.get(key) || { tokens: limit, lastRefill: now };
  
  // Refill tokens
  const elapsedMs = now - bucket.lastRefill;
  const refillAmount = (elapsedMs / 1000) * (limit / windowSec);
  bucket.tokens = Math.min(limit, bucket.tokens + refillAmount);
  bucket.lastRefill = now;
  
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    rateLimitCache.set(key, bucket);
    return true; // Allowed
  }
  
  rateLimitCache.set(key, bucket);
  return false; // Rate limited
}

/**
 * Next.js 16 Proxy (renamed from Middleware)
 */
export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  const clerkResponse = await clerk(request, event);
  if (clerkResponse && clerkResponse.headers.get('x-middleware-next') !== '1') {
    return clerkResponse;
  }
  
  // Proceed with default next response
  let response = (clerkResponse as NextResponse) || NextResponse.next();

  // 1. Visitor Tracking (Set UUID if not present)
  let visitorId = request.cookies.get(CONFIG.VISITOR_COOKIE_NAME)?.value;
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    response.cookies.set(CONFIG.VISITOR_COOKIE_NAME, visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: '/',
    });
  }

  // 2. Admin Authentication
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const admin = await validateSession();
    if (!admin) {
      // Redirect to login page
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 3. Rate Limiting (Dev-fallback or production via Upstash)
  const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || '127.0.0.1';
  let allowed = true;
  
  if (pathname === '/api/contact') {
    allowed = devRateLimit(ip, CONFIG.RATE_LIMITS.CONTACT_LIMIT, CONFIG.RATE_LIMITS.CONTACT_WINDOW);
  } else if (pathname === '/api/newsletter/subscribe') {
    allowed = devRateLimit(ip, CONFIG.RATE_LIMITS.NEWSLETTER_LIMIT, CONFIG.RATE_LIMITS.NEWSLETTER_WINDOW);
  } else if (pathname === '/api/search') {
    allowed = devRateLimit(ip, CONFIG.RATE_LIMITS.SEARCH_LIMIT, CONFIG.RATE_LIMITS.SEARCH_WINDOW);
  } else if (pathname === '/api/analytics/event') {
    allowed = devRateLimit(visitorId || ip, CONFIG.RATE_LIMITS.ANALYTICS_LIMIT, CONFIG.RATE_LIMITS.ANALYTICS_WINDOW);
  }

  if (!allowed) {
    return new Response(JSON.stringify({ success: false, error: 'Too many requests. Please try again later.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 4. Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  const csp = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob: res.cloudinary.com;
    media-src 'self' data: blob: res.cloudinary.com;
    connect-src 'self';
    font-src 'self' data:;
    object-src 'none';
    frame-ancestors 'none';
  `.replace(/\s+/g, ' ').trim();
  
  response.headers.set('Content-Security-Policy', csp);

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/:path*',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
