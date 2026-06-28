import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { ProductService } from '@/services/ProductService';
import prisma from '@/lib/prisma';

export async function GET() {
  const admin = await validateSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const products = await ProductService.getAll(false); // Get all including beta/archived
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('[API Admin Products] Fetch error:', error);
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
    const { name, tagline, description, status, visitUrl, logoUrl, categoryId } = body;

    if (!name || !tagline || !description || !status || !categoryId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Auto-generate slug
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const product = await ProductService.create({
      name,
      slug,
      tagline,
      description,
      status,
      visitUrl,
      logoUrl,
      categoryId,
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'CREATE_PRODUCT',
        details: `Created product: ${name} (${slug})`,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('[API Admin Products] Create error:', error);
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
    const { id, name, tagline, description, status, visitUrl, logoUrl, categoryId } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing product ID' }, { status: 400 });
    }

    const updatedData: any = {};
    if (name) {
      updatedData.name = name;
      updatedData.slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (tagline !== undefined) updatedData.tagline = tagline;
    if (description !== undefined) updatedData.description = description;
    if (status !== undefined) updatedData.status = status;
    if (visitUrl !== undefined) updatedData.visitUrl = visitUrl;
    if (logoUrl !== undefined) updatedData.logoUrl = logoUrl;
    if (categoryId !== undefined) updatedData.categoryId = categoryId;

    const product = await ProductService.update(id, updatedData);

    // Log Activity
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'UPDATE_PRODUCT',
        details: `Updated product id: ${id}`,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('[API Admin Products] Update error:', error);
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
      return NextResponse.json({ success: false, error: 'Missing product ID parameter' }, { status: 400 });
    }

    const success = await ProductService.delete(id);

    if (success) {
      // Log Activity
      await prisma.activityLog.create({
        data: {
          adminId: admin.id,
          action: 'DELETE_PRODUCT',
          details: `Deleted product id: ${id}`,
        },
      });
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[API Admin Products] Delete error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
