import { Resend } from 'resend';

// Initialize Resend with safety check
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = 'WarishLabs <noreply@warishlabs.com>';

export class EmailService {
  /**
   * Sends an email notification to the site administrator when a contact form is submitted
   */
  static async sendContactEmail(name: string, email: string, subject: string, message: string): Promise<boolean> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@warishlabs.com';
    const emailSubject = `[Contact Form] ${subject || 'New Message from ' + name}`;
    
    const htmlContent = `
      <h2>New Message from Contact Form</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="background: #f4f4f4; padding: 15px; border-left: 5px solid #2563EB;">
        ${message.replace(/\n/g, '<br/>')}
      </blockquote>
    `;

    console.log(`[EmailService] Attempting to send contact form notification to ${adminEmail}`);

    if (!resend) {
      console.warn('[EmailService] RESEND_API_KEY is not defined. Simulating email send (Console Log fallback).');
      console.log('--- EMAIL SIMULATION START ---');
      console.log(`To: ${adminEmail}\nFrom: ${fromEmail}\nSubject: ${emailSubject}\nBody:\n${htmlContent}`);
      console.log('--- EMAIL SIMULATION END ---');
      return true;
    }

    try {
      const data = await resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: emailSubject,
        html: htmlContent,
      });

      return !!data.data?.id;
    } catch (error) {
      console.error('[EmailService] Failed to send contact email:', error);
      return false;
    }
  }

  /**
   * Sends a welcome email to a new newsletter subscriber
   */
  static async sendNewsletterWelcome(email: string, unsubscribeToken: string): Promise<boolean> {
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;
    const emailSubject = 'Welcome to the WarishLabs Newsletter';

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #2563EB; border-bottom: 2px solid #2563EB; padding-bottom: 10px;">WarishLabs</h2>
        <p>Thank you for subscribing to the WarishLabs newsletter!</p>
        <p>You'll now receive updates about our newest products, engineering case studies, labs projects, and open-source contributions.</p>
        <p>Stay curious,</p>
        <p><strong>The WarishLabs Team</strong></p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
        <p style="font-size: 12px; color: #666;">
          You are receiving this because you subscribed at warishlabs.com. 
          If this was a mistake, you can <a href="${unsubscribeUrl}" target="_blank">unsubscribe here</a>.
        </p>
      </div>
    `;

    console.log(`[EmailService] Attempting to send newsletter welcome to ${email}`);

    if (!resend) {
      console.warn('[EmailService] RESEND_API_KEY is not defined. Simulating newsletter welcome.');
      console.log('--- EMAIL SIMULATION START ---');
      console.log(`To: ${email}\nSubject: ${emailSubject}\nBody:\n${htmlContent}`);
      console.log('--- EMAIL SIMULATION END ---');
      return true;
    }

    try {
      const data = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: emailSubject,
        html: htmlContent,
      });

      return !!data.data?.id;
    } catch (error) {
      console.error('[EmailService] Failed to send newsletter welcome email:', error);
      return false;
    }
  }

  /**
   * Dispatches a broadcast campaign email to a list of subscribers
   */
  static async sendBroadcastCampaign(
    emails: string[],
    subject: string,
    htmlContent: string
  ): Promise<{ successCount: number; failureCount: number }> {
    console.log(`[EmailService] Sending newsletter broadcast to ${emails.length} subscribers`);
    
    if (!resend) {
      console.warn('[EmailService] RESEND_API_KEY is not defined. Simulating broadcast email campaign.');
      console.log('--- EMAIL BROADCAST SIMULATION START ---');
      console.log(`To: ${emails.join(', ')}\nFrom: ${fromEmail}\nSubject: ${subject}\nContent:\n${htmlContent}`);
      console.log('--- EMAIL BROADCAST SIMULATION END ---');
      return { successCount: emails.length, failureCount: 0 };
    }

    let successCount = 0;
    let failureCount = 0;

    // Send in batches of 100 (Resend batch limit)
    const batchSize = 100;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batchEmails = emails.slice(i, i + batchSize);
      const batchPayload = batchEmails.map((email) => ({
        from: fromEmail,
        to: email,
        subject,
        html: htmlContent,
      }));

      try {
        const response = await resend.batch.send(batchPayload);
        if (response.data) {
          successCount += response.data.length;
        } else {
          failureCount += batchEmails.length;
        }
      } catch (err) {
        console.error(`[EmailService] Failed to send broadcast batch starting at ${i}:`, err);
        failureCount += batchEmails.length;
      }
    }

    return { successCount, failureCount };
  }

  /**
   * Sends a reply email to a contact form message sender
   */
  static async sendMessageReply(
    toEmail: string,
    originalSubject: string,
    originalMessage: string,
    replyText: string
  ): Promise<boolean> {
    const emailSubject = `Re: ${originalSubject || 'Your inquiry at WarishLabs'}`;
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #2563EB; border-bottom: 2px solid #2563EB; padding-bottom: 10px;">WarishLabs</h2>
        <div style="margin-bottom: 25px; line-height: 1.6; color: #111; white-space: pre-wrap;">
          ${replyText.replace(/\n/g, '<br/>')}
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
        <div style="font-size: 12px; color: #666;">
          <p><strong>Original Message:</strong></p>
          <blockquote style="border-left: 3px solid #ccc; padding-left: 10px; margin-left: 0; color: #555;">
            ${originalMessage.replace(/\n/g, '<br/>')}
          </blockquote>
        </div>
      </div>
    `;

    console.log(`[EmailService] Attempting to send message reply to ${toEmail}`);

    if (!resend) {
      console.warn('[EmailService] RESEND_API_KEY is not defined. Simulating message reply.');
      console.log('--- EMAIL SIMULATION START ---');
      console.log(`To: ${toEmail}\nSubject: ${emailSubject}\nBody:\n${htmlContent}`);
      console.log('--- EMAIL SIMULATION END ---');
      return true;
    }

    try {
      const data = await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: emailSubject,
        html: htmlContent,
      });

      return !!data.data?.id;
    } catch (error) {
      console.error('[EmailService] Failed to send message reply email:', error);
      return false;
    }
  }
}
