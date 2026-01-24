/**
 * Validation constants for the frontend
 * These are runtime values used for form validation
 */

export const VALIDATION = {
  /** Maximum resume text length (characters) */
  MAX_RESUME_LENGTH: 50_000,

  /** Maximum job description length (characters) */
  MAX_JOB_DESCRIPTION_LENGTH: 20_000,

  /** Minimum text length to analyze */
  MIN_TEXT_LENGTH: 100,

  /** Maximum PDF file size in bytes (5MB) */
  MAX_PDF_SIZE: 5 * 1024 * 1024,
} as const;

export type ValidationConfig = typeof VALIDATION;
