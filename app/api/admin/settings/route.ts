import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const admin = await validateSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sections = await prisma.homepageSection.findMany({
      where: {
        sectionType: {
          in: ['hero', 'about', 'contact'],
        },
      },
    });

    // Map list to a keyed dictionary for easier frontend binding
    const configMap = sections.reduce((acc, curr) => {
      acc[curr.sectionType] = {
        id: curr.id,
        title: curr.title || '',
        subtitle: curr.subtitle || '',
        active: curr.active,
        config: curr.config,
      };
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({ success: true, settings: configMap });
  } catch (error) {
    console.error('[API Admin Settings] Fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await validateSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sectionType, title, subtitle, active, config } = body;

    if (!sectionType || !['hero', 'about', 'contact'].includes(sectionType)) {
      return NextResponse.json({ success: false, error: 'Invalid sectionType' }, { status: 400 });
    }

    const section = await prisma.homepageSection.upsert({
      where: { sectionType },
      update: {
        title,
        subtitle,
        active: active ?? true,
        config: config || {},
      },
      create: {
        sectionType,
        title,
        subtitle,
        active: active ?? true,
        config: config || {},
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'UPDATE_CMS_SETTINGS',
        details: `Updated CMS section settings: ${sectionType}`,
      },
    });

    return NextResponse.json({ success: true, section });
  } catch (error: any) {
    console.error('[API Admin Settings] Update error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
