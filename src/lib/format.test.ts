import { describe, it, expect } from 'vitest';
import { formatCompactStars, formatRelativeTime } from './format';

describe('formatCompactStars', () => {
  it('keeps counts under 1k as plain integers', () => {
    expect(formatCompactStars(0)).toBe('0');
    expect(formatCompactStars(42)).toBe('42');
    expect(formatCompactStars(999)).toBe('999');
  });

  it('formats four-to-six digit counts with k', () => {
    expect(formatCompactStars(1_000)).toBe('1k');
    expect(formatCompactStars(12_345)).toBe('12.3k');
  });

  it('rounds counts in the 999.5k+ window up to M instead of producing 1000k', () => {
    expect(formatCompactStars(999_999)).toBe('1M');
  });

  it('formats seven-digit counts with M', () => {
    expect(formatCompactStars(1_000_000)).toBe('1M');
    expect(formatCompactStars(1_500_000)).toBe('1.5M');
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-06-06T12:00:00Z');

  it('returns an empty string for missing or invalid input', () => {
    expect(formatRelativeTime(undefined, now)).toBe('');
    expect(formatRelativeTime('not-a-date', now)).toBe('');
  });

  it('formats recent timestamps with the largest sensible unit', () => {
    expect(formatRelativeTime('2026-06-06T10:00:00Z', now)).toBe('2 hours ago');
    expect(formatRelativeTime('2026-06-04T12:00:00Z', now)).toBe('2 days ago');
    expect(formatRelativeTime('2026-05-06T12:00:00Z', now)).toBe('last month');
  });

  it('clamps future timestamps (clock skew) to now', () => {
    expect(formatRelativeTime('2026-06-06T13:00:00Z', now)).toBe('now');
  });
});
