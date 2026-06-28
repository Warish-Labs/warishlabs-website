import { describe, it, expect } from 'vitest';
import { formatDate, formatCompactNumber, formatBytes } from '@/utils/formatters';

describe('formatters', () => {
  describe('formatDate', () => {
    it('formats a date string correctly', () => {
      // Use fixed UTC dates to avoid local timezone variances in test environments
      const formatted = formatDate(new Date('2026-06-28T12:00:00Z'), {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
      });
      expect(formatted).toBe('Jun 28, 2026');
    });
  });

  describe('formatCompactNumber', () => {
    it('leaves numbers under 1000 unchanged', () => {
      expect(formatCompactNumber(999)).toBe('999');
    });

    it('formats numbers in thousands with K+', () => {
      expect(formatCompactNumber(1200)).toBe('1.2K+');
      expect(formatCompactNumber(50000)).toBe('50K+');
    });

    it('formats numbers in millions with M+', () => {
      expect(formatCompactNumber(2500000)).toBe('2.5M+');
    });
  });

  describe('formatBytes', () => {
    it('returns 0 Bytes for zero input', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
    });

    it('formats bytes to KB/MB correctly', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1536)).toBe('1.5 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
    });
  });
});
