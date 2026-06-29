import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const socialSection = await prisma.homepageSection.findUnique({
      where: { sectionType: 'social' },
    }).catch(() => null);

    const config = (socialSection?.config as any) || {};

    return NextResponse.json({
      success: true,
      social: {
        githubUrl: config.githubUrl || 'https://github.com/warishlabs',
        twitterUrl: config.twitterUrl || 'https://twitter.com/warishlabs',
        linkedinUrl: config.linkedinUrl || 'https://linkedin.com/company/warishlabs',
        youtubeUrl: config.youtubeUrl || 'https://youtube.com/@warishlabs',
      }
    });
  } catch (error) {
    console.error('[API Settings] Failed to load settings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
