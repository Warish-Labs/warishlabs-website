import { Resend } from 'resend';

const alertCache = new Map<string, number>();

export class AlertService {
  /**
   * Dispatches a runtime service failure alert to engineering contacts via Resend.
   * Rate limited to 1 alert per service/action pair per 15 minutes.
   */
  static async sendRuntimeAlert(
    service: 'Cloudinary' | 'Resend' | 'Clerk' | 'Database',
    action: string,
    error: unknown
  ): Promise<void> {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const key = `${service}:${action}`;
    const now = Date.now();
    const lastAlert = alertCache.get(key) || 0;

    // Rate-limit: 15 minutes de-duplication per failure type
    if (now - lastAlert < 15 * 60 * 1000) {
      return;
    }
    alertCache.set(key, now);

    const timestamp = new Date().toISOString();
    const alertText = `[WARISHLABS RUNTIME ALERT]\nService: ${service}\nAction/Route: ${action}\nTimestamp: ${timestamp}\nError: ${errorMsg}`;

    console.error(`[AlertService] 🚨 ${service} Failure in ${action}:`, errorMsg);

    // If Resend failed, fallback to console/Sentry log, do not loop Resend
    if (service === 'Resend') {
      return;
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) return;

    try {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: 'WarishLabs System <noreply@warishlabs.in>',
        to: ['warishdeveloper@gmail.com', 'warishlabs@gmail.com'],
        subject: `🚨 [Alert] ${service} Failure on ${action}`,
        text: alertText,
      });
    } catch (err) {
      console.error('[AlertService] Failed to send runtime failure alert email:', err);
    }
  }
}
