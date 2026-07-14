import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ success: false, error: 'Slug is required' }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // Update clickCount in database
    await prisma.product.update({
      where: { id: product.id },
      data: { clickCount: { increment: 1 } }
    });

    // Track analytics event
    const cookieStore = await cookies();
    const visitorId = cookieStore.get('wl_visitor')?.value;
    if (visitorId) {
      await prisma.analyticsEvent.create({
        data: {
          visitorId,
          eventName: 'product_launch',
          eventData: { slug },
          url: `/products/${slug}`,
        },
      }).catch(err => console.error('Failed to log product click analytics event:', err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Product Click Tracker] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
