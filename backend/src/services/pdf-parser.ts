import pdf from 'pdf-parse';
import { Errors } from '../utils/errors.js';
import { config } from '../config.js';

/**
 * Extract text content from a PDF buffer
 */
export async function parsePdf(buffer: Buffer): Promise<string> {
  // Validate file size
  if (buffer.length > config.limits.maxPdfSizeBytes) {
    throw Errors.validation(
      `PDF file too large. Maximum size is ${config.limits.maxPdfSizeBytes / 1024 / 1024}MB`
    );
  }

  // Check PDF magic bytes
  const pdfHeader = buffer.slice(0, 5).toString('ascii');
  if (pdfHeader !== '%PDF-') {
    throw Errors.validation('Invalid PDF file format');
  }

  try {
    const data = await pdf(buffer, {
      // Limit pages to prevent abuse
      max: 20,
    });

    const text = data.text.trim();

    if (!text || text.length < config.limits.minTextLength) {
      throw Errors.pdfParse(
        'Could not extract sufficient text from PDF. The file may be image-based or corrupted.'
      );
    }

    // Clean up common PDF extraction artifacts
    const cleanedText = text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase (common PDF issue)
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
