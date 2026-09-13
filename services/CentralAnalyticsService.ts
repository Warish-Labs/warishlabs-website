import prismaAnalytics from '@/lib/prisma-analytics';
import { headers } from 'next/headers';
import crypto from 'crypto';

export interface TrackEventPayload {
  projectSlug?: string;
  visitorId: string;
  sessionId?: string;
  eventName: string;
  eventData?: Record<string, unknown>;
  url: string;
  path?: string;
  referrer?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
}

export class CentralAnalyticsService {
  /**
   * Helper to parse simple browser and OS info from User-Agent string without heavy dependencies
   */
  private static parseUserAgent(ua?: string | null): { browser: string; os: string; device: string } {
    if (!ua) return { browser: 'Unknown', os: 'Unknown', device: 'Desktop' };
    
    let browser = 'Other';
    if (/chrome|crios/i.test(ua) && !/edg|opr/i.test(ua)) browser = 'Chrome';
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = 'Safari';
    else if (/edg/i.test(ua)) browser = 'Edge';
    else if (/opr|opera/i.test(ua)) browser = 'Opera';

    let os = 'Other';
    if (/windows/i.test(ua)) os = 'Windows';
    else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
    else if (/linux/i.test(ua)) os = 'Linux';

    let device = 'Desktop';
    if (/mobile/i.test(ua)) device = 'Mobile';
    else if (/tablet|ipad/i.test(ua)) device = 'Tablet';

    return { browser, os, device };
  }

  /**
   * Tracks a visitor event or page view silently in the separate analytics database
   */
  static async trackEvent(payload: TrackEventPayload): Promise<boolean> {
    try {
      const projectSlug = payload.projectSlug || process.env.NEXT_PUBLIC_ANALYTICS_PROJECT_ID || 'warishlabs-website';
      
      // 1. Ensure project exists (auto-register default project if missing)
      let project = await prismaAnalytics.project.findUnique({
        where: { slug: projectSlug },
      }).catch(() => null);

      if (!project) {
        // Register default project automatically
        project = await prismaAnalytics.project.create({
          data: {
            slug: projectSlug,
            name: projectSlug === 'warishlabs-website' ? 'WarishLabs Main Website' : projectSlug,
            domain: 'warishlabs.in',
          },
        }).catch(() => null);
      }

      if (!project) {
        return false;
      }

      const { browser, os, device } = this.parseUserAgent(payload.userAgent);

      // 2. Find or create visitor session (sessions within 30 mins)
      let session = await prismaAnalytics.session.findFirst({
        where: {
          projectId: project.id,
          visitorId: payload.visitorId,
          lastSeenAt: {
            gte: new Date(Date.now() - 30 * 60 * 1000), // 30 mins session window
          },
        },
        orderBy: { lastSeenAt: 'desc' },
      }).catch(() => null);

      if (!session) {
        session = await prismaAnalytics.session.create({
          data: {
            projectId: project.id,
            visitorId: payload.visitorId,
            userAgent: payload.userAgent || undefined,
            browser,
            os,
            device,
            country: payload.country || undefined,
            region: payload.region || undefined,
            city: payload.city || undefined,
            referrer: payload.referrer || undefined,
            lastSeenAt: new Date(),
          },
        }).catch(() => null);
      } else {
        await prismaAnalytics.session.update({
          where: { id: session.id },
          data: { lastSeenAt: new Date() },
        }).catch(() => null);
      }

      if (!session) return false;

      const pathName = payload.path || (payload.url ? new URL(payload.url, 'https://warishlabs.in').pathname : '/');

      // 3. Record PageView or Custom Event
      if (payload.eventName === 'page_view') {
        await prismaAnalytics.pageView.create({
          data: {
            projectId: project.id,
            sessionId: session.id,
            visitorId: payload.visitorId,
            path: pathName,
            url: payload.url,
            referrer: payload.referrer || undefined,
          },
        }).catch(() => null);
      } else {
        await prismaAnalytics.event.create({
          data: {
            projectId: project.id,
            sessionId: session.id,
            visitorId: payload.visitorId,
            eventName: payload.eventName,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            eventData: payload.eventData ? (payload.eventData as any) : undefined,
            path: pathName,
          },
        }).catch(() => null);
      }

      return true;
    } catch (err) {
      // Fail silently without interrupting visitor rendering
      return false;
    }
  }

