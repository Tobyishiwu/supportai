import { describe, expect, it } from 'vitest';
import { parseDurationToSeconds } from './duration.js';

describe('parseDurationToSeconds', () => {
  it('parses seconds', () => {
    expect(parseDurationToSeconds('45s')).toBe(45);
  });

  it('parses minutes', () => {
    expect(parseDurationToSeconds('15m')).toBe(15 * 60);
  });

  it('parses hours', () => {
    expect(parseDurationToSeconds('2h')).toBe(2 * 3600);
  });

  it('parses days', () => {
    expect(parseDurationToSeconds('30d')).toBe(30 * 86400);
  });

  it('tolerates surrounding whitespace', () => {
    expect(parseDurationToSeconds('  15m  ')).toBe(900);
  });

  it('throws on an unrecognized unit', () => {
    expect(() => parseDurationToSeconds('15x')).toThrow('Invalid duration format: 15x');
  });

  it('throws on a malformed string', () => {
    expect(() => parseDurationToSeconds('fifteen minutes')).toThrow('Invalid duration format');
  });
});
