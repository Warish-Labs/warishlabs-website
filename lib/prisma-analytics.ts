import { PrismaClient as AnalyticsPrismaClient } from '@prisma/analytics-client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForAnalytics = globalThis as unknown as {
  prismaAnalytics: AnalyticsPrismaClient | undefined;
  analyticsPool: pg.Pool | undefined;
};

const analyticsDbUrl = process.env.ANALYTICS_DATABASE_URL || process.env.DATABASE_URL;

const analyticsPool =
  globalForAnalytics.analyticsPool ??
  new pg.Pool({
    connectionString: analyticsDbUrl,
    max: 10,
    idleTimeoutMillis: 30000,
    ssl:
      process.env.NODE_ENV === 'production' &&
      (analyticsDbUrl?.includes('sslmode=') ||
        analyticsDbUrl?.includes('neon.tech') ||
        process.env.VERCEL === '1')
        ? { rejectUnauthorized: true }
        : false,
  });

if (process.env.NODE_ENV !== 'production') globalForAnalytics.analyticsPool = analyticsPool;

const adapter = new PrismaPg(analyticsPool);

export const prismaAnalytics =
  globalForAnalytics.prismaAnalytics ??
  new AnalyticsPrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForAnalytics.prismaAnalytics = prismaAnalytics;
export default prismaAnalytics;