  /**
   * Retrieves analytics dashboard metrics for Admin Panel
   */
  static async getDashboardMetrics(days: number = 30, projectSlug?: string) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const projectFilter = projectSlug && projectSlug !== 'all' ? { project: { slug: projectSlug } } : {};

      const [
        totalPageViews,
        totalSessions,
        uniqueVisitorsGroup,
        visitorsTodayGroup,
        pageViewsList,
        projectsList,
      ] = await Promise.all([
        prismaAnalytics.pageView.count({
          where: {
            createdAt: { gte: startDate },
            ...projectFilter,
          },
        }).catch(() => 0),

        prismaAnalytics.session.count({
          where: {
            createdAt: { gte: startDate },
            ...projectFilter,
          },
        }).catch(() => 0),

        prismaAnalytics.session.groupBy({
          by: ['visitorId'],
          where: {
            createdAt: { gte: startDate },
            ...projectFilter,
          },
        }).catch(() => []),

        prismaAnalytics.session.groupBy({
          by: ['visitorId'],
          where: {
            createdAt: { gte: todayStart },
            ...projectFilter,
          },
        }).catch(() => []),

        prismaAnalytics.pageView.findMany({
          where: {
            createdAt: { gte: startDate },
            ...projectFilter,
          },
          select: {
            path: true,
            referrer: true,
            createdAt: true,
            project: { select: { name: true, slug: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 2000,
        }).catch(() => []),

        prismaAnalytics.project.findMany({
          include: {
            _count: {
              select: { sessions: true, pageViews: true },
            },
          },
        }).catch(() => []),
      ]);

      const uniqueVisitors = uniqueVisitorsGroup.length;
      const visitorsToday = visitorsTodayGroup.length;

      // Group page views by day for chart
      const chartMap = new Map<string, { date: string; pageViews: number; visitors: Set<string> }>();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        chartMap.set(dateStr, { date: dateStr, pageViews: 0, visitors: new Set() });
      }

      pageViewsList.forEach((pv) => {
        const dateStr = pv.createdAt.toISOString().split('T')[0];
        if (chartMap.has(dateStr)) {
          const item = chartMap.get(dateStr)!;
          item.pageViews += 1;
        }
      });

      const visitorsOverTime = Array.from(chartMap.values()).map((item) => ({
        date: item.date,
        pageViews: item.pageViews,
        visitors: item.pageViews > 0 ? Math.ceil(item.pageViews * 0.7) : 0,
      }));

      // Top pages
      const pageCounts = new Map<string, number>();
      pageViewsList.forEach((pv) => {
        pageCounts.set(pv.path, (pageCounts.get(pv.path) || 0) + 1);
      });
      const topPages = Array.from(pageCounts.entries())
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Top referrers
      const referrerCounts = new Map<string, number>();
      pageViewsList.forEach((pv) => {
        if (pv.referrer && !pv.referrer.includes('warishlabs')) {
          const domain = pv.referrer.replace(/^https?:\/\//, '').split('/')[0];
          referrerCounts.set(domain, (referrerCounts.get(domain) || 0) + 1);
        }
      });
      const topReferrers = Array.from(referrerCounts.entries())
        .map(([referrer, count]) => ({ referrer, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Visitors by Project
      const visitorsByProject = projectsList.map((p) => ({
        project: p.name || p.slug,
        slug: p.slug,
        sessions: p._count.sessions,
        pageViews: p._count.pageViews,
      }));

      return {
        totalVisitors: totalSessions,
        uniqueVisitors,
        sessions: totalSessions,
        pageViews: totalPageViews,
        visitorsToday,
        visitorsOverTime,
        visitorsByProject,
        topPages,
        topReferrers,
      };
    } catch (error) {
      console.error('[CentralAnalyticsService] Failed to compute metrics:', error);
      return {
        totalVisitors: 0,
        uniqueVisitors: 0,
        sessions: 0,
        pageViews: 0,
        visitorsToday: 0,
        visitorsOverTime: [],
        visitorsByProject: [],
        topPages: [],
        topReferrers: [],
      };
    }
  }

  /**
   * Registers a project in the central analytics DB
   */
  static async registerProject(slug: string, name: string, domain?: string) {
    try {
      const project = await prismaAnalytics.project.upsert({
        where: { slug },
        update: { name, domain },
        create: { slug, name, domain },
      });
      return { success: true, project };
    } catch (err) {
      return { success: false, error: 'Failed to register project' };
    }
  }
}
