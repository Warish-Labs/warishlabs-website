import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/services/AnalyticsService';
import { CONFIG } from '@/constants/config';
import { cookies, headers } from 'next/headers';
import crypto from 'crypto';
import { z } from 'zod';

const eventSchema = z.object({
  eventName: z.string().min(1, { message: 'eventName is required' }),
  eventData: z.record(z.string(), z.any()).optional().nullable(),
  url: z.string().url({ message: 'A valid URL is required' }),
  referrer: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Validate request body via Zod
    const validation = eventSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { eventName, eventData, url, referrer } = validation.data;

    // 2. Retrieve or dynamically allocate visitor ID in cookies (Await cookies() in Next.js 16)
    const cookieStore = await cookies();
    let visitorId = cookieStore.get(CONFIG.VISITOR_COOKIE_NAME)?.value;

    if (!visitorId) {
      // Allocate new visitorId if none exists (first page visit analytics)
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

    // 3. Track event in DB
    const success = await AnalyticsService.trackEvent({
      visitorId,
      eventName,
      eventData: eventData || undefined,
      url,
      referrer: referrer || undefined,
      userAgent,
      ipAddress,
    });

    return NextResponse.json({ success });
  } catch (error) {
    console.error('[API Analytics Event] Error tracking event:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
