// Backend-local type definitions (mirrors shared/types.ts)
// Avoids rootDir issues with TypeScript — backend can't import from ../shared directly

export interface ResumeInput {
  text: string;
  source: "paste" | "pdf";
  fileName?: string;
}

export interface JobDescription {
  text: string;
  title?: string;
  company?: string;
}

export interface InsightItem {
  headline: string;
  detail: string;
}

export interface AnalysisResult {
  matchScore: number;
  summary: string;
  strengths: InsightItem[];
  gaps: InsightItem[];
  riskFlags: InsightItem[];
  improvements: InsightItem[];
}

export interface AnalyzeResponse {
  success: true;
  result: AnalysisResult;
  processingTimeMs: number;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: string;
  };
}

export type ApiResponse = AnalyzeResponse | ApiErrorResponse;

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "PDF_PARSE_ERROR"
  | "AI_SERVICE_ERROR"
  | "RATE_LIMIT_ERROR"
  | "INTERNAL_ERROR";

export const VALIDATION = {
  MAX_RESUME_LENGTH: 50_000,
  MAX_JOB_DESCRIPTION_LENGTH: 20_000,
  MIN_TEXT_LENGTH: 100,
  MAX_PDF_SIZE: 5 * 1024 * 1024,
} as const;

export type ValidationConfig = typeof VALIDATION;
