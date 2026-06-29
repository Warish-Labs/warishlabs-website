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
    const { id, replyText } = body;

    if (!id || !replyText) {
      return NextResponse.json({ success: false, error: 'Missing message ID or reply content' }, { status: 400 });
    }

    // 1. Fetch original message
    const msg = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!msg) {
      return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
    }

    // 2. Send email via Resend
    const emailSent = await EmailService.sendMessageReply(msg.email, msg.subject || '', msg.message, replyText);

    if (!emailSent) {
      return NextResponse.json({ success: false, error: 'Failed to send reply email' }, { status: 500 });
    }

    // 3. Mark message status as read in DB
    await prisma.contactMessage.update({
      where: { id },
      data: { status: 'read' },
    });

    // 4. Log Activity
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'REPLY_MESSAGE',
        details: `Replied to message from ${msg.name} (${msg.email})`,
      },
    }).catch(err => console.error('Failed to log reply activity:', err));

    return NextResponse.json({ success: true, message: 'Reply email sent successfully' });
  } catch (error) {
    console.error('[API Admin Messages Reply] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
