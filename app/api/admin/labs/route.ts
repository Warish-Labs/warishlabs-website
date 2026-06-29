import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import { z } from 'zod';

const labInputSchema = z.object({
  name: z.string().min(1, 'Name/Title is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.string().min(1, 'Status is required'),
  type: z.string().optional().default('experiment'),
  url: z.string().nullable().optional(),       // liveUrl
  githubUrl: z.string().nullable().optional(), // repoUrl
  demoUrl: z.string().nullable().optional(),
  mediaUrl: z.string().nullable().optional(),   // Cloudinary screenshot
  techStack: z.string().nullable().optional(),  // comma-separated tags
});

const labUpdateSchema = labInputSchema.partial().extend({
  id: z.string().min(1, 'Lab ID is required'),
});

export async function GET() {
  const admin = await validateSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const labs = await prisma.lab.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, labs });
  } catch (error) {
    console.error('[API Admin Labs] Fetch error:', error);
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
    
    // Validate schema
    const validation = labInputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, ...restData } = validation.data;
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const lab = await prisma.lab.create({
      data: {
        name,
        slug,
        ...restData,
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'CREATE_LAB',
        details: `Created lab: ${name} (${slug})`,
      },
    });

    return NextResponse.json({ success: true, lab });
  } catch (error: any) {
    console.error('[API Admin Labs] Create error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const admin = await validateSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate schema
    const validation = labUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { id, ...updatedFields } = validation.data;

    if (updatedFields.name) {
      (updatedFields as any).slug = updatedFields.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const lab = await prisma.lab.update({
      where: { id },
      data: updatedFields,
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'UPDATE_LAB',
        details: `Updated lab id: ${id}`,
      },
    });

    return NextResponse.json({ success: true, lab });
  } catch (error: any) {
    console.error('[API Admin Labs] Update error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
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
      return NextResponse.json({ success: false, error: 'Missing lab ID parameter' }, { status: 400 });
    }

    await prisma.lab.delete({
      where: { id },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'DELETE_LAB',
        details: `Deleted lab id: ${id}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API Admin Labs] Delete error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
