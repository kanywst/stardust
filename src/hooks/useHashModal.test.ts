import { describe, it, expect } from 'vitest';
import { slugify } from './useHashModal';

describe('slugify', () => {
  it('lowercases and hyphenates non-alphanumerics', () => {
    expect(slugify('TypeScript')).toBe('typescript');
    expect(slugify('Objective C')).toBe('objective-c');
  });

  it('keeps C++ and C# distinct instead of collapsing both to "c"', () => {
    expect(slugify('C++')).toBe('cplusplus');
    expect(slugify('C#')).toBe('csharp');
    expect(slugify('C')).toBe('c');
  });

  it('trims leading and trailing separators', () => {
    expect(slugify('.NET')).toBe('net');
    expect(slugify('  Go  ')).toBe('go');
  });
});
