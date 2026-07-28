import * as cheerio from 'cheerio';
import { AppError } from '../../../common/errors/app-error.js';

const FETCH_TIMEOUT_MS = 15_000;
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;

export async function extractUrlText(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'SupportAI-KnowledgeBot/1.0' },
    });
  } catch {
    throw AppError.validation('Could not reach the provided URL');
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw AppError.validation(`URL returned an error (${response.status})`);
  }

  const contentLength = Number(response.headers.get('content-length') ?? 0);
  if (contentLength > MAX_RESPONSE_BYTES) {
    throw AppError.validation('Page is too large to process');
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  $('script, style, noscript, svg, nav, footer').remove();

  const text = $('body').text().replace(/[ \t]+/g, ' ').replace(/\n{2,}/g, '\n').trim();
  if (!text) throw AppError.validation('No readable text found on this page');
  return text;
}
