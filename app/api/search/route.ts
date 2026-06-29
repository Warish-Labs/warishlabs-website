import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    if (!q.trim()) {
      return NextResponse.json({
        success: true,
        products: [],
        categories: [],
        labs: [],
        blogs: [],
      });
    }

    const query = q.trim();

    // Query databases in parallel
    const [products, categories, labs, blogs] = await Promise.all([
      // 1. Products search
      prisma.product.findMany({
        where: {
          status: 'active',
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { tagline: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          tagline: true,
        },
        take: 5,
      }).catch(() => []),

      // 2. Categories search
      prisma.category.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' }
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        take: 5,
      }).catch(() => []),

      // 3. Labs search
      prisma.lab.findMany({
        where: {
          status: 'active',
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        take: 5,
      }).catch(() => []),

      // 4. Blogs search
      prisma.blog.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
        },
        take: 5,
      }).catch(() => []),
    ]);

    return NextResponse.json({
      success: true,
      products,
      categories,
      labs,
      blogs,
    });
  } catch (error) {
    console.error('[API Search] Search handler failed:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
