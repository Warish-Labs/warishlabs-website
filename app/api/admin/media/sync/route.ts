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
    // 1. Sync Folders
    const cloudinaryFolders = await MediaService.walkAllFolders();
    const cloudinaryPaths = new Set(cloudinaryFolders.map((f) => f.path));

    const localFolders = await prisma.mediaFolder.findMany();
    const localPaths = new Set(localFolders.map((f) => f.path));

    const added: string[] = [];
    const removed: string[] = [];
    let unchanged = 0;

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

    for (const local of localFolders) {
      if (!cloudinaryPaths.has(local.path)) {
        await prisma.mediaFolder.delete({ where: { id: local.id } });
        removed.push(local.path);
      }
    }

    // 2. Orphan Check: Scan DB for referenced media URLs
    const [products, productMedia, blogs, labs] = await Promise.all([
      prisma.product.findMany({ select: { logoUrl: true, bannerUrl: true } }),
      prisma.productMedia.findMany({ select: { url: true } }),
      prisma.blog.findMany({ select: { coverImage: true } }),
      prisma.lab.findMany({ select: { mediaUrl: true } }),
    ]);

    const activeUrls = new Set<string>();
    
    // Helper to extract and normalize URLs
    const addUrl = (url: string | null) => {
      if (url) {
        activeUrls.add(url.trim());
        const publicId = MediaService.getPublicIdFromUrl(url);
        if (publicId) activeUrls.add(publicId);
      }
    };

    products.forEach(p => {
      addUrl(p.logoUrl);
      addUrl(p.bannerUrl);
    });
    productMedia.forEach(m => addUrl(m.url));
    blogs.forEach(b => addUrl(b.coverImage));
    labs.forEach(l => addUrl(l.mediaUrl));

    // 3. Retrieve all assets across synced folders
    const allAssets = await MediaService.listAllAssets();
    
    const orphans = allAssets.filter(asset => {
      const isReferencedByUrl = activeUrls.has(asset.url);
      const isReferencedByPublicId = activeUrls.has(asset.publicId);
      return !isReferencedByUrl && !isReferencedByPublicId;
    }).map(asset => ({
      publicId: asset.publicId,
      url: asset.url,
      fileName: asset.fileName,
      bytes: asset.bytes,
      createdAt: asset.createdAt,
    }));

    // Log activity if folder structure changed
    if (added.length > 0 || removed.length > 0) {
      await prisma.activityLog.create({
        data: {
          adminId: admin.id,
          action: 'SYNC_MEDIA_FOLDERS',
          details: `Folder sync: +${added.length} added, -${removed.length} removed. Found ${orphans.length} orphan assets.`,
        },
      }).catch(err => console.error('Failed to log sync activity:', err));
    }

    return NextResponse.json({
      success: true,
      added,
      removed,
      unchanged,
      orphans,
      message: `Synced: ${added.length} folder${added.length !== 1 ? 's' : ''} added, ${removed.length} removed. Scan completed: resolved ${orphans.length} orphan asset${orphans.length !== 1 ? 's' : ''} occupying storage.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[API Admin Media Sync] Error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
