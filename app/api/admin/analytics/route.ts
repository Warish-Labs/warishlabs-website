import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const admin = await validateSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';

    // 1. Build date range filter
    const dateFilter: any = {};
    if (range === '7d' || range === '30d') {
      const limitDate = new Date();
      limitDate.setDate(limitDate.getDate() - (range === '7d' ? 7 : 30));
      dateFilter.createdAt = { gte: limitDate };
    }

    // 2. Query total events under date range
    const totalEvents = await prisma.analyticsEvent.count({
      where: dateFilter,
    });
    
    // 3. Group events by eventName
    const eventCounts = await prisma.analyticsEvent.groupBy({
      by: ['eventName'],
      where: dateFilter,
      _count: {
        id: true,
      },
    });

    // 4. Group events by referrer (Top 10 referrers)
    const referrers = await prisma.analyticsEvent.groupBy({
      by: ['referrer'],
      where: {
        ...dateFilter,
        referrer: { not: null },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // 5. Query recent events (Last 100) under date filter
    const recentEvents = await prisma.analyticsEvent.findMany({
      where: dateFilter,
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        visitor: true,
      },
    });

    return NextResponse.json({
      success: true,
      range,
      totalEvents,
      eventCounts,
      referrers,
      recentEvents,
    });
  } catch (error) {
    console.error('[API Admin Analytics] Fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
