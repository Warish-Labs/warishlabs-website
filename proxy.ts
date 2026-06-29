import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { CONFIG } from '@/constants/config';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// 1. Upstash Redis Setup (if env variables exist)
let redisClient: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redisClient = Redis.fromEnv();
  } catch (err) {
    console.error('[RateLimit] Failed to initialize Upstash Redis from env:', err);
  }
}

// 2. Local In-Memory Fallback rate limiter
const rateLimitCache = new Map<string, { tokens: number; lastRefill: number }>();

function devRateLimit(ip: string, limit: number, windowSec: number): boolean {
  const now = Date.now();
  const key = `${ip}:${limit}:${windowSec}`;
  const bucket = rateLimitCache.get(key) || { tokens: limit, lastRefill: now };
  
  const elapsedMs = now - bucket.lastRefill;
  const refillAmount = (elapsedMs / 1000) * (limit / windowSec);
  bucket.tokens = Math.min(limit, bucket.tokens + refillAmount);
  bucket.lastRefill = now;
  
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    rateLimitCache.set(key, bucket);
    return true;
  }
  
  rateLimitCache.set(key, bucket);
  return false;
}

// Helper to handle rate limiting dynamically
async function checkRateLimit(ip: string, category: string, limit: number, windowSec: number): Promise<boolean> {
  if (redisClient) {
    try {
      const limiter = new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
        prefix: `ratelimit:${category}`,
      });
      const { success } = await limiter.limit(ip);
      return success;
    } catch (err) {
      console.error(`[RateLimit] Upstash execution error on ${category}, fallback to local:`, err);
    }
  }
  return devRateLimit(ip, limit, windowSec);
}

/**
 * Next.js 16 Proxy (Middleware) with Clerk SSO & Security features
 */
export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // Immediately bypass Sentry monitoring tunnel route
  if (pathname.startsWith('/monitoring')) {
    return NextResponse.next();
  }

  // 1. Visitor Tracking (Set UUID if not present)
  let visitorId = request.cookies.get(CONFIG.VISITOR_COOKIE_NAME)?.value;
  const response = NextResponse.next();

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
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const clerkAuth = await auth();
    if (!clerkAuth.userId) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 3. Security-focused Rate Limiting
  const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || '127.0.0.1';
  let allowed = true;
  
  if (pathname === '/api/contact') {
    allowed = await checkRateLimit(ip, 'contact', CONFIG.RATE_LIMITS.CONTACT_LIMIT, CONFIG.RATE_LIMITS.CONTACT_WINDOW);
  } else if (pathname === '/api/newsletter/subscribe') {
    allowed = await checkRateLimit(ip, 'newsletter', CONFIG.RATE_LIMITS.NEWSLETTER_LIMIT, CONFIG.RATE_LIMITS.NEWSLETTER_WINDOW);
  } else if (pathname === '/api/search') {
    allowed = await checkRateLimit(ip, 'search', CONFIG.RATE_LIMITS.SEARCH_LIMIT, CONFIG.RATE_LIMITS.SEARCH_WINDOW);
  } else if (pathname === '/api/analytics/event') {
    allowed = await checkRateLimit(visitorId || ip, 'analytics', CONFIG.RATE_LIMITS.ANALYTICS_LIMIT, CONFIG.RATE_LIMITS.ANALYTICS_WINDOW);
  } else if (pathname.startsWith('/api/admin')) {
    allowed = await checkRateLimit(ip, 'admin', 60, 60);
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
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('Permissions-Policy', 'accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(self), screen-wake-lock=(), usb=(), web-share=(self)');
  response.headers.set('Cross-Origin-Embedder-Policy', 'credentialless');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  
  // Content Security Policy
  const isProd = process.env.NODE_ENV === 'production';
  const csp = `
    default-src 'self';
    script-src 'self' ${isProd ? '' : "'unsafe-eval'"} 'unsafe-inline' *.clerk.accounts.dev clerk.warishlabs.in https://www.googletagmanager.com https://challenges.cloudflare.com https://www.clarity.ms;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob: res.cloudinary.com img.clerk.com *.clerk.accounts.dev https://www.google-analytics.com https://*.clarity.ms https://*.bing.com;
    media-src 'self' data: blob: res.cloudinary.com;
    connect-src 'self' *.clerk.accounts.dev clerk.warishlabs.in https://api.clerk.com https://vitals.vercel-insights.com https://challenges.cloudflare.com https://*.clarity.ms https://*.bing.com https://www.google-analytics.com;
    font-src 'self' data:;
    object-src 'none';
    frame-ancestors 'none';
    frame-src 'self' https://challenges.cloudflare.com;
    worker-src 'self' blob:;
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim();
  
  response.headers.set('Content-Security-Policy', csp);

  return response;
});

export const config = {
  matcher: [
    '/((?!monitoring|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/__clerk/:path*',
    '/(api|trpc)(.*)',
  ],
};
