import pdf from 'pdf-parse';
import { Errors } from '../utils/errors.js';
import { config } from '../config.js';

export async function parsePdf(buffer: Buffer): Promise<string> {
  if (buffer.length > config.limits.maxPdfSizeBytes) {
    throw Errors.validation(
      `PDF file too large. Maximum size is ${config.limits.maxPdfSizeBytes / 1024 / 1024}MB`
    );
  }

  const pdfHeader = buffer.slice(0, 5).toString('ascii');
  if (pdfHeader !== '%PDF-') {
    throw Errors.validation('Invalid PDF file format');
  }

  try {
    const data = await pdf(buffer, { max: 20 });

    const text = data.text.trim();

    if (!text || text.length < config.limits.minTextLength) {
      throw Errors.pdfParse(
        'Could not extract sufficient text from PDF. The file may be image-based or corrupted.'
      );
    }

    const cleanedText = text
      .replace(/\s+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .trim();

    return cleanedText;
  } catch (error) {
    if (error instanceof Error && error.name === 'ApiError') {
      throw error;
    }
    throw Errors.pdfParse(
      error instanceof Error ? error.message : 'Unknown PDF parsing error'
    );
  }
}
