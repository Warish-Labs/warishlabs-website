import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { MediaService } from '@/services/MediaService';

export async function POST(request: Request) {
  const admin = await validateSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary / Mock
    const uploadResult = await MediaService.uploadAsset(
      buffer,
      file.name,
      file.type,
      folder as any
    );

    if (!uploadResult) {
      return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
    }

    // Save media asset info in local DB
    const asset = await prisma.mediaAsset.create({
      data: {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'UPLOAD_MEDIA',
        details: `Uploaded media: ${file.name} to warishlabs/${folder}`,
      },
    }).catch(err => console.error('Failed to log activity:', err));

    return NextResponse.json({ success: true, asset });
  } catch (error) {
    console.error('[API Admin Media Upload] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
