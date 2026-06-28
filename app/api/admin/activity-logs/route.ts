import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await validateSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: { name: true, email: true },
        },
      },
    });
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error('[API Admin Activity Logs] Fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
