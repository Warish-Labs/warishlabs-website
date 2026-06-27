import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/services/AnalyticsService';
import { headers } from 'next/headers';

/**
 * API route to clean up analytics events older than 90 days.
 * Secured via CRON_SECRET token comparison.
 */
export async function POST(request: Request) {
  try {
    const headerStore = await headers();
    const authHeader = headerStore.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { success: false, error: 'CRON_SECRET is not configured on the server.' },
        { status: 500 }
      );
    }

    const expectedAuth = `Bearer ${cronSecret}`;
    if (authHeader !== expectedAuth) {
      // Also support query param fallback for simple scheduling tools
      const { searchParams } = new URL(request.url);
      const secretParam = searchParams.get('secret');
      
      if (secretParam !== cronSecret) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized credentials.' },
          { status: 401 }
        );
      }
    }

    // Call retention cleanup query
    const result = await AnalyticsService.cleanupOldEvents();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Cleanup query execution failed.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Old analytics events pruned successfully.',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('[API Analytics Cleanup] Error handling cleanup request:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
