import { NextResponse } from 'next/server';
import { CentralAnalyticsService } from '@/services/CentralAnalyticsService';
import { validateSession } from '@/lib/auth';
import prismaAnalytics from '@/lib/prisma-analytics';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  domain: z.string().optional(),
});

export async function GET() {
  const admin = await validateSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const projects = await prismaAnalytics.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { sessions: true, pageViews: true },
        },
      },
    }).catch(() => []);

    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error('[API Admin Analytics Projects GET] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await validateSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const validation = createProjectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, slug, domain } = validation.data;
    const result = await CentralAnalyticsService.registerProject(slug, name, domain);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to create project' }, { status: 400 });
    }

    return NextResponse.json({ success: true, project: result.project });
  } catch (error) {
    console.error('[API Admin Analytics Projects POST] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
