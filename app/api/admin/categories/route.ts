import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { slugify } from '@/utils/slugify';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await validateSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('[API Categories] Fetch error:', error);
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
    const { name, description, seo } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const slug = slugify(name);

    // Create Category with SEO (if provided)
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        seo: seo ? {
          create: {
            title: seo.title || name,
            description: seo.description || description || '',
            keywords: seo.keywords || '',
          }
        } : undefined,
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'CREATE_CATEGORY',
        details: `Created category: ${name} (${slug})`,
      },
    }).catch(err => console.error('Failed to log activity:', err));

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error('[API Categories] Create error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Category slug already exists' }, { status: 400 });
    }
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
      return NextResponse.json({ success: false, error: 'ID parameter is required' }, { status: 400 });
    }

    // Check if category has products
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete category that contains products. Reassign or delete the products first.',
      }, { status: 400 });
    }

    const deleted = await prisma.category.delete({
      where: { id },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'DELETE_CATEGORY',
        details: `Deleted category: ${deleted.name} (${deleted.slug})`,
      },
    }).catch(err => console.error('Failed to log activity:', err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Categories] Delete error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
