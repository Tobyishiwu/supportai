import { describe, expect, it } from 'vitest';
import { chunkText } from './chunking.js';

describe('chunkText', () => {
  it('returns an empty array for empty/whitespace-only input', () => {
    expect(chunkText('')).toEqual([]);
    expect(chunkText('   \n\t  ')).toEqual([]);
  });

  it('produces a single chunk for short text', () => {
    const chunks = chunkText('the quick brown fox jumps over the lazy dog');
    expect(chunks).toHaveLength(1);
    expect(chunks[0]!.order).toBe(0);
    expect(chunks[0]!.content).toBe('the quick brown fox jumps over the lazy dog');
  });

  it('splits long text into multiple overlapping chunks', () => {
    const words = Array.from({ length: 1000 }, (_, i) => `word${i}`);
    const chunks = chunkText(words.join(' '));

    expect(chunks.length).toBeGreaterThan(1);
    // orders are sequential starting at 0
    chunks.forEach((chunk, i) => expect(chunk.order).toBe(i));

    // consecutive chunks overlap: the tail of one reappears at the head of the next
    const firstWords = chunks[0]!.content.split(' ');
    const secondWords = chunks[1]!.content.split(' ');
    expect(secondWords[0]).toBe(firstWords[firstWords.length - 38]);
  });

  it('never produces an empty chunk and covers all input words', () => {
    const words = Array.from({ length: 1000 }, (_, i) => `word${i}`);
    const chunks = chunkText(words.join(' '));

    for (const chunk of chunks) {
      expect(chunk.content.length).toBeGreaterThan(0);
    }
    // the very last word of the input appears in the final chunk
    expect(chunks.at(-1)!.content.endsWith('word999')).toBe(true);
  });
});
