/**
 * @fileoverview Shared Type Definitions - API Contract
 *
 * This file defines the contract between frontend and backend.
 * It is the SINGLE SOURCE OF TRUTH for all type definitions used across the application.
 *
 * Organization:
 * 1. Input Types - User-provided data (resume, job description)
 * 2. Analysis Result Types - Claude AI response structure
 * 3. API Request/Response Types - HTTP contract
 * 4. Error Codes - Standardized error classification
 * 5. Validation Constants - Shared limits and constraints
 * 6. UI State Types - Frontend-only state management
 *
 * Design Principles:
 * - Types are immutable (no mutation methods)
 * - Optional fields are explicitly marked with ?
 * - Discriminated unions for type-safe branching (success: true/false)
 * - Const assertions for validation values (as const)
 *
 * Usage:
 * - Backend: import from '../types/shared.js'
 * - Frontend: import from '@shared/types'
 *
 * @module shared/types
 */

// ============================================
// INPUT TYPES
// ============================================

/**
 * Resume input from user - either raw text or extracted from PDF.
 *
 * The 'source' discriminator allows the backend to handle text differently:
 * - 'paste': User typed/pasted text directly
 * - 'pdf': Text was extracted from uploaded PDF
 *
 * @example
 * // Text paste
 * const resume: ResumeInput = { text: "...", source: 'paste' };
 *
 * // PDF upload
 * const resume: ResumeInput = {
 *   text: extractedText,
 *   source: 'pdf',
 *   fileName: 'resume.pdf'
 * };
 */
export interface ResumeInput {
  /** Raw text content of the resume */
  text: string;
  /** Original source of the resume - affects how text is processed */
  source: "paste" | "pdf";
  /** Original filename if uploaded - used for display and debugging */
  fileName?: string;
}

/**
 * Job description input from user.
 *
 * Optional title and company fields are for future enhancements
 * (e.g., auto-extraction from job posting text).
 */
export interface JobDescription {
  /** Raw text of the job posting */
  text: string;
  /** Optional job title - for display or analytics */
  title?: string;
  /** Optional company name - for display or analytics */
  company?: string;
}

// ============================================
// ANALYSIS RESULT TYPES
// ============================================

/**
 * A single insight item with explanation.
 *
 * Used throughout the analysis for consistent structure:
 * - Headline: Quick scannable text (shown in cards)
 * - Detail: Supporting context (shown on expand/hover)
 *
 * This pattern enables progressive disclosure in the UI.
 */
export interface InsightItem {
  /** Short headline (1 line) - the key takeaway */
  headline: string;
  /** Detailed explanation (1-2 sentences) - supporting evidence */
  detail: string;
}

/**
 * The complete analysis result from Claude AI.
 *
 * This structure is carefully designed to match the AI's output format.
 * The system prompt instructs Claude to return exactly this structure.
 *
 * Scoring Bands:
 * - 90-100: Excellent match - minimal gaps
 * - 75-89: Strong match - minor improvements needed
 * - 60-74: Moderate match - notable gaps
 * - 40-59: Weak match - significant gaps
 * - 0-39: Poor match - major misalignment
 *
 * @see services/claude.ts for the system prompt that produces this
 */
export interface AnalysisResult {
  /** Overall match score from 0-100 (see scoring bands above) */
  matchScore: number;

  /** Brief summary of the match (2-3 sentences) - executive overview */
  summary: string;

  /** What aligns well between resume and job - positive signals */
  strengths: InsightItem[];

  /** Missing skills, experience, or keywords - areas to address */
  gaps: InsightItem[];

  /** Red flags a recruiter might notice - potential concerns */
  riskFlags: InsightItem[];

