import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/services/AnalyticsService';
import { CentralAnalyticsService } from '@/services/CentralAnalyticsService';
import { CONFIG } from '@/constants/config';
import { cookies, headers } from 'next/headers';
import crypto from 'crypto';
import { z } from 'zod';

const eventSchema = z.object({
  projectSlug: z.string().optional(),
  projectId: z.string().optional(),
  visitorId: z.string().optional(),
  eventName: z.string().optional().default('page_view'),
  eventData: z.record(z.string(), z.any()).optional().nullable(),
  url: z.string().optional().nullable(),
  path: z.string().optional().nullable(),
  referrer: z.string().nullable().optional(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-project-slug',
  'Access-Control-Max-Age': '86400',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // 1. Validate request body via Zod
    const validation = eventSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.error.flatten().fieldErrors },
        { status: 400, headers: corsHeaders }
      );
    }

    const { projectSlug, projectId, visitorId: bodyVisitorId, eventName, eventData, url: bodyUrl, path: bodyPath, referrer } = validation.data;
    const targetSlug = projectSlug || projectId || process.env.NEXT_PUBLIC_ANALYTICS_PROJECT_ID || 'warishlabs-website';

    // 2. Retrieve or dynamically allocate visitor ID in cookies (Next.js 16 await cookies())
    const cookieStore = await cookies();
    let cookieVisitorId = cookieStore.get(CONFIG.VISITOR_COOKIE_NAME)?.value;

    if (!cookieVisitorId) {
      cookieVisitorId = bodyVisitorId || crypto.randomUUID();
      cookieStore.set(CONFIG.VISITOR_COOKIE_NAME, cookieVisitorId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60, // 1 year
        path: '/',
      });
    }

    const finalVisitorId = bodyVisitorId || cookieVisitorId;

    const headerStore = await headers();
    const userAgent = headerStore.get('user-agent');
    const ipAddress = headerStore.get('x-real-ip') || headerStore.get('x-forwarded-for') || '127.0.0.1';
    const origin = headerStore.get('origin') || headerStore.get('referer') || 'https://warishlabs.in';
    const resolvedUrl = bodyUrl || (bodyPath ? `${origin}${bodyPath}` : origin);
    
    // Vercel Geolocation Headers
    const country = headerStore.get('x-vercel-ip-country') || null;
    const region = headerStore.get('x-vercel-ip-country-region') || null;
    const city = headerStore.get('x-vercel-ip-city') || null;

    // 3. Track event in Central Analytics DB (Auto-registers project if missing)
    const centralSuccess = await CentralAnalyticsService.trackEvent({
      projectSlug: targetSlug,
      visitorId: finalVisitorId,
      eventName: eventName || 'page_view',
      eventData: eventData || undefined,
      url: resolvedUrl,
      referrer: referrer || undefined,
      userAgent,
      ipAddress,
      country,
      region,
      city,
    });

    // 4. Track event in Main App DB (backward compatibility)
    await AnalyticsService.trackEvent({
      visitorId: finalVisitorId,
      eventName,
      eventData: eventData || undefined,
      url: resolvedUrl,
      referrer: referrer || undefined,
      userAgent,
      ipAddress,
    }).catch(() => null);

    return NextResponse.json({ success: centralSuccess }, { headers: corsHeaders });
  } catch (error) {
    // Fail silently without interrupting visitor rendering
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
