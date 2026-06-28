import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateSession } from '@/lib/auth';

export async function GET() {
  const admin = await validateSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get aggregate counts
    const totalEvents = await prisma.analyticsEvent.count();
    
    // Group events by eventName
    const eventCounts = await prisma.analyticsEvent.groupBy({
      by: ['eventName'],
      _count: {
        id: true,
      },
    });

    // Get recent 100 events
    const recentEvents = await prisma.analyticsEvent.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        visitor: true,
      },
    });

    return NextResponse.json({
      success: true,
      totalEvents,
      eventCounts,
      recentEvents,
    });
  } catch (error) {
    console.error('[API Admin Analytics] Fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
