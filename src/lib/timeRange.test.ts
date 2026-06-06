import { describe, it, expect } from 'vitest';
import { timeRangeQualifier } from './timeRange';

const NOW = new Date('2026-06-06T00:00:00Z');

describe('timeRangeQualifier', () => {
  it('returns an empty qualifier for the all-time range', () => {
    expect(timeRangeQualifier('all', NOW)).toBe('');
  });

  it('subtracts the right number of days for bounded windows', () => {
    expect(timeRangeQualifier('day', NOW)).toBe('pushed:>2026-06-05');
    expect(timeRangeQualifier('week', NOW)).toBe('pushed:>2026-05-30');
    expect(timeRangeQualifier('month', NOW)).toBe('pushed:>2026-05-07');
  });
});
