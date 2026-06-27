import { NextResponse } from 'next/server';
import { NewsletterService } from '@/services/NewsletterService';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
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

    const { email } = validation.data;
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
