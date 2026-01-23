/**
 * Hiring Signal Analyzer - Shared Type Definitions
 * These types are used by both frontend and backend
 */

// ============================================
// INPUT TYPES
// ============================================

/**
 * Resume input from user - either raw text or extracted from PDF
 */
export interface ResumeInput {
  /** Raw text content of the resume */
  text: string;
  /** Original source of the resume */
  source: 'paste' | 'pdf';
  /** Original filename if uploaded */
  fileName?: string;
}

/**
 * Job description input from user
 */
export interface JobDescription {
  /** Raw text of the job posting */
  text: string;
  /** Optional job title extracted or provided */
  title?: string;
  /** Optional company name */
  company?: string;
}

// ============================================
// ANALYSIS RESULT TYPES
// ============================================

/**
 * A single insight item with explanation
 */
export interface InsightItem {
  /** Short headline (1 line) */
  headline: string;
  /** Detailed explanation (1-2 sentences) */
  detail: string;
}

/**
 * The complete analysis result from Claude
 */
export interface AnalysisResult {
  /** Overall match score from 0-100 */
  matchScore: number;
  
  /** Brief summary of the match (2-3 sentences) */
  summary: string;
  
  /** What aligns well between resume and job */
  strengths: InsightItem[];
  
  /** Missing skills, experience, or keywords */
  gaps: InsightItem[];
  
  /** Red flags a recruiter might notice */
  riskFlags: InsightItem[];
  
  /** Actionable suggestions to improve the match */
  improvements: InsightItem[];
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

/**
 * POST /api/analyze request body
 */
export interface AnalyzeRequest {
  resume: ResumeInput;
  jobDescription: JobDescription;
}

/**
 * POST /api/analyze success response
 */
export interface AnalyzeResponse {
  success: true;
  result: AnalysisResult;
  /** Processing time in milliseconds */
  processingTimeMs: number;
}

/**
 * API error response
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
 * Union type for all API responses
 */
export type ApiResponse = AnalyzeResponse | ApiErrorResponse;

// ============================================
// ERROR CODES
// ============================================

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'PDF_PARSE_ERROR'
  | 'AI_SERVICE_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'INTERNAL_ERROR';

// ============================================
// VALIDATION CONSTANTS
// ============================================

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

// ============================================
// UI STATE TYPES (Frontend only)
// ============================================

export type AnalysisStatus = 
  | 'idle'
  | 'uploading'
  | 'analyzing'
  | 'success'
  | 'error';

export interface AppState {
  resumeInput: ResumeInput | null;
  jobDescription: JobDescription | null;
  status: AnalysisStatus;
  result: AnalysisResult | null;
  error: string | null;
}
