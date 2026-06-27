import prisma from '@/lib/prisma';
import { EmailService } from './EmailService';
import type { ContactMessage } from '@prisma/client';

export class ContactService {
  /**
   * Saves a contact form message to the database and notifies the administrator.
   */
  static async submitMessage(data: {
    name: string;
    email: string;
    subject?: string | null;
    message: string;
  }): Promise<boolean> {
    try {
      // 1. Save message to DB
      await prisma.contactMessage.create({
        data: {
          name: data.name,
          email: data.email,
          subject: data.subject || null,
          message: data.message,
          status: 'unread',
        },
      });

      // 2. Send email notification to admin (non-blocking / try-catch wrapped)
      EmailService.sendContactEmail(
        data.name,
        data.email,
        data.subject || '',
        data.message
      ).catch((err) => {
        console.error('[ContactService] Failed to send admin email notification:', err);
      });

      return true;
    } catch (error) {
      console.error('[ContactService] Failed to submit contact message:', error);
      return false;
    }
  }

  /**
   * Admin: Retrieves all contact messages
   */
  static async getAll(): Promise<ContactMessage[]> {
    return prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin: Updates the status of a contact message (e.g. 'read', 'archived')
   */
  static async updateStatus(id: string, status: string): Promise<boolean> {
    try {
      await prisma.contactMessage.update({
        where: { id },
        data: { status },
      });
      return true;
    } catch (error) {
      console.error(`[ContactService] Failed to update message status for ${id}:`, error);
      return false;
    }
  }

  /**
   * Admin: Deletes a contact message
   */
  static async delete(id: string): Promise<boolean> {
    try {
      await prisma.contactMessage.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error(`[ContactService] Failed to delete contact message ${id}:`, error);
      return false;
    }
  }
}
