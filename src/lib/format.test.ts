import { describe, it, expect } from 'vitest';
import { formatCompactStars } from './format';

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
