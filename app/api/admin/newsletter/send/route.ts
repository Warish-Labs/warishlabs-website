import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { EmailService } from '@/services/EmailService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const admin = await validateSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { subject, htmlContent } = body;

    if (!subject || !htmlContent) {
      return NextResponse.json({ success: false, error: 'Missing subject or email htmlContent' }, { status: 400 });
    }

    // 1. Fetch active subscribers
    const activeSubscribers = await prisma.newsletterSubscriber.findMany({
      where: { active: true },
      select: { email: true },
    });

    if (activeSubscribers.length === 0) {
      return NextResponse.json({ success: false, error: 'No active subscribers found' }, { status: 400 });
    }

    const emailList = activeSubscribers.map((s) => s.email);

    // 2. Dispatch broadcast campaign
    const result = await EmailService.sendBroadcastCampaign(emailList, subject, htmlContent);

    // 3. Log Activity
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'SEND_NEWSLETTER_BROADCAST',
        details: `Sent newsletter broadcast "${subject}" to ${result.successCount} subscribers (failed: ${result.failureCount})`,
      },
    }).catch(err => console.error('Failed to log broadcast activity:', err));

    return NextResponse.json({
      success: true,
      message: `Mailing campaign complete. Successfully sent: ${result.successCount}, Failed: ${result.failureCount}`,
      ...result,
    });
  } catch (error: any) {
    console.error('[API Admin Newsletter Send] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
