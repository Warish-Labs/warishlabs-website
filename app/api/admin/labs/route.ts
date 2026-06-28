import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
    const { name, description, status, url } = body;

    if (!name || !description || !status) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const lab = await prisma.lab.create({
      data: {
        name,
        slug,
        description,
        status,
        url,
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
    const { id, name, description, status, url } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing lab ID' }, { status: 400 });
    }

    const updatedData: any = {};
    if (name) {
      updatedData.name = name;
      updatedData.slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (description !== undefined) updatedData.description = description;
    if (status !== undefined) updatedData.status = status;
    if (url !== undefined) updatedData.url = url;

    const lab = await prisma.lab.update({
      where: { id },
      data: updatedData,
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
