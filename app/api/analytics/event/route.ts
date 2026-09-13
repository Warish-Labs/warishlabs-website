import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/services/AnalyticsService';
import { CentralAnalyticsService } from '@/services/CentralAnalyticsService';
import { CONFIG } from '@/constants/config';
import { cookies, headers } from 'next/headers';
import crypto from 'crypto';
import { z } from 'zod';

const eventSchema = z.object({
  projectSlug: z.string().optional(),
  eventName: z.string().min(1, { message: 'eventName is required' }),
  eventData: z.record(z.string(), z.any()).optional().nullable(),
  url: z.string().url({ message: 'A valid URL is required' }),
  referrer: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // 1. Validate request body via Zod
    const validation = eventSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { projectSlug, eventName, eventData, url, referrer } = validation.data;

    // 2. Retrieve or dynamically allocate visitor ID in cookies (Next.js 16 await cookies())
    const cookieStore = await cookies();
    let visitorId = cookieStore.get(CONFIG.VISITOR_COOKIE_NAME)?.value;

    if (!visitorId) {
      visitorId = crypto.randomUUID();
      cookieStore.set(CONFIG.VISITOR_COOKIE_NAME, visitorId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60, // 1 year
        path: '/',
      });
    }

    const headerStore = await headers();
    const userAgent = headerStore.get('user-agent');
    const ipAddress = headerStore.get('x-real-ip') || headerStore.get('x-forwarded-for') || '127.0.0.1';
    
    // Vercel Geolocation Headers
    const country = headerStore.get('x-vercel-ip-country') || null;
    const region = headerStore.get('x-vercel-ip-country-region') || null;
    const city = headerStore.get('x-vercel-ip-city') || null;

    // 3. Track event in Central Analytics DB
    const centralSuccess = await CentralAnalyticsService.trackEvent({
      projectSlug: projectSlug || process.env.NEXT_PUBLIC_ANALYTICS_PROJECT_ID || 'warishlabs-website',
      visitorId,
      eventName,
      eventData: eventData || undefined,
      url,
      referrer: referrer || undefined,
      userAgent,
      ipAddress,
      country,
      region,
      city,
    });

    // 4. Track event in Main App DB (backward compatibility)
    await AnalyticsService.trackEvent({
      visitorId,
      eventName,
      eventData: eventData || undefined,
      url,
      referrer: referrer || undefined,
      userAgent,
      ipAddress,
    }).catch(() => null);

    return NextResponse.json({ success: centralSuccess });
  } catch (error) {
    // Fail silently without interrupting visitor rendering
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
