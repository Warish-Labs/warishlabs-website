import { NextResponse } from 'next/server';
import { ContactService } from '@/services/ContactService';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  subject: z.string().optional(),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = contactSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = validation.data;
    const success = await ContactService.submitMessage({ name, email, subject, message });

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to process message' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Message submitted successfully' });
  } catch (error) {
    console.error('[API Contact] Error handling post request:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
