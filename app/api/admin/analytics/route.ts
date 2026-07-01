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
    // numDays drives the time-series bucket count; the initial value is
    // determined by the range before any branching (avoids dead-write lint).
    const RANGE_DAYS: Record<string, number> = { '7d': 7, '30d': 30 };
    const numDays: number = RANGE_DAYS[range] ?? 90;

    const dateFilter: any = {};
    if (range === '7d' || range === '30d') {
      const limitDate = new Date();
      limitDate.setDate(limitDate.getDate() - numDays);
      dateFilter.createdAt = { gte: limitDate };
    }
    // else: no createdAt filter → all time

    // Run all queries in parallel
    const [
      totalEvents,
      eventCounts,
      referrers,
      recentEvents,
      pageViewEvents,
      searchEvents,
    ] = await Promise.all([
      // 2. Total events
      prisma.analyticsEvent.count({ where: dateFilter }),

      // 3. Group events by eventName
      prisma.analyticsEvent.groupBy({
        by: ['eventName'],
        where: dateFilter,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),

      // 4. Top 10 referrers
      prisma.analyticsEvent.groupBy({
        by: ['referrer'],
        where: { ...dateFilter, referrer: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),

      // 5. Recent events (last 100)
      prisma.analyticsEvent.findMany({
        where: dateFilter,
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: { visitor: true },
      }),

      // 6. Page view events for time-series chart (select only createdAt)
      prisma.analyticsEvent.findMany({
        where: {
          ...dateFilter,
          eventName: 'page_view',
        },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),

      // 7. Search events for top terms
      prisma.analyticsEvent.findMany({
        where: {
          ...dateFilter,
          eventName: 'search',
        },
        select: { eventData: true },
      }),
    ]);

    // --- Build page views over time (grouped by day) ---
    const viewsByDay: Record<string, number> = {};
    const now = new Date();
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      viewsByDay[key] = 0;
    }

    pageViewEvents.forEach((evt) => {
      const key = new Date(evt.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      if (viewsByDay[key] !== undefined) {
        viewsByDay[key]++;
      }
    });

    const viewsOverTime = Object.entries(viewsByDay).map(([date, views]) => ({
      date,
      views,
    }));

    // --- Build top search terms ---
    const termCounts: Record<string, number> = {};
    searchEvents.forEach((evt) => {
      try {
        const data = evt.eventData as { query?: string } | null;
        if (data?.query) {
          const term = data.query.trim().toLowerCase();
          if (term) {
            termCounts[term] = (termCounts[term] || 0) + 1;
          }
        }
      } catch {
        // ignore parse errors
      }
    });

    const topSearches = Object.entries(termCounts)
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      range,
      totalEvents,
      eventCounts,
      referrers,
      recentEvents,
      viewsOverTime,
      topSearches,
    });
  } catch (error) {
    console.error('[API Admin Analytics] Fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
