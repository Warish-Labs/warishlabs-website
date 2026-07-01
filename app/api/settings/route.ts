import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Load only visible social links with non-empty URLs, ordered by sortOrder
    const links = await prisma.socialLink.findMany({
      where: {
        isVisible: true,
        url: { not: null },
      },
      orderBy: { sortOrder: 'asc' },
      select: {
        platform: true,
        url: true,
      },
    });

    // Filter out any rows where url is empty string
    const visibleLinks = links.filter((l) => l.url && l.url.trim() !== '');

    return NextResponse.json({ success: true, links: visibleLinks });
  } catch (error) {
    console.error('[API Settings] Failed to load social links:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

