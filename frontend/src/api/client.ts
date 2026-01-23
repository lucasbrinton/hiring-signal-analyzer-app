/**
 * API configuration and client
 */

import type {
  AnalyzeRequest,
  AnalyzeResponse,
  ApiErrorResponse,
  ResumeInput,
  JobDescription,
} from '@shared/types';

const API_BASE = '/api';

/**
 * Custom error for API failures
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Analyze resume against job description
 */
export async function analyzeResume(
  resume: ResumeInput,
  jobDescription: JobDescription
): Promise<AnalyzeResponse> {
  const request: AnalyzeRequest = { resume, jobDescription };

  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const errorData = data as ApiErrorResponse;
    throw new ApiError(
      errorData.error.code,
      errorData.error.message,
      errorData.error.details
    );
  }

  return data as AnalyzeResponse;
}

/**
 * Upload PDF and analyze
 */
export async function analyzePdfResume(
  file: File,
  jobDescription: JobDescription
): Promise<AnalyzeResponse> {
  const formData = new FormData();
  formData.append('resumeFile', file);
  formData.append('jobDescription', JSON.stringify(jobDescription));

  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const errorData = data as ApiErrorResponse;
    throw new ApiError(
      errorData.error.code,
      errorData.error.message,
      errorData.error.details
    );
  }

  return data as AnalyzeResponse;
}

/**
 * Extract text from PDF (preview only)
 */
export async function extractPdfText(file: File): Promise<{ text: string; fileName: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/analyze/pdf`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const errorData = data as ApiErrorResponse;
    throw new ApiError(
      errorData.error.code,
      errorData.error.message,
      errorData.error.details
    );
  }

  return { text: data.text, fileName: data.fileName };
}
