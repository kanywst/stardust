import { describe, it, expect } from 'vitest';
import { slugify } from './useHashModal';

describe('slugify', () => {
  it('lowercases and hyphenates non-alphanumerics', () => {
    expect(slugify('TypeScript')).toBe('typescript');
    expect(slugify('C++')).toBe('c');
    expect(slugify('Objective C')).toBe('objective-c');
  });

  it('trims leading and trailing separators', () => {
    expect(slugify('.NET')).toBe('net');
    expect(slugify('  Go  ')).toBe('go');
  });
});
