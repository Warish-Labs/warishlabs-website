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
}
