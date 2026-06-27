import prisma from '@/lib/prisma';
import { CONFIG } from '@/constants/config';

export class AnalyticsService {
  /**
   * Tracks an analytics event in the database, ensuring the visitor record exists first.
   */
  static async trackEvent({
    visitorId,
    eventName,
    eventData,
    url,
    referrer,
    userAgent,
    ipAddress,
  }: {
    visitorId: string;
    eventName: string;
    eventData?: Record<string, any>;
    url: string;
    referrer?: string | null;
    userAgent?: string | null;
    ipAddress?: string | null;
  }): Promise<boolean> {
    try {
      // 1. Ensure Visitor exists (upsert)
      await prisma.visitor.upsert({
        where: { id: visitorId },
        update: { updatedAt: new Date() },
        create: { id: visitorId },
      });

      // 2. Create the AnalyticsEvent
      await prisma.analyticsEvent.create({
        data: {
          visitorId,
          eventName,
          eventData: eventData || undefined,
          url,
          referrer,
          userAgent,
          ipAddress,
        },
      });

      return true;
    } catch (error) {
      console.error('[AnalyticsService] Failed to track event:', error);
      return false;
    }
  }

  /**
   * Cleans up analytics events older than the retention threshold (90 days).
   * Designed to be triggered by an authorized CRON job to keep Neon DB slim.
   */
  static async cleanupOldEvents(): Promise<{ success: boolean; deletedCount: number }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - CONFIG.ANALYTICS_RETENTION_DAYS);

      console.log(`[AnalyticsService] Running analytics cleanup. Deleting events older than ${cutoffDate.toISOString()}`);

      const result = await prisma.analyticsEvent.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      console.log(`[AnalyticsService] Cleanup completed. Deleted ${result.count} event records.`);
      return { success: true, deletedCount: result.count };
    } catch (error) {
      console.error('[AnalyticsService] Failed during event cleanup:', error);
      return { success: false, deletedCount: 0 };
    }
  }
}
