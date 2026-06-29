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
    const blogs = await prisma.blog.findMany({
      include: { seo: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, blogs });
  } catch (error) {
    console.error('[API Admin Blog] Fetch error:', error);
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
    const { title, content, excerpt, category, published, coverImage, seo } = body;

    if (!title || !content || !excerpt || !category) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const slug = slugify(title);

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        category,
        published: published ?? false,
        publishedAt: published ? new Date() : null,
        seo: seo ? {
          create: {
            title: seo.title || title,
            description: seo.description || excerpt,
            keywords: seo.keywords || '',
          }
        } : undefined,
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'CREATE_BLOG',
        details: `Created blog article: ${title} (${slug})`,
      },
    }).catch(err => console.error('Failed to log activity:', err));

    return NextResponse.json({ success: true, blog });
  } catch (error: any) {
    console.error('[API Admin Blog] Create error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Blog slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const admin = await validateSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, title, content, excerpt, category, published, coverImage, seo } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing blog ID' }, { status: 400 });
    }

    const currentBlog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!currentBlog) {
      return NextResponse.json({ success: false, error: 'Blog not found' }, { status: 404 });
    }

    const updatedData: any = {};
    if (title) {
      updatedData.title = title;
      updatedData.slug = slugify(title);
    }
    if (content !== undefined) updatedData.content = content;
    if (excerpt !== undefined) updatedData.excerpt = excerpt;
    if (category !== undefined) updatedData.category = category;
    if (coverImage !== undefined) updatedData.coverImage = coverImage;
    if (published !== undefined) {
      updatedData.published = published;
      if (published && !currentBlog.published) {
        updatedData.publishedAt = new Date();
      } else if (!published) {
        updatedData.publishedAt = null;
      }
    }

    const blog = await prisma.blog.update({
      where: { id },
      data: updatedData,
    });

    // Update SEO
    if (seo) {
      await prisma.blogSEO.upsert({
        where: { blogId: id },
        update: {
          title: seo.title || blog.title,
          description: seo.description || blog.excerpt,
          keywords: seo.keywords || '',
        },
        create: {
          blogId: id,
          title: seo.title || blog.title,
          description: seo.description || blog.excerpt,
          keywords: seo.keywords || '',
        },
      });
    }

    // Log Activity
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'UPDATE_BLOG',
        details: `Updated blog article: ${blog.title}`,
      },
    }).catch(err => console.error('Failed to log activity:', err));

    return NextResponse.json({ success: true, blog });
  } catch (error) {
    console.error('[API Admin Blog] Update error:', error);
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
      return NextResponse.json({ success: false, error: 'Missing blog ID parameter' }, { status: 400 });
    }

    const deleted = await prisma.blog.delete({
      where: { id },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'DELETE_BLOG',
        details: `Deleted blog article: ${deleted.title}`,
      },
    }).catch(err => console.error('Failed to log activity:', err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Admin Blog] Delete error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
