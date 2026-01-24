/**
 * @fileoverview API Client - Frontend HTTP Communication Layer
 *
 * Provides type-safe functions for communicating with the backend API.
 * All functions handle error normalization and response parsing.
 *
 * API Endpoints:
 * - POST /api/analyze - Analyze resume (JSON or multipart)
 * - POST /api/analyze/pdf - Extract text from PDF (preview only)
 *
 * Error Handling Strategy:
 * - All API errors are normalized to `ApiError` class
 * - Network errors are caught and re-thrown with context
 * - Non-2xx responses are parsed and thrown as ApiError
 *
 * @example
 * ```typescript
 * try {
 *   const response = await analyzeResume(resume, jobDescription);
 *   console.log(response.result.matchScore);
 * } catch (err) {
 *   if (err instanceof ApiError) {
 *     console.error(`${err.code}: ${err.message}`);
 *   }
 * }
 * ```
 */

import type {
  AnalyzeRequest,
  AnalyzeResponse,
  ApiErrorResponse,
  JobDescription,
  ResumeInput,
} from "@shared/types";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

/** Base URL for API requests (uses Vite proxy in development) */
const API_BASE = "/api";

// ─────────────────────────────────────────────────────────────────────────────
// ERROR HANDLING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Custom error class for API failures.
 * Provides structured error information for UI display.
 */
export class ApiError extends Error {
  /**
   * Creates an ApiError instance.
   * @param code - Error code from backend (e.g., 'VALIDATION_ERROR')
   * @param message - Human-readable error message
   * @param details - Optional additional context
   */
  constructor(
    public code: string,
    message: string,
    public details?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Analyzes a resume against a job description using text input.
 * Sends a JSON request body to the backend.
 *
 * @param resume - Resume text and metadata
 * @param jobDescription - Job posting text
 * @returns Analysis result with match score and insights
 * @throws {ApiError} On validation errors, AI service errors, or network failures
 */
export async function analyzeResume(
  resume: ResumeInput,
  jobDescription: JobDescription,
): Promise<AnalyzeResponse> {
  const request: AnalyzeRequest = { resume, jobDescription };

  const response = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const errorData = data as ApiErrorResponse;
    throw new ApiError(
      errorData.error.code,
      errorData.error.message,
      errorData.error.details,
    );
  }

  return data as AnalyzeResponse;
}

/**
 * Analyzes a resume against a job description using PDF upload.
 * Sends a multipart/form-data request with the PDF file.
 *
 * This function is used when the user uploads a PDF directly.
 * The backend extracts text from the PDF and performs analysis in one request.
 *
 * @param file - PDF file to analyze
 * @param jobDescription - Job posting text
 * @returns Analysis result with match score and insights
 * @throws {ApiError} On PDF parsing errors, validation errors, or AI service failures
 */
export async function analyzePdfResume(
  file: File,
  jobDescription: JobDescription,
): Promise<AnalyzeResponse> {
  const formData = new FormData();
  formData.append("resumeFile", file);
  formData.append("jobDescription", JSON.stringify(jobDescription));

  const response = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const errorData = data as ApiErrorResponse;
    throw new ApiError(
      errorData.error.code,
      errorData.error.message,
      errorData.error.details,
    );
  }

  return data as AnalyzeResponse;
}

/**
 * Extracts text from a PDF file without performing analysis.
 * Used for preview purposes - allows user to see extracted text before analyzing.
 *
 * @param file - PDF file to extract text from
 * @returns Extracted text and original filename
 * @throws {ApiError} On PDF parsing errors
 */
export async function extractPdfText(
  file: File,
): Promise<{ text: string; fileName: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/analyze/pdf`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const errorData = data as ApiErrorResponse;
    throw new ApiError(
      errorData.error.code,
      errorData.error.message,
      errorData.error.details,
    );
  }

  return { text: data.text, fileName: data.fileName };
}
