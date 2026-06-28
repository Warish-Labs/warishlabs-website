import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { MediaService } from '@/services/MediaService';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await validateSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const assets = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, assets });
  } catch (error) {
    console.error('[API Admin Media] Fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = await validateSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing asset ID parameter' }, { status: 400 });
    }

    const asset = await prisma.mediaAsset.findUnique({
      where: { id },
    });

    if (!asset) {
      return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 });
    }

    // Delete from Cloudinary
    await MediaService.deleteAsset(asset.publicId);

    // Delete from DB
    await prisma.mediaAsset.delete({
      where: { id },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'DELETE_MEDIA',
        details: `Deleted media file: ${asset.fileName} (${asset.publicId})`,
      },
    }).catch(err => console.error('Failed to log activity:', err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Admin Media] Delete error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
