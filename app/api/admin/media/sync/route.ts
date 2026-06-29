import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary only if credentials are set
const isConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export const dynamic = 'force-dynamic';

export async function POST() {
  const admin = await validateSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!isConfigured) {
    return NextResponse.json({
      success: false,
      error: 'Cloudinary is not configured. Sync unavailable in mock environment.',
    });
  }

  try {
    // 1. Fetch remote resources under the prefix 'warishlabs/'
    let remoteResources: any[] = [];
    let nextCursor: string | undefined = undefined;

    do {
      const response: any = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'warishlabs/',
        max_results: 100,
        next_cursor: nextCursor,
      });

      if (response.resources) {
        remoteResources = [...remoteResources, ...response.resources];
      }
      nextCursor = response.next_cursor;
    } while (nextCursor);

    // 2. Fetch all local assets
    const localAssets = await prisma.mediaAsset.findMany();
    const localPublicIds = new Set(localAssets.map((a) => a.publicId));
    const remotePublicIds = new Set(remoteResources.map((r) => r.public_id));

    let createdCount = 0;
    let deletedCount = 0;

    // 3. Insert remote assets that are missing locally
    for (const remote of remoteResources) {
      if (!localPublicIds.has(remote.public_id)) {
        const fileName = remote.public_id.split('/').pop() || remote.public_id;
        const mimeType = `${remote.resource_type}/${remote.format || 'bin'}`;
        
        await prisma.mediaAsset.create({
          data: {
            publicId: remote.public_id,
            url: remote.secure_url,
            fileName,
            fileSize: remote.bytes || 0,
            mimeType,
            createdAt: new Date(remote.created_at),
          },
        });
        createdCount++;
      }
    }

    // 4. Delete local assets that no longer exist in Cloudinary
    for (const local of localAssets) {
      if (!remotePublicIds.has(local.publicId)) {
        await prisma.mediaAsset.delete({
          where: { id: local.id },
        });
        deletedCount++;
      }
    }

    // 5. Log Activity
    if (createdCount > 0 || deletedCount > 0) {
      await prisma.activityLog.create({
        data: {
          adminId: admin.id,
          action: 'SYNC_MEDIA',
          details: `Synchronized Media Library. Imported ${createdCount} missing, pruned ${deletedCount} deleted items.`,
        },
      }).catch(err => console.error('Failed to log sync activity:', err));
    }

    return NextResponse.json({
      success: true,
      message: `Library sync completed. Imported ${createdCount} assets and removed ${deletedCount} stale references.`,
      createdCount,
      deletedCount,
    });
  } catch (error: any) {
    console.error('[API Admin Media Sync] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
