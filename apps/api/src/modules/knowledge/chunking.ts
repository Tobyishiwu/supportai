const WORDS_PER_CHUNK = 375; // ~500 tokens at ~0.75 words/token
const OVERLAP_WORDS = 38; // ~50 tokens

export interface TextChunk {
  content: string;
  order: number;
  tokenCount: number;
}

/** Splits cleaned text into overlapping word-count-based chunks approximating ~500 tokens each. */
export function chunkText(text: string): TextChunk[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const chunks: TextChunk[] = [];
  let start = 0;
  let order = 0;

  while (start < words.length) {
    const end = Math.min(start + WORDS_PER_CHUNK, words.length);
    const chunkWords = words.slice(start, end);
    chunks.push({
      content: chunkWords.join(' '),
      order,
      tokenCount: Math.round(chunkWords.length / 0.75),
    });
    order += 1;

    if (end === words.length) break;
    start = end - OVERLAP_WORDS;
  }

  return chunks;
}
