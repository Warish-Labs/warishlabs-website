import { NextResponse } from 'next/server';
import { NewsletterService } from '@/services/NewsletterService';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  turnstileToken: z.string().min(1, { message: 'Security verification is required' }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = subscribeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, turnstileToken } = validation.data;

    // Verify Cloudflare Turnstile token
    const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || undefined;
    const isValidToken = await verifyTurnstileToken(turnstileToken, ip);
    if (!isValidToken) {
      return NextResponse.json(
        { success: false, error: 'Security verification failed. Please try again.' },
        { status: 400 }
      );
    }

    const result = await NewsletterService.subscribe(email);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error('[API Newsletter Subscribe] Error handling post request:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
