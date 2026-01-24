import type { ApiErrorResponse, ErrorCode } from "../types/shared.js";

// Re-export for convenience
export type { ApiErrorResponse, ErrorCode };

/**
 * Custom API error class with structured error codes
 */
export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 400,
    public details?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  toResponse(): ApiErrorResponse {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

/**
 * Factory functions for common errors
 */
export const Errors = {
  validation: (message: string, details?: string) =>
    new ApiError("VALIDATION_ERROR", message, 400, details),

  pdfParse: (details?: string) =>
    new ApiError("PDF_PARSE_ERROR", "Failed to parse PDF file", 400, details),

  aiService: (details?: string) =>
    new ApiError(
      "AI_SERVICE_ERROR",
      "AI analysis service unavailable",
      503,
      details,
    ),

  rateLimit: () =>
    new ApiError(
      "RATE_LIMIT_ERROR",
      "Too many requests, please try again later",
      429,
    ),

  internal: (details?: string) =>
    new ApiError(
      "INTERNAL_ERROR",
      "An unexpected error occurred",
      500,
      details,
    ),
};
