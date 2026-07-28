import type { KnowledgeDocumentDoc } from '../../../models/knowledge-document.model.js';
import { extractPdfText } from './pdf.extractor.js';
import { extractDocxText } from './docx.extractor.js';
import { extractPlainText } from './plain.extractor.js';
import { extractUrlText } from './url.extractor.js';
import { AppError } from '../../../common/errors/app-error.js';

interface ExtractInput {
  sourceType: KnowledgeDocumentDoc['sourceType'];
  buffer?: Buffer;
  sourceUrl?: string | null;
  faqAnswer?: string;
}

export async function extractText(input: ExtractInput): Promise<string> {
  switch (input.sourceType) {
    case 'pdf':
      if (!input.buffer) throw AppError.validation('Missing file for PDF document');
      return extractPdfText(input.buffer);
    case 'docx':
      if (!input.buffer) throw AppError.validation('Missing file for DOCX document');
      return extractDocxText(input.buffer);
    case 'txt':
    case 'markdown':
      if (!input.buffer) throw AppError.validation('Missing file for text document');
      return extractPlainText(input.buffer);
    case 'url':
      if (!input.sourceUrl) throw AppError.validation('Missing URL for URL document');
      return extractUrlText(input.sourceUrl);
    case 'faq':
      if (!input.faqAnswer) throw AppError.validation('Missing answer for FAQ document');
      return input.faqAnswer;
    default:
      throw AppError.validation(`Unsupported source type: ${input.sourceType as string}`);
  }
}
