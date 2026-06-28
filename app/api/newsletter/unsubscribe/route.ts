import { NextResponse } from 'next/server';
import { NewsletterService } from '@/services/NewsletterService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return new Response(
        `<html>
          <head>
            <title>Invalid Request</title>
            <style>
              body { background: #000; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { border: 1px solid #1F1F1F; padding: 30px; border-radius: 8px; text-align: center; max-width: 400px; background: #0A0A0A; }
              h1 { color: #EF4444; margin-top: 0; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Invalid Unsubscribe Link</h1>
              <p>The link you followed is invalid or has expired.</p>
              <a href="/" style="color: #2563EB; text-decoration: none;">Return to WarishLabs</a>
            </div>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    const success = await NewsletterService.unsubscribe(token);

    if (!success) {
      return new Response(
        `<html>
          <head>
            <title>Unsubscribe Failed</title>
            <style>
              body { background: #000; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { border: 1px solid #1F1F1F; padding: 30px; border-radius: 8px; text-align: center; max-width: 400px; background: #0A0A0A; }
              h1 { color: #EF4444; margin-top: 0; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Unsubscribe Failed</h1>
              <p>We could not find an active subscription matching this token.</p>
              <a href="/" style="color: #2563EB; text-decoration: none;">Return to WarishLabs</a>
            </div>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    return new Response(
      `<html>
        <head>
          <title>Unsubscribed</title>
          <style>
            body { background: #000; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { border: 1px solid #1F1F1F; padding: 30px; border-radius: 8px; text-align: center; max-width: 400px; background: #0A0A0A; }
            h1 { color: #2563EB; margin-top: 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Unsubscribed Successfully</h1>
            <p>You have been unsubscribed from the WarishLabs newsletter. We won't send you any more emails.</p>
            <a href="/" style="color: #2563EB; text-decoration: none;">Return to WarishLabs</a>
          </div>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error) {
    console.error('[API Newsletter Unsubscribe] Error handling request:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
