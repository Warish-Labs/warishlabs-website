import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

const BOT_USER_AGENTS = [
  'googlebot', 'bingbot', 'yandexbot', 'ahrefsbot', 'semrushbot', 'baiduspider',
  'twitterbot', 'facebookexternalhit', 'rogerbot', 'linkedinbot', 'embedly',
  'quora link preview', 'showyoubot', 'outbrain', 'pinterest', 'slackbot',
  'vkshare', 'w3c_validator', 'redditbot', 'applebot', 'ia_archiver'
];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ success: false, error: 'Slug is required' }, { status: 400 });
  }

  // 1. Bot filtering
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  const isBot = BOT_USER_AGENTS.some(bot => userAgent.includes(bot));
  if (isBot) {
    return NextResponse.json({ success: true, message: 'Bot traffic ignored' });
  }

  // 2. Cookie dedupe (15 minutes)
  const cookieStore = await cookies();
  const cookieName = `wl_pv_${slug}`;
  if (cookieStore.has(cookieName)) {
    return NextResponse.json({ success: true, message: 'View already tracked' });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // Update viewCount in database
    await prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } }
    });

    // Track analytics event
    const visitorId = cookieStore.get('wl_visitor')?.value;
    if (visitorId) {
      await prisma.analyticsEvent.create({
        data: {
          visitorId,
          eventName: 'product_view',
          eventData: { slug },
          url: `/products/${slug}`,
        },
      }).catch(err => console.error('Failed to log product view analytics event:', err));
    }

    // Set dedupe cookie
    cookieStore.set(cookieName, '1', {
      maxAge: 15 * 60, // 15 minutes
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Product View Tracker] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
