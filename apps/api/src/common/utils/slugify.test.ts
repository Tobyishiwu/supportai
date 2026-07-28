import { describe, expect, it } from 'vitest';
import { slugify } from './slugify.js';

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Acme Support Co')).toBe('acme-support-co');
  });

  it('strips non-alphanumeric characters', () => {
    expect(slugify("Bob's Widgets & Co.!!")).toBe('bob-s-widgets-co');
  });

  it('trims leading/trailing hyphens produced by punctuation', () => {
    expect(slugify('--Hello World--')).toBe('hello-world');
  });

  it('truncates to 60 characters', () => {
    const long = 'a'.repeat(100);
    expect(slugify(long)).toHaveLength(60);
  });

  it('returns an empty string for input with no alphanumeric characters', () => {
    expect(slugify('!!!')).toBe('');
  });
});
