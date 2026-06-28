import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateSession } from '@/lib/auth';

export async function GET() {
  const admin = await validateSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, faqs });
  } catch (error) {
    console.error('[API Admin FAQs] Fetch error:', error);
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
    const { question, answer, sortOrder, active } = body;

    if (!question || !answer) {
      return NextResponse.json({ success: false, error: 'Question and answer are required' }, { status: 400 });
    }

    const faq = await prisma.fAQ.create({
      data: {
        question,
        answer,
        sortOrder: sortOrder ?? 0,
        active: active ?? true,
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'CREATE_FAQ',
        details: `Created FAQ: ${question.substring(0, 50)}...`,
      },
    }).catch(err => console.error('Failed to log activity:', err));

    return NextResponse.json({ success: true, faq });
  } catch (error) {
    console.error('[API Admin FAQs] Create error:', error);
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
    const { id, question, answer, sortOrder, active } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing FAQ ID' }, { status: 400 });
    }

    const updatedData: any = {};
    if (question !== undefined) updatedData.question = question;
    if (answer !== undefined) updatedData.answer = answer;
    if (sortOrder !== undefined) updatedData.sortOrder = sortOrder;
    if (active !== undefined) updatedData.active = active;

    const faq = await prisma.fAQ.update({
      where: { id },
      data: updatedData,
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'UPDATE_FAQ',
        details: `Updated FAQ: ${faq.question.substring(0, 50)}...`,
      },
    }).catch(err => console.error('Failed to log activity:', err));

    return NextResponse.json({ success: true, faq });
  } catch (error) {
    console.error('[API Admin FAQs] Update error:', error);
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
      return NextResponse.json({ success: false, error: 'Missing ID parameter' }, { status: 400 });
    }

    const deleted = await prisma.fAQ.delete({
      where: { id },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'DELETE_FAQ',
        details: `Deleted FAQ: ${deleted.question.substring(0, 50)}...`,
      },
    }).catch(err => console.error('Failed to log activity:', err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Admin FAQs] Delete error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
