import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/services/AnalyticsService';
import { CONFIG } from '@/constants/config';
import { cookies, headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventName, eventData, url, referrer } = body;

    if (!eventName || !url) {
      return NextResponse.json({ success: false, error: 'Missing eventName or url' }, { status: 400 });
    }

    // Retrieve visitor ID from cookies (Await cookies() and headers() in Next.js 16)
    const cookieStore = await cookies();
    const visitorId = cookieStore.get(CONFIG.VISITOR_COOKIE_NAME)?.value;

    if (!visitorId) {
      // If visitorId is not set yet, we don't track or we use a temporary random UUID
      return NextResponse.json({ success: false, error: 'No visitor session found' }, { status: 400 });
    }

    const headerStore = await headers();
    const userAgent = headerStore.get('user-agent');
    const ipAddress = headerStore.get('x-forwarded-for') || request.headers.get('x-real-ip');

    // Track event in DB
    const success = await AnalyticsService.trackEvent({
      visitorId,
      eventName,
      eventData,
      url,
      referrer,
      userAgent,
      ipAddress,
    });

    return NextResponse.json({ success });
  } catch (error) {
    console.error('[API Analytics Event] Error tracking event:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
