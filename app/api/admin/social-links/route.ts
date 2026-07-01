import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// --- Helpers ---

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function sanitizePlatform(platform: string): string {
  return platform.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
}

// GET /api/admin/social-links — Return all social links (admin view, includes hidden)
export async function GET() {
  const admin = await validateSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const links = await prisma.socialLink.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, links });
  } catch (error) {
    console.error('[API Admin SocialLinks] GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/admin/social-links — Upsert a social link by platform
export async function POST(request: Request) {
  const admin = await validateSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 422 });
  }

  const { platform, url, isVisible, sortOrder } = body as Record<string, unknown>;

  // Validate platform
  if (!platform || typeof platform !== 'string' || platform.trim() === '') {
    return NextResponse.json({ success: false, error: 'Platform name is required' }, { status: 422 });
  }

  const sanitized = sanitizePlatform(platform as string);
  if (sanitized === '') {
    return NextResponse.json({ success: false, error: 'Platform name contains invalid characters' }, { status: 422 });
  }

  // Validate URL if provided
  if (url !== undefined && url !== null && url !== '') {
    if (typeof url !== 'string' || !isValidUrl(url)) {
      return NextResponse.json({ success: false, error: 'URL must be a valid http/https URL' }, { status: 422 });
    }
  }

  // Validate sortOrder if provided
  if (sortOrder !== undefined && (typeof sortOrder !== 'number' || !Number.isInteger(sortOrder) || sortOrder < 0)) {
    return NextResponse.json({ success: false, error: 'sortOrder must be a non-negative integer' }, { status: 422 });
  }

  try {
    const link = await prisma.socialLink.upsert({
      where: { platform: sanitized },
      update: {
        url: url ? (url as string).trim() : null,
        isVisible: typeof isVisible === 'boolean' ? isVisible : true,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      },
      create: {
        platform: sanitized,
        url: url ? (url as string).trim() : null,
        isVisible: typeof isVisible === 'boolean' ? isVisible : true,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      },
    });

    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'UPSERT_SOCIAL_LINK',
        details: `Upserted social link: ${sanitized}`,
      },
    });

    return NextResponse.json({ success: true, link });
  } catch (error) {
    console.error('[API Admin SocialLinks] POST error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/admin/social-links?platform=<platform> — Remove a social link
export async function DELETE(request: Request) {
  const admin = await validateSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform');

  if (!platform || platform.trim() === '') {
    return NextResponse.json({ success: false, error: 'Platform query parameter is required' }, { status: 422 });
  }

  const sanitized = sanitizePlatform(platform);

  try {
    const existing = await prisma.socialLink.findUnique({ where: { platform: sanitized } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Social link not found' }, { status: 404 });
    }

    await prisma.socialLink.delete({ where: { platform: sanitized } });

    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'DELETE_SOCIAL_LINK',
        details: `Deleted social link: ${sanitized}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Admin SocialLinks] DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
