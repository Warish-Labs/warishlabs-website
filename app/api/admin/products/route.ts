import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { ProductService } from '@/services/ProductService';
import prisma from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const productInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  tagline: z.string().min(1, 'Tagline is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.string().min(1, 'Status is required'),
  type: z.string().optional().default('Tool'),
  githubUrl: z.string().nullable().optional(),
  visitUrl: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  bannerUrl: z.string().nullable().optional(),
  featured: z.boolean().optional().default(false),
  showOnHomepage: z.boolean().optional().default(false),
  displayOrder: z.number().int().optional().default(0),
  categoryId: z.string().min(1, 'Category is required'),
  media: z.array(z.object({
    url: z.string(),
    type: z.string(),
    alt: z.string().optional(),
    sortOrder: z.number().optional()
  })).optional(),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string(),
    sortOrder: z.number().optional()
  })).optional(),
  seo: z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.string().optional()
  }).nullable().optional()
});

const productUpdateSchema = productInputSchema.partial().extend({
  id: z.string().min(1, 'Product ID is required')
});

export async function GET(request: Request) {
  const admin = await validateSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '15');
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          media: {
            orderBy: { sortOrder: 'asc' },
          },
          faqs: {
            orderBy: { sortOrder: 'asc' },
          },
          seo: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      }
    });
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
    
    // Validate request body
    const validation = productInputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, ...restData } = validation.data;

    // Auto-generate slug
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const product = await ProductService.create({
      name,
      slug,
      ...restData,
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
    
    // Validate request body
    const validation = productUpdateSchema.safeParse(body);
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

    const product = await ProductService.update(id, updatedFields);

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
