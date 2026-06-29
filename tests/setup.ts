import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global Fetch Mock to handle relative Next.js API route calls under test environment
global.fetch = vi.fn().mockImplementation((url: string) => {
  if (url === '/api/stats') {
    return Promise.resolve({
      json: () => Promise.resolve({ success: true, products: 4, visitors: 120 }),
    });
  }
  return Promise.resolve({
    json: () => Promise.resolve({ success: true }),
  });
});