  /** Actionable suggestions to improve the match - next steps */
  improvements: InsightItem[];
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

/**
 * POST /api/analyze request body.
 *
 * This is the JSON format for direct text analysis.
 * For PDF uploads, the request uses multipart/form-data instead.
 */
export interface AnalyzeRequest {
  resume: ResumeInput;
  jobDescription: JobDescription;
}

/**
 * POST /api/analyze success response.
 *
 * The discriminated union (success: true) enables type-safe branching:
 * ```typescript
 * if (response.success) {
 *   // TypeScript knows response.result exists
 *   console.log(response.result.matchScore);
 * }
 * ```
 */
export interface AnalyzeResponse {
  success: true;
  result: AnalysisResult;
  /** Processing time in milliseconds - for performance monitoring */
  processingTimeMs: number;
}

/**
 * API error response.
 *
 * Structured errors enable consistent error handling across the app:
 * - code: Machine-readable error type for programmatic handling
 * - message: User-friendly description for display
 * - details: Technical details for debugging (optional)
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: string;
  };
}

/**
 * Union type for all API responses.
 *
 * Discriminated by the 'success' field for type-safe handling.
 */
export type ApiResponse = AnalyzeResponse | ApiErrorResponse;

// ============================================
// ERROR CODES
// ============================================

/**
 * Standardized error codes for the API.
 *
 * These codes enable:
 * - Consistent error handling in the frontend
 * - Appropriate HTTP status codes in the backend
 * - Clear error categorization for debugging
 *
 * Mapping to HTTP status:
 * - VALIDATION_ERROR → 400 Bad Request
 * - PDF_PARSE_ERROR → 400 Bad Request
 * - AI_SERVICE_ERROR → 503 Service Unavailable
 * - RATE_LIMIT_ERROR → 429 Too Many Requests
 * - INTERNAL_ERROR → 500 Internal Server Error
 */
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "PDF_PARSE_ERROR"
  | "AI_SERVICE_ERROR"
  | "RATE_LIMIT_ERROR"
  | "INTERNAL_ERROR";

// ============================================
// VALIDATION CONSTANTS
// ============================================

/**
 * Validation constraints shared between frontend and backend.
 *
 * These values enforce consistent limits across the application:
 * - Frontend: Shows validation errors before submission
 * - Backend: Validates and rejects invalid requests
 *
 * Using `as const` makes these values:
 * - Immutable (readonly)
 * - Literal types (e.g., MAX_RESUME_LENGTH is type 50000, not number)
 *
 * Rationale for limits:
 * - MAX_RESUME_LENGTH (50k chars): ~12,000 words, covers even verbose resumes
 * - MAX_JOB_DESCRIPTION_LENGTH (20k chars): ~5,000 words, handles detailed postings
 * - MIN_TEXT_LENGTH (100 chars): Ensures meaningful content to analyze
 * - MAX_PDF_SIZE (5MB): Balances file size with memory constraints
 */
export const VALIDATION = {
  /** Maximum resume text length (characters) - ~12,000 words */
  MAX_RESUME_LENGTH: 50_000,

  /** Maximum job description length (characters) - ~5,000 words */
  MAX_JOB_DESCRIPTION_LENGTH: 20_000,

  /** Minimum text length to analyze - ensures meaningful content */
  MIN_TEXT_LENGTH: 100,

  /** Maximum PDF file size in bytes (5MB) - memory/performance limit */
  MAX_PDF_SIZE: 5 * 1024 * 1024,
} as const;

/** Type for validation values - enables type-safe config access */
export type ValidationConfig = typeof VALIDATION;

// ============================================
// UI STATE TYPES (Frontend only)
// ============================================

/**
 * Analysis workflow status - represents the current step in the analysis flow.
 *
 * State transitions:
 * - idle → uploading (PDF selected)
 * - idle → analyzing (text submitted)
 * - uploading → analyzing (PDF extracted successfully)
 * - uploading → error (PDF extraction failed)
 * - analyzing → success (AI response received)
 * - analyzing → error (AI request failed)
 * - success/error → idle (user resets)
 */
export type AnalysisStatus =
  | "idle"
  | "uploading"
  | "analyzing"
  | "success"
  | "error";

/**
 * Complete application state for the frontend.
 *
 * This interface represents the full state tree that could be stored
 * in a state management solution (though we use hooks for simplicity).
 *
 * Nullable fields indicate optional or pending data:
 * - resumeInput: null before user provides resume
 * - result: null before analysis completes
 * - error: null when no error present
 */
export interface AppState {
  /** User's resume input - null before submission */
  resumeInput: ResumeInput | null;
  /** User's job description - null before submission */
  jobDescription: JobDescription | null;
  /** Current workflow status */
  status: AnalysisStatus;
  /** Analysis result - null until success */
  result: AnalysisResult | null;
  /** Error message - null when no error */
  error: string | null;
}
