/**
 * Server-side verification helper for Cloudflare Turnstile CAPTCHA.
 * Validates the verification token sent by the client.
 */
export async function verifyTurnstileToken(token: string, ip?: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.error('[Turnstile] TURNSTILE_SECRET_KEY is not configured in env.');
    // Fail-safe in development so the site remains testable if keys are not present in some development setups
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Turnstile] Bypassing Turnstile verification in development.');
      return true;
    }
    return false;
  }

  if (!token) {
    console.warn('[Turnstile] Missing verification token.');
    return false;
  }

  try {
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (ip) {
      formData.append('remoteip', ip);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    return !!result.success;
  } catch (error) {
    console.error('[Turnstile] siteverify API request failed:', error);
    return false;
  }
}
