import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { EmailService } from './EmailService';

export class NewsletterService {
  /**
   * Subscribes an email to the newsletter, sending a welcome email.
   */
  static async subscribe(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.toLowerCase().trim();
    const token = crypto.randomBytes(24).toString('hex');

    try {
      // Find if subscriber already exists
      const existing = await prisma.newsletterSubscriber.findUnique({
        where: { email: cleanEmail },
      });

      if (existing) {
        if (existing.active) {
          return { success: true, message: 'You are already subscribed!' };
        } else {
          // Reactivate subscription
          await prisma.newsletterSubscriber.update({
            where: { email: cleanEmail },
            data: { active: true, token },
          });
          
          await EmailService.sendNewsletterWelcome(cleanEmail, token);
          return { success: true, message: 'Welcome back! Subscription reactivated.' };
        }
      }

      // Create new subscription
      await prisma.newsletterSubscriber.create({
        data: {
          email: cleanEmail,
          token,
          active: true,
        },
      });

      await EmailService.sendNewsletterWelcome(cleanEmail, token);
      return { success: true, message: 'Subscribed successfully! Welcome email sent.' };
    } catch (error) {
      console.error('[NewsletterService] Failed to subscribe:', error);
      return { success: false, message: 'An error occurred. Please try again.' };
    }
  }

  /**
   * Unsubscribes a user based on their unique token.
   */
  static async unsubscribe(token: string): Promise<boolean> {
    try {
      const subscriber = await prisma.newsletterSubscriber.findUnique({
        where: { token },
      });

      if (!subscriber || !subscriber.active) {
        return false;
      }

      await prisma.newsletterSubscriber.update({
        where: { token },
        data: { active: false },
      });

      return true;
    } catch (error) {
      console.error('[NewsletterService] Failed to unsubscribe:', error);
      return false;
    }
  }
}
