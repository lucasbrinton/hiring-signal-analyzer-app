import { NextFunction, Request, Response } from "express";
import type { ApiErrorResponse } from "../types/shared.js";
import { ApiError } from "../utils/errors.js";

/**
 * Global error handling middleware
 */
export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error("Error:", error);

  // Handle our custom ApiError
  if (error instanceof ApiError) {
    res.status(error.statusCode).json(error.toResponse());
    return;
  }

  // Handle multer errors
  if (error.name === "MulterError") {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "File upload error",
        details: error.message,
      },
    };
    res.status(400).json(response);
    return;
  }

  // Handle unexpected errors
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    },
  };

  res.status(500).json(response);
}
