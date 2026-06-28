import { describe, it, expect, vi } from 'vitest';

vi.mock('resend', () => {
  return {
    Resend: vi.fn().mockImplementation(() => {
      return {
        emails: {
          send: vi.fn().mockResolvedValue({ data: { id: 'mock-id' }, error: null }),
        },
      };
    }),
  };
});

describe('EmailService', () => {
  it('sends contact email without throwing', async () => {
    const { EmailService } = await import('@/services/EmailService');
    const result = await EmailService.sendContactEmail('Test User', 'test@example.com', 'Subject Test', 'Message body details.');
    expect(result).toBe(true);
  });
});
