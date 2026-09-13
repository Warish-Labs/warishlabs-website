import { NextResponse } from 'next/server';
import { CentralAnalyticsService } from '@/services/CentralAnalyticsService';
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
    const projectSlug = searchParams.get('project') || 'all';

    const RANGE_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
    const numDays = RANGE_DAYS[range] ?? 30;

    const metrics = await CentralAnalyticsService.getDashboardMetrics(numDays, projectSlug);

    return NextResponse.json({
      success: true,
      range,
      ...metrics,
    });
  } catch (error) {
    console.error('[API Admin Analytics] Fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
