import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [productsCount, visitorsCount, labsCount] = await Promise.all([
      prisma.product.count({
        where: { status: 'active' },
      }).catch(() => 0),
      prisma.visitor.count().catch(() => 0),
      prisma.lab.count().catch(() => 0),
    ]);

    return NextResponse.json({
      success: true,
      products: productsCount,
      visitors: visitorsCount,
      labs: labsCount,
    });
  } catch (error) {
    console.error('[API Stats] Fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
