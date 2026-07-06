import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { MediaService } from '@/services/MediaService';

export const dynamic = 'force-dynamic';

export async function POST() {
  const admin = await validateSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Recursively walk ALL Cloudinary folders
    const cloudinaryFolders = await MediaService.walkAllFolders();
    const cloudinaryPaths = new Set(cloudinaryFolders.map((f) => f.path));

    // 2. Fetch all locally-stored folder records
    const localFolders = await prisma.mediaFolder.findMany();
    const localPaths = new Set(localFolders.map((f) => f.path));

    const added: string[] = [];
    const removed: string[] = [];
    let unchanged = 0;

    // 3. Insert folders found in Cloudinary but missing from DB
    for (const folder of cloudinaryFolders) {
      if (!localPaths.has(folder.path)) {
        await prisma.mediaFolder.create({
          data: {
            path: folder.path,
            name: folder.name,
          },
        });
        added.push(folder.path);
      } else {
        unchanged++;
      }
    }

    // 4. Remove DB folders that no longer exist in Cloudinary
    for (const local of localFolders) {
      if (!cloudinaryPaths.has(local.path)) {
        await prisma.mediaFolder.delete({ where: { id: local.id } });
        removed.push(local.path);
      }
    }

    // 5. Log activity (only if something changed)
    if (added.length > 0 || removed.length > 0) {
      await prisma.activityLog
        .create({
          data: {
            adminId: admin.id,
            action: 'SYNC_MEDIA_FOLDERS',
            details: `Folder sync: +${added.length} added, -${removed.length} removed, ${unchanged} unchanged.`,
          },
        })
        .catch((err) => console.error('Failed to log sync activity:', err));
    }

    return NextResponse.json({
      success: true,
      added,
      removed,
      unchanged,
      message: `Synced: ${added.length} folder${added.length !== 1 ? 's' : ''} added, ${removed.length} removed, ${unchanged} unchanged.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[API Admin Media Sync] Error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
